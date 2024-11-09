const CreepListAseembler = require("utils.creep_list_assembler")
const BuildPlanner = require("utils.build_planner")
const RoomStateManager = require("utils.room_state_manager")
const FlagManager = require("utils.flag_manager")
// unfinished functions: findRangeRoom, findClosestRoomByRange, valueRoomForClaim, automaticTerritoryManager
// plus need to replace all coments where I explain requests with actual CreepListAssmebler.request() sort of thing
const claimManager = {
    findRangeRoom: function (room1_name, room2_name) {
        return // those are super hard or rather sad to write and are also last resort options sooo... just don't do it for now i guess
    },

    findClosestRoomByRange: function (room_name, list_of_names) {
        return // those are super hard or rather sad to write and are also last resort options sooo... just don't do it for now i guess
    },

    autoSupport: function () {
        const main_flags = FlagManager.getAllerMainFlags()

        let rooms_for_support = []
        let capable_rooms = []
        for (let flag_name of main_flags) {
            const room_name = flag_name.split("_")[1]
            const room = Game.rooms[room_name]
            if (!room) {
                console.log("autoSupport: MAIN ROOM NOT IN VISION - " + room_name)
                rooms_for_support.push(room_name)
            } else {
                const level = room.memory.level
                if (!level) {
                    RoomStateManager.roomLevelUpdate(room_name)
                    rooms_for_support.push(room_name)
                } else if (level < 4) {
                    rooms_for_support.push(room_name)
                } else {
                    capable_rooms.push(room_name)
                }
            }
        }

        for (let room_name of rooms_for_support) {
            if (capable_rooms.length == 0) { console.log("autoSupport: Ran out of rooms capable of supporting"); return }
            let support_room
            const memory = Memory.rooms[room_name]

            if (!memory) {
                support_room = this.findClosestRoomByRange(room_name, capable_rooms)
            } else {
                const claimer_room = memory.claimer_room
                if (!claimer_room) {
                    const room = Game.rooms[room_name]
                    if (!room) {
                        for (let i in Game.flags) {
                            if (i.split('_')[0] == "room" && i.split('_')[1] == room_name) {
                                if (i.split('_')[2] != undefined) {
                                    support_room = i.split('_')[2]
                                }
                            }
                        }
                    } else {
                        const flags = room.find(FIND_FLAGS)
                        for (let i in flags) {
                            if (i.split('_')[0] == "room") {
                                if (i.split('_')[2] != undefined) {
                                    support_room = i.split('_')[2]
                                }
                            }
                        }
                    }
                    if (!support_room) {
                        support_room = this.findClosestRoomByRange(room_name, capable_rooms)
                    }
                    memory.claimer_room = support_room
                }
                else { support_room = claimer_room }
            }

            if (!support_room) { console.log("autoSupport: Couldn't find a support for - " + room_name); continue }

            console.log("autoSupport: Support room - " + support_room + " is sending help to " + room_name)
            const index = capable_rooms.indexOf(support_room)
            capable_rooms.splice(index, 1)
        }
    },

    supportRoom: function (helper_room_name, room_name) {
        const helper_room = Game.rooms[helper_room_name]
        if (!helper_room) { console.log("supportRoom: HELPER ROOM NOT IN VISSION - " + helper_room_name); return }
        if (!helper_room.controller.my) { console.log("supportRoom: HELPER ROOM NOT MY - " + helper_room_name); return }
        const room = Game.rooms[room_name]
        const memory = Memory.rooms[room_name]

        if (memory.room_value < 0) {
            FlagManager.removeFlag('room_' + room_name)
            return
        }

        if (!room) {
            console.log("supportRoom: Room under support is not in vision - " + room_name)
            CreepListAseembler.requestTemplate(helper_room, 'temp_claim', {SPAWNROOM: helper_room_name, TARGETROOM: room_name})
            CreepListAseembler.requestTemplate(helper_room, 'temp_support', {SPAWNROOM: helper_room_name, TARGETROOM: room_name})
        }

        if (memory.room_value != undefined) {
            this.valueRoomForClaim(room)
        }

        const orbs = room.find(FIND_HOSTILE_STRUCTURES)
        if (orbs.length > 0) {
            console.log("supportRoom: Is orbed - " + room_name)
            memory.orbed = true
            CreepListAseembler.requestTemplate(helper_room, 'temp_orb_roomba', {SPAWNROOM: helper_room_name, TARGETROOM: room_name})
        }

        const hostiles = room.find(FIND_HOSTILE_CREEPS)
        if (hostiles.length > 0) {
            console.log("supportRoom: Under attack - " + room_name)
            memory.attacked = true
            if (hostiles.some(c => c.owner.username != "Invader")) {
                // reqest a full attack or nothing if it's a player since players are actually a threat
                return
            }

            CreepListAseembler.requestTemplate(helper_room, 'temp_def_roomba', {SPAWNROOM: helper_room_name, TARGETROOM: room_name})
            return
        }

        CreepListAseembler.requestTemplate(helper_room, 'temp_support', {SPAWNROOM: helper_room_name, TARGETROOM: room_name})
    },

    autoRemote: function () {
        const remote_flags = FlagManager.getAllRemoteFlags()
        for (let flag_name of remote_flags) {
            const remote_name = flag_name.split('_')[1]
            const owner_name = flag_name.split('_')[2]
            if (!remote_name) { console.log("autoRemote: INVALID REMOTE NAME IN FLAG - " + flag_name); continue }
            if (!owner_name) { console.log("autoRemote: INVALID OWNER NAME IN FLAG - " + flag_name); continue }
            this.runRemoteRoom(owner_name, remote_name)
        }
    },

    runRemoteRoom: function (owner_room_name, room_name) {
        const owner_room = Game.rooms[owner_room_name]
        if (!owner_room) { console.log("runRemoteRoom: OWNER ROOM NOT IN VISSION - " + owner_room_name); return }
        if (!owner_room.controller.my) { console.log("runRemoteRoom: OWNER ROOM NOT MY - " + owner_room_name); return }
        const room = Game.rooms[room_name]
        const memory = Memory.rooms[room_name]
        if (memory.inactive && memory.inactive > 3500) {
            console.log("runRemoteRoom: ROOM INACTIVE FOR TOO LONG - " + room_name)
            // notify me that the remote is lost
            FlagManager.removeFlag('remote_' + room_name)
            memory.remote_value = -1
            return
        }

        if (memory.remote_value < 0) {
            FlagManager.removeFlag('remote_' + room_name)
            return
        }

        if (!room) {
            console.log("runRemoteRoom: Remote room not in vision - " + room_name)
            if (!memory) {
                console.log("runRemoteRoom: Room not explored")
                CreepListAseembler.requestTemplate(owner_room, 'temp_remote_build', {SPAWNROOM: owner_room_name, TARGETROOM: room_name})
                return
            }

            if (memory.pause && memory.pause > 0) { // pauses remote mining temporary if the threat is considered too big to fight
                memory.pause -= 1
                if (!memory.inactive) { memory.inactive = 0 }
                memory.inactive += 1 // counts how long the remote is inactive for
                return
            }
            else { memory.pause = 0 }

            if (memory.attacked) {
                console.log("runRemoteRoom: Under attack")
                CreepListAseembler.requestTemplate(owner_room, 'temp_def_roomba', {SPAWNROOM: owner_room_name, TARGETROOM: room_name})
                return
            }

            if (memory.orbed) {
                console.log("runRemoteRoom: Is orbed")
                CreepListAseembler.requestTemplate(owner_room, 'temp_orb_roomba', {SPAWNROOM: owner_room_name, TARGETROOM: room_name})
                return
            }

            if (owner_room.controller.level >= 6) {
                CreepListAseembler.requestTemplate(owner_room, 'temp_reserve2', {SPAWNROOM: owner_room_name, TARGETROOM: room_name})
            } else {
                CreepListAseembler.requestTemplate(owner_room, 'temp_reserve1', {SPAWNROOM: owner_room_name, TARGETROOM: room_name})
            }
            return
        }

        if (memory.remote_value != undefined) {
            this.valueRoomForRemote(owner_room, room)
        }

        const orbs = room.find(FIND_HOSTILE_STRUCTURES)
        if (orbs.length > 0) {
            console.log("runRemoteRoom: Is orbed - " + room_name)
            memory.orbed = true
            CreepListAseembler.requestTemplate(owner_room, 'temp_orb_roomba', {SPAWNROOM: owner_room_name, TARGETROOM: room_name})
        }

        const hostiles = room.find(FIND_HOSTILE_CREEPS)
        const attackers = hostiles.filter(c => c.body.some(p => p.type == ATTACK || p.type == RANGED_ATTACK))
        if (attackers.length > 0) {
            console.log("runRemoteRoom: Under attack - " + room_name)
            memory.attacked = true
            if (attackers.length > 2) {
                const min_attack_time = attackers[0].ticksToLive
                memory.pause = min_attack_time
                return // we dont request anything if attack is too big
            }
            CreepListAseembler.requestTemplate(owner_room, 'temp_def_roomba', {SPAWNROOM: owner_room_name, TARGETROOM: room_name})
            return
        }

        const name = owner_room.controller.owner.username
        let request = []
        if (!room.controller.reservation) {
            if (owner_room.controller.level >= 6) {
                CreepListAseembler.requestTemplate(owner_room, 'temp_reserve2', {SPAWNROOM: owner_room_name, TARGETROOM: room_name})
            } else {
                CreepListAseembler.requestTemplate(owner_room, 'temp_reserve1', {SPAWNROOM: owner_room_name, TARGETROOM: room_name})
            }
        } else if (room.controller.reservation.username == name && room.controller.reservation.ticksToEnd > 2500) {
            // here we don"t reqest the reserver since it"s already reserved enough
        } else {
            if (owner_room.controller.level >= 6) {
                CreepListAseembler.requestTemplate(owner_room, 'temp_reserve2', {SPAWNROOM: owner_room_name, TARGETROOM: room_name})
            } else {
                CreepListAseembler.requestTemplate(owner_room, 'temp_reserve1', {SPAWNROOM: owner_room_name, TARGETROOM: room_name})
            }
        }

        const sites = room.find(FIND_MY_CONSTRUCTION_SITES)
        const sources = room.find(FIND_SOURCES)
        if (sites.length > 0) {
            CreepListAseembler.requestTemplate(owner_room, 'temp_remote_build', {SPAWNROOM: owner_room_name, TARGETROOM: room_name})
        } else {
            const roads = room.find(FIND_STRUCTURES).filter(s => s.structureType == STRUCTURE_ROAD)
            if (roads.length < 5) {
                BuildPlanner.remoteRoadPlanner(room)
                CreepListAseembler.requestTemplate(owner_room, 'temp_remote_build', {SPAWNROOM: owner_room_name, TARGETROOM: room_name})
            } else {
                let needs_repair = false
                for (let road of roads) {
                    if (road.hits / road.hitsMax < 0.40) { needs_repair = true; break }
                }

                if (needs_repair) {
                    CreepListAseembler.requestTemplate(owner_room, 'temp_remote_repair', {SPAWNROOM: owner_room_name, TARGETROOM: room_name})
                }
            }

            const containers = room.find(FIND_STRUCTURES).filter(s => s.structureType == STRUCTURE_CONTAINER)
            if (containers.length < sources.length) {
                BuildPlanner.remoteContainerPlanner(room)
                CreepListAseembler.requestTemplate(owner_room, 'temp_remote_build', {SPAWNROOM: owner_room_name, TARGETROOM: room_name})
            }
        }

        if (owner_room.controller.level >= 6) {
            CreepListAseembler.requestTemplate(owner_room, 'temp_remote_B' + sources.length, {SPAWNROOM: owner_room_name, TARGETROOM: room_name})
        } else {
            CreepListAseembler.requestTemplate(owner_room, 'temp_remote_A' + sources.length, {SPAWNROOM: owner_room_name, TARGETROOM: room_name})
        }
    },

    valueRoomForRemote: function (owner_room, room) { // adds the remote name to the owner memory if it's not an invalid remote
        if (!owner_room) { console.log("valueRoomForRemote: INVALID OWNER ROOM - " + owner_room); return }
        if (!room) { console.log("valueRoomForRemote: INVALID REMOTE ROOM - " + room); return }
        let value = 0
        if (!room.controller) { value = -1 }
        else if (room.controller.owner) { value = -1 }
        else if (room.find(FIND_SOURCES).length == 0) { value = -1 }

        if (value = -1) { room.memory.remote_value = value; return }
        value += room.find(FIND_SOURCES).length
        const terrainData = room.getTerrain()
        let swamps = 0
        let empties = 0
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                if (terrainData.get(x, y) == TERRAIN_MASK_SWAMP) { swamps += 1 }
                if (terrainData.get(x, y) != TERRAIN_MASK_WALL) { empties += 1 }
            }
        }
        if (swamps / empties < 0.2) { value += 1 } // if swamps cover less than 20% of room give it an extra point
        room.memory.remote_value = value
        if (!owner_room.valid_remotes) { owner_room.valid_remotes = [] }
        if (!owner_room.valid_remotes.includes(room.name)) { owner_room.valid_remotes.push(room.name) }
    },

    valueRoomForClaim: function (room) {
        // autoclaiming is delayed until after I have a working creep list assembler to test exsisting auto remote and build code
    },

    automaticTerritoryManager: function () { // scary
        // auto remote increasing
        const main_flags = FlagManager.getAllMainFlags()
        let capable_rooms = []
        for (let flag_name of main_flags) {
            const room_name = flag_name.split('_')[1]
            const room = Game.rooms[room_name]
            const level = room.memory.level
            if (!level) {
                RoomStateManager.roomLevelUpdate(room_name)
            } else if (level >= 4) {
                capable_rooms.push(room)
            }
        }

        for (let room of capable_rooms) {
            const valid_remotes = room.memory.valid_remotes
            const remotes = room.memory.remotes
            if (!valid_remotes) {
                CreepListAseembler.requestTemplate(owner_room, 'temp_scout', 
                    {SPAWNROOM: room.name, TARGETROOM: 'TARGETROOM', 
                    TASK: [{remote: true, direction: 'top'}, {remote: true, direction: 'right'}, {remote: true, direction: 'bottom'}, {remote: true, direction: 'left'},]})
            } else {
                const level = room.memory.level
                let max_remotes = 0
                if (level < 7) {
                    max_remotes = 2
                } else if (level < 8) {
                    max_remotes = 4
                } else if (level < 8) {
                    max_remotes = 4 // only 4 for simplicity
                }
                
                if (remotes == undefined) { room.memory.remotes = [] }
                if (remotes.length < max_remotes) {
                    if (valid_remotes.length <= remotes.length) { continue }
                    let remote_reqest = []
                    for (let room_name of valid_remotes) {
                        if (!remotes.includes(room_name)) {
                            remote_reqest.push({room: room_name, value: Memory.rooms[room_name].remote_value})
                        }
                    }

                    const sorted_requests = remote_reqest.sort((a, b) => b.value - a.value)
                    let final_requests = []
                    let counter = 0
                    for (let reqest of sorted_requests) {
                        if (counter + remotes.length >= max_remotes) { break }
                        final_requests.push(reqest.room)
                        counter += 1
                    }

                    let task = []
                    for (let request of final_requests) {
                        task.push({room: request.room, flag: 'remote'})
                    }
                    CreepListAseembler.requestTemplate(owner_room, 'temp_scout', {SPAWNROOM: room.name, TARGETROOM: 'TARGETROOM', TASK: task})
                }
            }
        }

        // auto room claiming
    },
};

module.exports = claimManager;