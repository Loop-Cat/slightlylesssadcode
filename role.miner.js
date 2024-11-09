const roleMiner = {
    run: function (creep) {
        const target_room = creep.memory.target_room;
        if (!target_room) { console.log('INVALID TARGET ROOM VALUE FOR CREEP - ' + creep.name) }
        else if (creep.room.name != target_room) { creep.moveTo(new RoomPosition(25, 25, target_room), { maxOps: 600 }); return }

        const memory = creep.memory;
        let source
        let container
        let link
        let target_spot

        // cache mining power
        if (!memory.mining_power) { creep.memory.mining_power = creep.body.filter(part => part.type == 'work').length * 2 }

        // pick a source
        if (!memory.source_id) {
            const sources = creep.room.find(FIND_SOURCES)
            if (sources == 0) { return }
            const miners = creep.room.find(FIND_CREEPS).filter(c => c.memory.role == 'miner')
            if (creep.body.filter(p => p.type == WORK).length < 5) {// different way of picking sources for mini miners
                if (miners.length > 6) { console.log('Unneeded miner in room - ' + creep.room.name)}
                const not_full_sources = sources.filter(s => s.pos.findInRange(miners, 1).length < 3)
                let free_sources = []
                const terrainData = creep.room.getTerrain()
                for (let soruce of not_full_sources) {
                    for (let x = -1; x <= 1; x++) {
                        for (let y = -1; y <= 1; y++) {
                            if (terrainData.get(soruce.pos.x + x, soruce.pos.y + y)) { continue }
                            if (creep.room.lookAt(soruce.pos.x + x, soruce.pos.y + y).some(l => l.type == 'creep' && l.creep.memory.role == 'miner')) { continue }
                            free_sources.push(soruce)
                        }
                    }
                }
                if (free_sources.length > 0) { source = free_sources[0]}
            } else {
                if (sources.length == 1) { source = sources[0] }
                else {
                    
                    if (miners.length == 1) { source = sources[0] }
                    else {
                        const source_ids = sources.map(s => s.id)
                        const sure_miners = miners.filter(c => ('source_id' in c.memory))
                        const taken_source_ids = sure_miners.map(c => c.memory.source_id)
                        if (source_ids.length <= taken_source_ids) { console.log('Unneeded miner in room - ' + creep.room.name); return}
                        if (miners - sure_miners.length > 1) {
                            console.log('More then one miner with undefined source id in room - ' + creep.room.name)
                            console.log('Attempting to resolve')
                            for (let mine of miners) {
                                if (!mine.memory.source_id) {mine.suicide()}
                            }
                        } else {
                            for (let id of source_ids) {
                                if (!taken_source_ids.includes(id)) { source = Game.getObjectById(id); break }
                            }
                        }
                    }
                }
            }
            

            if (source) {
                memory.source_id = source.id
            } else {
                memory.source_id = sources[0].id
                return
            }
        } else {
            source = Game.getObjectById(memory.source_id)
            target_spot = target_spot = source.pos
        }

        // look for a container
        if (!memory.container_id && memory.container_id != 0) {
            container = source.pos.findInRange(FIND_STRUCTURES, 1).filter(s => s.structureType == STRUCTURE_CONTAINER)[0]
            if (container) {
                memory.container_id = container.id
                target_spot = container.pos
            } else {
                creep.say('No cntnr:(')
                memory.container_id = 0
                target_spot = source.pos
            }
        } else {
            container = Game.getObjectById(memory.container_id)
        }

        // look for a link
        if (!memory.link_id && memory.link_id != 0 && container) {
            link = container.pos.findInRange(FIND_STRUCTURES, 1).filter(s => s.structureType == STRUCTURE_LINK)[0]
            if (link) {
                memory.link_id = link.id
            } else {
                creep.say('No link :(')
                memory.link_id = 0
            }
        } else {
            if (memory.link_id != 0) {
                link = Game.getObjectById(memory.link_id)
            }
        }

        // go to the target
        if (container) {
            if (!creep.pos.isEqualTo(container.pos)) {
                creep.moveTo(container, { range: 0 });
                return;
            }
        } else {
            if (!creep.pos.isNearTo(target_spot)) {
                creep.moveTo(target_spot, { range: 1 });
                return;
            }
        }

        // begin mining
        if (!source) { console.log('Bad source id - ' + memory.source_id + '; in creep - ' + creep.name); return }
        if (source.energy) { creep.harvest(source); }

        if (!container) { console.log('Bad container id - ' + memory.container_id + '; in creep - ' + creep.name); return }
        if (container.hitsMax - container.hits > 600) {
            if (creep.store[RESOURCE_ENERGY] == 0) {
                creep.withdraw(container, RESOURCE_ENERGY);
            } else {
                creep.repair(container)
            }
        }

        // link stuf
        if (!link) { console.log('Bad link id - ' + memory.link_id + '; in creep - ' + creep.name); return }
        if (creep.store.getCapacity() - creep.store.getUsedCapacity() <= memory.mining_power && link) {
            creep.transfer(link, RESOURCE_ENERGY, Math.min(creep.store[RESOURCE_ENERGY], link.store.getFreeCapacity()));
        }
    }
};

module.exports = roleMiner;