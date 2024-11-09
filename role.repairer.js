const BuildPlanner = require('utils.build_planner');

const roleRepairer = {
    findRepairTargets: function (creep) {
        let wall_hp = creep.room.memory.wall_hp;
        if (!wall_hp || wall_hp == 0) { console.log('BAD WALL HP VALUES IN ' + creep.room.name); return 0 }

        let min_hp_wall

        const all_structures = creep.room.find(FIND_STRUCTURES);
        for (let i in all_structures) {
            const structure = all_structures[i];
            if (structure.structureType == STRUCTURE_ROAD) {
                if (structure.hits / structure.hitsMax < 0.5) {
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
        if (creep.store[RESOURCE_ENERGY] == 0) {
            const storage = Game.rooms[creep.room.name].storage
            if (!storage) {creep.say('no storage'); return}
            if (storage.store[RESOURCE_ENERGY] > 5000) {
                if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage)
                }
                return
            }
            creep.say('notenughen')
            return
        }

        let target = 0;
        if (creep.memory.target_id) {
            target = Game.getObjectById(creep.memory.target_id);
            if (target.hits == target.hitsMax || target.hits > creep.room.memory.wall_hp) {
                target = this.findRepairTargets(creep);
                if (target && target != 0) {
                    creep.memory.target_id = target.id;
                }
            }
        } else {
            target = this.findRepairTargets(creep);
            if (target && target != 0) {
                creep.memory.target_id = target.id;
            } else {
                console.log('No target found');
                return;
            }
        }

        if (target != 0 && target) {
            if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target.pos, { range: 3 })
            }
        }
    }
};

module.exports = roleRepairer;