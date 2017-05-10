import {Component} from "@angular/core";
import {Platform} from "ionic-angular";
import {SolvesService} from "../../providers/solves.service";
import {TimerPage} from "../page-timer/page-timer";
import {ListPage} from "../list/list";

@Component({
  selector: 'page-current-session',
  templateUrl: 'page-current-session.html'
})
export class CurrentSessionPage {

  tab1Root = TimerPage;
  tab2Root = ListPage;

  constructor(private platform: Platform,
              private solvesService: SolvesService) {
  }
}
