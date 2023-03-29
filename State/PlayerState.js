class PlayerState {
    constructor() {
        this.sprites = {
            "sp1": {
                spriteId: "an001",
                hp: 50,
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
            },
            "sp3": {
                spriteId: "sp003",
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
        this.storyFlags = {
  
        }
    }

    swapLineup(oldId, incomingId) {
        const oldIndex = this.lineup.indexOf(oldId);
        this.lineup[oldIndex] = incomingId;
        utils.emitEvent("LineupChanged");
    }

    moveToFront(futureFrontId) {
        this.lineup = this.lineup.filter(id => id !== futureFrontId);
        this.lineup.unshift(futureFrontId);
        utils.emitEvent("LineupChanged");
    }
}
window.playerState = new PlayerState();