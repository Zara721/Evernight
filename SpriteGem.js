class SpriteGem extends GameObject {
    constructor(config) {
        super(config);
        this.sprite = new Sprite({
            gameObject: this,
            src: "images/spriteGem.png",
            animations: {
                "used-down": [ [0,0] ],
                "unused-down" : [ [1,0] ]
            },
            currentAnimation: "used-down"
        });
    }
}