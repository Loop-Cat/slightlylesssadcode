const defaults = {
    default_harvester: [WORK,CARRY,MOVE,MOVE],
    default_upgrader: [WORK,CARRY,MOVE,MOVE],
    default_builder: [WORK,CARRY,MOVE,MOVE],
    default_miner: [WORK,WORK,MOVE],
    default_claimer: [CLAIM,MOVE],
    default_reserver: [CLAIM,MOVE],
    default_repairer: [WORK,CARRY,MOVE,MOVE],
    default_hauler: [MOVE,MOVE,MOVE,CARRY,CARRY,CARRY],
    default_filler: [MOVE,MOVE,MOVE,CARRY,CARRY,CARRY],
    default_manager: [MOVE,CARRY,CARRY,CARRY,CARRY,CARRY],
    default_roomba: [TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK],
};

const blueprints = {
    RCL1_harvester: [WORK,CARRY,MOVE,MOVE],
    RCL1_upgrader: [WORK,CARRY,MOVE,MOVE],
    RCL1_builder: [WORK,CARRY,MOVE,MOVE],
    RCL1_miner: [WORK,WORK,MOVE],
    RCL1_repairer: [WORK,CARRY,MOVE,MOVE],
    RCL1_hauler: [MOVE,MOVE,CARRY,CARRY],

    RCL2_harvester: [MOVE,MOVE,WORK,WORK,CARRY,CARRY],
    RCL2_upgrader: [MOVE,MOVE,WORK,WORK,CARRY,CARRY],
    RCL2_builder: [MOVE,MOVE,WORK,WORK,CARRY,CARRY],
    RCL2_miner: [MOVE,WORK,WORK,WORK,WORK,WORK],
    RCL2_repairer: [MOVE,MOVE,WORK,WORK,CARRY,CARRY],
    RCL2_hauler: [MOVE,MOVE,MOVE,CARRY,CARRY,CARRY],

    RCL3_upgrader: [MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY],
    RCL3_builder: [MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY],
    RCL3_miner: [MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,CARRY],
    RCL3_claimer: [CLAIM,MOVE],
    RCL3_reserver: [CLAIM,MOVE],
    RCL3_repairer: [MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY],
    RCL3_hauler: [MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL3_roomba: [TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK],

    RCL4_upgrader: [MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL4_builder: [MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL4_miner: [MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,CARRY],
    RCL4_claimer: [CLAIM,MOVE],
    RCL4_reserver: [CLAIM,MOVE],
    RCL4_repairer: [MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL4_hauler: [MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL4_filler: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL4_roomba: [TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK],

    RCL5_upgrader: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL5_builder: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL5_miner: [MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,CARRY],
    RCL5_claimer: [CLAIM,MOVE],
    RCL5_reserver: [CLAIM,MOVE],
    RCL5_repairer: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL5_hauler: [MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL5_filler: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL5_manager: [MOVE,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL5_roomba: [TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK],

    RCL6_upgrader: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL6_builder: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL6_miner: [MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,CARRY],
    RCL6_claimer: [CLAIM,MOVE],
    RCL6_reserver: [MOVE,MOVE,CLAIM,CLAIM],
    RCL6_repairer: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL6_hauler: [MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL6_filler: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL6_manager: [MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL6_roomba: [TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK],

    RCL7_upgrader: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL7_builder: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL7_miner: [MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,CARRY],
    RCL7_claimer: [CLAIM,MOVE],
    RCL7_reserver: [MOVE,MOVE,CLAIM,CLAIM],
    RCL7_repairer: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL7_hauler: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL7_filler: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL7_manager: [MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL7_roomba: [TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK],

    RCL8_upgrader: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL8_builder: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL8_miner: [MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,CARRY],
    RCL8_claimer: [CLAIM,MOVE],
    RCL8_reserver: [MOVE,MOVE,CLAIM,CLAIM],
    RCL8_repairer: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL8_hauler: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL8_filler: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL8_manager: [MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    RCL8_roomba: [TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK],
}; // past rcl 6 those mostly run with adjust parameter on so the blueprints matter less

const specials = {
    orb_roomba: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
    scout: [MOVE],
};

const templates = {
    temp_upgrader: [MOVE,WORK,CARRY],
    temp_builder: [MOVE,WORK,CARRY],
    temp_repairer: [MOVE,WORK,CARRY],
    temp_hauler: [MOVE,CARRY,CARRY],
    temp_filler: [MOVE,CARRY,CARRY],

    temp_RCL1: [
        {name: '1', body: blueprints.RCL1_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 8},
        {name: '1', body: blueprints.RCL1_hauler, memory: {role: 'hauler', sub_role: 'main', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 7},
        {name: '2', body: blueprints.RCL1_hauler, memory: {role: 'hauler', sub_role: 'main', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 7},
        {name: '2', body: blueprints.RCL1_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 6},
        {name: '3', body: blueprints.RCL1_hauler, memory: {role: 'hauler', sub_role: 'main', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 5},
        {name: '4', body: blueprints.RCL1_hauler, memory: {role: 'hauler', sub_role: 'main', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 5},
        {name: '3', body: blueprints.RCL1_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 4},
        {name: '4', body: blueprints.RCL1_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 4},

        {name: '1', body: blueprints.RCL1_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 3},
        {name: '2', body: blueprints.RCL1_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 3},
        {name: '1', body: blueprints.RCL1_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2.5},
        {name: '2', body: blueprints.RCL1_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2.5},
        {name: '3', body: blueprints.RCL1_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2},
        {name: '3', body: blueprints.RCL1_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2},
        {name: '4', body: blueprints.RCL1_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
        {name: '5', body: blueprints.RCL1_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
        {name: '6', body: blueprints.RCL1_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
    ],

    temp_RCL2: [
        {name: '1', body: blueprints.RCL2_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 8},
        {name: '1', body: blueprints.RCL2_hauler, memory: {role: 'hauler', sub_role: 'main', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 7},
        {name: '2', body: blueprints.RCL2_hauler, memory: {role: 'hauler', sub_role: 'main', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 7},
        {name: '2', body: blueprints.RCL2_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 6},
        {name: '3', body: blueprints.RCL2_hauler, memory: {role: 'hauler', sub_role: 'main', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 5},
        {name: '4', body: blueprints.RCL2_hauler, memory: {role: 'hauler', sub_role: 'main', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 5},

        {name: '1', body: blueprints.RCL2_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 3},
        {name: '2', body: blueprints.RCL2_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 3},
        {name: '1', body: blueprints.RCL2_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2.5},
        {name: '2', body: blueprints.RCL2_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2.5},
        {name: '3', body: blueprints.RCL2_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2},
        {name: '3', body: blueprints.RCL2_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2},
        {name: '4', body: blueprints.RCL2_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
        {name: '4', body: blueprints.RCL2_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
        {name: '5', body: blueprints.RCL2_upgrader, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
        {name: '6', body: blueprints.RCL2_upgrader, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
        {name: '5', body: blueprints.RCL2_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
        {name: '6', body: blueprints.RCL2_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
        {name: '7', body: blueprints.RCL2_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
    ],

    temp_RCL3: [
        {name: '1', body: blueprints.RCL3_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 8},
        {name: '1', body: blueprints.RCL3_hauler, memory: {role: 'hauler', sub_role: 'main', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 7},
        {name: '2', body: blueprints.RCL3_hauler, memory: {role: 'hauler', sub_role: 'main', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 7},
        {name: '2', body: blueprints.RCL3_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 6},
        {name: '3', body: blueprints.RCL3_hauler, memory: {role: 'hauler', sub_role: 'main', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 5},
        {name: '4', body: blueprints.RCL3_hauler, memory: {role: 'hauler', sub_role: 'main', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 5},

        {name: '1', body: blueprints.RCL3_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 3},
        {name: '2', body: blueprints.RCL3_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 3},
        {name: '1', body: blueprints.RCL3_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2.5},
        {name: '2', body: blueprints.RCL3_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2.5},
        {name: '3', body: blueprints.RCL3_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2},
        {name: '3', body: blueprints.RCL3_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2},
        
        {name: '4', body: blueprints.RCL3_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
        {name: '5', body: blueprints.RCL3_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
        {name: '6', body: blueprints.RCL3_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
        {name: '7', body: blueprints.RCL3_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
        {name: '8', body: blueprints.RCL3_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
        {name: '9', body: blueprints.RCL3_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
    ],

    temp_RCL4: [
        {name: '1', body: blueprints.RCL4_filler, memory: {role: 'filler', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 9},

        {name: '1', body: blueprints.RCL4_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 8},
        {name: '1', body: blueprints.RCL4_hauler, memory: {role: 'hauler', sub_role: 'main', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 7},
        {name: '2', body: blueprints.RCL4_hauler, memory: {role: 'hauler', sub_role: 'main', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 7},
        {name: '2', body: blueprints.RCL4_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 6},
        {name: '3', body: blueprints.RCL4_hauler, memory: {role: 'hauler', sub_role: 'main', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 5},

        {name: '1', body: blueprints.RCL4_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 3},
        {name: '2', body: blueprints.RCL4_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 3},
        {name: '1', body: blueprints.RCL4_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2.5},
        {name: '2', body: blueprints.RCL4_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2.5},
        {name: '3', body: blueprints.RCL4_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2},
        
        {name: '4', body: blueprints.RCL4_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
        {name: '5', body: blueprints.RCL4_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
        {name: '6', body: blueprints.RCL4_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
    ],

    temp_RCL5: [
        {name: '1', body: blueprints.RCL5_filler, memory: {role: 'filler', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 9},
        
        {name: '1', body: blueprints.RCL5_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 8},
        {name: '1', body: blueprints.RCL5_hauler, memory: {role: 'hauler', sub_role: 'main', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 7},
        {name: '2', body: blueprints.RCL5_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 6},
        {name: '3', body: blueprints.RCL5_hauler, memory: {role: 'hauler', sub_role: 'main', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 5},

        {name: '1', body: blueprints.RCL5_manager, memory: {role: 'manager', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 4},

        {name: '1', body: blueprints.RCL5_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 3},
        {name: '2', body: blueprints.RCL5_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 3},
        {name: '1', body: blueprints.RCL5_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2.5},
        {name: '2', body: blueprints.RCL5_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2.5},
        {name: '3', body: blueprints.RCL5_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2},
        
        {name: '4', body: blueprints.RCL5_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
        {name: '5', body: blueprints.RCL5_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
    ],


    temp_RCL6: [
        {name: '1', body: blueprints.RCL6_filler, memory: {role: 'filler', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 9},
        
        {name: '1', body: blueprints.RCL6_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 8},
        {name: '2', body: blueprints.RCL6_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 6},

        {name: '1', body: blueprints.RCL6_manager, memory: {role: 'manager', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 4},

        {name: '1', body: blueprints.RCL6_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 3},
        {name: '2', body: blueprints.RCL6_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 3},
        {name: '1', body: blueprints.RCL6_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2.5},
        {name: '2', body: blueprints.RCL6_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2.5},
        {name: '3', body: blueprints.RCL6_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 2},
        
        {name: '4', body: blueprints.RCL6_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
        {name: '5', body: blueprints.RCL6_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'SPAWNROOM'}, priority: 1},
    ],

    temp_reserve1: [
        {name: '1', body: blueprints.RCL3_reserver, memory: {role: 'reserver', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 3},
    ],

    temp_reserve2: [
        {name: '1', body: blueprints.RCL6_reserver, memory: {role: 'reserver', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 3},
    ],

    temp_remote_A1: [
        {name: '1', body: blueprints.RCL3_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 2},
        {name: '1', body: blueprints.RCL3_hauler, memory: {role: 'hauler', sub_role: 'remote', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 2},
        {name: '2', body: blueprints.RCL3_hauler, memory: {role: 'hauler', sub_role: 'remote', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 2},
    ],

    temp_remote_B1: [
        {name: '1', body: blueprints.RCL3_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 2},
        {name: '1', body: blueprints.RCL7_hauler, memory: {role: 'hauler', sub_role: 'remote', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 2},
    ],

    temp_remote_A2: [
        {name: '1', body: blueprints.RCL3_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 2},
        {name: '1', body: blueprints.RCL3_hauler, memory: {role: 'hauler', sub_role: 'remote', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 2},
        {name: '2', body: blueprints.RCL3_hauler, memory: {role: 'hauler', sub_role: 'remote', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 2},

        {name: '2', body: blueprints.RCL3_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 2},
        {name: '3', body: blueprints.RCL3_hauler, memory: {role: 'hauler', sub_role: 'remote', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 2},
        {name: '4', body: blueprints.RCL3_hauler, memory: {role: 'hauler', sub_role: 'remote', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 2},
    ],

    temp_remote_B2: [
        {name: '1', body: blueprints.RCL3_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 2},
        {name: '1', body: blueprints.RCL7_hauler, memory: {role: 'hauler', sub_role: 'remote', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 2},

        {name: '2', body: blueprints.RCL3_miner, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 2},
        {name: '2', body: blueprints.RCL7_hauler, memory: {role: 'hauler', sub_role: 'remote', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 2},
    ],

    temp_remote_build: [
        {name: '1', body: blueprints.RCL3_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 2.6},
        {name: '2', body: blueprints.RCL3_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 2.6},
    ],

    temp_remote_repair: [
        {name: '1', body: blueprints.RCL2_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 2.6},
    ],

    temp_def_roomba: [
        {name: '1', body: blueprints.RCL4_roomba, memory: {role: 'roomba', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 5},
    ],

    temp_orb_roomba: [
        {name: '1', body: specials.orb_roomba, memory: {role: 'miner', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 5},
    ],

    temp_claim: [
        {name: '1', body: blueprints.RCL3_claimer, memory: {role: 'claimer', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 3},
    ],

    temp_support: [
        {name: '1', body: blueprints.RCL4_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 1.5},
        {name: '2', body: blueprints.RCL4_builder, memory: {role: 'builder', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 1.5},

        {name: '1', body: blueprints.RCL4_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 1.5},
        {name: '2', body: blueprints.RCL4_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 1.5},
        {name: '3', body: blueprints.RCL4_upgrader, memory: {role: 'upgrader', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 1.5},
    ],

    temp_scout: [
        {name: '1', body: specials.scout, memory: {role: 'scout', task: 'TASK', original_room: 'SPAWNROOM', target_room: 'TARGETROOM'}, priority: 6},
    ],
};

const exportss = {
    blueprints: blueprints, 
    templates: templates, 
    defaults: defaults, 
    specials: specials,
};

module.exports = exportss;