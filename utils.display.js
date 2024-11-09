require('RoomVisual')

const structure_circle = {
    spawn: { radius: 0.5, fill: '#ffe900', opacity: 0.8, stroke: '#191919', strokeWidth: 0.1 },
    extension: { radius: 0.4, fill: '#fff15f', opacity: 0.7, stroke: '#191919', strokeWidth: 0.1 },
    road: { radius: 0.3, fill: '#585858', opacity: 0.4 },
    constructedWall: { radius: 0.6, fill: '#0a0a0a', opacity: 0.4 },
    rampart: { radius: 0.6, fill: '#37d00a', opacity: 0.4, stroke: '#205b0f', strokeWidth: 0.1 },
    link: { radius: 0.3, fill: '#205b0f', opacity: 0.3 },
    storage: { radius: 0.5, fill: '#ff9200', opacity: 0.8, stroke: '#ff9200', strokeWidth: 0.1 },
    tower: { radius: 0.5, fill: '#001dff', opacity: 0.7, stroke: '#00bdff', strokeWidth: 0.1 },
    observer: { radius: 0.3, fill: '#e62187', opacity: 0.5, stroke: '#9a1313', strokeWidth: 0.1 },
    powerSpawn: { radius: 0.5, fill: '#ff0000', opacity: 0.7 },
    extractor: { radius: 0.4, fill: '#ff0000', opacity: 0.5, stroke: '#000000', strokeWidth: 0.1 },
    lab: { radius: 0.4, fill: '#ffffff', opacity: 0.5, stroke: '#000000', strokeWidth: 0.1 },
    terminal: { radius: 0.5, fill: '#af00ff', opacity: 0.8, stroke: '#2c00ff', strokeWidth: 0.1 },
    container: { radius: 0.3, fill: '#484558', opacity: 0.5, stroke: '#ffe900', strokeWidth: 0.1 },
    nuker: { radius: 0.5, fill: '#ff00a0', opacity: 0.8, stroke: '#5700ff', strokeWidth: 0.1 },
    factory: { radius: 0.5, fill: '#27394e', opacity: 0.8, stroke: '#0e1c2c', strokeWidth: 0.1 },
};

const display = {
    planDisplayRoom: function (room) {
        const plan = room.memory.building_plan
        if (!plan) { console.log('planDisplayRoom: no plan for room - ' + room.name); return }

        for (let i in plan) {
            room.visual.structure(plan[i].x, plan[i].y, plan[i].type)
        }
        room.visual.connectRoads()
    },

    constructionDisplayRoom: function (room) {
        const constructions = room.find(FIND_MY_CONSTRUCTION_SITES)
        for (let i in constructions) {
            room.visual.circle(constructions[i].pos, structure_circle[constructions[i].structureType])
        }
    },

    displayPlan: function () {
        for (let i in Game.rooms) {
            const room = Game.rooms[i]
            const run = room.find(FIND_FLAGS).some(f => f.name.split('_')[0] == 'showplan')
            if (run) {
                this.planDisplayRoom(room)
                this.constructionDisplayRoom(room)
            }
        }
    },

    displayCreepList: function () {
        for (let i in Game.rooms) {
            const room = Game.rooms[i]
            const run = room.find(FIND_FLAGS).some(f => f.name.split('_')[0] == 'showlist')
            if (run) {
                this.displayCreepListRoom(room)
            }
        }
    },

    displayCreepListRoom: function (room) {
        if (!room) { console.log('displayCreepList: ROOM NOT IN VISION - ' + room.name); return }
        const creep_list = room.memory.creep_list
        if (!creep_list) { console.log('displayCreepList: NO CREEP LIST IN ROOM - ' + room.name); return }
        const creeps = Game.creeps
        let creep_names = []
        for (let i in creeps) { creep_names.push(creeps[i].name) } 

        const x = 3
        let y = 4
        for (let order of creep_list) {
            if (!order) { continue }
            if (!order.name) { continue }
            if (!creep_names.includes(order.name)) {
                room.visual.text(order.name, x, y, {align: 'left', backgroundColor: '#d02400', opacity: 0.7})
            } else {
                room.visual.text(order.name, x, y, {align: 'left', backgroundColor: '#009111', opacity: 0.7})
            }
            y += 1
        }
    },

    displayFlood: function (room, flood_matrix) {
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                const value = flood_matrix.get(x, y)
                room.visual.text(value, x, y)
            }
        }
    },

    displayFlow: function (room, flow_matrix) {

    },

    displayDistance: function (room, distance_matrix) {

    },
};

module.exports = display;