const roleClaimer = {
    run: function (creep) {
        const target_room = creep.memory.target_room;
        if (!target_room) { console.log('INVALID TARGET ROOM VALUE FOR CREEP - ' + creep.name) }
        else if (creep.room.name != target_room) { creep.moveTo(new RoomPosition(25, 25, target_room), { maxOps: 600 }); return }

        let controller = creep.room.controller;
        if (!controller) { return }
        if (controller.owner) {
            if (!controller.my) {
                creep.say("WAH!")
                if (creep.attackController(controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller)
                }
                return
            }

            creep.say("Nya!")
        } else {
            if (creep.claimController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller)
            }
        }
    }
};

module.exports = roleClaimer;