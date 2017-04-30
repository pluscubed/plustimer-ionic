import {BrowserModule, HAMMER_GESTURE_CONFIG} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ErrorHandler, NgModule} from "@angular/core";
import {IonicApp, IonicErrorHandler, IonicModule} from "ionic-angular";
import {AppComponent} from "./app.component";

import {TimerPage} from "../pages/timer-page/timer-page";
import {ItemDetailsPage} from "../pages/item-details/item-details";
import {ListPage} from "../pages/list/list";

import {TimerComponent} from "../pages/timer-component/timer-component";

import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";
import {SolvesService} from "../providers/solves.service";
import {SolvesBarComponent} from "../pages/solves-bar-component/solves-bar-component";
import {CurrentSessionPage} from "../pages/current-session-page/current-session-page";
import {SuperTabsModule} from "ionic2-super-tabs";
import {AppGestureConfig} from "./gesture-config";

@NgModule({
  declarations: [
    AppComponent,
    TimerPage,
    ItemDetailsPage,
    ListPage,
    CurrentSessionPage,
    TimerComponent,
    SolvesBarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SuperTabsModule.forRoot(),
    IonicModule.forRoot(AppComponent),
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
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {provide: HAMMER_GESTURE_CONFIG, useClass: AppGestureConfig}
  ]
})
export class AppModule {
}
