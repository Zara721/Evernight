class RevealingText {
    constructor(config) {
        this.element = config.element;
        this.text = config.text;
        this.speed = config.speed || 60;

        this.timeout = null;
        this.isDone = false;
    }

    revealOneCharacter(list) {
        const next = list.splice(0,1)[0];
        next.span.classList.add("revealed");

        if (list.length > 0) {
            this.timeout = setTimeout(() => {
                this.revealOneCharacter(list)
            }, next.delayAfter)
        } else {
            this.isDone = true;
        }
    }

    warpToDone() {
        clearInterval(this.timeout);
        this.isDone = true;
        this.element.querySelectorAll("span").forEach (s => {
            s.classList.add("revealed")
        })
    }

    init() {
        let characters = [];
        this.text.split("").forEach(character => {

            //create each span add to the element on DOM
            let span = document.createElement("span");
            span.textContent = character;
            this.element.appendChild(span);

            //Add the span to the array
            //If the character is equal to zero no delay and default to the passed in speed
            characters.push({
                span,
                delayAfter: character === " " ? 0 : this.speed
            })
        })

        this.revealOneCharacter(characters);
    }
}