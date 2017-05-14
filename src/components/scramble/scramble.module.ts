import {NgModule} from "@angular/core";
import {IonicModule} from "ionic-angular";
import {Presenter, ScrambleComponent} from "./scramble";

@NgModule({
  declarations: [ScrambleComponent],
  imports: [IonicModule],
  exports: [ScrambleComponent],
  providers: [Presenter]
})
export class ScrambleComponentModule {
}
