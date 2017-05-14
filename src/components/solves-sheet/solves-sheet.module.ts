import {NgModule} from "@angular/core";
import {IonicModule} from "ionic-angular";
import {Presenter, SolvesSheetComponent} from "./solves-sheet";

@NgModule({
  declarations: [SolvesSheetComponent],
  imports: [IonicModule],
  exports: [SolvesSheetComponent],
  providers: [Presenter]
})
export class SolvesSheetComponentModule {
}
