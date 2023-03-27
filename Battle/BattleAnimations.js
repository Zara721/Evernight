window.BattleAnimations = {
    async tackle(event, onComplete) {
        const element = event.caster.spriteElement;
        const animationClassName = event.caster.team === "player" ? "battle-tackle-right" : "battle-tackle-left";
        element.classList.add(animationClassName);

        //Remove class once animation has been complete
        element.addEventListener("animationend", () => {
            element.classList.remove(animationClassName);
        }, { once: true});

        //Continue battle cycle around the same time the sprites collide
        await utils.wait(100);
        onComplete();
    },

    async blob(event, onComplete) {
        const {caster} = event;
        let div = document.createElement("div");
        div.classList.add("blob-orb");
        div.classList.add(caster.team === "player" ? "battle-blob-right" : "battle-blob-left");

        div.innerHTML = (`
            <svg viewBox = "0 0 32 32" width = "32" height = "32">
                <circle cx="16" cy="16" r="16" fill="${event.color}" />
            </svg>
        `);

        //Remove the class when animation is complete
        div.addEventListener("animationend", () => {
            div.remove();
        });

        document.querySelector(".Battle").appendChild(div);

        //Continue battle cycle around the same time the sprites collide
        await utils.wait(820);
        onComplete();
    },

    async spin(event, onComplete) {
        const element = event.caster.spriteElement;
        const animationClassName = event.caster.team === "player" ? "battle-spin-right" : "battle-spin-left";
        element.classList.add(animationClassName);

        //Remove class once animation has been complete
        element.addEventListener("animationend", () => {
            element.classList.remove(animationClassName);
        }, { once: true});

        //Continue battle cycle around the same time the sprite finishing spinning
        await utils.wait(800);
        onComplete();

    }
}