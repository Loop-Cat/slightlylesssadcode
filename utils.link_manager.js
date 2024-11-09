const RoomStateManager = require('utils.room_state_manager')

const LinkManager = {
    findCenterLinkInRoom: function (room) {
        const storage = room.storage
        if (!storage) { console.log('findCenterLinkInRoom: NO STORAGE - ' + room_name) }
        const links = room.find(FIND_MY_STRUCTURES).filter(s => s.structureType == STRUCTURE_LINK)
        const central_links = storage.pos.findInRange(links, 2).map(l => l.id)
        if (central_links.length == 0) { console.log('No central links found - ' + room_name) }
        if (central_links.length > 1) { console.log('More than one central link found - ' + room_name) }
        return central_links
    },

    findMiningLinkInRoom: function (room) {
        const sources = room.find(FIND_SOURCES)
        const links = room.find(FIND_MY_STRUCTURES).filter(s => s.structureType == STRUCTURE_LINK)
        let mining_links = []
        for (let i in sources) {
            const source = sources[i]
            const links_in_range = source.pos.findInRange(links, 2).map(l => l.id)
            if (links_in_range.length > 0){
                mining_links.push(links_in_range[0])
            }
        }
        
        if (mining_links.length == 0) { console.log('No mining links found - ' + room_name) }
        
        return mining_links
    },

    runAllLinks: function () {
        for (let i in Game.rooms) {
            const room = Game.rooms[i]
            const level = Game.rooms[i].memory.level
            if (!level) { RoomStateManager.roomLevelUpdate(i); continue }
            if (level < 5) { continue }
            
            const central_link = this.findCenterLinkInRoom(room)[0]
            const mining_links = this.findMiningLinkInRoom(room)
            
            for (let i2 in mining_links){
                //console.log(room.name)
                const link = Game.getObjectById(mining_links[i2])
                if (!link) {console.log('INVALID LINK ID ' + mining_links[i2]); continue}
                if (link.store[RESOURCE_ENERGY] > 100){
                    const target = Game.getObjectById(central_link)
                    link.transferEnergy(target, Math.min(link.store[RESOURCE_ENERGY], target.store.getFreeCapacity()))
                }
            }
        }
    },
};

module.exports = LinkManager;