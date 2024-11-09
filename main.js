const CreepSpawner = require('utils.creep_spawner')
const TowersModule = require('utils.tower_code')
const RoomStateManager = require('utils.room_state_manager')
const ClaimManager = require('utils.claim_manager')
const CreepListAssembler = require('utils.creep_list_assembler')
const BuildPlanner = require('utils.build_planner')
const LinkManager = require('utils.link_manager')
const Display = require('utils.display')
const FlagManager = require('utils.flag_manager')

const roleHarvester = require('role.harvester')
const roleUpgrader = require('role.upgrader')
const roleBuilder = require('role.builder')
const roleMiner = require('role.miner')
const roleClaimer = require('role.claimer')
const roleReserver = require('role.reserver')
const roleRepairer = require('role.repairer')
const roleHauler = require('role.hauler')
const roleFiller = require('role.filler')
const roleManager = require('role.manager')
const roleRoomba = require('role.roomba')

const roles = {
    'upgrader': roleUpgrader,
    'builder': roleBuilder,
    'harvester': roleHarvester,
    'miner': roleMiner,
    'claimer': roleClaimer,
    'reserver': roleReserver,
    'repairer': roleRepairer,
    'hauler': roleHauler,
    'filler': roleFiller,
    'manager': roleManager,
    'roomba': roleRoomba,
}

FlagManager.checkMainFlags()
RoomStateManager.updateAll()
CreepListAssembler.run()

module.exports.loop = function () {
    if (Game.cpu.bucket < 100) { console.log('CPU cap'); return }
    for (let name in Memory.creeps) { if (!Game.creeps[name]) { delete Memory.creeps[name] } }

    TowersModule.runAllTowers()
    LinkManager.runAllLinks()
    CreepSpawner.maintainPopulation()

    for (let name in Game.creeps) {
        const creep = Game.creeps[name];
        //const cpuBeforeThisCreep = Game.cpu.getUsed();
        if (roles[creep.memory.role] && creep.spawning == false) {
            roles[creep.memory.role].run(creep);
        }
        //const cpuAfterThisCreep = Game.cpu.getUsed();
        //const delta = cpuAfterThisCreep - cpuBeforeThisCreep;
        //console.log(`Creep ${name} with role ${creep.memory.role} used ${delta} CPU`);
    }

    Display.displayPlan()
    Display.displayCreepList()

    if (Game.time % 20 == 0) {
        FlagManager.checkMainFlags()
        RoomStateManager.updateAll()

        CreepListAssembler.run()

        BuildPlanner.placeConstructionSites()
    }

    if (Game.time % 50 == 0) {
        BuildPlanner.wallHpUpdate()
        BuildPlanner.runAutoPlanner() // main rooms
        ClaimManager.automaticTerritoryManager() // super scarry thing here
    }

    //if (Game.cpu.bucket == 10000) {
    //    Game.cpu.generatePixel()
    //}

    console.log("CPU used:", Math.round(Game.cpu.getUsed()), "; Bucket:", Game.cpu.bucket)
    console.log("Creeps:", Object.keys(Game.creeps).length)
}