const FlagManager = {
    checkMainFlags: function () {
        const rooms = Game.rooms
        for (let i in rooms) {
            const room = rooms[i]
            if (!room.controller) { continue }
            if (!room.controller.my) { continue }
            const flags = room.find(FIND_FLAGS)
            let place_flag = true
            for (let i2 in flags) {
                const flag_name = flags[i2].name
                if (flag_name.split('_')[0] == "room") { place_flag = false }
            }
            if (place_flag) {
                room.createFlag(3, 3, 'room_' + room.name, COLOR_PURPLE)
            }
        }
    },

    getAllMainFlags: function () {
        let room_flag_names = []
        for (let i in Game.flags) {
            if (i.split('_')[0] == "room") {
                const room = Game.rooms[i.split('_')[1]]
                if (!room) { console.log('Room is not in vision'); continue }
                if (Game.flags[i].room.controller && Game.flags[i].room.controller.my) {
                    room_flag_names.push(i)
                }
            }
        }

        return room_flag_names
    },

    getAllerMainFlags: function () {
        let room_flag_names = []
        for (let i in Game.flags) {
            if (i.split('_')[0] == "room") {
                room_flag_names.push(i)
            }
        }

        return room_flag_names
    },

    getAllRemoteFlags: function () {
        let remote_flag_names = []
        for (let i in Game.flags) {
            if (i.split('_')[0] == "remote") {
                remote_flag_names.push(i)
            }
        }

        return remote_flag_names
    },

    getFlagsForClaiming: function () {
        let unclaimed_flag_names = []
        for (let i in Game.flags) {
            if (i.split('_')[0] == "room") {
                const room = Game.rooms[i.split('_')[1]]
                if (!room) { console.log('Room is not in vision... oh well'); unclaimed_flag_names.push(i) }
                else if (Game.flags[i].room.controller && !Game.flags[i].room.controller.owner) {
                    unclaimed_flag_names.push(i)
                }
            }
        }
        return unclaimed_flag_names
    },

    markForClaiming: function (room) {
        if (!room) { console.log('markForClaiming: ROOM NOT IN VISION - ' + room.name); return }
        const flags = room.find(FIND_FLAGS)
        let place_flag = true
        for (let i2 in flags) {
            const flag_name = flags[i2].name
            if (flag_name.split('_')[0] == "room") { place_flag = false }
        }
        if (place_flag) {
            room.createFlag(3, 3, 'room_' + room.name, COLOR_PURPLE)
        } else {
            console.log('markForClaiming: FLAG ALREADY PRESENT - ' + room.name)
        }
    },

    markForRemoting: function (owner_room, room) {
        if (!owner_room) { console.log('markForRemoting: OWNER NOT IN VISION - ' + room.name); return }
        if (!room) { console.log('markForRemoting: REMOTE NOT IN VISION - ' + room.name); return }
        const flags = room.find(FIND_FLAGS)
        let place_flag = true
        for (let i2 in flags) {
            const flag_name = flags[i2].name
            if (flag_name.split('_')[0] == "remote") { place_flag = false }
        }

        if (place_flag) {
            room.createFlag(3, 3, 'remote_' + room.name + '_' + owner_room.name, COLOR_PURPLE)
        } else {
            console.log('markForRemoting: FLAG ALREADY PRESENT - ' + room.name)
        }

        if (owner_room.memory.remotes == undefined) { owner_room.memory.remotes = [] }
        if (!owner_room.memory.remotes.includes(room.name)) {
            owner_room.memory.remotes.push(room.name)
        }
    },

    getSingleAttackFlags: function () {
        let attack_flag_names = []
        for (let i in Game.flags) {
            if (i.split('_')[0] == "squash") {
                const room = Game.rooms[i.split('_')[1]]
                if (!room) { console.log('Room is not in vision... oh well'); }
                attack_flag_names.push(i)
            }
        }

        return attack_flag_names
    },

    getSwarmAttackFlags: function () {
        let attack_flag_names = []
        for (let i in Game.flags) {
            if (i.split('_')[0] == "swarm") {
                const room = Game.rooms[i.split('_')[1]]
                if (!room) { console.log('Room is not in vision... oh well'); }
                attack_flag_names.push(i)
            }
        }

        return attack_flag_names
    },

    removeFlag: function (flag_name) {
        if (!flag_name) { console.log('removeFlag: INVALID FLAG NAME - ' + flag_name); return }
        const flag = Game.flags[flag_name]
        if (!flag) { console.log('removeFlag: UNABLE TO FIND FLAG - ' + flag_name); return }
        flag.remove()
    },
}

module.exports = FlagManager;