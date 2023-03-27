class Combatent {
    constructor(config, battle) {
        Object.keys(config).forEach(key => {
            this[key] = config[key];
        })
        this.hp = typeof(this.hp) === "undefined" ? this.maxHp : this.hp;
        this.battle = battle;
    }
    
    get hpPercent() {
        const percent = this.hp / this.maxHp * 100;
        return percent > 0 ? percent : 0;
    }

    get xpPercent() {
        return this.xp / this.maxXp * 100;
    }

    get isActive() {
        return this.battle?.activeCombatents[this.team] === this.id;
    }

    get givesXp() {
        return this.level * 20;
    }

    createElement() {
        this.hudElement = document.createElement("div");
        this.hudElement.classList.add("Combatent");
        this.hudElement.setAttribute("data-combatent", this.id);
        this.hudElement.setAttribute("data-team", this.team);
        this.hudElement.innerHTML = (`
            <p class = "Combatent_name">${this.name}</p>
            <p class = "Combatent_level"></p>
            <div class = "Combatent_character_crop">
                <img class = "Combatent_character" alt="${this.name}" src="${this.src}"/>  
            </div>
            <img class = "Combatent_type" alt="${this.type}" src="${this.icon}"/>  
            <svg viewBox="0 0 26 3" class="Combatent_life-container">
                <rect x=0 y=0 width=0% height=1 fill="#89EF7C" />
                <rect x=0 y=1 width=0% height=2 fill="#44D931" />
            </svg>
            <svg viewBox="0 0 26 1" class="Combatent_xp-container">
                <rect x=0 y=0 width=0% height=1 fill="#DC63FC" />
                <rect x=0 y=1 width=0% height=1 fill="#D036F9" />
            </svg>
            <p class = "Combatent_status"></p>
        `);

        this.spriteElement = document.createElement("img");
        this.spriteElement.classList.add("Sprite");
        this.spriteElement.setAttribute("src", this.src);
        this.spriteElement.setAttribute("alt", this.name);
        this.spriteElement.setAttribute("data-team", this.team);

        this.hpFills = this.hudElement.querySelectorAll(".Combatent_life-container > rect")
        this.xpFills = this.hudElement.querySelectorAll(".Combatent_xp-container > rect")
    }

    update(changes={}) {
        //Update any incoming information
        Object.keys(changes).forEach(key => {
            this[key] = changes[key]
        });

        //So update the elements to only display active combatents and associated sprites
        this.hudElement.setAttribute("data-active", this.isActive);
        this.spriteElement.setAttribute("data-active", this.isActive);

        //Basically updating the health to reflect the sprite's health status
        this.hpFills.forEach(rect => rect.style.width = `${this.hpPercent}%`);
        this.xpFills.forEach(rect => rect.style.width = `${this.xpPercent}%`);

        //Update the level on the battle screen
        this.hudElement.querySelector(".Combatent_level").innerHTML = this.level;

        //Update the status on screen
        const statusElement = this.hudElement.querySelector(".Combatent_status");
        if (this.state) {
            statusElement.innerHTML = this.state.type;
            statusElement.style.display = "block";
        } else { 
            statusElement.innerHTML = "";
            statusElement.style.display = "none";
        }

    }

    getReplacedEvents(originalEvents) {
        
        //Giving a 33% chance that the affected sprite will miss attack
        if (this.state?.type === "stubs" && utils.randomFromArray([true, false, false])) {
            return [
                {type: "textMessage", text: `${this.name} trips over!`},
            ]
        }

        return originalEvents
    }

    getPostEvents() {
        if (this.state?.type === "hugs") {
            return [
                {type: "textMessage", text: "A warm embrace restores some health"},
                {type: "stateChange", recover: 5, onCaster: true},
            ]
        }
        return [];
    }

    diminishingStatus() {
        if (this.state?.expiresIn > 0) { 
            this.state.expiresIn -= 1;
            if (this.state.type === "hugs" && this.state.expiresIn === 0) {
                this.update({
                    state: null
                })
                return {
                    type: "textMessage", text: "The warmth of the hugs has faded.",
                }
            }
        }
        return null;
    }

    init(container) {
        this.createElement();
        container.appendChild(this.hudElement);
        container.appendChild(this.spriteElement);
        this.update();
    }

}