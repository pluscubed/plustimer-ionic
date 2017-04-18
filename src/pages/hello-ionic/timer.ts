import {Observable, Scheduler} from "rxjs/Rx";
export namespace Timer {

  export class ViewModel {
    readonly displayTime: string;

    constructor(displayTime: string) {
      this.displayTime = displayTime;
    }
  }

  export interface View {
    intent(): Intent;
  }

  export interface Intent {
    keyup$: Observable<KeyboardEvent>;
    keydown$: Observable<KeyboardEvent>;
  }

  export class Presenter {
    timer: Timer;

    constructor() {
      this.timer = new Timer();
    }

    viewModel$(intent: Intent) {
      const keydownIntent$ = intent.keydown$
        .filter(event => event.key === ' ' || this.timer.state == TimerState.Running)
        .flatMap(event => {
          const transitionMap = {
            "ready": TimerState.HandOnTimer,
            "handOnTimer": TimerState.Ignore,
            "running": TimerState.Stopped,
            "stopped": TimerState.Ignore
          };
          this.timer.setState(transitionMap[this.timer.state]);

          switch (this.timer.state) {
            case TimerState.Stopped:
              return Observable.of(this.timer.time);
            default:
              return Observable.empty();
          }
        })
        .map((time: number) => new ViewModel(Util.formatTime(time)));

      const keyupIntent$ = intent.keyup$
        .filter(event => event.key === ' ' || this.timer.state == TimerState.Stopped)
        .flatMap(event => {
          const transitionMap = {
            "ready": TimerState.Ignore,
            "handOnTimer": TimerState.Running,
            "running": TimerState.Ignore,
            "stopped": TimerState.Ready
          };
          this.timer.setState(transitionMap[this.timer.state]);

          switch (this.timer.state) {
            case TimerState.Running:
              return Observable
                .of(0, Scheduler.animationFrame)
                .repeat()
                .takeUntil(intent.keydown$)
                .map(i => this.timer.elapsed());
            default:
              return Observable.empty();
          }
        })
        .map((time: number) => new ViewModel(Util.formatTime(time)));

      return Observable.merge<ViewModel>(keydownIntent$, keyupIntent$);
    }
  }

  const TimerState = {
    Ready: "ready",
    HandOnTimer: "handOnTimer",
    Running: "running",
    Stopped: "stopped",
    Ignore: "ignore"
  };

  export class Timer {
    startTime: number;
    time: number;
    state: string;

    constructor() {
      this.state = TimerState.Ready;
    }

    setState(state: any) {
      switch (state) {
        case TimerState.Ready:
          break;
        case TimerState.HandOnTimer:
          this.reset();
          break;
        case TimerState.Running:
          this.start();
          break;
        case TimerState.Stopped:
          this.stop();
          break;
        case TimerState.Ignore:
          return;
        default:
          console.error("Tried to set invalid state in controller:", state);
          break;
      }

      this.state = state;
    }

    reset() {
      this.time = 0;
      this.startTime = 0;
    }

    start() {
      this.startTime = Date.now();
    }

    stop() {
      this.time = this.elapsed();
      this.startTime = 0;
    }

    elapsed() {
      return Date.now() - this.startTime;
    }
  }

  export interface TimeParts {
    secString: string;
    decimals: string;
  }

  export class Util {

    /*
     * @param {!TimerApp.Timer.Milliseconds} time
     */
    static timeParts(time: number): TimeParts {
      // Each entry is [minimum number of digits if not first, separator before, value]
      let hours: number = Math.floor(time / (60 * 60 * 1000));
      let minutes: number = Math.floor(time / (     60 * 1000)) % 60;
      let seconds: number = Math.floor(time / (          1000)) % 60;

      /**
       * @param {number} number
       * @param {number} numDigitsAfterPadding
       */
      function pad(number: number, numDigitsAfterPadding: number): string {
        let output: string = "" + number;
        while (output.length < numDigitsAfterPadding) {
          output = "0" + output;
        }
        return output;
      }

      let secString: string;
      if (hours > 0) {
        secString = "" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2);
      } else if (minutes > 0) {
        secString = "" + minutes + ":" + pad(seconds, 2);
      } else {
        secString = "" + seconds;
      }

      let centiseconds: number = Math.floor((time % 1000) / 10);

      return {
        secString: secString,
        decimals: "" + pad(centiseconds, 2)
      };
    }

    static formatTime(time: number): string {
      if (time === null) {
        return "---"
      }

      let parts = this.timeParts(time);
      return parts.secString + "." + parts.decimals;
    }
  }
}
