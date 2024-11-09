const roomStateManager = {
    updateAll: function () {
        for (let room_name in Game.rooms) {
            this.roomLevelUpdate(room_name)
        }
    },

    roomLevelUpdate: function (room_name) {
        const room = Game.rooms[room_name]
        if (!room) { return }
        if (!room.controller) { return }
        if (!room.controller.my) { return }
        const structures = room.find(FIND_MY_STRUCTURES)
        
        let level = 0
        if (!room.memory.level) { level = 0}
        else { for (let i = 0; i < room.memory.level; i++) { level += 1} }
        if (structures.some(s => s.structureType == STRUCTURE_POWER_SPAWN)) {
            room.memory.level = 8
        }
        else if (structures.some(s => s.structureType == STRUCTURE_FACTORY)) {
            room.memory.level = 7
        }
        else if (structures.some(s => s.structureType == STRUCTURE_TERMINAL)) {
            room.memory.level = 6
        }
        else if (structures.some(s => s.structureType == STRUCTURE_LINK)) {
            room.memory.level = 5
        }
        else if (structures.some(s => s.structureType == STRUCTURE_STORAGE)) {
            room.memory.level = 4
        }
        else if (structures.some(s => s.structureType == STRUCTURE_TOWER)) {
            room.memory.level = 3
        }
        else if (structures.filter(s => s.structureType == STRUCTURE_EXTENSION).length >= 5) {
            room.memory.level = 2
        }
        else if (structures.some(s => s.structureType == STRUCTURE_SPAWN)) {
            room.memory.level = 1
        } else {
            room.memory.level = 0
        }

        if (level != room.memory.level) { room.memory.reasemble = true }
    },
};

module.exports = roomStateManager;