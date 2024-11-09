const ClaimManager = require('utils.claim_manager')
const FlagManager = require('utils.flag_manager')

var roleScout = {
    runClaimPlacer: function (creep) {
        const target_room = creep.memory.task[0].room
        const flag_type = creep.memory.task[0].flag
        if (Game.rooms[target_room]) {
            const room = Game.rooms[target_room]
            if (flag_type == 'room') { FlagManager.markForClaiming(room) }
            else if (flag_type == 'remote') { FlagManager.markForClaiming(room) }

            creep.memory.task.shift()
            return
        }

        if (!target_room) { console.log('INVALID TARGET ROOM VALUE FOR CREEP - ' + creep.name) }
        else if (creep.room.name != target_room) { creep.moveTo(new RoomPosition(25, 25, target_room), { maxOps: 600 }); return }
        return
    },

    runRemoteChecker: function (creep) {
        const original_room = Game.rooms[creep.memory.original_room]
        if (!original_room) { creep.say(':('); console.log('INVALID ORIGINAL ROOM IN SCOUT - ' + creep.name); return }

        if (creep.room.name != original_room.name) { creep.moveToRoom(original_room.name); return } // failsafe in case the scout gets stranded
        const direction = creep.memory.task[0].direction
        let find_const
        if (direction = 'top') {
            find_const = FIND_EXIT_TOP
        } else if (direction = 'right') {
            find_const = FIND_EXIT_RIGHT
        } else if (direction = 'left') {
            find_const = FIND_EXIT_LEFT
        } else if (direction = 'bottom') {
            find_const = FIND_EXIT_BOTTOM
        } else { creep.say(':('); console.log('INVALID DIRECTION IN TASK OF SCOUT - ' + creep.name); return }

        const exits = original_room.find(find_const)
        if (exits.length == 0) { creep.memory.task.shift(); return }

        if (creep.room.name == original_room.name) {
            const target = creep.pos.findClosestByRange(exits)
            creep.moveTo(target)
        } else {
            ClaimManager.valueRoomForRemote(creep.memory.original_room, room)
            creep.memory.task.shift()
        }
    },

    runClaimChecker: function (creep) {
        const target_room = creep.memory.task[0].room

        if (Game.rooms[target_room]) {
            const room = Game.rooms[target_room]
            if (room.memory.remote_value && room.memory.claim_value) {
                creep.memory.task.shift()
                return
            } else {
                ClaimManager.valueRoomForClaim(room)
            }
        }

        if (!target_room) { console.log('INVALID TARGET ROOM VALUE FOR CREEP - ' + creep.name) }
        else if (creep.room.name != target_room) { creep.moveTo(new RoomPosition(25, 25, target_room), { maxOps: 600 }); return }
        return
    },

    runSigner: function (creep) {
        const target_room = creep.memory.task[0].room
        const sign = creep.memory.task[0].sign
        if (Game.rooms[target_room]) {
            if (Game.rooms[target_room].sign.text == sign) {
                creep.memory.task.shift()
                return
            } else {
                const room = Game.rooms[target_room]
                if (creep.signController(room.controller, sign) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(room.controller)
                }
                return
            }
        }

        if (!target_room) { console.log('INVALID TARGET ROOM VALUE FOR CREEP - ' + creep.name) }
        else if (creep.room.name != target_room) { creep.moveTo(new RoomPosition(25, 25, target_room), { maxOps: 600 }); return }
        return
    },

    run: function (creep) {
        const task = creep.memory.task
        if (!task) { creep.say('no task :('); return }
        if (task.length == 0) { creep.say('empty :('); return }
        if (task[0].sign) {
            this.runSigner(creep)
        } else if (task[0].check) {
            this.runClaimChecker(creep)
        } else if (task[0].flag) {
            this.runClaimPlacer(creep)
        } else if (task[0].remote) {
            this.runClaimPlacer(creep)
        }
    },
};

module.exports = roleScout;