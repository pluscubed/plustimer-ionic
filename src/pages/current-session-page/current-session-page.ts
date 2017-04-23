import {Component} from "@angular/core";
import {Platform} from "ionic-angular";
import {SolvesService} from "../../providers/solves.service";
import {TimerPage} from "../timer-page/timer-page";
import {ListPage} from "../list/list";

@Component({
  selector: 'current-session-page',
  templateUrl: 'current-session-page.html'
})
export class CurrentSessionPage {

  tab1Root = TimerPage;
  tab2Root = ListPage;

  constructor(private platform: Platform,
              private solvesService: SolvesService) {
  }
}
