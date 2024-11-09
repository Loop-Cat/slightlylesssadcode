const CreepListAssembler = require('utils.creep_list_assembler')

const Spawn = {
    maintainPopulation: function () {
        for (let room_name in Game.rooms) {
            const spawns = Game.rooms[room_name].find(FIND_MY_SPAWNS)
            if (spawns.length > 0) {
                this.maintainPopulationRoom(Game.rooms[room_name])
            }
        }
    },

    maintainPopulationRoom: function (room) {
        if (!room) { console.log('maintainPopulationRoom: ROOM NOT IN VISION - ' + room.name); return }
        const spawns = room.find(FIND_MY_SPAWNS)
        if (spawns.length == 0) { console.log('maintainPopulationRoom: NO SPAWNS IN ROOM - ' + room.name); return }
        let free_spawns = spawns.filter(s => !s.spawning)
        if (free_spawns.length == 0) { return }
        const creep_list = room.memory.creep_list
        if (!creep_list) { console.log('maintainPopulationRoom: NO CREEP LIST IN ROOM - ' + room.name); return }
        let creeps = []
        for (let i in Game.creeps) { creeps.push(Game.creeps[i]) }

        let creep_names = creeps.map(c => c.name)
        let unspawned_creeps = []
        for (let order of creep_list) {
            if (!order) { continue }
            if (!order.name) { continue }
            if (!order.body) { continue }
            if (!order.memory) { continue }
            if (!creep_names.includes(order.name)) { unspawned_creeps.push(order) }
        }

        if (unspawned_creeps.length == 0) { return }
        // const sorted_creeps = unspawned_creeps.sort((a, b) => b.priority - a.priority) not needed now
        for (let order of unspawned_creeps) {
            let res
            const order_cost = CreepListAssembler.bodyCost(order.body)
            if (('adjust' in order) && adjust != 0) {
                const energy_available = room.energyAvailable
                const allowed_energy = energy_available * order.adjust
                const scaled_body = CreepListAssembler.scaleBody(order.body, allowed_energy)
                if (!scaled_body) { console.log('maintainPopulationRoom: "CreepListAssembler.scaleBody(order.body, allowed_energy)" - resulted in an error'); continue }
                if (scaled_body == ERR_NOT_ENOUGH_ENERGY) {
                    const energy_capacity = room.energyCapacityAvailable
                    if (order_cost > energy_capacity) { console.log('maintainPopulationRoom: ORDER TOO EXPENSIVE TO SPAWN - ' + order.name); continue }
                    if (order_cost > 300) { continue } // make sure important roles dont end up here
                    else {
                        // roles that could have adjustable bodies and also should be waited to spawn when energy is too smol
                        if (order.memory.role == 'filler' ||
                            order.memory.role == 'hauler' ||
                            order.memory.role == 'harvester'
                        ) {
                            console.log('maintainPopulationRoom: Room - ' + room.name + ' - is waiting for energy regeneration to spawn creep - ' + order.name)
                            return
                        }
                    }
                } else {
                    res = free_spawns[0].spawnCreep(scaled_body, order.name, { memory: order.memory })
                }
            } else {
                res = free_spawns[0].spawnCreep(order.body, order.name, { memory: order.memory })
            }

            if (res == undefined) { console.log('maintainPopulationRoom: RESULT OF A SPAWNING ATTEMPT IS UNDEFINED'); continue }

            if (res == OK) {
                free_spawns.shift()
                const arr = order.name.split('_')
                if (arr[arr.length - 1] == 'RESPAWNING') { CreepListAssembler.removeCreep(order.name) }
                if (free_spawns.length == 0) { break }
            }
            else if (res == ERR_NAME_EXISTS) { console.log('maintainPopulationRoom: NAME EXISTS - ' + order.name); continue }
            else if (res == ERR_BUSY) { console.log('maintainPopulationRoom: SPAWN BUSY'); continue }
            else if (res == ERR_INVALID_ARGS) { console.log('maintainPopulationRoom: INVALID CREEP ORDER - ' + order.name); continue }
            else if (res == ERR_RCL_NOT_ENOUGH) { console.log('maintainPopulationRoom: SPAWN UNAVAILABLE DUE TO CONTROLLER DOWNGRADE'); continue }
            else if (res == ERR_NOT_ENOUGH_ENERGY) {
                if (order_cost == -1) { console.log('maintainPopulationRoom: "CreepListAssembler.bodyCost(order.body)" - resulted in an error: ' + order_cost); continue }
                const energy_capacity = room.energyCapacityAvailable
                if (order_cost > energy_capacity) { console.log('maintainPopulationRoom: ORDER TOO EXPENSIVE TO SPAWN - ' + order.name); continue }
                if (order.memory.role == 'harvester') { if (order_cost > 300) { console.log('maintainPopulationRoom: Harvester is too big - ' + order.name); continue } }
                if (order.memory.role == 'miner') {
                    if (room.storage && room.storage.store[RESOURCE_ENERGY] > 1000) {
                        const fillers = creeps.filter(c => c.memory.role == 'filler')
                        if (fillers == 0) {
                            console.log('maintainPopulationRoom: Room - ' + room.name + ' - attempting to reboot')
                            const fill_body = [CARRY, CARRY, MOVE]
                            const fill_name = 'BOOTSTRAP_FILLER' + room.name + Game.time
                            const fill_memory = { role: 'filler', original_room: room.name, target_room: room.name, renewing: false }
                            free_spawns[0].spawnCreep(fill_body, fill_name, { memory: fill_memory })
                            return // using return to wait for energy
                        }
                        return
                    } else {
                        const harvesters = creeps.filter(c => c.memory.role == 'harvester')
                        if (harvesters.length > 0) { return }
                        const energy_pickups = room.find(FIND_DROPPED_RESOURCES).filter(p => p.resourceType == RESOURCE_ENERGY && p.amount > 50)
                        const containers = room.find(FIND_STRUCTURES).filter(s => s.structureType == STRUCTURE_CONTAINER)
                        let harvested_energy = 0
                        for (let pickup of energy_pickups) { harvested_energy += pickup.amount }
                        for (let container of containers) { harvested_energy += container.store[RESOURCE_ENERGY] }
                        if (harvested_energy > 500) {
                            const haulers = creeps.filter(c => c.memory.role == 'hauler')
                            if (haulers.length > 0) { return }
                            console.log('maintainPopulationRoom: Room - ' + room.name + ' - attempting to reboot')
                            const haul_body = [CARRY, MOVE]
                            const haul_name = 'BOOTSTRAP_HAULLER' + room.name + Game.time
                            const haul_memory = { role: 'hauler', original_room: room.name, target_room: room.name, renewing: false }
                            free_spawns[0].spawnCreep(haul_body, haul_name, { memory: haul_memory })
                            return // using return to wait for energy
                        } else {
                            const miners = creeps.filter(c => c.memory.role == 'miner')
                            if (miners.length > 0) { return }
                            console.log('maintainPopulationRoom: Room - ' + room.name + ' - attempting to reboot')
                            const mine_body = [WORK, WORK, MOVE]
                            const mine_name = 'BOOTSTRAP_MINER' + room.name + Game.time
                            const mine_memory = { role: 'miner', original_room: room.name, target_room: room.name, renewing: false }
                            free_spawns[0].spawnCreep(mine_body, mine_name, { memory: mine_memory })
                            return // using return to wait for energy
                        }
                    }
                }

                return // if not an emergency then proceed as usual
            }
        }
    },
}

module.exports = Spawn