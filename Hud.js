class Hud {
    constructor() {
        this.scoreboards = [];
    }

    update() {
        this.scoreboards.forEach(s => {
            //update here
            s.update(window.playerState.sprites[s.id])
        })
    }

    createElement() {

        if (this.element) {
            this.element.remove();
            this.scoreboards = [];
        }

        this.element = document.createElement("div");
        this.element.classList.add("Hud");

        const {playerState} = window;
        playerState.lineup.forEach(key => {
            const sprite = playerState.sprites[key];
            const scoreboard = new Combatent ({
                id: key,
                ...Sprites[sprite.spriteId],
                ...sprite,
            }, null)
            scoreboard.createElement();
            this.scoreboards.push(scoreboard);
            this.element.appendChild(scoreboard.hudElement);
        })
        this.update();

    }
    
    init(container) {
        this.createElement();
        container.appendChild(this.element)

        document.addEventListener("PlayerStateUpdate", () => {
            this.update();
        })

        document.addEventListener("LineupChanged", () => {
            this.createElement();
            container.appendChild(this.element);
        })
    }
}