const roleFiller = {
    findTargetToFill: function (creep) {
        const all_structures = creep.room.find(FIND_STRUCTURES);
        for (let i in all_structures) {
            const structure = all_structures[i];
            if (structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) {
                if (structure.store.getUsedCapacity(RESOURCE_ENERGY) < structure.store.getCapacity(RESOURCE_ENERGY)) {
                    return structure
                }
            } else if (structure.structureType == STRUCTURE_TOWER) {
                if (structure.store.getUsedCapacity(RESOURCE_ENERGY) < TOWER_CAPACITY * 0.7) {
                    return structure
                }
            } else if (structure.structureType == STRUCTURE_LAB) {
                if (structure.store.getUsedCapacity(RESOURCE_ENERGY) < LAB_ENERGY_CAPACITY) {
                    return structure
                }
            }
        }

        creep.memory.cooldown = 10;
        return
    },

    run: function (creep) {
        if (creep.memory.renewing) {
            if (creep.ticksToLive < 500 && creep.room.energyAvailable > 500) {
                creep.memory.needs_renewal = true
            }
        }

        if (creep.memory.needs_renewal && creep.room.energyAvailable > 500) {
            if (creep.ticksToLive > 1450) {
                creep.memory.needs_renewal = false;
                return;
            }
            const spawn = creep.room.find(FIND_MY_SPAWNS).find(s => !s.spawning)
            if (spawn) {
                if (creep.moveTo(spawn) == IN_RANGE) {
                    spawn.renewCreep(creep);
                }
            }
            return;
        }

        if (creep.store[RESOURCE_ENERGY] == 0) {
            const storage = Game.rooms[creep.room.name].storage;
            if (storage.store[RESOURCE_ENERGY] > 0) {
                if (creep.moveTo(storage) == IN_RANGE) {
                    creep.withdraw(storage, RESOURCE_ENERGY)
                }
            }
        } else {
            if (creep.memory.cooldown > 0) {
                creep.say('Nuh uh :3');
                creep.memory.cooldown = creep.memory.cooldown - 1;
                return;
            }

            let target;
            if (creep.memory.target_id) {
                target = Game.getObjectById(creep.memory.target_id);
                if (target.store.getUsedCapacity(RESOURCE_ENERGY) == target.store.getCapacity(RESOURCE_ENERGY)) {
                    target = this.findTargetToFill(creep);
                    if (target) {
                        creep.memory.target_id = target.id;
                    }
                }
            } else {
                target = this.findTargetToFill(creep);
                if (target) {
                    creep.memory.target_id = target.id;
                }
            }

            if (target) {
                if (creep.moveTo(target) == IN_RANGE) {
                    creep.transfer(target, RESOURCE_ENERGY)
                }
            }
        }
    }
};

module.exports = roleFiller;