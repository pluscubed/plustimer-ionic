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
  private touchup$: Subject<TouchEvent>;
  private touchdown$: Subject<TouchEvent>;

  private presenter: Timer.Presenter;
  private platform: Platform;

  constructor(solvesService: SolvesService, platform: Platform) {
    this.platform = platform;

    this.keyup$ = new Subject();
    this.keydown$ = new Subject();
    this.touchup$ = new Subject();
    this.touchdown$ = new Subject();

    this.presenter = new Timer.Presenter(solvesService);

    this.presenter.viewModel$(this.intent())
      .do(null, err => console.log('%s', err))
      .onErrorResumeNext(Observable.empty<Timer.ViewModel>())
      .subscribe(viewModel => this.viewModel = viewModel);
  }

  intent(): Timer.Intent {
    return {
      keyup$: this.keyup$.asObservable(),
      keydown$: this.keydown$.asObservable(),
      touchup$: this.touchup$.asObservable(),
      touchdown$: this.touchdown$.asObservable()
    };
  }

  @HostListener('touchend', ['$event'])
  onTouchUp(event: TouchEvent) {
    this.touchup$.next(event);
    console.log("Touch up");
  }

  @HostListener('touchstart', ['$event'])
  onTouchDown(event: TouchEvent) {
    this.touchdown$.next(event);
    console.log("Touch down");
  }

  @HostListener('document:keyup', ['$event'])
  onKeyboardUp(event: KeyboardEvent) {
    this.keyup$.next(event);
    console.log("Key up");
  }

  @HostListener('document:keydown', ['$event'])
  onKeyboardDown(event: KeyboardEvent) {
    this.keydown$.next(event);
    console.log("Key down");
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
    touchup$: Observable<TouchEvent>;
    touchdown$: Observable<TouchEvent>;
  }

  export class Presenter {
    timer: Timer;
    solvesService: SolvesService;

    constructor(solvesService: SolvesService) {
      this.timer = new Timer();
      this.solvesService = solvesService;
    }

    viewModel$(intent: Intent) {
      const downIntent$ = Observable.merge(
        intent.keydown$.filter(event => event.key === ' ' || this.timer.state == TimerState.Running),
        intent.touchdown$
      );

      const down$ = downIntent$
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


      const upIntent$ = Observable.merge(
        intent.keyup$.filter(event => event.key === ' ' || this.timer.state == TimerState.Stopped),
        intent.touchup$
      );

      const stopTimerIntent$ = Observable.merge(intent.keydown$, intent.touchdown$);

      const up$ = upIntent$
        .flatMap(event => {
          let time = this.timer.time;

          const transitionMap = {
            "ready": TimerState.Ignore,
            "handOnTimer": TimerState.Running,
            "running": TimerState.Ignore,
            "stopped": TimerState.Ready
          };
          this.timer.setState(transitionMap[this.timer.state]);

          switch (this.timer.state) {
            case TimerState.Ready:
              //Was stopped, now done: save solve
              let solve = new Solve(time, Date.now(), "");
              this.solvesService.add(solve);
              return Observable.empty();
            case TimerState.Running:
              return Observable
                .of(0, Scheduler.animationFrame)
                .repeat()
                .takeUntil(stopTimerIntent$)
                .map(i => this.timer.elapsed());
            default:
              return Observable.empty();
          }
        })
        .map((time: number) => new ViewModel(Util.formatTime(time)));

      return Observable.merge<ViewModel>(down$, up$)
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
}
