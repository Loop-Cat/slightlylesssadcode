// data import
const Blueprints = require('data.blueprints')

// utils import
const RoomStateManager = require('utils.room_state_manager')
const FlagManager = require('utils.flag_manager')

const creepListAseembler = {
    bodyCost: function (body) {
        if (!body) { console.log('bodyCost: INVALID BODY GIVEN'); return -1 }
        if (body.length == 0) { console.log('bodyCost: EMPTY BODY GIVEN'); return 0 }
        let cost = 0
        for (let part of body) {
            const part_cost = BODYPART_COST[part]
            if (!part_cost) { console.log('bodyCost: INVALID BODY PART - ' + part); return -2 }
            else { cost += part_cost }
        }
        return cost
    },

    scaleBody: function (body_temp, energy_available) {
        const body_cost = this.bodyCost(body_temp)
        if (body_cost < 0) { console.log('scaleBody: "this.bodyCost(order.body)" - resulted in an error: ' + order_cost); return }
        if (body_cost == 0) { return }
        if (energy_available < body_cost) { console.log('scaleBody: Not enough energy to spawn creep'); return ERR_NOT_ENOUGH_ENERGY }
        const amount = Math.floor(energy_available / body_cost)
        let final_body = []
        for (let i = 0; i < amount; i++) {
            if (final_body.length + body_temp.length > 50) {
                return final_body
            } else {
                final_body.push(...body_temp)
            }
        }

        return final_body
    },

    shouldRun: function (room) {
        if (!room.memory.creep_request) { room.memory.creep_request = []; return true }
        if (room.memory.creep_request.length > 0) { return true }
        if (room.controller.level < 4) { return true }
        if (room.memory.reasemble == undefined)  { room.memory.reasemble = false; return true }
        if (room.memory.reasemble) { return true }
        return false
    },

    lowRclAssembler: function (room) {
        const level = room.memory.level
        const template = Blueprints.templates['temp_RCL' + level]
        if (!template) { console.log('lowRclAssembler: UNABLE TO FIND TEMPLATE FOR - ' + 'temp_RCL' + level); return }
        let return_list = []
        // simple stuff here to make sure low rcl rooms function properly
        for (let order_temp of template) {
            const name = room.name + '_' + room.name + '_' + order_temp.memory.role + '_' + order_temp.name
            const body = order_temp.body
            const memory = {}
            for (let i in order_temp.memory) {
                memory[i] = order_temp.memory[i]
                if (memory[i] == 'SPAWNROOM') { memory[i] = room.name }
            }
            const priority = order_temp.priority
            return_list.push({name: name, body: body, memory: memory, priority: priority})
        }
        
        return return_list
    },

    highRclAssembler: function (room) { // temporary solution
        const level = room.memory.level
        const template = Blueprints.templates['temp_RCL' + level]
        if (!template) { console.log('lowRclAssembler: UNABLE TO FIND TEMPLATE FOR - ' + 'temp_RCL' + level); return }
        let return_list = []
        // simple stuff here to make sure low rcl rooms function properly
        for (let order_temp of template) {
            const name = room.name + '_' + room.name + '_' + order_temp.memory.role + '_' + order_temp.name
            const body = order_temp.body
            let memory = {}
            for (let i in order_temp.memory) {
                memory[i] = order_temp.memory[i]
                if (memory[i] == 'SPAWNROOM') { memory[i] = room.name }
            }
            const priority = order_temp.priority
            return_list.push({name: name, body: body, memory: memory, priority: priority})
        }
        
        return return_list
    },

    roomListAssmebler: function (room) {
        let level = room.memory.level
        if (!level) { RoomStateManager.roomLevelUpdate(room.name); return }
        if (level == 0) { return }
        let creep_list = []
        if (level < 4) {
            const assembled_temp = this.lowRclAssembler(room)
            if (!assembled_temp) { console.log('roomListAssmebler: INVALID TEMPLATE'); return }
            if (assembled_temp.length == 0) { console.log('roomListAssmebler: EMPTY TEMPLATE'); return }
            creep_list = assembled_temp
        } else {
            const assembled_temp = this.highRclAssembler(room)
            if (!assembled_temp) { console.log('roomListAssmebler: INVALID TEMPLATE'); return }
            if (assembled_temp.length == 0) { console.log('roomListAssmebler: EMPTY TEMPLATE'); return }
            creep_list = assembled_temp
        }

        const requests = room.memory.requested_creeps
        if (!requests) { room.memory.requested_creeps = [] }
        else { for (let request of requests) { creep_list.push(request) } }

        let valid_list = []
        for (let order of creep_list) {
            if (!order) { continue }
            if (!order.name) { continue }
            if (!order.body) { continue }
            if (!order.memory) { continue }
            if (!order.priority) { continue }

            if (!order.memory.role) { continue }
            if (order.body.length < 1) { continue }
            valid_list.push(order)
        }
    
        const sorted_list = valid_list.sort((a, b) => b.priority - a.priority)
        
        room.memory.reasemble = false
        room.memory.creep_list = sorted_list
    },

    run: function () {
        const main_flags = FlagManager.getAllMainFlags()

        for (let flag_name of main_flags) {
            const room_name = flag_name.split('_')[1]
            const room = Game.rooms[room_name]
            if (!room) { continue }
            if (this.shouldRun(room)) { this.roomListAssmebler(room) }
        }
    },

    removeCreep: function (creep_name) {
        const room_name = creep_name.split('_')[0]
        if (!room_name) { console.log('removeCreep: INVALID CREEP NAME - ' + creep_name); return }
        const room = Game.rooms[room_name]
        if (!room) { console.log('removeCreep: CREEPS ORIGINAL ROOM IS NOT IN VISION - ' + creep_name); return }
        const creep_list = room.memory.creep_list
        if (!creep_list) { console.log('removeCreep: NO CREEP LIST IN ROOM - ' + room_name); return }
        let counter = 0
        for (let order of creep_list) {
            if (order.name == creep_name) { break }
            counter++
        }

        room.memory.creep_list.splice(counter, 1)
    },

    requestCreep: function (order) {
        if (!order) { console.log('requestCreep: INVALID ORDER'); return }
        if (!order.name) { console.log('requestCreep: INVALID ORDER'); return }
        if (!order.body) { console.log('requestCreep: INVALID ORDER'); return }
        if (!order.memory) { console.log('requestCreep: INVALID ORDER'); return }
        if (!order.priority) { console.log('requestCreep: INVALID ORDER'); return }
        const arr = order.name.split('_')
        if (arr[arr.length - 1] != 'RESPAWNING') { console.log('requestCreep: WARNING! Creep - ' + order.name + ' - is going to be *permanent*') }
        if (!room.memory.requested_creeps) { room.memory.requested_creeps = [] }
        room.memory.requested_creeps.push(order)
    },

    // here data is an object. key is a string that will be looked for at the memory value is what it will be replaced with
    // mainly SPAWNROOM and TARGETROOM right now
    requestTemplate: function (room, template_name, data) {
        if (!room) { console.log('requestTemplate: ROOM NOT IN VISION - ' + room); return}
        const template = Blueprints.templates[template_name]
        if (!template) { console.log('requestTemplate: UNABLE TO FIND TEMPLATE - ' + template_name); return }
        let return_list = []
        let values_to_replace = []
        for (let i in data) { values_to_replace.push(i) }
        for (let order_temp of template) {
            const name = room.name + '_' + room.name + '_' + order_temp.memory.role + '_' + order_temp.name + '_NON_RESPAWNING'
            const body = order_temp.body
            let memory = {}
            
            for (let i in order_temp.memory) {
                memory[i] = order_temp.memory[i]
                if (values_to_replace.includes(order_temp.memory[i])) { memory[i] = data[order_temp.memory[i]] }
            }
            const priority = order_temp.priority
            return_list.push({name: name, body: body, memory: memory, priority: priority})
        }
        if (!room.memory.requested_creeps) { room.memory.requested_creeps = [] }
        room.memory.requested_creeps.push(...return_list)
    },
};

module.exports = creepListAseembler;