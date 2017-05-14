import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ErrorHandler, NgModule} from "@angular/core";
import {IonicApp, IonicErrorHandler, IonicModule} from "ionic-angular";
import {AppComponent} from "./app.component";

import {ItemDetailsPage} from "../pages/item-details/item-details";
import {ListPage} from "../pages/list/list";

import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";

import {CloudModule, CloudSettings} from "@ionic/cloud-angular";

import {SolvesService} from "../providers/solves.service";
import {SuperTabsModule} from "ionic2-super-tabs";
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
    ItemDetailsPage,
    ListPage
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
    ItemDetailsPage,
    ListPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    SolvesService,
    TimerService,
    ScrambleService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {
}
