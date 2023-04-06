class TurnCycle {
    constructor({ battle, onNewEvent, onWinner}){
        this.battle = battle;
        this.onNewEvent = onNewEvent;
        this.onWinner = onWinner;
        this.currentTeam = "player"; //or the enemy
    }

    async turn() {
        //Get the caster, the person doing the action
        const casterId = this.battle.activeCombatents[this.currentTeam];
        const caster = this.battle.combatents[casterId];

        //So if caster's is on team player look up enemy value, otherwise default to player
        const enemyId = this.battle.activeCombatents[caster.team === "player" ? "enemy" : "player"];
        const enemy = this.battle.combatents[enemyId];

        const submission = await this.onNewEvent({
            type: "submissionMenu",
            caster,
            enemy
        })

        //Stop here if choosing another sprite
        if (submission.replacement) {
            this.onNewEvent ({
                type: "replace",
                replacement: submission.replacement,
            })
            await this.onNewEvent ({
                type: "textMessage",
                text: `${submission.replacement.name} emerges from the shadows to join the battle!`
            })
            this.nextTurn();
            return;
        }
        
        if (submission.instanceId) {

            //Add to the list to persist player state later
            this.battle.usedInstanceIds[submission.instanceId] = true;

            //Removing items from battle state
            this.battle.items = this.battle.items.filter(item => item.instanceId !== submission.instanceId) 
        }

        //Did the player flee from battle
        if(submission.flee) {
            //End the battle
            await this.onNewEvent ({
                type: "textMessage", 
                text: `You have chosen to flee from battle.`
            })
            this.onWinner("enemy");
            return;
        }

        const resultingEvents = caster.getReplacedEvents(submission.action.success);

        for (let i = 0; i < resultingEvents.length; i++) {
            const event = {
                ...resultingEvents[i],
                submission,
                action: submission.action,
                caster,
                target: submission.target,
            }
            await this.onNewEvent(event);
        }

        //Did the target die?
        const targetDead = submission.target.hp <= 0;
        if (targetDead) {
            await this.onNewEvent ({
                type: "textMessage", text: `${submission.target.name} has fallen in battle!`
            })

            if (submission.target.team === "enemy") {
                const playerActiveSprite = this.battle.activeCombatents.player;
                const xp = submission.target.givesXp
                await this.onNewEvent ({
                    type: "textMessage",
                    text: `Gained ${xp} XP`
                })
                await this.onNewEvent ({
                type: "givesXp",
                xp,
                combatent: this.battle.combatents[playerActiveSprite],
                })
            }
        }

        //Is there a winning team?
        const winner = this.getWinningTeam();
        if (winner) {
            //End the battle
            await this.onNewEvent ({
                type: "textMessage", 
                text: `A Champion has emerged!`
            })
            this.onWinner(winner);
            return;
        }

        //Maybe dead target but still no winner, so bring in replacement
        if (targetDead) {
            const replacement = await this.onNewEvent ({
                type: "replacementMenu",
                team: submission.target.team
            })
            await this.onNewEvent ({
                type: "replace", 
                replacement: replacement
            })
            await this.onNewEvent ({
                type: "textMessage", 
                text: `${replacement.name} appears!`
            })
        }
    
        //Check for any post events
        //Basically doing things AFTER the original turn submisison
        const postEvents = caster.getPostEvents();
        for (let i = 0; i < postEvents.length; i++) {
            const event = {
                ...postEvents[i],
                submission,
                action: submission.action,
                caster,
                target: submission.target,
            }
            await this.onNewEvent(event);
        }

        //Check for status expiring
        const expiredEvent = caster.diminishingStatus();
        if (expiredEvent) {
            await this.onNewEvent(expiredEvent)
        }

        this.nextTurn();

    }

    nextTurn() {
        //Switch team to the opposite, like swicth team player for enemy and enemy for player
        this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
        this.turn();
    }

    getWinningTeam() {
        let aliveTeam = {};
        Object.values(this.battle.combatents).forEach(c => {
            if (c.hp > 0) {
                aliveTeam[c.team] = true;
            }
        })
        if (!aliveTeam["player"]) { return "enemy" }
        if (!aliveTeam["enemy"]) { return "player" }
        return null;
    }

    async init() {
        await this.onNewEvent({
            type: "textMessage",
            text: `${this.battle.enemy} has chosen to commence the battle!`,
            text: "The battle is about to commence...",
        })

        //Start the first turn of the battle
        this.turn();

    }
}