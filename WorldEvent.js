class WorldEvent {
    constructor({map, event}) {
      this.map = map;
      this.event = event;
    }
    
    stand(resolve) {
      const who = this.map.gameObjects [ this.event.who ]
      who.startBehaviour({
        map: this.map
      }, {
        type: "stand",
        direction: this.event.direction,
        time: this.event.time
      })
      
      //Set up a handler to complete when the person has finished walking, then resolve event
      const completeHandler = e => {
        if (e.detail.whoId === this.event.who) {
          document.removeEventListener("PersonStandingComplete", completeHandler);
          resolve();
        }
      }
      
      document.addEventListener("PersonStandingComplete", completeHandler)
    }
    
    walk(resolve) {
      const who = this.map.gameObjects [ this.event.who ]
      who.startBehaviour({
        map: this.map
      }, {
        type: "walk",
        direction: this.event.direction,
        retry: true
      })
      
      //Set up a handler to complete when the person has finished walking, then resolve event
      const completeHandler = e => {
        if (e.detail.whoId === this.event.who) {
          document.removeEventListener("PersonWalkingComplete", completeHandler);
          resolve();
        }
      }
      
      document.addEventListener("PersonWalkingComplete", completeHandler)
    }
    
    textMessage(resolve) {

      if (this.event.faceMc) {
        const object = this.map.gameObjects[this.event.faceMc];
        object.direction = utils.oppositeDirection(this.map.gameObjects["mc"].direction);
      }

      const message =  new TextMessage({
        text: this.event.text,
        onComplete: () => resolve()
      })
      message.init( document.querySelector(".game-container") )
    }
    
    changeMap(resolve) {
      
      //Deactivate old objects
      Object.values(this.map.gameObjects).forEach(obj => {
        obj.isMounted = false;
      })

      const sceneTransition = new SceneTransition();
      sceneTransition.init(document.querySelector(".game-container"), () => {
        this.map.world.startMap(OverworldMaps[this.event.map], {
          x: this.event.x,
          y: this.event.y,
          direction: this.event.direction,
        });
        resolve();
        sceneTransition.fadeOut();
      })
    }

    battle(resolve) {
        if (Object.keys(window.playerState.sprites).length === 0) {
          resolve("Lost_Battle");
          return;
        }

        const battle = new Battle({
          enemy: Enemies[this.event.enemyId],
          onComplete: (didWin) => {
            resolve(didWin ? "Won_Battle" : "Lost_Battle");
          }
        })

        battle.init(document.querySelector(".game-container"));
    }
 
    giveItem(resolve) {
      window.playerState.items.push({actionId: this.event.actionid, instanceId: this.event.instanceId});
      resolve();
    }

    pause(resolve) {
      this.map.isPaused = true;
      const menu = new PauseMenu({
        progress: this.map.world.progress,
        onComplete: () => {
          resolve();
          this.map.isPaused = false;
          this.map.world.startGameLoop();
        }
      });
      menu.init(document.querySelector(".game-container"));
    }

    addStoryFlag(resolve) {
      window.playerState.storyFlags[this.event.flag] = true;
      resolve();
    }

    removeStoryFlag(resolve) {
      window.playerState.storyFlags[this.event.flag] = false;
      resolve();
    }

    summoningMenu(resolve) {
      const menu = new SummoningMenu({
        sprites: this.event.sprites,
        onComplete: () => {
          resolve();
        }
      })
      menu.init(document.querySelector(".game-container"));
    }

    healSprites(resolve) {
      // Get all the sprites
      const sprites = Object.values(window.playerState.sprites);
  
      // Heal all the sprites to full health
      sprites.forEach((sprite) => {
        sprite.hp = sprite.maxHp;
      });
  
      // Resolve the event
      console.log("healed sprite")
      utils.emitEvent("PlayerStateUpdate");
      resolve();
    }

    init() {
      return new Promise(resolve => {
        this[this.event.type](resolve)
      })
    }
    
  }
    