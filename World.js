class World {
    constructor(config) {
      this.element = config.element;
      this.canvas = this.element.querySelector(".game-canvas");
      this.ctx = this.canvas.getContext("2d");
      this.bgMusic = new Sound("./Sound/outside.mp3");
    }
    
    startGameLoop() {
      const loop = () => {
        
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); 
        
        //Estabish camera person
        const camPerson = this.map.gameObjects.mc;
        
        //Update all objects
        Object.values(this.map.gameObjects).forEach(object => {
           object.update({
             arrow: this.directionInput.direction,
             map: this.map,
           })
         })
        
        //Draw Lower Image, the base background image
        this.map.drawLowerImage(this.ctx, camPerson);
          
        //Draw Game Objects, like player character and npcs
         Object.values(this.map.gameObjects).sort((a,b) => {
           //organise so that the lower y values are near the start of the array 
           //to avoid inconguint overlap
           return a.y - b.y;
         }).forEach(object => {
           object.sprite.draw(this.ctx, camPerson);
         })
        
        //Draw Upper Image, the foreground
        this.map.drawUpperImage(this.ctx, camPerson);
        
        if (!this.map.isPaused){
          requestAnimationFrame(() => {
            loop();
          })
        }
      }
      loop();
    }
    
    bindActionInput() {
      new KeyPressListener("Enter", () => {
        //Checking if there's an npc in place to talk to
        this.map.checkForActionCutscene()
      })
      new KeyPressListener("Escape", () => {
        if (!this.map.isCutscenePlaying) {
          this.map.startCutscene([
            {type: "pause"}
          ])
        }
      })
    }

    bindHeroPositionCheck() {
      document.addEventListener("PersonWalkingComplete", e => {
        if(e.detail.whoId === "mc") {
          //Then the player's position has changed
          this.map.checkForFootstepCutscene()
        }
      })
    }

    battleStart() {
      document.addEventListener("BattleStart", e => {
        this.bgMusic.stop();
      })
    }

    battleEnd() {
      document.addEventListener("BattleEnd", e => {
        this.bgMusic.loop();
      })
    }

    startMap(mapConfig, mcInitialState=null) {
      this.map = new WorldMap (mapConfig)
      this.map.world = this;
      this.map.mountObjects();

      //Override the original cooardinates and direction for correct map change transitions
      if (mcInitialState) {
        //make sure to remove the wall of the automatic player position so no invisble block
        const mc = this.map.gameObjects.mc
        mc.x = mcInitialState.x;
        mc.y = mcInitialState.y;
        mc.direction = mcInitialState.direction;
      }

      this.progress.mapId = mapConfig.id;
      this.progress.startingMcX = this.map.gameObjects.mc.x;
      this.progress.startingMcY = this.map.gameObjects.mc.y;
      this.progress.startingMcDirection = this.map.gameObjects.mc.direction;
      // console.log("test" + this.startingMcX, this.startingMcY, this.startingMcDirection);
    }

    async init() {
      
      const container = document.querySelector(".game-container");

      //Create a new progress tracker
      this.progress = new Progress();

      //Show title screen
      this.titleScreen = new TitleScreen({
        progress: this.progress
      })
      const useSaveFile = await this.titleScreen.init(container);

      //Potentially saved data from local storage
      let initMcState = null;
      if (useSaveFile) {
        this.progress.load();
        initMcState = {
          x: this.progress.startingMcX,
          y: this.progress.startingMcY,
          direction: this.progress.startingMcDirection,
        }
      }

      //Loading the Hud
      this.hud = new Hud();
      this.hud.init(container);

      //Start with first map
      this.startMap(OverworldMaps[this.progress.mapId], initMcState);
      //console.log(this.map.walls);
      
      //Create controls
      this.bindActionInput();
      this.bindHeroPositionCheck();

      //add Battle Listeners
      this.battleStart();
      this.battleEnd();

      this.directionInput = new DirectionInput();
      this.directionInput.init();
      // this.directionInput.direction; //"down"
      
      //play background music
      this.bgMusic.loop();

      //Kick off the game
      this.startGameLoop();
      
      // this.map.startCutscene([
      //   {type: "battle", enemyId: "amberly"},
      //   // {type: "changeMap", map: "ccIsland"},
      //   // {type: "textMessage", text: "Greetings, welcome to Evernight!"},
      // ])
      
    }
  }