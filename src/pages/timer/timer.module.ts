import {NgModule} from "@angular/core";
import {IonicPageModule} from "ionic-angular";
import {TimerPage} from "./timer";
import {ScrambleComponentModule} from "../../components/scramble/scramble.module";
import {TimerComponentModule} from "../../components/timer/timer.module";
import {SolvesSheetComponentModule} from "../../components/solves-sheet/solves-sheet.module";

@NgModule({
  declarations: [TimerPage],
  imports: [
    ScrambleComponentModule,
    TimerComponentModule,
    SolvesSheetComponentModule,
    IonicPageModule.forChild(TimerPage)
  ]
})
export class TimerPageModule {
}
