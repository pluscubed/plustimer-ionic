import {NgModule} from "@angular/core";
import {IonicPageModule} from "ionic-angular";
import {TimerPage} from "./timer";
import {CurrentSessionPage} from "./current-session";
import {SuperTabsModule} from "ionic2-super-tabs";

@NgModule({
  declarations: [CurrentSessionPage],
  imports: [
    SuperTabsModule,
    IonicPageModule.forChild(CurrentSessionPage)
  ]
})
export class CurrentSessionPageModule {
}
