class PlayerState {
    constructor() {
        this.sprites = {
            "sp1": {
                spriteId: "aq001",
                hp: 50,
                maxHp: 50,
                xp: 0,
                maxXp: 100,
                level: 1,
                state: null
            }
        }
        this.lineup = ["sp1"];
        this.items = [
            {actionId: "item_recoverHp", instanceId: "item1"},
            {actionId: "item_recoverHp", instanceId: "item1"},
            {actionId: "item_recoverHp", instanceId: "item1"},
        ]
        this.storyFlags = {
  
        }
    }

    addSprite(spriteId) {
        const newId = `sp${Math.floor(Math.random() * 99999)}`;
        this.sprites[newId] = {
            spriteId,
            hp: 50,
            maxHp: 50,
            xp: 0,
            maxXp: 100,
            level: 1,
            state: null,
        }
        if (this.lineup.length < 3) {
            this.lineup.push(newId)
        }
        utils.emitEvent("LineupChanged");
        console.log(this)
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