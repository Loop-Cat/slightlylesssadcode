const roleManager = {
    shiftAmount: function (creep, dealer, target, resource, amount) {
        if (!dealer || !target || !creep) { return }
        if (dealer.store[resource] > 0 && creep.store[resource] == 0) {
            if (creep.store.getFreeCapacity() == 0) {
                creep.transfer(dealer, Object.keys(creep.store)[0])
            } else {
                creep.withdraw(dealer, resource, amount);
            }
        } else if (creep.store[resource] > 0) {
            creep.transfer(target, resource);
        }
    },

    shift: function (creep, dealer, target, resource, floor) {
        if (!dealer || !target || !creep) { return }
        if (dealer.store[resource] > floor && creep.store[resource] == 0) {
            if (creep.store.getFreeCapacity() == 0) {
                creep.transfer(target, Object.keys(creep.store)[0])
            } else {
                creep.withdraw(dealer, resource);
            }
        } else if (creep.store[resource] > 0) {
            creep.transfer(target, resource);
        }
    },

    locateSpot: function (creep) {
        const room = creep.room
        if (!room) { console.log('MANAGER FAILURE ' + creep.name); return }
        const flags = creep.room.find(FIND_FLAGS)
        for (let i in flags) {
            const flag_name = flags[i].name
            if (flag_name.split('_')[0] == 'spot') {
                creep.memory.spot = flag_name
            }
        }
        if (!creep.memory.spot) { creep.say('no spot :('); return }
    },

    run: function (creep) {
        let flag
        if (!creep.memory.spot) {
            //flag = Game.flags.find(f => f.name.slice(0, 4) == 'Spot')
            this.locateSpot(creep)
            flag = Game.flags[creep.memory.spot];
        } else {
            flag = Game.flags[creep.memory.spot];
            if (!flag) { this.locateSpot(creep) }
        }

        if (!creep.pos.isEqualTo(flag.pos)) {
            creep.moveTo(flag.pos, { range: 0, priority: 20000 });
            return 1;
        }

        let link
        let factory

        if (!creep.memory.link_id) {
            link = creep.pos.findInRange(FIND_MY_STRUCTURES, 1).filter(s => s.structureType == STRUCTURE_LINK)[0]
            if (link) {
                creep.memory.link_id = link.id
            } else {
                creep.say('No link :(')
                return
            }
        } else {
            link = Game.getObjectById(creep.memory.link_id)
        }

        if (!creep.memory.factory_id) {
            factory = creep.pos.findInRange(FIND_MY_STRUCTURES, 1).filter(s => s.structureType == STRUCTURE_FACTORY)[0]
            if (factory) {
                creep.memory.factory_id = factory.id
            } else {
                //creep.say('No fctr :(')
                creep.memory.factory_id = 0
            }
        } else {
            if (creep.memory.factory_id != 0) {
                factory = Game.getObjectById(creep.memory.factory_id)
            }
        }

        const terminal = creep.room.terminal;
        const storage = creep.room.storage;

        if (!link) { return }

        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            if (terminal) {
                if (terminal.store[RESOURCE_ENERGY] < 100000 && storage.store[RESOURCE_ENERGY] > 100000) {
                    creep.transfer(terminal, RESOURCE_ENERGY)
                } else if (factory) {
                    if (factory.store[RESOURCE_ENERGY] < 10000) {
                        creep.transfer(factory, RESOURCE_ENERGY)
                    } else {
                        creep.transfer(storage, RESOURCE_ENERGY)
                    }
                } else {
                    creep.transfer(storage, RESOURCE_ENERGY)
                }
            } else {
                creep.transfer(storage, RESOURCE_ENERGY)
            }
        } else {
            if (terminal) {
                if (link.store[RESOURCE_ENERGY] > 0) {
                    creep.withdraw(link, RESOURCE_ENERGY)
                    return 0;
                } else if (terminal.store[RESOURCE_ENERGY] < 50000 && storage.store[RESOURCE_ENERGY] > 110000) {
                    creep.withdraw(storage, RESOURCE_ENERGY)
                    return 0;
                } else if (terminal.store[RESOURCE_ENERGY] > 20000 && storage.store[RESOURCE_ENERGY] < 1000000) {
                    creep.withdraw(terminal, RESOURCE_ENERGY)
                    return 0;
                }
            } else {
                creep.withdraw(link, RESOURCE_ENERGY)
                return 0;
            }
        }
        return 0;
    }
};

module.exports = roleManager;