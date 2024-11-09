const roleHauler = {
    runHighwayRes: function (creep) { // special haulers commodity miners

    },

    runHighwayPow: function (creep) { // special haulers for power

    },

    runStrongholder: function (creep) { // the special haulers for looting strongholds

    },

    runRemoteHauler: function (creep) {
        if (creep.store[RESOURCE_ENERGY] < 100) {
            const target_room = creep.memory.target_room;
            if (!target_room) { console.log('INVALID TARGET ROOM VALUE FOR CREEP - ' + creep.name) }
            else if (creep.room.name != target_room) { creep.moveTo(new RoomPosition(25, 25, target_room), { maxOps: 600 }); return }

            // locate energy
            let target
            if (creep.memory.target_id && !creep.memory.target_id == 0 && Game.getObjectById(creep.memory.target_id)) {
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
                const close = creep.pos.findClosestByRange(creep.room.find(FIND_SOURCES))
                creep.moveTo(close, { range: 3 })
                return
            }
        }

        const original_room = creep.memory.original_room;

        if (creep.room.name != original_room) {
            creep.moveTo(new RoomPosition(25, 25, original_room), { maxOps: 600 });
            return;
        }
        const storage = creep.room.storage;
        if (creep.transfer(storage, RESOURCE_ENERGY, Math.min(creep.store[RESOURCE_ENERGY], storage.store.getFreeCapacity())) == ERR_NOT_IN_RANGE) {
            creep.moveTo(storage);
        }
    },

    runWithStorage: function (creep) {
        const target_room = creep.memory.target_room;
        if (!target_room) { console.log('INVALID TARGET ROOM VALUE FOR CREEP - ' + creep.name) }
        else if (creep.room.name != target_room) { creep.moveTo(new RoomPosition(25, 25, target_room), { maxOps: 600 }); return }

        if (creep.store[RESOURCE_ENERGY] >= 50) {
            const storage = creep.room.storage
            if (storage.getFreeCapacity() == 0) { creep.say('it full'); return }
            if (creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage)
            }
        }

        // locate energy
        let target
        if (creep.memory.target_id && !creep.memory.target_id == 0 && Game.getObjectById(creep.memory.target_id)) {
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
        }
    },

    runNoStorage: function (creep) {
        const target_room = creep.memory.target_room;
        if (!target_room) { console.log('INVALID TARGET ROOM VALUE FOR CREEP - ' + creep.name) }
        else if (creep.room.name != target_room) { creep.moveTo(new RoomPosition(25, 25, target_room), { maxOps: 600 }); return }

        if (creep.store[RESOURCE_ENERGY] >= 40) {
            const targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                }
            });
            
            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            } else {
                const flags = creep.room.find(FIND_FLAGS)
                let spotflag
                for (let i in flags) {
                    const flag_name = flags[i].name
                    if (flag_name.split('_')[0] == 'spot') {
                        spotflag = Game.flags[flag_name]
                        break
                    }
                }
                if (!spotflag) { creep.say('no spot :('); return }
                else {creep.moveTo(spotflag)}
            }
            return
        }
        
        // locate energy
        let target
        if (creep.memory.target_id && !creep.memory.target_id == 0 && Game.getObjectById(creep.memory.target_id)) {
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
        }
    },

    run: function (creep) {
        if (!creep.memory.sub_role) { creep.memory.sub_role = 'main'; return }
        const sub_role = creep.memory.sub_role
        if (sub_role == 'main') {
            if (creep.room.storage) {
                this.runWithStorage(creep)
            } else {
                this.runNoStorage(creep)
            }
        } else if (sub_role == 'remote') {
            this.runRemoteHauler(creep)
        } else if (sub_role == 'stronghold') {
            this.runStrongholder(creep)
        } else if (sub_role == 'highwayres') {
            this.runHighwayRes(creep)
        } else if (sub_role == 'highwaypow') {
            this.runHighwayPow(creep)
        }
    }
};

module.exports = roleHauler;