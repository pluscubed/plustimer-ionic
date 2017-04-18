import {Component, HostListener} from "@angular/core";
import {Timer} from "./timer";
import {Subject} from "rxjs/Rx";

@Component({
  selector: 'page-timer',
  templateUrl: 'timer-page.html'
})
export class TimerPage implements Timer.View {
  viewModel: Timer.ViewModel;
  private keyup$: Subject<KeyboardEvent>;
  private keydown$: Subject<KeyboardEvent>;
  presenter: Timer.Presenter;

  constructor() {
    this.viewModel = new Timer.ViewModel("");
    this.keyup$ = new Subject();
    this.keydown$ = new Subject();

    this.presenter = new Timer.Presenter();

    this.presenter.viewModel$(this.intent())
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
    console.log("key up")
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardDown(event: KeyboardEvent) {
    this.keydown$.next(event);
  }
}
