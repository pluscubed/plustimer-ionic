import {Component} from "@angular/core";
import {Platform} from "ionic-angular";
import {SolvesService} from "../../providers/solves.service";

@Component({
  selector: 'page-timer',
  templateUrl: 'page-timer.html'
})
export class TimerPage {
  constructor(private platform: Platform,
              private solvesService: SolvesService) {

  }
}
