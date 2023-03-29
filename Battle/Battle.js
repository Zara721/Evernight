class Battle {
    constructor( {enemy, onComplete}) {

        this.enemy = enemy;
        this.onComplete = onComplete;

        this.combatents = {
        //     "player1": new Combatent({
        //         ...Sprites.an001,
        //         team: "player",
        //         hp: 40,
        //         maxHp: 50,
        //         xp: 97,
        //         maxXp: 100,
        //         level: 1,
        //         state: {type: "hugs"},
        //         isPlayerControlled: true
        //     }, this),

        //     "player2": new Combatent({
        //         ...Sprites.aq001,
        //         team: "player",
        //         hp: 50,
        //         maxHp: 50,
        //         xp: 75,
        //         maxXp: 100,
        //         level: 1,
        //         state: null,
        //         isPlayerControlled: true
        //     }, this),

        //     "enemy1": new Combatent({
        //         ...Sprites.pl001,
        //         team: "enemy",
        //         hp: 1,
        //         maxHp: 50,
        //         xp: 20,
        //         maxXp: 100,
        //         level: 1,
        //         state: null,
        //     }, this),

        //     "enemy2": new Combatent({
        //         ...Sprites.pl002,
        //         team: "enemy",
        //         hp: 50,
        //         maxHp: 50,
        //         xp: 30,
        //         maxXp: 100,
        //         level: 1,
        //         state: null,
        //     }, this),
        }

        this.activeCombatents = {
            player: null, // "player1",
            enemy: null, //"enemy1",
        }

        //Dynamically add Player Team
        window.playerState.lineup.forEach(id => {
            this.addCombatent(id, "player", window.playerState.sprites[id])
        });

        //Now enemy team
        Object.keys(this.enemy.sprites).forEach(key => {
            this.addCombatent("e_"+key, "enemy", this.enemy.sprites[key])
        })

        //Start empty
        this.items = []

        //Adds in player items
        window.playerState.items.forEach(item => {
            this.items.push({
                ...item,
                team: "player"
            })
        })

        //Tracking used items to be removed at end of battle
        this.usedInstanceIds = {};
    }

    addCombatent(id, team, config) {
        this.combatents[id] = new Combatent ({
            ...Sprites[config.spriteId],
            ...config,
            team,
            isPlayerControlled: team === "player"
        }, this)

        //Populate the first active sprite
        this.activeCombatents[team] = this.activeCombatents[team] || id
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("Battle");
        this.element.innerHTML = (`
            <div class = "Battle_mc">
                <img src = "${ "./images/ccMc.png"}" alt ="mc" />
            </div>
            <div class = "Battle_enemy">
                <img src = "${this.enemy.src}" alt ="${this.enemy.name}" />
            </div>
        `)
    }

    init(container) {
        this.createElement();
        container.appendChild(this.element);

        this.playerTeam = new Team("player", "Protagonist");
        this.enemyTeam = new Team("enemy", "Hobbyist");

        Object.keys(this.combatents).forEach(key => {
            let combatent = this.combatents[key];
            combatent.id = key;
            combatent.init(this.element)

            //Add to correct team
            if (combatent.team === "player") {
                this.playerTeam.combatents.push(combatent);
            } else if (combatent.team === "enemy") {
                this.enemyTeam.combatents.push(combatent);
            }
        })

        this.playerTeam.init(this.element);
        this.enemyTeam.init(this.element);

        this.turnCycle = new TurnCycle({
            battle: this,
            onNewEvent: event => {
                return new Promise(resolve => {
                    const battleEvent = new BattleEvent(event, this)
                    battleEvent.init(resolve);
                })
            },
            onWinner:  winner => {

                if (winner === "player") {
                    const playerState = window.playerState
                    Object.keys(playerState.sprites).forEach(id => {
                        const playerStateSprite = playerState.sprites[id];
                        const combatent = this.combatents[id]
                        if (combatent) {
                            playerStateSprite.hp = combatent.hp;
                            playerStateSprite.xp = combatent.xp;
                            playerStateSprite.maxXp = combatent.maxXp;
                            playerStateSprite.level = combatent.level;
                        }
                    })

                    //Get rid of player used items
                    playerState.items = playerState.items.filter(item => {
                        return !this.usedInstanceIds[item.instanceId]
                    })

                    //Send signal to update
                    utils.emitEvent("PlayerStateUpdate");
                }

                this.element.remove();
                this.onComplete(winner === "player");
            }
        })
        this.turnCycle.init();
    }

}