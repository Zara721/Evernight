class GameObject {
    constructor(config) {
      this.id = null;
      this.isMounted = false;
      this.x = config.x || 0;
      this.y = config.y || 0;
      this.direction = config.direction || "down";
      this.sprite = new Sprite ({
        gameObject: this,
        src: config.src,
      });
      
      this.behaviourLoop = config.behaviourLoop || [];
      this.behaviourLoopIndex = 0;

      this.talking = config.talking || [];
    }
    
    mount(map) {
      console.log("mounting")
      this.isMounted = true;
      map.addWall(this.x, this.y);
      
      //If there is a behaviour, then start the transition after a short delay
      setTimeout(() => {
        this.doBehaviourEvent(map);
      }, 10)
    }
    
    update() {
      
    }
    
    async doBehaviourEvent(map) {
      
      //Basically, don't do anything if there is a higher priority cutscene
      //or there is no config on the sprite
      if(map.isCutscenePlaying || this.behaviourLoop.length === 0 || this.isStanding) {
        return;
      }
      
      //Setting up event with relevant info
      let eventConfig = this.behaviourLoop[this.behaviourLoopIndex];
      eventConfig.who = this.id;
      
      //Creat an event instance based on the next event config
      const eventHandler = new WorldEvent({map, event: eventConfig});
      //await keyword to prevent an infinite loop, and gives a timing gap
      await eventHandler.init(); 
      
      //Setting the next event to fire
      this.behaviourLoopIndex += 1;
      if (this.behaviourLoopIndex === this.behaviourLoop.length) {
        this.behaviourLoopIndex = 0;
      }
      
      //Do it again
      this.doBehaviourEvent(map);
    }
    
    
  }