import {Component, Injectable} from "@angular/core";
import {Platform} from "ionic-angular";
import {TimerService, TimerState} from "../../providers/timer.service";
import {Observable} from "rxjs/Rx";
import {ScrambleService} from "../../providers/scramble.service";

@Injectable()
export class Presenter {

  constructor(private timer: TimerService,
              private scrambleService: ScrambleService,
              private platform: Platform) {
  }

  viewModel$() {
    const triggerScramble$ = Observable.merge(
      this.timer.onStateChange()
        .filter(state => state === TimerState.Running),
      Observable.fromPromise(this.platform.ready())
    );

    const scramble$ = Observable.zip(
      triggerScramble$
        .flatMap(() => this.scrambleService.getScramble()),
      this.timer.onStateChange()
        .filter(state => state === TimerState.Ready)
    )
      .map(items => items[0])
      .map(scramble => new ViewModel(scramble));

    return Observable.merge<ViewModel>(scramble$)
      .startWith(new ViewModel("Scrambling..."));
  }
}

@Component({
  selector: 'scramble',
  templateUrl: 'scramble.html'
})
export class ScrambleComponent {
  private viewModel: ViewModel;

  constructor(private platform: Platform,
              private presenter: Presenter) {

    this.presenter.viewModel$()
      .do(null, err => console.log('%s', err))
      .onErrorResumeNext(Observable.empty<ViewModel>())
      .subscribe(viewModel => {
        this.viewModel = viewModel;
      });

  }

}

export class ViewModel {
  readonly text: string;

  constructor(text: string) {
    this.text = text;
  }
}
