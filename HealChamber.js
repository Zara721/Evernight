class HealChamber extends GameObject {
  constructor(config) {
    super(config);
    this.sprite = new Sprite({
      gameObject: this,
      src: "./images/healChamber.png",
      animations: {
        "ready": [[0, 0]],
      },
      currentAnimation: "ready"
    });

    this.talking = this.chooseSpeech();
  }

  chooseSpeech() {
    const numSprites = Object.keys(window.playerState.sprites).length;

    if (numSprites === 0) {
      return [{
        events: [
          { type: "textMessage", text: "This is the healing chamber. You can use it to heal your sprites if they get injured during battle." }
        ],
      }]
    } else {
      const allSpritesFullHealth = Object.values(window.playerState.sprites).every(sprite => sprite.hp === sprite.maxHp);

      if (allSpritesFullHealth) {
        return [{
          events: [
            { type: "textMessage", text: "Initiating the healing chamber..." },
            { type: "textMessage", text: "All your sprites have full health, no need for healing!" }
          ],
        }]
      } else {
        return [{
          events: [
            {type: "textMessage", text: "Initiating the healing chamber..." },
            {type: "healSprites"},
            {type: "textMessage", text: "Sprites have been healed..." },
          ],
        }]
      }
    }
  }

  update() {
    this.talking = this.chooseSpeech();
  }
}



