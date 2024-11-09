const towersModule = {
    findAllTowers: function(){
        let towers = [];
        for (let i in Game.structures){
            const structure = Game.structures[i];
            if (structure.structureType == STRUCTURE_TOWER){
                towers.push(structure);
            }
        }
        return towers;
    },
    
    runTower: function(tower){
        const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
            return;
        }
        const structures = tower.room.find(FIND_STRUCTURES)
        let damagedStructures = [];
        for (let i in structures){
            const structure = structures[i];
            if (structure.structureType == STRUCTURE_CONTAINER && structure.hits < structure.hitsMax){
                damagedStructures.push(structure)
            }else if (structure.hits < 2000 && structure.hits < structure.hitsMax){
                damagedStructures.push(structure)
            }
        }
        
        const closestDamagedStructure = tower.pos.findClosestByRange(damagedStructures);
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
            return;
        }
        
        const closestDamagedCreep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: (creep) => {return creep.hits < creep.hitsMax}
        });

        if(closestDamagedCreep) {
            tower.heal(closestDamagedCreep);
            return;
        }
    },

    runAllTowers: function(){
        const towers = this.findAllTowers();
        for (let i in towers){
            const tower = towers[i];
            if (tower) {
                this.runTower(tower);
            }
        }
    }
};

module.exports = towersModule;