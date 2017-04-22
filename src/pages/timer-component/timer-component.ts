import {Observable, Scheduler} from "rxjs/Rx";
import {Component, HostListener} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {Solve, SolvesService} from "../../providers/solves.service";
import {Platform} from "ionic-angular";
import {Util} from "../../app/util";

@Component({
  selector: 'timer',
  templateUrl: 'timer-component.html'
})
export class TimerComponent implements Timer.View {
  private viewModel: Timer.ViewModel;
  private keyup$: Subject<KeyboardEvent>;
  private keydown$: Subject<KeyboardEvent>;
  private presenter: Timer.Presenter;
  private platform: Platform;

  constructor(solvesService: SolvesService, platform: Platform) {
    this.platform = platform;

    this.keyup$ = new Subject();
    this.keydown$ = new Subject();

    this.presenter = new Timer.Presenter(solvesService);

    this.presenter.viewModel$(this.intent())
      .do(null, err => console.log('%s', err))
      .onErrorResumeNext(Observable.empty<Timer.ViewModel>())
      .subscribe(viewModel => this.viewModel = viewModel);
  }

  intent(): Timer.Intent {
    return {
      keyup$: this.keyup$.asObservable(),
      keydown$: this.keydown$.asObservable()
    };
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardUp(event: KeyboardEvent) {
    this.keyup$.next(event);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardDown(event: KeyboardEvent) {
    this.keydown$.next(event);
  }
}

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
    solvesService: SolvesService;

    constructor(solvesService: SolvesService) {
      this.timer = new Timer();
      this.solvesService = solvesService;
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
              return Observable.of(this.timer.time)
                .do((time: number) => {
                  let solve = new Solve(time, Date.now(), "");
                  this.solvesService.add(solve);
                });
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

      return Observable.merge<ViewModel>(keydownIntent$, keyupIntent$)
        .startWith(new ViewModel(Util.formatTime(0)));
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
}
