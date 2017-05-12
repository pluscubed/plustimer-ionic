import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

export const TimerState = {
  Ready: "ready",
  HandOnTimer: "handOnTimer",
  Running: "running",
  Stopped: "stopped",
  Ignore: "ignore"
};

@Injectable()
export class TimerService {
  startTime: number;
  time: number;
  state: string;

  stateChange: Subject<string>;

  constructor() {
    this.state = TimerState.Ready;
    this.stateChange = new BehaviorSubject(this.state);
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

    this.stateChange.next(this.state);
  }

  onStateChange(): Observable<string> {
    return this.stateChange.asObservable();
  }

  reset() {
    this.time = 0;
    this.startTime = 0;
  }

  start() {
    this.startTime = performance.now();
  }

  stop() {
    this.time = this.elapsed();
    this.startTime = 0;
  }

  elapsed() {
    return performance.now() - this.startTime;
  }
}
