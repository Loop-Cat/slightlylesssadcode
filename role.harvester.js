var roleHarvester = {
    run: function(creep) {
	    if(creep.store.getFreeCapacity() > 0) {
            const source = creep.room.find(FIND_SOURCES, {
                            filter: (source) => {
                                return (source.energy > 0);}
                            })[1];
            if (source){
                if (creep.harvest(source) == ERR_NOT_IN_RANGE){
                    creep.moveTo(source, {swampCost: 1})
                }
            }
        }
        else {
            const targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
        }
	}
};

module.exports = roleHarvester;