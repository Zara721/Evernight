class TitleScreen {
    constructor({ progress }) {
        this.progress = progress;
        this.titleMusic = new Sound("./Sound/title.mp3");

        this.handleClick = () => {
            // Play audio when the user interacts with the document
            this.titleMusic.loop();
            document.removeEventListener('click', handleClick);
          };
        document.addEventListener('click', this.handleClick, { once: true });
    }

    getOptions(resolve) {
        const saveFile = this.progress.getSaveFile();
        return [
            {
                label: "New Game",
                description: "Start a new journey into the world of Evernight!",
                handler: () => {
                    utils.emitEvent("NewGame");
                    this.close();
                    resolve();
                }
            
            },
            saveFile ? {
                label: "Continue Game",
                description: "Resume previous adventure",
                handler: () => {
                    this.close();
                    resolve(saveFile);
                }
            } : null,
            {
                label: "Music",
                description: "Simply click anywhere on the screen to hear music",
            },
        ].filter(v => v);
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("TitleScreen");
        this.element.innerHTML = (`
            <img class="TitleScreen_logo" src="./images/logo.png" alt="Evernight" />
        `)
    }

    close() {
        document.removeEventListener('click', this.handleClick);
        this.titleMusic.stop();
        this.keyboardMenu.end();
        this.element.remove();
    }

    init(container) {
        return new Promise(resolve => {
            this.createElement();
            container.appendChild(this.element);
            this.keyboardMenu = new KeyboardMenu();
            this.keyboardMenu.init(this.element);
            this.keyboardMenu.setOptions(this.getOptions(resolve));
        })
    }
}