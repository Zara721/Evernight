class Person extends GameObject {
    constructor(config) {
      super(config);
      this.movingProgressRemaining = 0;
      this.isStanding = false;
      
      this.isPlayerControlled = config.isPlayerControlled || false;
      
      this.directionUpdate = {
        "up": ["y", -2],
        "down": ["y", 2],
        "left": ["x", -2],
        "right": ["x", 2],
      };
    }
    
    update(state) {
      if (this.movingProgressRemaining > 0) {
        this.updatePosition();
      } else {
          
          //Placeholder for more cases for starting to walk
          
          //Basically the user is allowed to provide input and has an arrow pressed and no cutscene playing
          if(state.map.isCutscenePlaying === false && this.isPlayerControlled === true && state.arrow) {
            //move in that direction
              this.startBehaviour(state, {
                type: "walk",
                direction: state.arrow
              })
          }
        this.updateSprite(state);
      }
    }
    
    startBehaviour(state, behaviour) {
        //setting the character direction to whatever behaviour has
        this.direction = behaviour.direction;
        
        if (behaviour.type === "walk") {
          
          //stop here if space is not free
          if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
            
            behaviour.retry && setTimeout(() => {
              this.startBehaviour(state, behaviour)
            }, 10)
            return;
          }
            // console.log(state.map.isSpaceTaken(this.x, this.y, this.direction));
            console.log(this.x, this.y, this.direction);
            
            //ready to walk
            state.map.moveWall(this.x, this.y, this.direction);
            this.movingProgressRemaining = 16;
            this.updateSprite(state)
        }
      
      if(behaviour.type === "stand") {
        this.isStanding = true;
        setTimeout(() => {
          utils.emitEvent("PersonStandingComplete", {
            whoId: this.id
          })
          this.isStanding = false;
        }, behaviour.time)
      }
    }
    
    updatePosition() {
        const [property, change] = this.directionUpdate[this.direction];
        this[property] += change;
        this.movingProgressRemaining -= 1;
      
        if(this.movingProgressRemaining === 0) {
          //The player has finished the walk
          utils.emitEvent("PersonWalkingComplete", {
            whoId: this.id
          })
        }
    }
    
    updateSprite() {
       if (this.movingProgressRemaining > 0) {
        this.sprite.setAnimation("walk-" + this.direction);
        return;
      }
      this.sprite.setAnimation("idle-" + this.direction);      
    }
  }