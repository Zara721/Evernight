class Progress {
    constructor() {
        this.mapId = "magentaHouse";
        this.startingMcX = 15;
        this.startingMcY = 10;
        this.startingMcDirection = "down";
        this.saveFileKey = "Evernight_SaveFile1";
    }

    save() {
        window.localStorage.setItem(this.saveFileKey, JSON.stringify({
            mapId: this.mapId,
            startingMcX: this.startingMcX,
            startingMcY: this.startingMcY,
            startingMcDirection: this.startingMcDirection,
            playerState:{
                sprites: playerState.sprites,
                lineup: playerState.lineup,
                items: playerState.items,
                storyFlags: playerState.storyFlags,
            }
        }))
    }

    getSaveFile() {
        const file = window.localStorage.getItem(this.saveFileKey);
        return file ? JSON.parse(file) : null
    }

    load() {
        const file = this.getSaveFile();
        if (file) {
            this.mapId = file.mapId;
            this.startingMcX = file.startingMcX;
            this.startingMcY = file.startingMcY;
            this.startingMcDirection = file.startingMcDirection;
            Object.keys(file.playerState).forEach(key => {
                playerState[key] = file.playerState[key]
            })
        }
    }
}