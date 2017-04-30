import {Observable, Scheduler} from "rxjs/Rx";
import {Component, HostBinding, HostListener} from "@angular/core";
import {Solve, SolvesService} from "../../providers/solves.service";
import {Platform} from "ionic-angular";
import {Util} from "../../app/util";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'solves-bar',
  templateUrl: 'solves-bar-component.html',
  animations: [
    trigger('expandedTrigger', [
      state('moving', style({})),
      state('false', style({
        transform: 'translate3d(0,calc(100% - 48px - 1.2em - 8px),0)'
      })),
      state('true', style({
        transform: 'translate3d(0,0px,0)'
      })),
      transition('* => true', [
        style({transform: '*'}),
        animate('225ms cubic-bezier(0.0, 0.0, 0.2, 1)', style({transform: 'translate3d(0, 0px, 0)'}))
      ]),
      transition('* => false', [
        style({transform: '*'}),
        animate('195ms cubic-bezier(0.0, 0.0, 0.2, 1)', style({transform: 'translate3d(0, calc(100% - 48px - 1.2em - 8px), 0)'}))
      ]),
    ])
  ]
})
export class SolvesBarComponent implements SolvesBar.View {
  private viewModel: SolvesBar.ViewModel;
  private presenter: SolvesBar.Presenter;

  private offset = 0;
  private lastDy = 0;

  private scrollTop = 0;
  private lastScrollTop = 0;

  private expandedState = "false";
  private expanded = false;

  private scrollEnabled = false;
  private isRealScrolling = false;
  private isFakeScrolling = false;
  private isAnimating = false;

  constructor(private solvesService: SolvesService,
              private platform: Platform,
              private sanitizer: DomSanitizer) {

    this.presenter = new SolvesBar.Presenter(solvesService);

    this.presenter.viewModel$(this.intent())
      .do(null, err => console.log('%s', err))
      .onErrorResumeNext(Observable.empty<SolvesBar.ViewModel>())
      .subscribe(viewModel => this.viewModel = viewModel);
  }

  onArrowClick() {
    if (this.isAnimating) {
      return;
    }

    this.expandedState = "moving";
    Observable.of(0, Scheduler.animationFrame).subscribe(() => {
      this.setExpanded(!this.expanded);
    });
  }

  private setExpanded(expanded: boolean) {
    this.expanded = expanded;
    this.expandedState = this.expanded.toString();
  }

  onSolvesScroll(event) {
    let dScroll = event.target.scrollTop - this.lastScrollTop;

    if (event.target.scrollTop > 0 || dScroll >= 0) {
      if (!this.isFakeScrolling) {
        //If scrolling down or in the middle of scrolling, set flag
        this.isRealScrolling = true;
      }
    } else {
      //Otherwise switch to moving the sheet
      this.isRealScrolling = false;
      this.isFakeScrolling = false;
      this.scrollEnabled = false;
    }

    this.offset = 0;

    this.lastScrollTop = event.target.scrollTop;
  }

  @HostListener('panstart', ['$event'])
  onPanStart(event: any) {
    if (this.isAnimating) {
      return;
    }

    this.lastDy = 0;

    //If expanded & going upwards, start fake-scrolling
    if (!this.isRealScrolling && this.expanded
      && this.lastScrollTop == 0 && event.direction == 8) {
      this.isFakeScrolling = true;
      this.scrollEnabled = true;
      this.scrollTop = 0;
    }
  }

  @HostListener('pan', ['$event'])
  onPan(event: any) {
    if (this.isAnimating) {
      return;
    }

    const dY = event.deltaY - this.lastDy;

    if (!this.isRealScrolling) {
      if (this.isFakeScrolling) {
        //Fake-scrolling
        this.offset = 0;
        this.scrollTop -= dY;
      } else {
        //Moving the sheet
        this.expandedState = "moving";
        this.offset = this.offset + dY;
      }
    }

    this.lastDy = event.deltaY;
  }

  @HostListener('panend', ['$event'])
  onPanEnd(event: any) {
    if (this.isAnimating) {
      return;
    }

    if (!this.isRealScrolling && !this.isFakeScrolling) {
      //If moving the sheet, set expanded status
      this.setExpanded(this.offset < -200);
    }
  }

  @HostListener('touchend')
  onTouchUp() {
    this.isFakeScrolling = false;
    this.isRealScrolling = false;
  }

  @HostListener('@expandedTrigger.start', ['$event'])
  onAnimationStart(event: any) {
    this.isAnimating = true;
  }

  @HostListener('@expandedTrigger.done', ['$event'])
  onAnimationDone(event: any) {
    this.isAnimating = false;
    this.offset = 0;
  }

  @HostBinding('@expandedTrigger')
  get expandedTrigger() {
    return this.expandedState;
  }

  @HostBinding('style.transform')
  get top() {
    if (!this.expanded) {
      return this.safe(`translate3d(0, calc(100% - 48px - 1.2em - 8px - ${-this.offset}px), 0)`);
    } else {
      return this.safe(`translate3d(0, calc(${this.offset}px), 0)`);
    }
  }

  safe(html) {
    return this.sanitizer.bypassSecurityTrustStyle(html);
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
