import {Observable} from "rxjs/Rx";
import {Component, HostBinding, HostListener} from "@angular/core";
import {Solve, SolvesService} from "../../providers/solves.service";
import {Platform} from "ionic-angular";
import {Util} from "../../app/util";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {DomSanitizer} from "@angular/platform-browser";

const expandedY = '16px';
const collapsedY = '100% - 48px - 1.2em - 8px';
const expanded = `translate3d(0, calc(${expandedY}), 0)`;
const collapsed = `translate3d(0, calc(${collapsedY}), 0)`;

@Component({
  selector: 'solves-bar',
  templateUrl: 'solves-bar-component.html',
  animations: [
    trigger('expandedTrigger', [
      state('moving', style({})),
      state('false', style({transform: collapsed})),
      state('true', style({transform: expanded})),
      transition('* => true', [
        style({transform: '*'}),
        animate('225ms cubic-bezier(0.0, 0.0, 0.2, 1)', style({transform: expanded}))
      ]),
      transition('* => false', [
        style({transform: '*'}),
        animate('195ms cubic-bezier(0.0, 0.0, 0.2, 1)', style({transform: collapsed}))
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
  private isAnimating = false;
  private state: ScrollState;

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

    this.scrollTop = 0;
    this.state = ScrollState.IDLE;
    this.scrollEnabled = false;

    this.expandedState = "moving";
    requestAnimationFrame(() => {
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
      if (this.state != ScrollState.FAKE_SCROLLING) {
        //If scrolling down or in the middle of scrolling, set flag
        this.state = ScrollState.REAL_SCROLLING;
      }
    } else {
      //Otherwise switch to moving the sheet
      this.state = ScrollState.PANNING;
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


    const scroll = this.findAncestor(event.target, "solves-scroll");

    //If expanded & going upwards & scrollable, start fake-scrolling
    if (this.state != ScrollState.REAL_SCROLLING &&
      this.expanded &&
      this.lastScrollTop == 0 &&
      event.additionalEvent === "panup" &&
      scroll.scrollHeight > scroll.clientHeight) {

      this.state = ScrollState.FAKE_SCROLLING;
      this.scrollEnabled = true;
      this.scrollTop = 0;

    } else if (scroll.scrollHeight <= scroll.clientHeight ||
      scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight > 0) {
      //If not scrollable, or not at the bottom of the scroll container
      this.state = ScrollState.PANNING;
    }
  }

  findAncestor(el: HTMLElement, cls: string) {
    const elements = el.parentElement.parentElement.parentElement.getElementsByClassName(cls);
    return elements.item(0);
  }

  @HostListener('pan', ['$event'])
  onPan(event: any) {
    if (this.isAnimating) {
      return;
    }

    const dY = event.deltaY - this.lastDy;

    if (this.state == ScrollState.FAKE_SCROLLING) {
      //Fake-scrolling
      this.offset = 0;
      this.scrollTop -= dY;
    } else if (this.state == ScrollState.PANNING) {
      //Moving the sheet
      this.expandedState = "moving";
      this.offset = this.offset + dY;
    }

    this.lastDy = event.deltaY;
  }

  @HostListener('panend', ['$event'])
  onPanEnd(event: any) {
    if (this.isAnimating) {
      return;
    }

    if (this.state == ScrollState.PANNING) {
      //If moving the sheet, set expanded status
      this.setExpanded(event.additionalEvent === "panup");
    }
  }

  @HostListener('touchend')
  onTouchUp() {
    this.state = ScrollState.IDLE;
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
  get transform() {
    if (!this.expanded) {
      return this.safe(`translate3d(0, calc(${collapsedY} - ${-this.offset}px), 0)`);
    } else {
      return this.safe(`translate3d(0, calc(${expandedY} - ${-this.offset}px), 0)`);
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

enum ScrollState{
  IDLE, PANNING, REAL_SCROLLING, FAKE_SCROLLING
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
