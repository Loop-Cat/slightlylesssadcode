const BuildPlanner = require('utils.build_planner');

const roleBuilder = {
    findRepairTargets: function (creep) {
        let wall_hp = creep.room.memory.wall_hp;
        if (!wall_hp || wall_hp == 0) { console.log('BAD WALL HP VALUES IN ' + creep.room.name); return 0 }

        let min_hp_wall

        const all_structures = creep.room.find(FIND_STRUCTURES);
        for (let i in all_structures) {
            const structure = all_structures[i];
            if (structure.structureType == STRUCTURE_ROAD) {
                if (structure.hits / structure.hitsMax < 0.8) {
                    return structure;
                }
            } else if (structure.structureType == STRUCTURE_CONTAINER) {
                if (structure.hits / structure.hitsMax < 0.5) {
                    return structure;
                }
            } else if (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) {
                if (min_hp_wall) {
                    if (min_hp_wall.hits - structure.hits > 10000) {
                        min_hp_wall = structure
                    }
                } else {
                    min_hp_wall = structure
                }
            }
        }

        if (min_hp_wall) {return min_hp_wall}
        return 0
    },

    run: function (creep) {
        const target_room = creep.memory.target_room;
        if (!target_room) { console.log('INVALID TARGET ROOM VALUE FOR CREEP - ' + creep.name) }
        else if (creep.room.name != target_room) { creep.moveTo(new RoomPosition(25, 25, target_room), { maxOps: 600 }); return }

        if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) { creep.memory.working = false }
        if (!creep.memory.working && creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) { creep.memory.working = true }

        if (creep.memory.working) {
            const targets = creep.room.find(FIND_CONSTRUCTION_SITES);

            if (targets.length) {
                if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { maxRooms: 1, range: 3 });
                }
                return
            }

            let target = 0;
            if (creep.memory.target_id && Game.getObjectById(creep.memory.target_id)) {
                target = Game.getObjectById(creep.memory.target_id);
                if (target.hits == target.hitsMax || target.hits > creep.room.memory.wall_hp) {
                    target = this.findRepairTargets(creep);
                    if (target && target != 0) {
                        creep.memory.target_id = target.id;
                    }
                }
            } else {
                target = this.findRepairTargets(creep)
                if (target && target != 0) {
                    creep.memory.target_id = target.id;
                } else {
                    console.log('No target found');
                    if (creep.room.controller.level <= 3) {
                        if (!creep.memory.inactive) { creep.memory.inactive = 0 }
                        creep.memory.inactive += 1
                        if (creep.memory.inactive >= 15) { creep.memory.role = 'upgrader' }
                    }
                    return;
                }
            }

            if (target != 0 && target) {
                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target.pos, { range: 3 })
                }
            }
        }
        
        // locate energy
        if (creep.memory.target_id && !creep.memory.target_id == 0 && Game.getObjectById(creep.memory.target_id)){
            target = Game.getObjectById(creep.memory.target_id)
            target = Game.getObjectById(creep.memory.target_id)
            if (target.resourceType == RESOURCE_ENERGY) {
                if (creep.pickup(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                } else {
                    creep.memory.target_id = 0
                }
                return
            } else {
                if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                } else {
                    creep.memory.target_id = 0
                }
                return
            }
        }

        const storage = creep.room.storage;
        const containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] > 300;
            }
        });
        const tombs = creep.room.find(FIND_TOMBSTONES, {
            filter: (tomb) => {
                return tomb.store[RESOURCE_ENERGY] > 50;
            }
        });
        const dropped_energy = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: (pickup) => {
                return pickup.resourceType == RESOURCE_ENERGY
            }
        });
        const sources = creep.room.find(FIND_SOURCES, {
            filter: (source) => {
                return source.energy > 0
            }
        });

        if (storage && storage.store[RESOURCE_ENERGY] > 10000) {
            if (storage) {
                if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage);
                }
                return
            }
        } else if (containers.length > 0) {
            target = containers.sort((a, b) => { return b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY] })[0]
            if (target) {
                creep.memory.target_id = target.id
                if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
                return
            }
        } else if (tombs.length > 0) {
            target = tombs.sort((a, b) => { return b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY] })[0]
            if (target) {
                creep.memory.target_id = target.id
                if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
                return
            }
        } else if (dropped_energy.length > 0) {
            target = dropped_energy.sort((a, b) => { return b.amount - a.amount })[0]
            if (target) {
                creep.memory.target_id = target.id
                if (creep.pickup(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
                return
            }
        } else {
            if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        }
    }
};

module.exports = roleBuilder;