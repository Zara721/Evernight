const utils = {  
    withGrid(n) {
      return n * 32;
    },
    
    asGridCoords(x,y) {
      return `${x*32},${y*32}`;
    },
    
    nextPosition(initX, initY, direction) {
      let x = initX;
      let y = initY;
      const size = 32;
      if (direction === "left") {
        x-= size
      } else if (direction === "right") {
        x+= size
      } else if (direction === "up") {
        y-= size
      } else if (direction === "down") {
        y+= size
      } 
      //console.log(x,y)
      return {x,y};    
    },

    oppositeDirection(direction) {
      if(direction === "left"){return "right"}
      if(direction === "right"){return "left"}
      if(direction === "up"){return "down"}
      if(direction === "down"){return "up"}
    },

    wait(ms) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, ms)
      })
    },

    randomFromArray(array) {
      return array[ Math.floor(Math.random()*array.length) ]
    },
    
    emitEvent(name, detail) {
      const event = new CustomEvent(name, {
            detail
      });
      document.dispatchEvent(event);
    }
  }