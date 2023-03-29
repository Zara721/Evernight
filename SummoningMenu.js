class SummoningMenu {
    constructor({sprites, onComplete}) {
        this.sprites = sprites;
        this.onComplete = onComplete;
    }

    getOptions() {
        return this.sprites.map(id=> {
            const base = Sprites[id];
            return {
                label: base.name,
                description: base.description,
                handler: () => {
                    playerState.addSprite(id);
                    this.close();
                }
            }
        })
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("SummoningMenu");
        this.element.classList.add("overlayMenu");
        this.element.innerHTML = (`
        <h2> Summon a Sprite </h2>
        `)
    }

    close() {
        this.keyboardMenu.end();
        this.element.remove();
        this.onComplete();
    }

    init(container) {
        this.createElement();
        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container
        })
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions());

        container.appendChild(this.element);
    }
}