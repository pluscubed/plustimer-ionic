import {Injectable} from "@angular/core";
import {IonicGestureConfig} from "ionic-angular";
import {DIRECTION_VERTICAL} from "ionic-angular/gestures/hammer";

@Injectable()
export class AppGestureConfig extends IonicGestureConfig {

  overrides = <any>{
    'pan': {direction: DIRECTION_VERTICAL}
  }

}
