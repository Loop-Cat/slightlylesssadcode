const roleReserver = {

    run: function(creep) {
        const target_room = creep.memory.target_room;
        if (!target_room) { console.log('INVALID TARGET ROOM VALUE FOR CREEP - ' + creep.name) }
        else if (creep.room.name != target_room) { creep.moveTo(new RoomPosition(25, 25, target_room), { maxOps: 600 }); return }
        if (creep.room.name == target_room){
            if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                if(creep.moveTo(creep.room.controller, {maxRooms: 1}) == ERR_NO_PATH){
                    creep.say("i am lost")
                }
            }
        }
	}
};

module.exports = roleReserver;