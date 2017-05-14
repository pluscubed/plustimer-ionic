import {Component} from "@angular/core";
import {IonicPage, Platform} from "ionic-angular";
import {SolvesService} from "../../providers/solves.service";
import {ListPage} from "../list/list";

@IonicPage({
  segment: 'current-session'
})
@Component({
  selector: 'page-current-session',
  templateUrl: 'current-session.html'
})
export class CurrentSessionPage {

  tab1Root = 'TimerPage';
  tab2Root = ListPage;

  constructor(private platform: Platform,
              private solvesService: SolvesService) {
  }
}
