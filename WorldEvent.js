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

      const sceneTransition = new SceneTransition();
      sceneTransition.init(document.querySelector(".game-container"), () => {
        this.map.world.startMap(OverworldMaps[this.event.map]);
        resolve();

        sceneTransition.fadeOut();
      })
    }

    battle(resolve) {
        const battle = new Battle({
          enemy: Enemies[this.event.enemyId],
          onComplete: () => {
            resolve();
          }
        })

        battle.init(document.querySelector(".game-container"));
    }

    init() {
      return new Promise(resolve => {
        this[this.event.type](resolve)
      })
    }
    
  }
    