class Team {
    constructor(team, name) {
        this.team = team;
        this.name = name;
        this.combatents = [];
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("Team");
        this.element.setAttribute("data-team", this.team);
        this.combatents.forEach(c => {
            let icon = document.createElement("div");
            icon.setAttribute("data-combatent", c.id);
            icon.innerHTML = (`
            <svg xmlns="http://www.w3.org/2000/svg" width="35" viewBox="0 -0.5 7 10" shape-rendering="crispEdges">
            <path stroke="#310D3A" d="M2 0h3M1 1h1M5 1h1M0 2h1M6 2h1M0 3h1M6 3h1M0 4h1M6 4h1M1 5h1M5 5h1M2 6h3" />
            <path stroke="#C151E2" d="M2 1h1M4 1h1M1 2h1M5 2h1M1 4h1M5 4h1M2 5h1M4 5h1" />
            <path stroke="#E386FF" d="M3 1h1M2 2h3M1 3h5M2 4h3M3 5h1" />
            
            <!-- Active indicator appears when needed with CSS -->
            <path class="active-sprite-indicator" stroke="#6A0F7F" d="M3 8h1M2 9h3" />
            
            <!-- Paths appear when needed with CSS -->
            <path class="dead-sprite" stroke="#310D3A" d="M2 0h3M1 1h1M5 1h1M0 2h1M2 2h1M4 2h1M6 2h1M0 3h1M3 3h1M6 3h1M0 4h1M2 4h1M4 4h1M6 4h1M1 5h1M5 5h1M2 6h3" />
            <path class="dead-sprite" stroke="#9B949C" d="M2 1h3M1 2h1M5 2h1" />
            <path class="dead-sprite" stroke="#C4B7C7" d="M3 2h1M1 3h2M4 3h2M1 4h1M3 4h1M5 4h1M2 5h3" />
            </svg> 
        `)
        //Addd to parent element
        this.element.appendChild(icon)

        })
    }

    update() {
        this.combatents.forEach(c => {
            const icon = this.element.querySelector(`[data-combatent="${c.id}"]`)
            icon.setAttribute("data-dead", c.hp <= 0 );
            icon.setAttribute("data-active", c.isActive);
        })
    }

    init(container) {
        this.createElement();
        this.update();
        container.appendChild(this.element);
    }
}