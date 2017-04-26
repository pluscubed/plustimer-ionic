import {Observable} from "rxjs/Rx";
import {Component, HostListener} from "@angular/core";
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

  public offset: number = 0;
  public lastDy: number = 0;

  constructor(solvesService: SolvesService, platform: Platform) {
    this.platform = platform;

    this.presenter = new SolvesBar.Presenter(solvesService);

    this.presenter.viewModel$(this.intent())
      .do(null, err => console.log('%s', err))
      .onErrorResumeNext(Observable.empty<SolvesBar.ViewModel>())
      .subscribe(viewModel => this.viewModel = viewModel);
  }

  @HostListener('panstart', ['$event'])
  onPanStart(event: any) {
    this.lastDy = 0;
  }

  @HostListener('pan', ['$event'])
  onPan(event: any) {
    this.offset += (event.deltaY - this.lastDy);
    this.lastDy = event.deltaY;
  }

  @HostListener('panend', ['$event'])
  onPanEnd(event: any) {

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
      console.log("" + solves.length);
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
      return Observable.merge(this.solvesService.getAll()
        .map(solves => solves.reverse())
        .map(solves => new ViewModel(solves)))
        .startWith(new ViewModel([]));
    }
  }
}
