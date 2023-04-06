class SpriteGem extends GameObject {
    constructor(config) {
        super(config);
        this.sprite = new Sprite({
            gameObject: this,
            src: "./images/spriteGem.png",
            animations: {
                "used-down": [ [0,0] ],
                "unused-down" : [ [1,0] ],
            },
            currentAnimation: "used-down"
        });
        this.storyFlag = config.storyFlag;
        this.sprites = config.sprites;

        this.talking = [
            {
                required: [this.storyFlag],
                events: [
                    {type: "textMessage", text: "This gem is out of energy"}
                ]
            },
            {
                events: [
                    {type: "textMessage", text: "Activating the mystical sprite gem..."},
                    {type: "summoningMenu", sprites: this.sprites},
                    {type: "addStoryFlag", flag: this.storyFlag},
                ]
            }
        ]
        console.log(this.talking)
    }

    update() {
        this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
        ? "used-down"
        : "unused-down"
    }
}