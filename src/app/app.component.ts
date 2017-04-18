import {Component, ViewChild} from "@angular/core";

import {MenuController, Nav, Platform} from "ionic-angular";

import {TimerPage} from "../pages/timer-page/timer-page";
import {ListPage} from "../pages/list/list";

import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make TimerPage the root (or first) page
  rootPage = TimerPage;
  pages: Array<{ title: string, component: any }>;

  constructor(public platform: Platform,
              public menu: MenuController,
              public statusBar: StatusBar,
              public splashScreen: SplashScreen) {
    this.initializeApp();

    // set our app's pages
    this.pages = [
      {title: 'Timer', component: TimerPage},
      {title: 'My First List', component: ListPage}
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }
}
