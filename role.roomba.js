const roleMeleeDefender = {
    run: function (creep) {
        const target_room = creep.memory.target_room;
        if (!target_room) { console.log('INVALID TARGET ROOM VALUE FOR CREEP - ' + creep.name) }
        else if (creep.room.name != target_room) { creep.moveTo(new RoomPosition(25, 25, target_room), { maxOps: 600 }); return }

        const closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        const invaderCore = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: (structure) => { return (structure.structureType == STRUCTURE_INVADER_CORE) }
        });

        if (closestHostile) {
            if (creep.attack(closestHostile) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestHostile, { maxRooms: 1 });
            }
        } else if (invaderCore) {
            if (creep.attack(invaderCore) == ERR_NOT_IN_RANGE) {
                creep.moveTo(invaderCore, { maxRooms: 1 });
            }
        } else {
            if (!creep.room.controller) {creep.say("Nu!"); return;}
            creep.moveTo(creep.room.controller, { maxRooms: 1, range: 2});
            creep.say("Nya!")
        }

    }
};

module.exports = roleMeleeDefender;