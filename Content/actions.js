window.Actions = {
    damage1:{
        name: "Charge",
        description: "Concentrates strength to give a single powerful attack",
        success: [
            {type: "textMessage", text: "{Caster} uses {Action}!"},
            {type: "animation", animation: "tackle"},
            {type: "stateChange", damage: 10},
            {type: "textMessage", text: "{Target} is slammed with great force!"},
        ]
    },
    damage2:{
        name: "Shadow Bolt",
        description: "Summons a bolt of darkness that strikes the target, dealing heavy damage",
        success: [
            {type: "textMessage", text: "{Caster} uses {Action}!"},
            {type: "animation", animation: "blob" , color: "#420541"},
            {type: "stateChange", damage: 10},
            {type: "textMessage", text: "{Target} is struck by a bolt of darkness!"},
        ]
    },
    damage3:{
        name: "Leaf Dart",
        description: "Pummels the target with a flurry of razor-sharp leaves, dealing significant damage",
        success: [
            {type: "textMessage", text: "{Caster} uses {Action}!"},
            {type: "animation", animation: "blob" , color: "#20733B"},
            {type: "stateChange", damage: 10},
            {type: "textMessage", text: "{Target} is pummeled with leaves!"},
        ]
    },
    damage4:{
        name: "Water Ball",
        description: "A powerful ball of water that can wash away your opponent's health",
        success: [
            {type: "textMessage", text: "{Caster} uses {Action}!"},
            {type: "animation", animation: "blob" , color: "#205773"},
            {type: "stateChange", damage: 10},
            {type: "textMessage", text: "{Target} is engulfed in a watery exploision!"},
        ]
    },
    hugsStatus:{
        name: "Warm Embrace",
        description: "Embraces the sprite in a warm hug, healing it for 3 turns",
        targetType: "friendly",
        success: [
            {type: "textMessage", text: "{Caster} uses {Action}!"},
            {type: "stateChange", state: { type: "hugs", expiresIn: 3}},
        ]
    },
    stubsStatus:{
        name: "Blinding Twirl",
        description: "Confuses the enemy and increases the chance of them missing their next attack",
        success: [
            {type: "textMessage", text: "{Caster} uses {Action}!"},
            {type: "animation", animation: "spin"},
            {type: "stateChange", state: { type: "stubs", expiresIn: 3}},
            {type: "textMessage", text: "{Target} is left dazed and confused!"},
        ]
    },
    //items
    item_recoverStatus: {
        name: "Cocunut Water",
        description: "A refreshing drink that purifies the body, curing any status conditions",
        targetType: "friendly",
        success: [
            {type: "textMessage", text: "{Caster} uses {Action}!"},
            {type: "stateChange", state: null},
            {type: "textMessage", text: "{Caster}'s status condition is washed away!"},

        ],
    },
    item_recoverHp: {
        name: "Bamboo Bandages",
        description: "Can heal injuries and restore a moderate amount of health",
        targetType: "friendly",
        success: [
            {type: "textMessage", text: "{Caster} uses {Action}!"},
            {type: "stateChange", recover: 10, },
            {type: "textMessage", text: "{Caster}'s injuries are mended and health is restored!"},

        ],
    },
    item_smallRecoverHp: {
        name: "Axo Berry",
        description: "A small, magenta berry that is known for its healing properties",
        targetType: "friendly",
        success: [
            {type: "textMessage", text: "{Caster} uses {Action}!"},
            {type: "stateChange", recover: 5, },
            {type: "textMessage", text: "{Caster} munches on an Axo Berry, restoring a small amount of health!"},

        ],
    },
    itemDamage1: {
        name: "Firefly Jar",
        description: "A jar filled with volitile fireflies that can deal serious damage",
        success: [
        {type: "textMessage", text: "{Caster} uses {Action}!"},
        {type: "stateChange", damage: 15},
        {type: "textMessage", text: "{Target} is swarmed by fireflies!"}
        ]
    }
    
}

