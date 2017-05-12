import {Observable, Subject} from "rxjs/Rx";
import {Component, HostBinding, HostListener, ViewChild} from "@angular/core";
import {Solve, SolvesService} from "../../providers/solves.service";
import {Content, Platform, VirtualScroll} from "ionic-angular";
import {Util} from "../../app/util";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {DomSanitizer} from "@angular/platform-browser";

export const expandedY = '16px';
export const collapsedY = '100% - 48px - 24px';
export const expanded = 'translate3d(0, calc(' + expandedY + '), 0)';
export const collapsed = 'translate3d(0, calc(' + collapsedY + '), 0)';

@Component({
  selector: 'solves-sheet',
  templateUrl: 'solves-sheet.html',
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
export class SolvesSheetComponent implements View {
  private viewModel: ViewModel;
  private presenter: Presenter;

  private offset = 0;

  private itemWidth;

  private expandedState = "false";
  private expanded = false;

  private isAnimating = false;
  private state: ScrollState;

  private lastY = -1;
  private lastDy = 0;
  private isSecondTouch = false;

  @ViewChild(Content)
  private scrollContent: Content;
  @ViewChild(VirtualScroll)
  private virtualScroll;

  private scrollContentElement: HTMLElement;

  constructor(private solvesService: SolvesService,
              private platform: Platform,
              private sanitizer: DomSanitizer) {

    this.presenter = new Presenter(solvesService);

    this.presenter.viewModel$(this.intent())
      .do(null, err => console.log('%s', err))
      .onErrorResumeNext(Observable.empty<ViewModel>())
      .subscribe(viewModel => this.viewModel = viewModel);
  }

  ngAfterViewInit() {
    this.scrollContentElement = this.scrollContent._scrollContent.nativeElement;
    this.calcItemWidth();
  }

  onArrowClick() {
    if (this.isAnimating) {
      return;
    }

    this.state = ScrollState.IDLE;
    this.setScrollEnabled(false);

    this.scrollContent.scrollToTop();
    this.expandedState = "moving";
    requestAnimationFrame(() => {
      this.setExpanded(!this.expanded);
    });
  }

  private setScrollEnabled(enabled: boolean) {
    if (!!this.scrollContentElement) {
      this.scrollContentElement.style.overflowY = enabled ? "auto" : "hidden";
    }
  }

  private setExpanded(expanded: boolean) {
    this.expanded = expanded;
    this.expandedState = this.expanded.toString();
  }

  private scrollFiring: Subject<any>;

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

      if (this.state != ScrollState.REAL_SCROLLING && !this.expanded ||
        !this.scrollFiring && this.scrollContent.scrollTop == 0 && dY > 0) {
        this.setScrollEnabled(false);
        this.state = ScrollState.PANNING;
        this.offset = 0;
      }

      this.isSecondTouch = false;

    } else {
      //Later touch events: move the sheet

      if (this.state == ScrollState.PANNING) {
        this.setScrollEnabled(false);
        this.expandedState = "moving";
        this.offset = this.offset + dY;
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

      this.setScrollEnabled(this.expanded);
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

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.calcItemWidth();

    //Reset Virtual Scroll
    this.virtualScroll.readUpdate(true);
    this.virtualScroll.writeUpdate(true);
  }

  get isFullBarHeight() {
    return this.expanded || this.state == ScrollState.PANNING || this.isAnimating;
  }

  safe(html) {
    return this.sanitizer.bypassSecurityTrustStyle(html);
  }

  trackById(index: number, item: any): number {
    return item._id;
  }

  intent(): Intent {
    return {};
  }

  displayTime(solve: Solve) {
    return Util.formatTime(solve.time);
  }

  private calcItemWidth() {
    const width = this.scrollContentElement.clientWidth;
    //Max whole number of columns that will fit
    const columns = Math.trunc(width / 64);
    //Truncate to whole number pixels (otherwise virtualscroll puts last item on next line)
    const pixels = Math.trunc(width / columns);

    this.itemWidth = `${pixels}px`;
  }
}

enum ScrollState{
  IDLE, PANNING, REAL_SCROLLING, FAKE_SCROLLING
}

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
