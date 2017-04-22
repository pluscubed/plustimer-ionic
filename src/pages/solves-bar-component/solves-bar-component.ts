import {Observable} from "rxjs/Rx";
import {Component} from "@angular/core";
import {Solve, SolvesService} from "../../providers/solves.service";
import {Platform} from "ionic-angular";
import {Util} from "../../app/util";

@Component({
  selector: 'solves-bar',
  templateUrl: 'solves-bar-component.html'
})
export class SolvesBarComponent implements SolvesBar.View {
  private viewModel: SolvesBar.ViewModel;
  private presenter: SolvesBar.Presenter;
  private platform: Platform;

  constructor(solvesService: SolvesService, platform: Platform) {
    this.platform = platform;

    this.presenter = new SolvesBar.Presenter(solvesService);

    this.presenter.viewModel$(this.intent())
      .do(null, err => console.log('%s', err))
      .onErrorResumeNext(Observable.empty<SolvesBar.ViewModel>())
      .subscribe(viewModel => this.viewModel = viewModel);
  }

  trackById(index: number, item: any): number {
    return item._id;
  }

  intent(): SolvesBar.Intent {
    return {};
  }

  displayTime(solve: Solve) {
    return Util.formatTime(solve.time);
  }
}

export namespace SolvesBar {

  export class ViewModel {

    constructor(public readonly solves: Array<Solve>) {
      console.log(Date.now() + " " + solves);
    }
  }

  export interface View {
    intent(): Intent;
  }

  export interface Intent {
  }

  export class Presenter {
    solvesService: SolvesService;

    constructor(solvesService: SolvesService) {
      this.solvesService = solvesService;
    }

    viewModel$(intent: Intent) {
      /*const keyupIntent$ = intent.keyup$
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
       .map((time: number) => new ViewModel(Util.formatTime(time)));*/

      return Observable.merge(this.solvesService.getAll()
        .map(solves => solves.reverse())
        .map(solves => new ViewModel(solves)))
        .startWith(new ViewModel([]));
    }
  }
}
