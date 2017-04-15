import {Component} from "@angular/core";

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {
  displayTime: string;
  timer: Timer;

  constructor() {
    this.timer = new Timer(time => {

    });
  }
}

export class Timer {
  running: boolean;
  startTime: number;
  currentTimeCallback: (time: number) => void;
  animFrameBound: FrameRequestCallback;

  constructor(currentTimeCallback: (time: number) => void) {
    this.animFrameBound = this.animFrame.bind(this);
    this.currentTimeCallback = currentTimeCallback;
  }

  start() {
    this.startTime = Date.now();
    this.running = true;
    requestAnimationFrame(this.animFrameBound);
  }

  animFrame() {
    if (!this.running) {
      return;
    }
    this.currentTimeCallback(this.elapsed());
    requestAnimationFrame(this.animFrameBound);
  }

  elapsed() {
    return Date.now() - this.startTime;
  }
}
