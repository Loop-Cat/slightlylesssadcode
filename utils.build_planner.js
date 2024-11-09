const FlagManager = require('utils.flag_manager')
const RoomStateManager = require('utils.room_state_manager')
const Matrices = require('utils.matrices')

const FloodCash = {}

const lab_stamp = [
    { x: 3, y: 1, type: STRUCTURE_LAB },
    { x: 2, y: 1, type: STRUCTURE_LAB },
    { x: 2, y: 2, type: STRUCTURE_LAB },
    { x: 4, y: 2, type: STRUCTURE_LAB },
    { x: 4, y: 3, type: STRUCTURE_LAB },
    { x: 3, y: 3, type: STRUCTURE_LAB },
    { x: 1, y: 2, type: STRUCTURE_LAB },
    { x: 1, y: 3, type: STRUCTURE_LAB },
    { x: 3, y: 4, type: STRUCTURE_LAB },
    { x: 2, y: 4, type: STRUCTURE_LAB },

    { x: 4, y: 1, type: STRUCTURE_ROAD },
    { x: 3, y: 2, type: STRUCTURE_ROAD },
    { x: 2, y: 3, type: STRUCTURE_ROAD },
    { x: 1, y: 4, type: STRUCTURE_ROAD },
    { x: 0, y: 3, type: STRUCTURE_ROAD },
    { x: 0, y: 2, type: STRUCTURE_ROAD },
    { x: 1, y: 1, type: STRUCTURE_ROAD },
    { x: 2, y: 0, type: STRUCTURE_ROAD },
    { x: 3, y: 0, type: STRUCTURE_ROAD },
    { x: 5, y: 2, type: STRUCTURE_ROAD },
    { x: 5, y: 3, type: STRUCTURE_ROAD },
    { x: 4, y: 4, type: STRUCTURE_ROAD },
    { x: 3, y: 5, type: STRUCTURE_ROAD },
    { x: 2, y: 5, type: STRUCTURE_ROAD },
]

