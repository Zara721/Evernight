class Sprite {
    constructor(config) {
      //Set up the image
      this.image = new Image ();
      this.image.src = config.src
      this.image.onload = () => {
        this.Loaded = true;
      }
      
      //config animation and inital state
      this.animations = config.animations || {
        "idle-down": [ [0,0] ],
        "idle-left": [ [0,1] ],
        "idle-right": [ [0,2] ],
        "idle-up": [ [0,3] ],
        "walk-down": [ [1,0], [0,0], [3,0], [0,0] ],
        "walk-left": [ [1,1], [0,1], [3,1], [0,1] ],
        "walk-right": [ [1,2], [0,2], [3,2], [0,2] ],
        "walk-up": [ [1,3], [0,3], [3,3], [0,3] ]
      }
      this.currentAnimation = "idle-down"//config.currentAnimation || "idle-down";
      this.currentAnimationFrame = 0;
      
      this.animationFrameLimit = config.animationFrameLimit || 12;
      this.animationFrameProgress = this.animationFrameLimit;
      
      //Reference the game object
      this.gameObject = config.gameObject;
    }
    
    get frame() {
      return this.animations[this.currentAnimation][this.currentAnimationFrame];
    }
    
    setAnimation(key) {
      if(this.currentAnimation !== key) {
        this.currentAnimation = key;
        this.currentAnimationFrame = 0;
        this.animationFrameProgress = this.animationFrameLimit;
      }
    }
    
    updateAnimationProgress() {
      //Countdown frame progress
      if(this.animationFrameProgress > 0) {
        this.animationFrameProgress -= 1;
        return;
      }
      
      //Resetting the counter
      this.animationFrameProgress = this.animationFrameLimit;
      this.currentAnimationFrame +=1;
      
      if(this.frame == undefined) {
        this.currentAnimationFrame = 0;
      }
      
    }
    
    draw(ctx, camPerson) {
      const x = this.gameObject.x + 405 - camPerson.x;
      const y = this.gameObject.y + 210 - camPerson.y;
      
      const [frameX, frameY] = this.frame;
      
      this.Loaded && ctx.drawImage(this.image, 
        frameX*32, frameY*48, //x,y starting position
        32, 48, // width, height of the frame in the sprite sheet
        x, y, //x,y position to draw at
        32, 48 // width, height of the frame in the canvas    
      )
      
      this.updateAnimationProgress();
    }
  }