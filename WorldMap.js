class WorldMap {
    constructor(config) {
      this.world = null;
      this.gameObjects = {}; //Live objects in here
      this.configObjects = config.configObjects; //Configuration content

      this.cutsceneSpaces = config.cutsceneSpaces || {};
      this.walls = config.walls || {};
      
      this.lowerImage = new Image();
      this.lowerImage.src = config.lowerSrc;
      
      this.upperImage = new Image();
      this.upperImage.src = config.upperSrc;
      
      this.isCutscenePlaying = false;
      this.isPaused = false;
      
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
        if (this.walls[`${x},${y}`]) {
          return true;
        }
        //Check for gameObject at this poisition
        return Object.values(this.gameObjects).find(obj => {
          if (obj.x === x && obj.y === y){return true;}
          if (obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition[1] === y) {
            return true
          }
          return false;
        })
    }
    
    mountObjects() {
      Object.keys(this.configObjects).forEach(key => {  
        
        let object = this.configObjects[key];
        object.id = key;
        
        let instance;
        if (object.type === "Person") {
          instance = new Person(object)
        }
        if (object.type === "SpriteGem") {
          instance = new SpriteGem(object)
        }
        if (object.type === "HealChamber") {
          instance = new HealChamber(object)
          console.log("healCheck")
        }
        
        this.gameObjects[key] = instance;
        this.gameObjects[key].id = key;
        instance.mount(this);
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
        const result = await eventHandler.init();
        if (result === "Lost_Battle") {
          break;
        }
      }
      
      this.isCutscenePlaying = false;
      
      //reset Npc's to do their idle behaviour
      // Object.values(this.gameObjects).forEach(object => object.doBehaviourEvent(this))
    }

    checkForActionCutscene() {
      const mc = this.gameObjects["mc"];
      const nextCoords = utils.nextPosition(mc.x, mc.y, mc.direction);
      const match = Object.values(this.gameObjects).find(object => {
        return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
      });
      if (!this.isCutscenePlaying && match && match.talking.length) {

        const relevantScenario = match.talking.find(scenario => {
          return (scenario.required || []).every(sf => {
            return playerState.storyFlags[sf]
          })
        })

        relevantScenario && this.startCutscene(relevantScenario.events)
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


    
  }

  const OverworldMaps = {
    ccIsland: {
      id: "ccIsland",
      lowerSrc: "./images/ccWorld.png",
      upperSrc: "./images/ccForeground.png",
      configObjects: {
        mc: {
          type: "Person",
          isPlayerControlled: true,
          x: utils.withGrid(26),
          y: utils.withGrid(17),
          src:  "./images/ccMc.png",
        },
        npc1: {
          type: "Person",
          x: utils.withGrid(18),
          y: utils.withGrid(10),
          src:  "./images/ccWorldAster.png",
          behaviourLoop: [
            // { type: "walk", direction: "right"},
            // { type: "stand", direction: "up", time: 800},
            // { type: "walk", direction: "up"},
            // { type: "walk", direction: "left"},
            // { type: "walk", direction: "down"},
          ],
          talking: [
            {
              required: ["Defeat_Amberly2"],
              events: [
                {type: "textMessage", text: "I didn't expect you to be so strong.", faceMc: "npc1"},
                {type: "textMessage", text: "...well I can't wait for Rio to come back to town.", faceMc: "npc1"},
                {who: "npc1", type: "stand", direction: "down", time: 50},
              ]
            },
            {
              required: ["Defeat_Aster"],
              events: [
                {type: "textMessage", text: "That was a good match.", faceMc: "npc1"},
                {type: "textMessage", text: "You might want to rechallenge my sister, I'm sure she was holding back.", faceMc: "npc1"},
                {who: "npc1", type: "stand", direction: "down", time: 50},
              ]
            },
            {
              required: ["Defeat_Amberly"],
              events: [
                {type: "textMessage", text: "It's a wonderful day for a duel...", faceMc: "npc1"},
                {type: "battle", enemyId: "aster"},
                {type: "addStoryFlag", flag: "Defeat_Aster"},
                {type: "removeStoryFlag", flag: "Used_Gem_Stone"},
                {type: "textMessage", text: "Woah, you have a great team", faceMc: "npc1"},
                {type: "textMessage", text: "Take this energy orb to summon another sprite", faceMc: "npc1"},
                {who: "npc1", type: "stand", direction: "down", time: 50},
              ]
            },
            {
              required: ["Used_Gem_Stone"],
              events: [
                {type: "textMessage", text: "Don't even think about challenging me if you can't even defeat Amber.", faceMc: "npc1"},
                {who: "npc1", type: "stand", direction: "down", time: 50},
              ]
            },
            {
              events: [
                {type: "textMessage", text: "Mind you don't bother the fireflies without a sprite of your own", faceMc: "npc1"},
              ]
            },     
          ]
        }, 
         npc2: {
          type: "Person",
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
              required: ["Defeat_Amberly2"],
              events: [
                {type: "textMessage", text: "I already gave you the last of my flower crowns", faceMc: "npc2"},
                {type: "textMessage", text: "Hmmp, Celeste is still the strongest on the island anyway"},
              ]
            },
            {
              required: ["Defeat_Aster"],
              events: [
                {type: "textMessage", text: "Woww, you really managed to beat Aster!!", faceMc: "npc2"},
                {type: "textMessage", text: "I didn't know you had it in you!", faceMc: "npc2"},
                {type: "textMessage", text: "We have to have a rematch!", faceMc: "npc2"},
                {type: "battle", enemyId: "amberly2"},
                {type: "addStoryFlag", flag: "Defeat_Amberly2"},
                {type: "removeStoryFlag", flag: "Used_Gem_Stone"},
                {type: "textMessage", text: "Alright..alright...you really bested me", faceMc: "npc2"},
                {type: "textMessage", text: "Here take my backup sprite gem", faceMc: "npc2"},
              ]
            },
            {
              required: ["Defeat_Amberly"],
              events: [
                {type: "textMessage", text: "I already gave you my favorite flower crown", faceMc: "npc2"},
                {type: "textMessage", text: "Hmmp, wait till my brother Aster gets to you"},
              ]
            },
            {
              required: ["Used_Gem_Stone"],
              events: [
                {type: "textMessage", text: "Haha I, Amberley Stone, challenge you to a sacred duel", faceMc: "npc2"},
                {type: "textMessage", text: "Winner gets the best flower crown in town!", faceMc: "npc2"},
                {type: "battle", enemyId: "amberly"},
                {type: "addStoryFlag", flag: "Defeat_Amberly"},
                {type: "removeStoryFlag", flag: "Used_Gem_Stone"},
                {type: "textMessage", text: "Well, maybe you do deserve this flower crown...", faceMc: "npc2"},
                {type: "textMessage", text: "Oh, you can use it as material to summon another sprite...", faceMc: "npc2"},
                {type: "textMessage", text: "Hmmp, take this...", faceMc: "npc2"},
                {type: "giveItem", actionid: "item_smallRecoverHp", instanceId: "item3"},
                {type: "giveItem", actionid: "item_smallRecoverHp", instanceId: "item3"},
                {type: "giveItem", actionid: "item_smallRecoverHp", instanceId: "item3"},
                {type: "textMessage", text: "Gained x3 Axo Berry"},
                {type: "textMessage", text: "These can help heal your sprites in battle!"},
              ]
            },
            {
              events: [
                {type: "textMessage", text: "Wow, I've never seen someone without a sprite before", faceMc: "npc2"},
                {type: "textMessage", text: "Maybe if you summon one with the sparkly gem, we can battle!"},
              ]
            },
            
          ]
        }, 
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
        [utils.asGridCoords(26,15)] : false,
        [utils.asGridCoords(27,15)] : true,
        [utils.asGridCoords(28,15)] : true,

        //front pink house
        [utils.asGridCoords(24,14)] : true,
        [utils.asGridCoords(25,14)] : true,
        [utils.asGridCoords(26,14)] : true,
        [utils.asGridCoords(27,14)] : true,
        [utils.asGridCoords(28,14)] : true,

        //cream house
        [utils.asGridCoords(30,10)] : true,
        [utils.asGridCoords(31,10)] : true,
        [utils.asGridCoords(32,10)] : true,
        [utils.asGridCoords(33,10)] : true,

        //top right trees
        [utils.asGridCoords(36,8)] : true,
        [utils.asGridCoords(37,8)] : true,
        [utils.asGridCoords(38,8)] : true,
        [utils.asGridCoords(39,8)] : true,

        //bottom right tree
        [utils.asGridCoords(30,18)] : true,
        [utils.asGridCoords(31,18)] : true,
        [utils.asGridCoords(32,18)] : true,
        [utils.asGridCoords(33,18)] : true,
        [utils.asGridCoords(34,18)] : true,
        [utils.asGridCoords(35,18)] : true,
        
        //island walls

        //left side of island
        [utils.asGridCoords(5,2)] : true,
        [utils.asGridCoords(5,3)] : true,

        //corner
        [utils.asGridCoords(4,3)] : true,

        //side
        [utils.asGridCoords(3,4)] : true,
        [utils.asGridCoords(3,5)] : true,
        [utils.asGridCoords(3,6)] : true,
        [utils.asGridCoords(3,7)] : true, 
        [utils.asGridCoords(3,8)] : true,
        [utils.asGridCoords(3,9)] : true,
        [utils.asGridCoords(3,10)] : true,
        [utils.asGridCoords(3,11)] : true,
        [utils.asGridCoords(3,12)] : true, 
        [utils.asGridCoords(3,13)] : true,
        
        //corner
        [utils.asGridCoords(2,13)] : true,

        //side
        [utils.asGridCoords(1,14)] : true,
        [utils.asGridCoords(1,15)] : true,
        [utils.asGridCoords(1,16)] : true,
        [utils.asGridCoords(1,17)] : true,
        [utils.asGridCoords(1,18)] : true,
        [utils.asGridCoords(1,19)] : true,

        //corner
        [utils.asGridCoords(2,20)] : true,

        //side
        [utils.asGridCoords(3,20)] : true,
        [utils.asGridCoords(3,21)] : true,
        [utils.asGridCoords(3,22)] : true,

        //top side
        [utils.asGridCoords(6,1)] : true,
        [utils.asGridCoords(7,1)] : true,
        [utils.asGridCoords(8,1)] : true,

        //top trees
        [utils.asGridCoords(8,2)] : true,
        [utils.asGridCoords(9,2)] : true,
        [utils.asGridCoords(10,2)] : true,
        [utils.asGridCoords(11,2)] : true,
        [utils.asGridCoords(12,2)] : true,
        [utils.asGridCoords(13,2)] : true,
        [utils.asGridCoords(14,2)] : true,
        [utils.asGridCoords(15,2)] : true,

        //top
        [utils.asGridCoords(16,1)] : true,
        [utils.asGridCoords(17,1)] : true,

        //corner
        [utils.asGridCoords(18,2)] : true,

        //top
        [utils.asGridCoords(18,3)] : true,
        [utils.asGridCoords(19,3)] : true,
        [utils.asGridCoords(20,3)] : true,
        [utils.asGridCoords(21,3)] : true,
        [utils.asGridCoords(22,3)] : true,
        [utils.asGridCoords(23,3)] : true,
        [utils.asGridCoords(24,3)] : true,
        [utils.asGridCoords(25,3)] : true,
        [utils.asGridCoords(26,3)] : true,
        [utils.asGridCoords(27,3)] : true,
        [utils.asGridCoords(28,3)] : true,
        [utils.asGridCoords(29,3)] : true,
        [utils.asGridCoords(30,3)] : true,
        [utils.asGridCoords(31,3)] : true,
        [utils.asGridCoords(32,3)] : true,
        [utils.asGridCoords(33,3)] : true,

        //corner
        [utils.asGridCoords(34,4)] : true,

        //side
        [utils.asGridCoords(34,5)] : true,
        [utils.asGridCoords(35,5)] : true,
        [utils.asGridCoords(36,5)] : true,
        [utils.asGridCoords(37,5)] : true,
        [utils.asGridCoords(38,5)] : true,
        [utils.asGridCoords(39,5)] : true,
        [utils.asGridCoords(40,5)] : true,
        [utils.asGridCoords(41,5)] : true,

        //right side
        [utils.asGridCoords(42,6)] : true,
        [utils.asGridCoords(42,7)] : true,
        [utils.asGridCoords(42,8)] : true,
        [utils.asGridCoords(42,9)] : true,
        [utils.asGridCoords(42,10)] : true,
        [utils.asGridCoords(42,11)] : true,
        [utils.asGridCoords(42,12)] : true,
        [utils.asGridCoords(42,13)] : true,

        //corner
        [utils.asGridCoords(41,14)] : true,

        //right side boat
        [utils.asGridCoords(40,14)] : true,
        [utils.asGridCoords(40,15)] : true,
        [utils.asGridCoords(42,16)] : true,
        [utils.asGridCoords(42,17)] : true,
        [utils.asGridCoords(42,15)] : true,
        [utils.asGridCoords(41,18)] : true,
        [utils.asGridCoords(40,18)] : true,
        [utils.asGridCoords(40,19)] : true,

        //corner
        [utils.asGridCoords(39,20)] : true,

        //right side
        [utils.asGridCoords(38,20)] : true,
        [utils.asGridCoords(38,21)] : true,

        //bottom
        [utils.asGridCoords(37,22)] : true,
        [utils.asGridCoords(36,22)] : true,
        [utils.asGridCoords(35,22)] : true,
        [utils.asGridCoords(34,22)] : true,
        [utils.asGridCoords(33,22)] : true,
        [utils.asGridCoords(32,22)] : true,
        [utils.asGridCoords(31,22)] : true,
        [utils.asGridCoords(30,22)] : true,

        //corner
        [utils.asGridCoords(30,23)] : true,

        //bottom
        [utils.asGridCoords(29,24)] : true,
        [utils.asGridCoords(28,24)] : true,
        [utils.asGridCoords(27,24)] : true,
        [utils.asGridCoords(26,24)] : true,
        [utils.asGridCoords(25,24)] : true,
        [utils.asGridCoords(24,24)] : true,
        [utils.asGridCoords(23,24)] : true,
        [utils.asGridCoords(22,24)] : true,
        [utils.asGridCoords(21,24)] : true,
        [utils.asGridCoords(20,24)] : true,
        [utils.asGridCoords(19,24)] : true,
        [utils.asGridCoords(18,24)] : true,
        [utils.asGridCoords(17,24)] : true,
        [utils.asGridCoords(16,24)] : true,
        [utils.asGridCoords(15,24)] : true,
        [utils.asGridCoords(14,24)] : true,
        [utils.asGridCoords(13,24)] : true,
        [utils.asGridCoords(12,24)] : true,
        [utils.asGridCoords(11,24)] : true,
        [utils.asGridCoords(10,24)] : true,
        [utils.asGridCoords(9,24)] : true,
        [utils.asGridCoords(8,24)] : true,
        [utils.asGridCoords(7,24)] : true,
        [utils.asGridCoords(6,24)] : true,
        [utils.asGridCoords(5,24)] : true,
        [utils.asGridCoords(4,24)] : true,




        









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
        //firefly monster
        [utils.asGridCoords(19,15)]: [
          {
            //a random encouter event
            events: [
              {type: "textMessage", text: "The grass rustles and a firefly  flutters out!"},
              {type: "battle", enemyId: "firefly"},
              {type: "giveItem", actionid: "itemDamage1", instanceId: "item4"},
              {type: "textMessage", text: "Gained x1 Firefly Jar"},
              {type: "textMessage", text: "These can help you explode your enemies in battle"},
            ],
          }
        ],
        //sea or lake monsters
        [utils.asGridCoords(14,13)]: [
          {
            //a random encouter event
            events: [
              {type: "textMessage", text: "A claw pokes out the surface of the lake!"},
              {type: "battle", enemyId: "crab"},
              {type: "giveItem", actionid: "item_recoverStatus", instanceId: "item2"},
              {type: "textMessage", text: "Gained x1 Cocunut Water"},
              {type: "textMessage", text: "These can help you wash away negative status in battle"},
            ],
          }
        ],
        [utils.asGridCoords(12,15)]: [
          {
            //a random encouter event
            events: [
              {type: "textMessage", text: "A shimmer under the lake catches your eye!"},
              {type: "battle", enemyId: "starfish"},
              {type: "giveItem", actionid: "itemDamage3", instanceId: "item6"},
              {type: "giveItem", actionid: "itemDamage3", instanceId: "item6"},
              {type: "textMessage", text: "Gained x2 Fish Scale"},
              {type: "textMessage", text: "These can help harm your enemies in battle"},
            ],
          }
        ],
        //plant encounters
        [utils.asGridCoords(21,11)]: [
          {
            //a random encouter event
            events: [
              {type: "textMessage", text: "A twisty vine riggles through the bushes!"},
              {type: "battle", enemyId: "vine"},
              {type: "giveItem", actionid: "itemDamage2", instanceId: "item5"},
              {type: "giveItem", actionid: "itemDamage2", instanceId: "item5"},
              {type: "giveItem", actionid: "itemDamage2", instanceId: "item5"},
              {type: "textMessage", text: "Gained x3 Venus Flytrap"},
              {type: "textMessage", text: "These can help attack your enemies in battle"},
            ],
          }
        ],
        [utils.asGridCoords(27,10)]: [
          {
            //a random encouter event
            events: [
              {type: "textMessage", text: "A sweet scent arises and a lilac flower springs into view!"},
              {type: "battle", enemyId: "lilac"},
              {type: "giveItem", actionid: "item_smallRecoverHp", instanceId: "item3"},
              {type: "textMessage", text: "Gained x2 Axo Berry"},
              {type: "textMessage", text: "These can help heal your sprite in battle"},
            ],
          }
        ],
        // ghost encounters
        [utils.asGridCoords(31,9)]: [
          {
            //a random encouter event
            events: [
              {type: "textMessage", text: "A chill runs down your spine as a ghostly blue figure materializes in front of you!"},
              {type: "battle", enemyId: "sprit"},
              {type: "giveItem", actionid: "item_gradualHeal", instanceId: "item8"},
              {type: "textMessage", text: "Gained x1 Ghostly Lantern"},
              {type: "textMessage", text: "These can help gradually heal your sprite in battle"},
            ],
          }
        ],
        [utils.asGridCoords(9,5)]: [
          {
            //a random encouter event
            events: [
              {type: "textMessage", text: "A small, colorful blob of goo hops into view, looking at you with curiosity."},
              {type: "battle", enemyId: "sprit2"},
              {type: "giveItem", actionid: "item_recoverHp2", instanceId: "item7"},
              {type: "giveItem", actionid: "item_recoverHp2", instanceId: "item7"},
              {type: "giveItem", actionid: "item_recoverHp2", instanceId: "item7"},
              {type: "textMessage", text: "Gained x3 Ectoplasm Vial"},
              {type: "textMessage", text: "These can help to heal your sprite in battle"},
            ],
          }
        ],
        [utils.asGridCoords(26,15)]: [
          {
            events: [
              {
                type: "changeMap",
                map: "magentaHouse",
                x: utils.withGrid(15),
                y: utils.withGrid(9),
                direction: "down",
              }
              // {type: "changeMap", map: "magentaHouse"},
              // {who: "mc", type: "stand", direction: "down"},
            ]
          }
        ]
      }
    },
    magentaHouse: {
      id: "magentaHouse",
      lowerSrc: "./images/ccMainRoom.png",
      upperSrc: "./images/ccMainRoomForeground.png",
      configObjects: {
        mc: {
          type: "Person",
          isPlayerControlled: true,
          x: utils.withGrid(15),
          y: utils.withGrid(8),
          src:  "./images/ccMc.png",
        },
        cat1: {
          type: "Person",
          x: utils.withGrid(12),
          y: utils.withGrid(15),
          src:  "./images/blackCat.png",
          talking: [
            {
              events: [
                {type: "textMessage", text: "Meowwww, Meoww"},
              ]
            },
            
          ],
        },
        npc3: {
          type: "Person",
          x: utils.withGrid(18),
          y: utils.withGrid(9),
          src:  "./images/ccWorldCeleste.png",
          behaviourLoop: [
            
          ],
          talking: [
            {
              events: [
                {type: "textMessage", text: "If your looking for some trinkets to aid you on your journey...", faceMc: "npc3"},
                {type: "textMessage", text: "There are always some lonely spirits behind houses...", faceMc: "npc3"},
                {type: "textMessage", text: "Fluttering fireflies in the Glowing Meadows...", faceMc: "npc3"},
                {type: "textMessage", text: "Or some watery creatures looming in the lake...", faceMc: "npc3"},
                {type: "textMessage", text: "Be sure to have some fun exploring the island!", faceMc: "npc3"},
                {who: "npc3", type: "stand", direction: "up", time: 50},
                // {type: "textMessage", text: "Have some trinkets to aid you on your journey!", faceMc: "npc3"},
                // {type: "giveItem", actionid: "item_recoverHp", instanceId: "item1"},
                // {type: "textMessage", text: "Gained x1 Bamboo Bandages"},
                // {type: "textMessage", text: "These can help you restore some health in battle"},
                // {who: "npc3", type: "stand", direction: "up", time: 50},
                // {type: "addStoryFlag", flag: "First_Item"}
              ]
            }
            
          ]
        }, 
        spriteGem: {
          type: "SpriteGem",
          x: utils.withGrid(33),
          y: utils.withGrid(14),
          storyFlag: "Used_Gem_Stone", 
          sprites: ["an001", "sp002", "aq002","pl001"],
        },
        healChamber: {
          type: "HealChamber",
          x: utils.withGrid(33),
          y: utils.withGrid(10),
        },
      },
      walls: {
        //pink house
        
        //bed
        [utils.asGridCoords(11,9)] : true,
        [utils.asGridCoords(12,9)] : true,


        [utils.asGridCoords(11,10)] : true,
        [utils.asGridCoords(12,10)] : true,

        //bedroom top wall
        [utils.asGridCoords(11,7)] : true,
        [utils.asGridCoords(12,7)] : true,
        [utils.asGridCoords(13,7)] : true,
        [utils.asGridCoords(14,7)] : true,

         //bedroom door
         [utils.asGridCoords(15,6)] : true,

        //bedroom top wall
        [utils.asGridCoords(16,7)] : true,
        [utils.asGridCoords(17,7)] : true,
        [utils.asGridCoords(18,7)] : true,

        [utils.asGridCoords(18,8)] : true,
        [utils.asGridCoords(19,8)] : true,
        [utils.asGridCoords(20,8)] : true,
        [utils.asGridCoords(21,8)] : true,
        [utils.asGridCoords(22,8)] : true,

        //bedroom top
        [utils.asGridCoords(10,17)] : true,
        [utils.asGridCoords(11,17)] : true,
        [utils.asGridCoords(12,17)] : true,
        [utils.asGridCoords(13,17)] : true,
        [utils.asGridCoords(14,17)] : true,
        [utils.asGridCoords(15,17)] : true,
        [utils.asGridCoords(16,17)] : true,
        [utils.asGridCoords(17,17)] : true,
        [utils.asGridCoords(18,17)] : true,
        [utils.asGridCoords(19,17)] : true,
        [utils.asGridCoords(20,17)] : true,
        [utils.asGridCoords(21,17)] : true,
        [utils.asGridCoords(22,17)] : true,
        [utils.asGridCoords(23,17)] : true,

        //bedroom left
        [utils.asGridCoords(10,7)] : true,
        [utils.asGridCoords(10,8)] : true,
        [utils.asGridCoords(10,9)] : true,
        [utils.asGridCoords(10,10)] : true,
        [utils.asGridCoords(10,11)] : true,
        [utils.asGridCoords(10,12)] : true,
        [utils.asGridCoords(10,13)] : true,
        [utils.asGridCoords(10,14)] : true,
        [utils.asGridCoords(10,15)] : true,
        [utils.asGridCoords(10,16)] : true,

        //bedroom right
        [utils.asGridCoords(23,8)] : true,
        [utils.asGridCoords(23,9)] : true,
        [utils.asGridCoords(23,10)] : true,
        [utils.asGridCoords(23,11)] : true,
        [utils.asGridCoords(23,12)] : true,

        [utils.asGridCoords(23,16)] : true,
        [utils.asGridCoords(23,17)] : true,

        //hallway
        [utils.asGridCoords(24,16)] : true,
        [utils.asGridCoords(25,16)] : true,
        [utils.asGridCoords(26,16)] : true,

        [utils.asGridCoords(24,12)] : true,
        [utils.asGridCoords(25,12)] : true,
        [utils.asGridCoords(26,12)] : true,

        //lab room

        //desk
        [utils.asGridCoords(29,11)] : true,
        [utils.asGridCoords(30,11)] : true,
        [utils.asGridCoords(31,11)] : true,


        //lab left
        [utils.asGridCoords(26,7)] : true,
        [utils.asGridCoords(26,8)] : true,
        [utils.asGridCoords(26,9)] : true,
        [utils.asGridCoords(26,10)] : true,
        [utils.asGridCoords(26,11)] : true,

        [utils.asGridCoords(26,17)] : true,
        [utils.asGridCoords(26,18)] : true,

        //lab top
        [utils.asGridCoords(27,7)] : true,
        [utils.asGridCoords(28,7)] : true,
        [utils.asGridCoords(29,7)] : true,
        [utils.asGridCoords(30,7)] : true,
        [utils.asGridCoords(31,7)] : true,
        [utils.asGridCoords(32,7)] : true,
        [utils.asGridCoords(33,7)] : true,

        //lab right
        [utils.asGridCoords(34,7)] : true,
        [utils.asGridCoords(34,8)] : true,
        [utils.asGridCoords(34,9)] : true,
        [utils.asGridCoords(34,10)] : true,
        [utils.asGridCoords(34,11)] : true,
        [utils.asGridCoords(34,12)] : true,
        [utils.asGridCoords(34,13)] : true,
        [utils.asGridCoords(34,14)] : true,
        [utils.asGridCoords(34,15)] : true,
        [utils.asGridCoords(34,16)] : true,
        [utils.asGridCoords(34,17)] : true,
        [utils.asGridCoords(34,18)] : true,

        //lab bottom
        [utils.asGridCoords(27,17)] : true,
        [utils.asGridCoords(28,17)] : true,
        [utils.asGridCoords(29,17)] : true,
        [utils.asGridCoords(30,17)] : true,
        [utils.asGridCoords(31,17)] : true,
        [utils.asGridCoords(32,17)] : true,
        [utils.asGridCoords(33,17)] : true,
        
      },
      cutsceneSpaces: {
        [utils.asGridCoords(12,16)]: [
          {
            //a random encouter event
            events: [
              {type: "textMessage", text: "A tail flickers overhead!"},
              {type: "battle", enemyId: "cat"},
              {type: "giveItem", actionid: "item_smallRecoverHp", instanceId: "item3"},
              {type: "textMessage", text: "Gained x3 Axo Berry"},
              {type: "textMessage", text: "These can help to heal your sprite in battle"},
            ],
          }
        ],
        [utils.asGridCoords(15,7)]: [
          {
            events: [
              {
                type: "changeMap",
                map: "ccIsland",
                x: utils.withGrid(26),
                y: utils.withGrid(16),
                direction: "down",
              },
            ]
          }
        ]
      }
    }
  };