const buildPlanner = {
    runAutoPlanner: function () {
        const main_flags = FlagManager.getAllMainFlags()
        for (let i in main_flags) {
            const room_name = main_flags[i].split('_')[1]
            const room = Game.rooms[room_name]
            if (!room) { console.log('runAutoPlanner: Room is not in vision - ' + room_name); continue }
            this.planRoom(room)
        }
    },

    planRoom: function (room) {
        if (!room) { console.log('planRoom: ROOM NOT IN VISION'); return }
        if (!this.shouldRunForRoom(room)) { return }
        // the omega super duper hard part here
        console.log('AUTO BASE PLANNER ENGAGED IN - ' + room.name)

        const poses = this.coreFlagPlacer(room)
        const colony_center = poses[0]
        const colony_spot = poses[1]
        if (!colony_center) { console.log('planRoom: NO VALID PLACE FOR SPAWN FOUND IN ROOM - ' + room.name); return }
        if (!colony_spot) { console.log('planRoom: NO VALID PLACE FOR SPOT FOUND IN ROOM - ' + room.name); return }
        // if the base flags couldn't be placed the room should be blacklisted for claiming
        let plan = []

        const extractor_plan = this.extractorPlanner(room)
        const container_plan = this.mainContainerPlanner(room, colony_spot)
        const road_plan = this.mainRoadPlanner(room, colony_center, colony_spot, container_plan)
        const core_plan = this.coreStructurePlanner(room, colony_center, colony_spot)

        let avoid_matrix = new PathFinder.CostMatrix()
        const terrainData = room.getTerrain()
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                if (terrainData.get(x, y) == TERRAIN_MASK_WALL) { avoid_matrix.set(x, y, 1) }
            }
        }

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                avoid_matrix.set(colony_center.x + x, colony_center.y + y, 1)
                avoid_matrix.set(colony_spot.x + x, colony_spot.y + y, 1)
            }
        }

        let all_things = []
        const sources = room.find(FIND_SOURCES)
        for (let i in sources) { all_things.push(sources[i].pos) }
        all_things.push(room.find(FIND_MINERALS)[0].pos)
        all_things.push(room.controller.pos)

        for (let i in all_things) {
            for (let x = -2; x <= 2; x++) {
                for (let y = -2; y <= 2; y++) {
                    avoid_matrix.set(all_things[i].x + x, all_things[i].y + y, 1)
                }
            }
        }

        const lab_plan = this.labPlanner(room, colony_center, colony_spot, avoid_matrix, road_plan)

        for (let i in road_plan) {
            avoid_matrix.set(road_plan[i].x, road_plan[i].y, 1)
        }

        for (let i in lab_plan) {
            avoid_matrix.set(lab_plan[i].x, lab_plan[i].y, 1)
        }

        const mining_link_plan = this.miningLinkPlanner(room, container_plan, road_plan)
        const spawn_plan = this.spawnPlanner(room, colony_center, avoid_matrix)
        for (let i in spawn_plan) {
            const spawn = spawn_plan[i]
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    avoid_matrix.set(spawn.x + x, spawn.y + y, 1)
                }
            }
        }

        const tower_plan = this.towerPlanner(room, colony_center, avoid_matrix, road_plan, lab_plan)
        let extension_matrix = new PathFinder.CostMatrix()
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                if (terrainData.get(x, y) == TERRAIN_MASK_WALL) { extension_matrix.set(x, y, 1) }
            }
        }
        for (let i in all_things) {
            for (let x = -2; x <= 2; x++) {
                for (let y = -2; y <= 2; y++) {
                    extension_matrix.set(all_things[i].x + x, all_things[i].y + y, 1)
                    extension_matrix.set(colony_spot.x + x, colony_spot.y + y, 1)
                }
            }
        }
        for (let i in spawn_plan) {
            const spawn = spawn_plan[i]
            extension_matrix.set(spawn.x, spawn.y, 1)
        }
        for (let i in tower_plan) {
            const tower = tower_plan[i]
            extension_matrix.set(tower.x, tower.y, 1)
        }
        for (let i in lab_plan) {
            const struct = lab_plan[i]
            extension_matrix.set(struct.x, struct.y, 1)
        }
        for (let i in road_plan) {
            const road = road_plan[i]
            extension_matrix.set(road.x, road.y, 1)
        }

        const extension_plan = this.extensionPlanner(room, colony_center, extension_matrix, road_plan, lab_plan)
        const outer_wall_plan = this.outerWallPlanner(room, road_plan)
        const control_link_plan = this.controllerLinkPlanner(room, colony_spot, road_plan)

        plan.push(...road_plan)
        plan.push(...core_plan)
        plan.push(...lab_plan)
        plan.push(...container_plan)
        plan.push(...extractor_plan)
        plan.push(...mining_link_plan)
        plan.push(...spawn_plan)
        plan.push(...tower_plan)
        plan.push(...extension_plan)
        plan.push(...outer_wall_plan)
        plan.push(...control_link_plan)

        const rampart_plan = this.rampartPlanner(plan)
        plan.push(...rampart_plan)

        room.memory.building_plan = plan

        return plan
    },

    // important stuff to add for future:
    // inner walls using mincut
    controllerLinkPlanner: function (room, colony_spot, road_plan) {
        let plan = []
        const cpos = room.controller.pos
        const terrainData = room.getTerrain()
        const roadmatrix = new PathFinder.CostMatrix()
        for (let i in road_plan) {
            const road = road_plan[i]
            roadmatrix.set(road.x, road.y, 1)
        }
        let unsorted_spots = []
        for (let x = -2; x <= 2; x++) {
            for (let y = -2; y <= 2; y++) {
                if (x == 0 && y == 0) { continue }
                if ((Math.abs(cpos.x + x) == 1) && (Math.abs(cpos.y + y) < 2)) { continue }
                if ((Math.abs(cpos.y + y) == 1) && (Math.abs(cpos.x + x) < 2)) { continue }
                if (terrainData.get(cpos.x + x, cpos.y + y) == TERRAIN_MASK_WALL) { continue }
                if (roadmatrix.get(cpos.x + x, cpos.y + y) == 1) { continue }
                let wall_count = 0
                for (let x1 = -2; x1 <= 2; x1++) {
                    for (let y1 = -2; y1 <= 2; y1++) {
                        if (terrainData.get(cpos.x + x + x1, cpos.y + y + y1) == TERRAIN_MASK_WALL) {
                            wall_count += 1
                        }
                    }
                }
                unsorted_spots.push({x: cpos.x + x, y: cpos.y + y, wall: wall_count})
            }
        }
        const sorted_spots = unsorted_spots.sort((a, b) => a.wall - b.wall)
        if (sorted_spots.length == 0) { console.log('controllerLinkPlanner: NO WALID CONTTOL LINK PLACEMENT FOUND - ' + room.name); return [] }
        const min_wall_count = sorted_spots[0].wall
        const clearest_spots = sorted_spots.filter(s => s.wall <= min_wall_count)
        let spots_as_poses = []
        for (let i in clearest_spots) {
            spots_as_poses.push(room.getPositionAt(clearest_spots[i].x, clearest_spots[i].y))
        }
        const bestest_spot = colony_spot.findClosestByRange(spots_as_poses)
        
        plan.push({x: bestest_spot.x, y: bestest_spot.y, type: STRUCTURE_LINK})
        return plan
    },

    rampartPlanner: function (plan) {
        let returnplan = []
        for (let i in plan) {
            const struct = plan[i]
            if (struct.type == STRUCTURE_SPAWN ||
                struct.type == STRUCTURE_TOWER ||
                struct.type == STRUCTURE_LINK ||
                struct.type == STRUCTURE_CONTAINER ||
                struct.type == STRUCTURE_FACTORY ||
                struct.type == STRUCTURE_POWER_SPAWN ||
                struct.type == STRUCTURE_NUKER ||
                struct.type == STRUCTURE_TERMINAL ||
                struct.type == STRUCTURE_STORAGE
            ) {
                returnplan.push({x: struct.x, y: struct.y, type: STRUCTURE_RAMPART})
            }
        }

        return returnplan
    },

    outerWallPlanner: function (room, road_plan) {
        const terrainData = room.getTerrain()
        const roadmatrix = new PathFinder.CostMatrix()
        for (let i in road_plan) {
            const road = road_plan[i]
            roadmatrix.set(road.x, road.y, 1)
        }
        plan = []
        const exits = room.find(FIND_EXIT)
        const exitsmatrix = new PathFinder.CostMatrix()
        for (let i in exits) {
            const exit = exits[i]
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    exitsmatrix.set(exit.x + x, exit.y + y, 1)
                }
            }
        }
        for (let i in exits) {
            const exit = exits[i]
            for (let x = -2; x <= 2; x++) {
                for (let y = -2; y <= 2; y++) {
                    if (x == 0 && y == 0) { continue }
                    if (exit.x + x > 48 || exit.x + x < 1) { continue }
                    if (exit.y + y > 48 || exit.y + y < 1) { continue }
                    if ((Math.abs(exit.x + x) == 1) && (Math.abs(exit.y + y) < 2)) { continue }
                    if ((Math.abs(exit.y + y) == 1) && (Math.abs(exit.x + x) < 2)) { continue }
                    if (terrainData.get(exit.x + x, exit.y + y) == TERRAIN_MASK_WALL) { continue }
                    if (exitsmatrix.get(exit.x + x, exit.y + y) == 1) { continue }

                    if (roadmatrix.get(exit.x + x, exit.y + y) == 1) {
                        plan.push({ x: exit.x + x, y: exit.y + y, type: STRUCTURE_RAMPART })
                    } else {
                        plan.push({ x: exit.x + x, y: exit.y + y, type: STRUCTURE_WALL })
                    }
                }
            }
        }

        return plan
    },

    extensionPlanner: function (room, colony_center, extension_matrix, road_plan, lab_plan) {
        const floodMatrix = Matrices.floodFill(room, [colony_center])
        const roadmatrix = new PathFinder.CostMatrix()
        for (let i in road_plan) {
            const road = road_plan[i]
            roadmatrix.set(road.x, road.y, 1)
        }
        for (let i in lab_plan) {
            const struct = lab_plan[i]
            if (struct.type == STRUCTURE_ROAD) { roadmatrix.set(struct.x, struct.y, 1) }
        }
        let all_valid_spots = []
        for (let x = 10; x < 40; x++) {
            for (let y = 10; y < 40; y++) {
                if (extension_matrix.get(x, y) == 1) { continue }
                let near_road = false
                for (let x1 = -1; x1 <= 1; x1++) {
                    for (let y1 = -1; y1 <= 1; y1++) {
                        if (x1 == 0 && y1 == 0) { continue }
                        if (roadmatrix.get(x + x1, y + y1) == 1) { near_road = true }
                    }
                }

                if (near_road) {
                    const value = floodMatrix.get(x, y)
                    all_valid_spots.push({ x: x, y: y, dist: value })
                }
            }
        }
        let plan = []
        const sorted_spots = all_valid_spots.sort((a, b) => a.dist - b.dist)
        if (sorted_spots.length < 60) {
            console.log('extensionPlanner: NOT ENOUGH VALID SPOTS FOR EXTENSIONS ( ' + sorted_spots.length + ' ) - ' + room.name)
            for (let i in sorted_spots) {
                const spot = sorted_spots[i]
                plan.push({ x: spot.x, y: spot.y, type: STRUCTURE_EXTENSION })
            }
        } else {
            for (let i = 0; i < 60; i++) {
                const spot = sorted_spots[i]
                plan.push({ x: spot.x, y: spot.y, type: STRUCTURE_EXTENSION })
            }
        }

        return plan
    },

    towerPlanner: function (room, colony_center, avoid_matrix, road_plan, lab_plan) {
        const clonematrix = avoid_matrix.clone()
        const roadmatrix = new PathFinder.CostMatrix()
        for (let i in road_plan) {
            const road = road_plan[i]
            roadmatrix.set(road.x, road.y, 1)
        }
        for (let i in lab_plan) {
            const struct = lab_plan[i]
            if (struct.type == STRUCTURE_ROAD) { roadmatrix.set(struct.x, struct.y, 1) }
        }
        let plan = []
        let all_valid_spots = []
        for (let x = 10; x < 40; x++) {
            for (let y = 10; y < 40; y++) {
                if (clonematrix.get(x, y) == 1) { continue }
                let near_road = false
                for (let x1 = -1; x1 <= 1; x1++) {
                    for (let y1 = -1; y1 <= 1; y1++) {
                        if (x1 == 0 && y1 == 0) { continue }
                        if (roadmatrix.get(x + x1, y + y1) == 1) { near_road = true }
                    }
                }
                if (near_road) {
                    all_valid_spots.push(room.getPositionAt(x, y))
                }
            }
        }
        const closest_place1 = colony_center.findClosestByPath(all_valid_spots)
        plan.push({ x: closest_place1.x, y: closest_place1.y, type: STRUCTURE_TOWER })
        while (plan.length < 6) {
            for (let i in plan) {
                const struct = plan[i]
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        if (Math.abs(x) == 1 && Math.abs(y) == 1) { continue }
                        clonematrix.set(struct.x + x, struct.y + y, 1)
                    }
                }
            }

            all_valid_spots = all_valid_spots.filter(s => (clonematrix.get(s.x, s.y) != 1))
            const closest_place = colony_center.findClosestByPath(all_valid_spots)
            plan.push({ x: closest_place.x, y: closest_place.y, type: STRUCTURE_TOWER })
        }

        return plan
    },

    spawnPlanner: function (room, colony_center, avoid_matrix) {
        let plan = []
        plan.push({ x: colony_center.x, y: colony_center.y, type: STRUCTURE_SPAWN })

        let all_valid_spots = []
        for (let x = 10; x < 40; x++) {
            for (let y = 10; y < 40; y++) {
                if (avoid_matrix.get(x, y) == 1) { continue }
                all_valid_spots.push(room.getPositionAt(x, y))
            }
        }

        const closest_place1 = colony_center.findClosestByRange(all_valid_spots)
        plan.push({ x: closest_place1.x, y: closest_place1.y, type: STRUCTURE_SPAWN })

        let spawnmatrix = new PathFinder.CostMatrix()
        for (let x = -2; x <= 2; x++) {
            for (let y = -2; y <= 2; y++) {
                spawnmatrix.set(closest_place1.x + x, closest_place1.y + y, 1)
            }
        }

        all_valid_spots = []
        for (let x = 10; x < 40; x++) {
            for (let y = 10; y < 40; y++) {
                if (avoid_matrix.get(x, y) == 1) { continue }
                if (spawnmatrix.get(x, y) == 1) { continue }
                all_valid_spots.push(room.getPositionAt(x, y))
            }
        }

        const closest_place2 = colony_center.findClosestByRange(all_valid_spots)
        plan.push({ x: closest_place2.x, y: closest_place2.y, type: STRUCTURE_SPAWN })
        const terrainData = room.getTerrain()
        let road_plan = []
        for (let i in plan) {
            const spawn = plan[i]
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (Math.abs(x) == 1 && Math.abs(y) == 1) { continue }
                    if (x == 0 && y == 0) { continue }
                    if (terrainData.get(spawn.x + x, spawn.y + y) == TERRAIN_MASK_WALL) { continue }

                    road_plan.push({ x: spawn.x + x, y: spawn.y + y, type: STRUCTURE_ROAD })
                }
            }
        }

        plan.push(...road_plan)

        return plan
    },

    miningLinkPlanner: function (room, container_plan, road_plan) {
        const terrainData = room.getTerrain()
        let avoid_matrix = new PathFinder.CostMatrix()
        for (let i in road_plan) {
            avoid_matrix.set(road_plan[i].x, road_plan[i].y, 1)
        }

        const sources = room.find(FIND_SOURCES)
        let container_poses = []
        for (let i in container_plan) {
            const cont = container_plan[i]
            const pos = room.getPositionAt(cont.x, cont.y)
            if (pos.findInRange(sources, 1).length > 0) {
                container_poses.push(pos)
            }
        }

        let plan = []
        for (let i in container_poses) {
            let link_pos
            const pos = container_poses[i]
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (x == 0 && y == 0) { continue }
                    if (terrainData.get(pos.x + x, pos.y + y) == TERRAIN_MASK_WALL) { continue }
                    if (avoid_matrix.get(pos.x + x, pos.y + y) != 1) {
                        link_pos = room.getPositionAt(pos.x + x, pos.y + y)
                    }
                }
            }
            if (link_pos) { plan.push({ x: link_pos.x, y: link_pos.y, type: STRUCTURE_LINK }) }
        }

        return plan
    },

    extractorPlanner: function (room) {
        const mineral = room.find(FIND_MINERALS)[0]
        let plan = [{ x: mineral.pos.x, y: mineral.pos.y, type: STRUCTURE_EXTRACTOR }]
        return plan
    },

    labPlanner: function (room, colony_center, colony_spot, avoid_matrix, road_plan) {
        let roadmatrix = new PathFinder.CostMatrix()
        for (let i in road_plan) {
            roadmatrix.set(road_plan[i].x, road_plan[i].y, 1)
        }
        let all_spots = []
        for (let x = 10; x < 40; x++) {
            for (let y = 10; y < 40; y++) {
                all_spots.push(room.getPositionAt(x, y))
            }
        }

        const sorted_spots = all_spots.sort((a, b) => a.getRangeTo(colony_spot) - b.getRangeTo(colony_spot))

        for (let i in sorted_spots) {
            const place = sorted_spots[i]
            let run = true
            for (let i2 in lab_stamp) {
                const struct = lab_stamp[i2]

                const x = place.x + struct.x
                const y = place.y + struct.y
                if (avoid_matrix.get(x, y) == 1) { run = false }
                if (struct.type == STRUCTURE_LAB && roadmatrix.get(x, y) == 1) { run = false }
            }

            if (run) {
                let plan = []
                for (let i2 in lab_stamp) {
                    const struct = lab_stamp[i2]
                    plan.push({ x: struct.x + place.x, y: struct.y + place.y, type: struct.type })
                }
                let plan_as_positions = []
                for (let i2 in plan) {
                    plan_as_positions.push(room.getPositionAt(plan[i2].x, plan[i2].y))
                }
                let road_plan_as_positions = []
                for (let i2 in road_plan) {
                    road_plan_as_positions.push(room.getPositionAt(road_plan[i2].x, road_plan[i2].y))
                }
                const closest_road = colony_spot.findClosestByPath(plan_as_positions)
                const clos_pos = room.getPositionAt(closest_road.x, closest_road.y)
                const target = clos_pos.findClosestByPath(road_plan_as_positions)
                const road_path2 = clos_pos.findPathTo(target)
                for (let i2 in road_path2) {
                    plan.push({ x: road_path2[i2].x, y: road_path2[i2].y, type: STRUCTURE_ROAD })
                }

                return plan
            }
        }

        console.log('labPlanner: NO VALID PLACES FOR LABS FOUND IN ROOM - ', room.name)
        return []
    },

    coreStructurePlanner: function (room, colony_center, colony_spot) {

        let place_selection = []
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (x == 0 && y == 0) { continue }
                place_selection.push(room.getPositionAt(colony_spot.x + x, colony_spot.y + y))
            }
        }

        const closest_place = colony_center.findClosestByPath(place_selection)
        place_selection = place_selection.filter(p => !p.isEqualTo(closest_place))

        let plan = []
        const storage_place = colony_center.findClosestByPath(place_selection)
        place_selection = place_selection.filter(p => !p.isEqualTo(storage_place))
        plan.push({ x: storage_place.x, y: storage_place.y, type: STRUCTURE_STORAGE })

        const terminal_place = colony_center.findClosestByPath(place_selection)
        place_selection = place_selection.filter(p => !p.isEqualTo(terminal_place))
        plan.push({ x: terminal_place.x, y: terminal_place.y, type: STRUCTURE_TERMINAL })

        const link_place = place_selection[0]
        place_selection = place_selection.filter(p => !p.isEqualTo(link_place))
        plan.push({ x: link_place.x, y: link_place.y, type: STRUCTURE_LINK })

        const power_place = place_selection[0]
        place_selection = place_selection.filter(p => !p.isEqualTo(power_place))
        plan.push({ x: power_place.x, y: power_place.y, type: STRUCTURE_POWER_SPAWN })

        const nuker_place = place_selection[0]
        place_selection = place_selection.filter(p => !p.isEqualTo(nuker_place))
        plan.push({ x: nuker_place.x, y: nuker_place.y, type: STRUCTURE_NUKER })

        const factory_place = place_selection[0]
        place_selection = place_selection.filter(p => !p.isEqualTo(factory_place))
        plan.push({ x: factory_place.x, y: factory_place.y, type: STRUCTURE_FACTORY })

        const observer_place = place_selection[0]
        place_selection = place_selection.filter(p => !p.isEqualTo(observer_place))
        plan.push({ x: observer_place.x, y: observer_place.y, type: STRUCTURE_OBSERVER })

        return plan
    },

    mainRoadPlanner: function (room, colony_center, colony_spot, container_plan) {
        let terrainData = room.getTerrain()
        let finalMatrix = new PathFinder.CostMatrix()

        let all_things = []
        const controller = room.controller
        const mineral = room.find(FIND_MINERALS)
        const sources = room.find(FIND_SOURCES)
        for (let i in sources) { all_things.push(sources[i].pos) }
        all_things.push(controller.pos)
        all_things.push(mineral[0].pos)

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                finalMatrix.set(colony_spot.x + x, colony_spot.y + y, 15)
                for (let i in all_things) {
                    finalMatrix.set(all_things[i].x + x, all_things[i].y + y, 15)
                }
            }
        }

        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                if (finalMatrix.get(x, y) === 255) { continue }
                if (terrainData.get(x, y) === TERRAIN_MASK_WALL) { finalMatrix.set(x, y, 255) }
                else if (terrainData.get(x, y) === TERRAIN_MASK_SWAMP) { finalMatrix.set(x, y, 2) }
            }
        }

        const path_settings = {
            ignoreDestructibleStructures: true, ignoreCreeps: true, ignoreRoads: true,
            costCallback(rom, _matrix) { return finalMatrix }, maxRooms: 1, range: 1, swampCost: 2
        }
        let plan = []

        // roads for spawn
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (Math.abs(x) == 1 && Math.abs(y) == 1) { continue }
                if (x == 0 && y == 0) { continue }
                plan.push({ x: colony_center.x + x, y: colony_center.y + y, type: STRUCTURE_ROAD })
            }
        }

        // roads for spot
        let place_selection = []
        for (let x = -2; x <= 2; x++) {
            for (let y = -2; y <= 2; y++) {
                if ((Math.abs(x) == 1 && Math.abs(y) < 2) || (Math.abs(y) == 1 && Math.abs(x) < 2)) {
                    place_selection.push(room.getPositionAt(colony_spot.x + x, colony_spot.y + y))
                    continue
                }
                if (Math.abs(x) == 2 && Math.abs(y) == 2) { continue }
                plan.push({ x: colony_spot.x + x, y: colony_spot.y + y, type: STRUCTURE_ROAD })
            }
        }

        const closest_place = colony_center.findClosestByPath(place_selection)
        plan.push({ x: closest_place.x, y: closest_place.y, type: STRUCTURE_ROAD })

        // road from spawn to spot
        const road_path1 = colony_center.findPathTo(closest_place, path_settings)
        for (let i in road_path1) {
            plan.push({ x: road_path1[i].x, y: road_path1[i].y, type: STRUCTURE_ROAD })
        }

        // road to controller
        let plan_as_positions = []
        for (let i in plan) {
            plan_as_positions.push(room.getPositionAt(plan[i].x, plan[i].y))
        }

        const target_road = room.controller.pos.findClosestByPath(plan_as_positions)
        const road_pathc = room.controller.pos.findPathTo(target_road, path_settings)
        for (let i in road_pathc) {
            plan.push({ x: road_pathc[i].x, y: road_pathc[i].y, type: STRUCTURE_ROAD })
        }

        // roads to containers
        for (let i in container_plan) {
            let plan_as_positions = []
            for (let i2 in plan) {
                plan_as_positions.push(room.getPositionAt(plan[i2].x, plan[i2].y))
            }
            const cont_pos = room.getPositionAt(container_plan[i].x, container_plan[i].y)
            const target = cont_pos.findClosestByPath(plan_as_positions)
            const road_path2 = cont_pos.findPathTo(target, path_settings)
            for (let i2 in road_path2) {
                plan.push({ x: road_path2[i2].x, y: road_path2[i2].y, type: STRUCTURE_ROAD })
            }
        }

        // roads to exits
        let exits = []
        const tops = room.find(FIND_EXIT_TOP).sort((a, b) => a.x - b.x)
        const top_res = tops[Math.floor(tops.length / 2)]
        if (top_res) { exits.push(top_res) }
        const botoms = room.find(FIND_EXIT_BOTTOM).sort((a, b) => a.x - b.x)
        const bot_res = botoms[Math.floor(botoms.length / 2)]
        if (bot_res) { exits.push(bot_res) }
        const lefts = room.find(FIND_EXIT_LEFT).sort((a, b) => a.y - b.y)
        const lef_res = lefts[Math.floor(lefts.length / 2)]
        if (lef_res) { exits.push(lef_res) }
        const rights = room.find(FIND_EXIT_RIGHT).sort((a, b) => a.y - b.y)
        const rig_res = rights[Math.floor(rights.length / 2)]

        if (rig_res) { exits.push(rig_res) }

        for (let i in exits) {
            let plan_as_positions = []
            for (let i2 in plan) {
                plan_as_positions.push(room.getPositionAt(plan[i2].x, plan[i2].y))
            }
            const target = exits[i].findClosestByPath(plan_as_positions) // here
            const road_path2 = exits[i].findPathTo(target, path_settings)
            for (let i2 in road_path2) {
                plan.push({ x: road_path2[i2].x, y: road_path2[i2].y, type: STRUCTURE_ROAD })
            }
        }

        return plan
    },

    coreFlagPlacer: function (room) {
        const flags = room.find(FIND_FLAGS)
        const spawns = room.find(FIND_MY_SPAWNS)
        let colony_center
        const seed_flag = flags.find(f => f.name.split('_')[0] == 'seed')
        console.log(seed_flag)
        if (!seed_flag) {
            if (spawns.length == 1) {
                colony_center = spawns[0].pos
            } else if (spawns.length > 1) {
                const center_spawn = room.getPositionAt(25, 25).findClosestByRange(spawns)
                colony_center = center_spawn[0].pos
            } else {
                colony_center = this.bestSpawnPlace(room)
            }
            console.log('not here')
            if (colony_center) { console.log('here'); room.createFlag(colony_center, 'seed_' + room.name, COLOR_YELLOW) }
            else { console.log('coreFlagPlacer: COULD NOT FIND A PLACE FOR A FIRST SPAWN') }
        } else {
            colony_center = seed_flag.pos
        }
        let colony_spot
        const spot_flag = flags.find(f => f.name.split('_')[0] == 'spot')
        if (!spot_flag) {
            const spot = this.bestSpotPlace(room, colony_center)
            if (spot) { room.createFlag(spot, 'spot_' + room.name, COLOR_BLUE); colony_spot = spot }
            else { console.log('coreFlagPlacer: COULD NOT FIND A PLACE FOR A "SPOT"') }
        } else {
            colony_spot = spot_flag.pos
        }
        console.log(colony_center, colony_spot)
        return [colony_center, colony_spot]
    },

    bestSpawnPlace: function (room) {
        let all_valid_spots = []
        for (let x = 10; x < 40; x++) {
            for (let y = 10; y < 40; y++) {
                const position = room.getPositionAt(x, y)
                if (position.lookFor(LOOK_TERRAIN).some(t => t == 'wall')) { continue }

                let valid = true
                for (let x1 = -1; x1 <= 1; x1++) {
                    for (let y1 = -1; y1 <= 1; y1++) {
                        if (room.getPositionAt(x + x1, y + y1).lookFor(LOOK_TERRAIN).some(t => t == 'wall')) { valid = false }
                    }
                }
                if (!valid) { continue }

                let all_things = []
                const sources = room.find(FIND_SOURCES)
                const controller = room.controller
                const mineral = room.find(FIND_MINERALS)
                for (let i in sources) { all_things.push(sources[i].pos) }
                all_things.push(controller.pos)
                all_things.push(mineral[0].pos)

                for (let i in all_things) {
                    if (all_things[i].getRangeTo(position) <= 4) { valid = false }
                }

                if (!valid) { continue }

                let wall_count
                for (let x1 = -2; x1 <= 2; x1++) {
                    for (let y1 = -2; y1 <= 2; y1++) {
                        if (room.getPositionAt(x + x1, y + y1).lookFor(LOOK_TERRAIN).some(t => t == 'wall')) { wall_count += 1 }
                    }
                }

                if (wall_count > 5) { continue }

                all_valid_spots.push(position)
            }
        }

        const counted_spots = all_valid_spots.map(s => this.sumOfPaths(room, s))
        const sorted_spots = counted_spots.sort((a, b) => a.sum - b.sum)
        const best_spots = sorted_spots.slice(0, Math.ceil(counted_spots.length * 0.5)).map(s => s.pos)
        const bestest_spot = room.getPositionAt(25, 25).findClosestByRange(best_spots)

        return bestest_spot
    },

    sumOfPaths: function (room, position) {
        let all_things = []
        const sources = room.find(FIND_SOURCES)
        const controller = room.controller
        for (let i in sources) { all_things.push(sources[i].pos) }
        all_things.push(controller.pos)

        let runFloodFill = false
        for (let i in all_things) {
            const id = all_things[i].id
            if (!(id in FloodCash)) {
                runFloodFill == true
            }
        }

        if (runFloodFill) {
            FloodCash = {}
            for (let i in all_things) {
                FloodCash[all_things[i].id] = Matrices.floodFill(room, [all_things[i].pos])
            }
        }

        let sum = 0
        for (let i in FloodCash) {
            sum += FloodCash[i].get(position.x, position.y)
        }

        return { pos: position, sum: sum }
    },

    bestSpotPlace: function (room, first_spawn_pos) {
        let all_valid_spots = []
        for (let x = 10; x < 40; x++) {
            for (let y = 10; y < 40; y++) {
                const position = room.getPositionAt(x, y)
                if (position.lookFor(LOOK_TERRAIN).some(t => t == 'wall')) { continue }
                if (first_spawn_pos.getRangeTo(position) <= 3) { continue }

                let valid = true
                for (let x1 = -2; x1 <= 2; x1++) {
                    for (let y1 = -2; y1 <= 2; y1++) {
                        if (room.getPositionAt(x + x1, y + y1).lookFor(LOOK_TERRAIN).some(t => t == 'wall')) { valid = false }
                    }
                }
                if (!valid) { continue }

                let all_things = []
                const sources = room.find(FIND_SOURCES)
                const controller = room.controller
                const mineral = room.find(FIND_MINERALS)
                for (let i in sources) { all_things.push(sources[i].pos) }
                all_things.push(controller.pos)
                all_things.push(mineral[0].pos)

                for (let i in all_things) {
                    if (all_things[i].getRangeTo(position) <= 4) { valid = false }
                }
                if (!valid) { continue }

                all_valid_spots.push(position)
            }
        }

        const bestest_spot = first_spawn_pos.findClosestByRange(all_valid_spots)

        return bestest_spot
    },

    wallHpUpdate: function () {
        for (let i in Game.rooms) {
            const room = Game.rooms[i]
            const flags = room.find(FIND_FLAGS)
            if (flags.some(f => f.name.split('_')[0] == 'room')) {
                this.wallHpRoomUpdater(room.name)
            }
        }
    },

    shouldRunForRoom: function (room) {
        if (!room) { return false }
        const dontflag = room.find(FIND_FLAGS).some(f => f.name.split('_')[0] == 'nobuilder')
        if (dontflag) { return false }
        if (!room.controller) { return false }
        if (room.controller.owner && !room.controller.my) { return false }
        const plan = room.memory.building_plan
        if (!plan) { return true }

        const restart_flag = room.find(FIND_FLAGS).some(f => f.name.split('_')[0] == 'restart')
        if (restart_flag) { return true }
    },

    wallHpRoomUpdater: function (room_name) {
        const room = Game.rooms[room_name]
        if (!room) { console.log('wallHpRoomUpdater: ROOM NOT IN VISION - room_name'); return }
        if (!room.memory.wall_hp) { room.memory.wall_hp = 100000; return }
        if (room.memory.wall_hp == 0) { room.memory.wall_hp = 100000; return }
        if (room.memory.wall_hp == 300000000) { return }
        if (!room.storage) { return }
        if (room.storage.store[RESOURCE_ENERGY] < 50000) { return }
        const walls = room.find(FIND_STRUCTURES).filter(s => s.structureType == STRUCTURE_WALL)
        const ramps = room.find(FIND_STRUCTURES).filter(s => s.structureType == STRUCTURE_RAMPART)
        let hps = []
        for (let i in walls) { hps.push(walls[i].hits) }
        for (let i in ramps) { hps.push(ramps[i].hits) }

        const min = Math.min(...hps)
        const max = Math.max(...hps)
        if ((max - min) < 5000) { room.memory.wall_hp = room.memory.wall_hp + 50000; return }
    },

    remoteRoadPlanner: function (room) {
        if (!room) { console.log('remoteRoadPlanner: REMOTE NOT IN VISION' + room.name); return }
        console.log('remoteRoadPlanner invoked in room: ' + room.name)
        const flags_in_room = room.find(FIND_FLAGS)
        for (let i in flags_in_room) {
            const flag_name = flags_in_room[i].name
            if (flag_name.split('_')[0] == 'remote') {
                const owner_room = Game.rooms[flag_name.split('_')[2]]
                if (!owner_room) { console.log('remoteRoadPlanner: OWNER ROOM NOT IN VISION' + i.split('_')[2]); return }

                let core
                if (!owner_room.storage) {
                    core = owner_room.find(FIND_MY_STRUCTURES).filter(s => s.structureType == STRUCTURE_SPAWN)[0]
                } else {
                    core = owner_room.storage
                }

                const sources = room.find(FIND_SOURCES)
                for (let i2 in sources) {
                    const path = sources[i2].pos.findPathTo(core, { ignoreCreeps: true, swampCost: 2, maxRooms: 2 })
                    for (let i3 in path) {
                        room.getPositionAt(path[i3].x, path[i3].y).createConstructionSite(STRUCTURE_ROAD)
                    }
                }
            }
        }
    },

    remoteContainerPlanner: function (room) {
        if (!room) { console.log('containerPlanner: ROOM NOT IN VISION'); return }
        const flags_in_room = room.find(FIND_FLAGS)
        let plan = []
        let flag_name
        for (let i in flags_in_room) {
            if (flags_in_room[i].name.split('_')[0] == 'remote') {
                flag_name = flags_in_room[i].name
            }
        }

        if (!flag_name) { console.log('remoteContainerPlanner: REMOTE FLAG NOT FOUND IN - ' + room.name) }

        const owner_room = Game.rooms[flag_name.split('_')[2]]
        if (!owner_room) { console.log('containerPlanner: OWNER ROOM NOT IN VISION' + i.split('_')[2]); return }

        let core
        if (!owner_room.storage) {
            core = owner_room.find(FIND_MY_STRUCTURES).filter(s => s.structureType == STRUCTURE_SPAWN)[0]
        } else {
            core = owner_room.storage
        }

        const sources = room.find(FIND_SOURCES)
        for (let i2 in sources) {
            const path = sources[i2].pos.findPathTo(core, { ignoreCreeps: true, swampCost: 2, maxRooms: 2 })
            const spot = room.getPositionAt(path[0].x, path[0].y)
            if (!spot) { console.log('containerPlanner: NO VALID CONTAINER SPOTS FOUND IN - ' + room.name); continue }
            room.createConstructionSite(spot, STRUCTURE_CONTAINER)
        }
    },

    mainContainerPlanner: function (room, colony_spot) {
        let plan = []
        const sources = room.find(FIND_SOURCES)
        const minerals = room.find(FIND_MINERALS)
        sources.push(minerals[0])

        for (let i2 in sources) {
            const path = sources[i2].pos.findPathTo(colony_spot, { ignoreCreeps: true, swampCost: 2, maxRooms: 2 })
            const spot = room.getPositionAt(path[0].x, path[0].y)
            if (!spot) { console.log('containerPlanner: NO VALID CONTAINER SPOTS FOUND IN - ' + room.name); continue }
            plan.push({ x: spot.x, y: spot.y, type: STRUCTURE_CONTAINER })
        }

        return plan
    },

    placeConstructionSites: function () {
        const main_flags = FlagManager.getAllMainFlags()
        for (let i in main_flags) {
            const room_name = main_flags[i].split('_')[1]
            const room = Game.rooms[room_name]
            if (!room) { console.log('runAutoPlanner: Room is not in vision - ' + room_name); continue }
            this.placeSitesRoom(room)
        }
    },

    placeSitesRoom: function (room) {
        if (!room) { console.log('placeSitesRoom: ROOM NOT IN VISSION'); return }
        if (!room.controller) { console.log('placeSitesRoom: NO ROOM CONTROLLER IN ROOM - ' + room.name); return }
        if (!room.controller.my) { console.log("placeSitesRoom: Room controller isn't my - " + room.name); return }
        const construction = room.find(FIND_MY_CONSTRUCTION_SITES)
        if (construction.length > 0) { return }
        const plan = room.memory.building_plan
        if (!plan) { console.log('placeSitesRoom: No plan in room - ' + room.name); return }
        if (plan.length == 0) { console.log('placeSitesRoom: An empty plan in room - ' + room.name); return }
        const level = room.controller.level
        if (level <= 1) { console.log('placeSitesRoom: level 1 room'); return }

        console.log('Placing construction sites in room - ' + room.name)

        let cut_plan = this.cutPlan(room, plan, level)
        let counter = 0
        for (let i in cut_plan) {
            const site_plan = cut_plan[i]
            const structures = room.lookAt(site_plan.x, site_plan.y).filter(i => i.type == 'structure')
            
            if (structures.some(s => s.structure.structureType == site_plan.type)) { continue }
            if (site_plan.type == STRUCTURE_SPAWN) {
                const amount = room.find(FIND_MY_SPAWNS).length + 1
                const res = room.createConstructionSite(site_plan.x, site_plan.y, site_plan.type, 'S_' + room.name + '_' + amount)
                if (res == OK) { counter += 1 }
            } else {
                const res = room.createConstructionSite(site_plan.x, site_plan.y, site_plan.type)
                if (res == OK) { counter += 1 }
            }
            if (counter >= 10) {
                return
            }
        }
    },

    cutPlan: function (room, plan, level) {
        let final_plan = []

        // extensions
        const extension_count = CONTROLLER_STRUCTURES['extension'][level]
        let counter = 0
        for (let i in plan) {
            const struct = plan[i]
            if (struct.type == STRUCTURE_EXTENSION) {
                final_plan.push(struct)
                counter += 1
            }
            if (counter >= extension_count) { break }
        }

        // containers
        if (level < 3) { 
        }else if (level < 6) {
            const sources = room.find(FIND_SOURCES)
            for (let i in plan) {
                const struct = plan[i]
                if (struct.type == STRUCTURE_CONTAINER) {
                    if (room.getPositionAt(struct.x, struct.y).findInRange(sources, 1).length > 0) {
                        final_plan.push(struct)
                    }
                }
            }
        } else {
            for (let i in plan) {
                const struct = plan[i]
                if (struct.type == STRUCTURE_CONTAINER) {
                    final_plan.push(struct)
                }
            }
        }

        // roads
        if (level >= 3) {
            for (let i in plan) {
                const struct = plan[i]
                if (struct.type == STRUCTURE_ROAD) {
                    final_plan.push(struct)
                }
            }
        }

        // towers
        if (level >= 3) {
            const tower_count = CONTROLLER_STRUCTURES['tower'][level]
            counter = 0
            for (let i in plan) {
                const struct = plan[i]
                if (struct.type == STRUCTURE_TOWER) {
                    final_plan.push(struct)
                    counter += 1
                }
                if (counter >= tower_count) { break }
            }
        }

        // storage
        if (level >= 4) { final_plan.push(plan.find(s => s.type == STRUCTURE_STORAGE)) }

        // walls and ramparts
        if (level < 4) {
        } else if (level < 7) {
            for (let i in plan) {
                const struct = plan[i]
                if (struct.type == STRUCTURE_WALL || struct.type == STRUCTURE_RAMPART) {
                    if ((struct.x > 45 || struct.x < 5) && (struct.y > 45 || struct.y < 5)) {
                        final_plan.push(struct)
                    }
                }
            }
        } else {
            for (let i in plan) {
                const struct = plan[i]
                if (struct.type == STRUCTURE_WALL || struct.type == STRUCTURE_RAMPART) {
                    final_plan.push(struct)
                }
            }
        }

        // links
        if (level < 5) {
        } else if (level < 6) {
            const spot = room.find(FIND_FLAGS).find(f => f.name.split('_')[0] == 'spot').pos
            for (let i in plan) {
                const struct = plan[i]
                if (struct.type == STRUCTURE_LINK) {
                    if (room.getPositionAt(struct.x, struct.y).getRangeTo(spot) == 1) {
                        final_plan.push(struct)
                        break
                    }
                }
            }
            const sources = room.find(FIND_SOURCES)
            for (let i in plan) {
                const struct = plan[i]
                if (struct.type == STRUCTURE_LINK) {
                    if (room.getPositionAt(struct.x, struct.y).findInRange(sources, 2).length > 0) {
                        final_plan.push(struct)
                        break
                    }
                }
            }
        } else if (level < 7) {
            for (let i in plan) {
                const struct = plan[i]
                if (struct.type == STRUCTURE_LINK) {
                    if (room.getPositionAt(struct.x, struct.y).findInRange([room.controller], 2).length == 0) {
                        final_plan.push(struct)
                    }
                }
            }
        } else {
            for (let i in plan) {
                const struct = plan[i]
                if (struct.type == STRUCTURE_LINK) {
                    final_plan.push(struct)
                }
            }
        }

        // extractor
        if (level >= 6) { final_plan.push(plan.find(s => s.type == STRUCTURE_EXTRACTOR)) }

        // labs
        if (level >= 6) {
            const lab_count = CONTROLLER_STRUCTURES['lab'][level]
            counter = 0
            for (let i in plan) {
                const struct = plan[i]
                if (struct.type == STRUCTURE_LAB) {
                    final_plan.push(struct)
                    counter += 1
                }
                if (counter >= lab_count) { break }
            }
        }
        
        // terminal
        if (level >= 6) { final_plan.push(plan.find(s => s.type == STRUCTURE_TERMINAL)) }

        // factory
        if (level >= 7) { final_plan.push(plan.find(s => s.type == STRUCTURE_FACTORY)) }

        // observer
        if (level >= 8) { final_plan.push(plan.find(s => s.type == STRUCTURE_OBSERVER)) }

        // nuker
        if (level >= 8) { final_plan.push(plan.find(s => s.type == STRUCTURE_NUKER)) }

        // power spawn
        if (level >= 8) { final_plan.push(plan.find(s => s.type == STRUCTURE_POWER_SPAWN)) }
        
        return final_plan
    }
};

module.exports = buildPlanner;