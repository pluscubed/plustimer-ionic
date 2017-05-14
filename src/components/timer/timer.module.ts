import {NgModule} from "@angular/core";
import {IonicModule} from "ionic-angular";
import {Presenter, TimerComponent} from "./timer";

@NgModule({
  declarations: [TimerComponent],
  imports: [IonicModule],
  exports: [TimerComponent],
  providers: [Presenter]
})
export class TimerComponentModule {
}
