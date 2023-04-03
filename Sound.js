class Sound {
    constructor(src) {
      this.sound = document.createElement("audio");
      this.sound.src = src;
      this.sound.setAttribute("preload", "auto");
      this.sound.setAttribute("controls", "none");
      this.sound.style.display = "none";
      this.sound.setAttribute("loop", "true");
      document.body.appendChild(this.sound);
    }
  
    play() {
      this.sound.play();
    }
  
    stop() {
      this.sound.pause();
    }
  
    loop() {
      this.sound.currentTime = 0;
      this.sound.play();
    }
  }
  
  