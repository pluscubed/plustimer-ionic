import {BrowserModule, HAMMER_GESTURE_CONFIG} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ErrorHandler, NgModule} from "@angular/core";
import {IonicApp, IonicErrorHandler, IonicModule} from "ionic-angular";
import {AppComponent} from "./app.component";

import {TimerPage} from "../pages/page-timer/page-timer";
import {ItemDetailsPage} from "../pages/item-details/item-details";
import {ListPage} from "../pages/list/list";

import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";

import {CloudModule, CloudSettings} from "@ionic/cloud-angular";

import {SolvesService} from "../providers/solves.service";
import {SolvesSheetComponent} from "../pages/solves-sheet/solves-sheet";
import {CurrentSessionPage} from "../pages/page-current-session/page-current-session";
import {SuperTabsModule} from "ionic2-super-tabs";
import {AppGestureConfig} from "./gesture-config";
import * as timer from "../pages/timer/timer";
import * as scramble from "../pages/scramble/scramble";
import {TimerService} from "../providers/timer.service";
import {ScrambleService} from "../providers/scramble.service";

const cloudSettings: CloudSettings = {
  'core': {
    'app_id': 'bc5472e3'
  }
};

@NgModule({
  declarations: [
    AppComponent,
    TimerPage,
    ItemDetailsPage,
    ListPage,
    CurrentSessionPage,
    timer.TimerComponent,
    SolvesSheetComponent,
    scramble.ScrambleComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SuperTabsModule.forRoot(),
    IonicModule.forRoot(AppComponent),
    CloudModule.forRoot(cloudSettings)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    AppComponent,
    TimerPage,
    ItemDetailsPage,
    ListPage,
    CurrentSessionPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    SolvesService,
    TimerService,
    ScrambleService,
    timer.Presenter,
    scramble.Presenter,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {provide: HAMMER_GESTURE_CONFIG, useClass: AppGestureConfig}
  ]
})
export class AppModule {
}
