class PlayerState {
    constructor() {
        this.sprites = {
            "sp1": {
                spriteId: "an001",
                hp: 40,
                maxHp: 50,
                xp: 97,
                maxXp: 100,
                level: 1,
                state: {type: "hugs"},
            },
            "sp2": {
                spriteId: "sp002",
                hp: 50,
                maxHp: 50,
                xp: 70,
                maxXp: 100,
                level: 1,
                state: null,
            }
        }
        this.lineup = ["sp1", "sp2"];
        this.items = [
            {actionId: "item_recoverHp", instanceId: "item1"},
            {actionId: "item_recoverHp", instanceId: "item1"},
            {actionId: "item_recoverHp", instanceId: "item1"},
        ]
    }
}
window.playerState = new PlayerState();