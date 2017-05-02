import {BrowserModule, HAMMER_GESTURE_CONFIG} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ErrorHandler, NgModule} from "@angular/core";
import {IonicApp, IonicErrorHandler, IonicModule} from "ionic-angular";
import {AppComponent} from "./app.component";

import {TimerPage} from "../pages/timer-page/timer-page";
import {ItemDetailsPage} from "../pages/item-details/item-details";
import {ListPage} from "../pages/list/list";

import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";

import {CloudModule, CloudSettings} from "@ionic/cloud-angular";

import {SolvesService} from "../providers/solves.service";
import {SolvesBarComponent} from "../pages/solves-bar-component/solves-bar-component";
import {CurrentSessionPage} from "../pages/current-session-page/current-session-page";
import {SuperTabsModule} from "ionic2-super-tabs";
import {AppGestureConfig} from "./gesture-config";
import * as timer from "../pages/timer-component/timer-component";

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
    SolvesBarComponent
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
    timer.Presenter,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {provide: HAMMER_GESTURE_CONFIG, useClass: AppGestureConfig}
  ]
})
export class AppModule {
}
