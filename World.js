class World {
    constructor(config) {
      this.element = config.element;
      this.canvas = this.element.querySelector(".game-canvas");
      this.ctx = this.canvas.getContext("2d");
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
        
        
        requestAnimationFrame(() => {
          loop();
        })
      }
      loop();
    }
    
    bindActionInput() {
      new KeyPressListener("Enter", () => {
        //Checking if there's an npc in place to talk to
        this.map.checkForActionCutscene()
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

    startMap(mapConfig) {
      this.map = new WorldMap (mapConfig)
      this.map.world = this;
      this.map.mountObjects();
    }

    init() {

      this.hud = new Hud();
      this.hud.init(document.querySelector(".game-container"));

      this.startMap(OverworldMaps["magentaHouse"]);
      //console.log(this.map.walls);
      
      this.bindActionInput();
      this.bindHeroPositionCheck();

      this.directionInput = new DirectionInput();
      this.directionInput.init();
      this.directionInput.direction; //"down"
      
      this.startGameLoop();
      
      // this.map.startCutscene([
      //   {type: "battle", enemyId: "amberly"},
      //   // {type: "changeMap", map: "ccIsland"},
      //   // {type: "textMessage", text: "Greetings, welcome to Evernight!"},
      // ])
      
    }
  }