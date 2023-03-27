class BattleEvent {
    constructor(event, battle) {
        this.event = event;
        this.battle = battle;
    }

    textMessage(resolve) {

        const text = this.event.text
        .replace("{Caster}", this.event.caster?.name)
        .replace("{Target}", this.event.target?.name)
        .replace("{Action}", this.event.action?.name)

        const messsage = new TextMessage({
            text,
            onComplete: () => {
                resolve();
            }
        })
        messsage.init(this.battle.element)
    }

    async stateChange(resolve) {
        const {caster, target, damage, recover, state, action} = this.event;
        let who = this.event.onCaster ? caster : target;

        if (damage) {
            //reflect that with the target having less health
            target.update({
                hp: target.hp - damage 
            })
            // console.log(caster.level)
            
            //start flickering
            target.spriteElement.classList.add("battle-damage-blink");
            console.log(target)
        }

        if (recover) {
            let newHp = who.hp + recover;
            if (newHp > who.maxHp) {
                newHp = who.maxHp;
            }
            who.update({
                hp: newHp
            })
        }

        if (state) {
            who.update({
                state: {...state}
            })
        }
        if (state === null) {
            who.update ({
                state: null
            })
        }
        

        //Wait a little bit
        await utils.wait(600);

        //Update team side icons
        this.battle.playerTeam.update();
        this.battle.enemyTeam.update();

        //stop flickering
        target.spriteElement.classList.remove("battle-damage-blink");
        resolve();
    }

    givesXp(resolve) {
        let amount = this.event.xp;
        const {combatent} = this.event;
        const step = () => {
            if (amount > 0) {
                amount -= 1;
                combatent.xp += 1;

                //Check if sprite has hit max xp, then level up
                if (combatent.xp === combatent.maxXp) {
                    combatent.xp = 0;
                    combatent.maxHp = 100;
                    combatent.level += 1;
                }

                combatent.update();
                requestAnimationFrame(step);
                return;
            }
            resolve();
        }
        requestAnimationFrame(step);
    }

    submissionMenu(resolve) {
        const { caster } = this.event;
        const menu = new SubmissionMenu ({
            caster: caster,
            enemy: this.event.enemy,
            items: this.battle.items,
            replacements: Object.values(this.battle.combatents).filter(c => {
                return c.id !== caster.id && c.team === caster.team && c.hp > 0
            }),
            onComplete: submission => {
                //submission, submitting actions like what move is being used and so on
                resolve(submission)
            }
        })
        menu.init(this.battle.element)

    }

    replacementMenu(resolve) {
        const menu = new ReplacementMenu({
            replacements: Object.values(this.battle.combatents).filter(c => {
                return c.team === this.event.team && c.hp > 0
            }),
            onComplete: replacement => {
                resolve(replacement)
            }
        })
        menu.init( this.battle.element )
    }

    async replace(resolve) {
        const {replacement} = this.event;

        //Clear out old combatent
        const prevCombatent = this.battle.combatents[this.battle.activeCombatents[replacement.team]];
        this.battle.activeCombatents[replacement.team] = null;
        prevCombatent.update();
        await utils.wait(400);

        //Come in the new sprite
        this.battle.activeCombatents[replacement.team] = replacement.id;
        replacement.update();
        await utils.wait(400);

        //Update team side icons
        this.battle.playerTeam.update();
        this.battle.enemyTeam.update();

        resolve();
    }

    animation(resolve) {
        const fn = BattleAnimations[this.event.animation];
        fn(this.event, resolve);
    }

    init(resolve) {
        this[this.event.type](resolve);
    }
}