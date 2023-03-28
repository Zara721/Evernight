class PauseMenu {
    constructor({onComplete}) {
        this.onComplete = onComplete
    }

    getOptions(pageKey) {

        //Case 1: Show the first page of options
        if (pageKey === "root") {

            const spriteLineup = playerState.lineup.map(id => {
                const {spriteId} = playerState.sprites[id];
                const base = Sprites[spriteId];
                return {
                    label: base.name,
                    description: base.description,
                    handler: () => {
                        this.keyboardMenu.setOptions(this.getOptions(id))
                    }
                }
            })

            return [
                //All of the sprites (dynomic)
                ...spriteLineup,
                {
                    label: "Save",
                    description: "Save your progress",
                    handler: () => {
                        //Come back to do
                    }
                },
                {
                    label: "Close",
                    description: "Close the pause menu",
                    handler: () => {
                        this.close();
                    }
                }
            ]
        }

        //Case 2: Show the options for just one sprite by id
        const unequipped = Object.keys(playerState.sprites).filter(id=> {
            return playerState.lineup.indexOf(id) === -1;
        }).map(id => {
            const {spriteId} = playerState.sprites[id];
            const base = Sprites[spriteId];
            return {
                label:`Swap for ${base.name}`,
                description: base.description,
                handler: () => {
                    //...
                }
            }
        })

        return [
            ...unequipped,
            //Swap for any unequipped Sprite..
            {
                label: "Move to front",
                description: "Move this sprite to the front of list",
                handler: () => {
                    //...
                }
            },
            {
                label: "Back",
                description: "Back to previous page",
                handler: () => {
                    this.keyboardMenu.setOptions(this.getOptions("root"))
                }
            }
        ];
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("PauseMenu")
        this.element.innerHTML = (`
        <h2> Pause Menu </h2>
        `)

    }

    close() {
        this.esc?.unbind();
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
        this.keyboardMenu.setOptions(this.getOptions("root"));

        container.appendChild(this.element);

        utils.wait(200);
        this.esc = new KeyPressListener("Escape", () => {
            this.close()
        })
    }
}