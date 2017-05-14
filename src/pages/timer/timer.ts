import {Component} from "@angular/core";
import {IonicPage, Platform} from "ionic-angular";
import {SolvesService} from "../../providers/solves.service";

@IonicPage({
  segment: 'timer'
})
@Component({
  selector: 'page-timer',
  templateUrl: 'timer.html'
})
export class TimerPage {
  constructor(private platform: Platform,
              private solvesService: SolvesService) {

  }
}
