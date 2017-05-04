import {Observable, Subject} from "rxjs/Rx";
import {Component, ElementRef, HostBinding, HostListener, Inject, ViewChild} from "@angular/core";
import {Solve, SolvesService} from "../../providers/solves.service";
import {Platform} from "ionic-angular";
import {Util} from "../../app/util";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {DomSanitizer} from "@angular/platform-browser";

export const expandedY = '16px';
export const collapsedY = '100% - 48px - 1.2em - 8px';
export const expanded = 'translate3d(0, calc(' + expandedY + '), 0)';
export const collapsed = 'translate3d(0, calc(' + collapsedY + '), 0)';

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

  private scrollTop = 0;
  private lastScrollTop = 0;

  private expandedState = "false";
  private expanded = false;

  private scrollEnabled = false;
  private isAnimating = false;
  private state: ScrollState;

  private lastY = -1;
  private lastDy = 0;
  private isSecondTouch = false;

  @ViewChild('solvesscroll')
  private solvesScrollView: ElementRef;

  constructor(private solvesService: SolvesService,
              private platform: Platform,
              private sanitizer: DomSanitizer,
              @Inject(ElementRef) private elementRef: ElementRef) {

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

    this.state = ScrollState.IDLE;
    this.scrollEnabled = false;

    this.scrollTop = 1;
    this.expandedState = "moving";
    requestAnimationFrame(() => {
      this.scrollTop = 0;
      this.setExpanded(!this.expanded);
    });
  }

  private setExpanded(expanded: boolean) {
    this.expanded = expanded;
    this.expandedState = this.expanded.toString();
  }

  private scrollFiring: Subject<any>;

  onSolvesScroll(event) {
    let dScroll = event.target.scrollTop - this.lastScrollTop;

    if ((!this.scrollFiring) && event.target.scrollTop == 0 && dScroll < 0) {
      //If at the top and scrolling down
      this.state = ScrollState.PANNING;
      this.scrollEnabled = false;

    } else {
      //If scrolling down or in the middle of scrolling, set flag
      this.state = ScrollState.REAL_SCROLLING;
      if (!this.scrollFiring) {
        this.scrollFiring = new Subject<any>();
        this.scrollFiring
          .asObservable()
          .timeout(100)
          .subscribe(() => {
          }, err => {
            this.scrollFiring.unsubscribe();
            this.scrollFiring = null;
          })
      }
      this.scrollFiring.next(0);
    }

    this.offset = 0;

    this.lastScrollTop = event.target.scrollTop;
  }

  findAncestor(el: HTMLElement, cls: string) {
    const elements = el.parentElement.parentElement.parentElement.getElementsByClassName(cls);
    return elements.item(0);
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(e: any) {
    if (this.isAnimating) {
      return;
    }

    let touchobj = e.changedTouches[0];
    const dY = touchobj.clientY - this.lastY;

    if (this.lastY == -1) {
      //Initial touch event: set baseline Y
      this.isSecondTouch = true;

    } else if (this.isSecondTouch) {
      //Second touch event: determine direction, whether to move the sheet

      const solvesScrollElement: HTMLElement = this.solvesScrollView.nativeElement;

      if (this.state != ScrollState.REAL_SCROLLING && !this.expanded ||
        !this.scrollFiring && solvesScrollElement.scrollTop == 0 && dY > 0) {
        this.scrollEnabled = false;
        this.state = ScrollState.PANNING;
        this.scrollTop = 0;
        this.offset = 0;
      }

      this.isSecondTouch = false;

    } else {
      //Later touch events: move the sheet

      if (this.state == ScrollState.PANNING) {
        this.scrollEnabled = false;
        this.expandedState = "moving";
        this.offset = this.offset + dY;
        this.scrollTop = 0;
      }

      this.lastDy = dY;
    }


    this.lastY = touchobj.clientY;
  }

  @HostListener('touchend')
  onTouchEnd() {
    if (this.isAnimating || this.platform.is('core')) {
      return;
    }

    if (this.state == ScrollState.PANNING) {
      //If moving the sheet, set expanded status
      this.setExpanded(this.lastDy < 0);
    }

    this.state = ScrollState.IDLE;

    this.lastY = -1;
    this.lastDy = -1;
  }

  @HostListener('@expandedTrigger.start', ['$event'])
  onAnimationStart(event: any) {
    if (event.toState != "moving") {
      this.isAnimating = true;
    }
  }

  @HostListener('@expandedTrigger.done', ['$event'])
  onAnimationDone(event: any) {
    if (event.toState != "moving") {
      this.isAnimating = false;
      this.offset = 0;

      this.scrollEnabled = this.expanded;
    }
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
