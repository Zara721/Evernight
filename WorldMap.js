class WorldMap {
    constructor(config) {
      this.world = null;
      this.gameObjects = config.gameObjects;
      this.cutsceneSpaces = config.cutsceneSpaces || {};
      this.walls = config.walls || {};
      
      this.lowerImage = new Image();
      this.lowerImage.src = config.lowerSrc;
      
      this.upperImage = new Image();
      this.upperImage.src = config.upperSrc;
      
      this.isCutscenePlaying = false;
      
    }
    
    drawLowerImage(ctx, camPerson) {
      ctx.drawImage(
        this.lowerImage, 
        405 - camPerson.x, 
        210 - camPerson.y
      );
    }
    
    drawUpperImage(ctx, camPerson) {
      ctx.drawImage(
        this.upperImage, 
        405 - camPerson.x, 
        210 - camPerson.y
      );
    }
    
    
    isSpaceTaken(currentX, currentY, direction) {
        const {x,y} = utils.nextPosition(currentX, currentY, direction);
        return this.walls[`${x},${y}`] || false;
    }
    
    mountObjects() {
      Object.keys(this.gameObjects).forEach(key => {  
        
        let object = this.gameObjects[key];
        object.id = key;
        
        //Placeholder for objects not needed to be mounted
        object.mount(this);
         })
    }
    
    async startCutscene(events) {
      this.isCutscenePlaying = true;
      
      //Loop of async events that awaits for each event to occur
      for(let i = 0; i < events.length; i++) {
        const eventHandler = new WorldEvent({
          event: events[i],
          map: this,
        })
        await eventHandler.init();
      }
      
      this.isCutscenePlaying = false;
      
      //reset Npc's to do their idle behaviour
      Object.values(this.gameObjects).forEach(object => object.doBehaviourEvent(this))
    }

    checkForActionCutscene() {
      const mc = this.gameObjects["mc"];
      const nextCoords = utils.nextPosition(mc.x, mc.y, mc.direction);
      const match = Object.values(this.gameObjects).find(object => {
        return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
      });
      if (this.isCutscenePlaying === false && match && match.talking.length) {
        this.startCutscene(match.talking[0].events)
      }
    }

    checkForFootstepCutscene() {
      const mc = this.gameObjects["mc"];
      const match = this.cutsceneSpaces[`${mc.x},${mc.y}`];
      console.log({match});
      if (!this.isCutscenePlaying && match) {
        this.startCutscene( match[0].events )
      }
    }

    addWall(x,y) {
      this.walls[`${x},${y}`] = true;
    }
    removeWall(x,y) {
      delete this.walls[`${x},${y}`]
    }
    moveWall(wasX, wasY, direction) {
      this.removeWall(wasX, wasY);
      const {x,y} = utils.nextPosition(wasX, wasY, direction);
      this.addWall(x,y);
    }
    
  }

  const OverworldMaps = {
    ccIsland: {
      lowerSrc: "./images/ccWorld.png",
      upperSrc: "./images/ccForeground.png",
      gameObjects: {
        mc: new Person ({
          isPlayerControlled: true,
          x: utils.withGrid(26),
          y: utils.withGrid(17),
          src:  "./images/ccMc.png",
        }),
        npc1: new Person ({
          x: utils.withGrid(18),
          y: utils.withGrid(10),
          src:  "./images/ccWorldAster.png",
          // behaviourLoop: [
          //   { type: "walk", direction: "right"},
          //   { type: "stand", direction: "up", time: 800},
          //   { type: "walk", direction: "up"},
          //   { type: "walk", direction: "left"},
          //   { type: "walk", direction: "down"},
          // ]
          talking: [
            {
              events: [
                {type: "textMessage", text: "It's a wonderful day for a duel...", faceMc: "npc1"},
                { type: "battle", enemyId: "aster"}
              ]
            },
            
          ]
        }), 
         npc2: new Person ({
          x: utils.withGrid(32),
          y: utils.withGrid(15),
          src:  "./images/ccWorldAmberly.png",
          behaviourLoop: [
            { type: "stand", direction: "left", time: 800},
            { type: "stand", direction: "down", time: 800},
            { type: "stand", direction: "right", time: 1200},
            { type: "stand", direction: "up", time: 300},
          ],
          talking: [
            {
              events: [
                {type: "textMessage", text: "You don't got a flower crown", faceMc: "npc2"},
                { type: "battle", enemyId: "amberly"}
                // {type: "textMessage", text: "I've got the best flower crown in town!"},
              ]
            },
            
          ]
        }), 
      },
      walls: {
        //blue house
        [utils.asGridCoords(8,7)] : true,
        [utils.asGridCoords(9,7)] : true,
        [utils.asGridCoords(8,6)] : true,
        [utils.asGridCoords(9,6)] : true,

        //front pink house
        [utils.asGridCoords(24,15)] : true,
        [utils.asGridCoords(25,15)] : true,
        [utils.asGridCoords(26,15)] : true,
        [utils.asGridCoords(27,15)] : true,
        [utils.asGridCoords(28,15)] : true,

        //front pink house
        [utils.asGridCoords(24,14)] : true,
        [utils.asGridCoords(25,14)] : true,
        [utils.asGridCoords(26,14)] : true,
        [utils.asGridCoords(27,14)] : true,
        [utils.asGridCoords(28,14)] : true,
        
        //side of the island
        [utils.asGridCoords(4,3)] : true,
        [utils.asGridCoords(3,4)] : true,
        [utils.asGridCoords(3,5)] : true,
        [utils.asGridCoords(3,6)] : true,
        [utils.asGridCoords(3,7)] : true, 
      },
      cutsceneSpaces: {
        [utils.asGridCoords(18,14)]: [
          {
            events: [
              {who: "mc", type: "stand", direction: "up", time: 100},

              {who: "npc1", type: "walk", direction: "down"},
              {who: "npc1", type: "walk", direction: "down"},
              {who: "npc1", type: "walk", direction: "down"},
              {who: "npc1", type: "stand", direction: "down", time: 300},
              {type: "textMessage", text: "Mind that you don't disturb the fireflies"},
              {who: "npc1", type: "walk", direction: "up"},
              {who: "npc1", type: "walk", direction: "up"},
              {who: "npc1", type: "walk", direction: "up"},
              {who: "npc1", type: "stand", direction: "down", time: 50},

              {who: "mc", type: "walk", direction: "left"},
              {who: "mc", type: "walk", direction: "left"},
              {who: "mc", type: "stand", direction: "down"},
            ]
          }
        ],
        [utils.asGridCoords(26,16)]: [
          {
            events: [
              {type: "changeMap", map: "magentaHouse"},
              {who: "mc", type: "stand", direction: "down"},
            ]
          }
        ]
      }
    },
    magentaHouse: {
      lowerSrc: "./images/ccHouseMagenta.png",
      upperSrc: "./images/ccHouseMagentaForeground.png",
      gameObjects: {
        mc: new Person ({
          isPlayerControlled: true,
          x: utils.withGrid(9),
          y: utils.withGrid(6),
          src:  "./images/ccMc.png",
        }),
        cat1: new Person ({
          x: utils.withGrid(6),
          y: utils.withGrid(9),
          src:  "./images/blackCat.png",
          talking: [
            {
              events: [
                {type: "textMessage", text: "Meowwww, Meoww"},
              ]
            },
            
          ],
        }),
      },
      walls: {
        //pink house
        [utils.asGridCoords(9,2)] : true,
        
      },
      cutsceneSpaces: {
        [utils.asGridCoords(9,3)]: [
          {
            events: [
              {type: "changeMap", map: "ccIsland"},
              {who: "mc", type: "stand", direction: "down"},
            ]
          }
        ]
      }
    }
  };