/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import { Lightning } from "@lightningjs/sdk";
import { CONFIG } from "../../Config/Config";
import TvOverlaySettingsItem from "../../items/TvOverlaySettingsItem";
import PictureSettingsApi from "../../api/PictureSettingsApi";

export default class TvOverlaySettingsScreen extends Lightning.Component {
  static _template() {
    return {
      Contents: {
        h: 1080,
        w: 500,
        Background: {
          h: 1080,
          w: 500,
          rect: true,
          colorLeft: 0xff000000,
          colorRight: 0x99000000,
        },
        Settings: {
          w: 500,
          h: 910,
          clipping: true,
          y: 80,
          List: {
            type: Lightning.components.ListComponent,
            w: 500,
            h: 910,
            y: 5,
            itemSize: 90,
            horizontal: false,
            invertDirection: true,
            roll: true,
            rollMax: 900,
            itemScrollOffset: -9,
          },
        },
      },
    };
  }

  _init() {
    this.pictureApi = new PictureSettingsApi();
    this.options = this.pictureApi.getOptions(); //#byDefault //not required //fetches the defaults dummy values //following api calls fetches the actual values from api here after
    this.pictureApi
      .getSupportedPictureModes()
      .then((res) => {
        if (res) {
          this.options = this.pictureApi.getOptions();
          this.refreshList();
        }
      })
      .catch((err) => {
        console.log(
          "ERROR from settings overlay screen init: getSupportedPictureModes: ",
          JSON.stringify(err)
        );
        // this.options = this.pictureApi.getOptions(); //#forTesting
        // this.refreshList(); //#forTesting
      });
    //the getSupportedColorTemps api call has some issue when working on chrome browser
    this.pictureApi
      .getSupportedColorTemps()
      .then((res) => {
        if (res) {
          this.options = this.pictureApi.getOptions();
          this.refreshList();
        }
      })
      .catch((err) => {
        console.log(
          "ERROR from settings overlay screen init: getSupportedColorTemps: ",
          JSON.stringify(err)
        );
        // this.options = this.pictureApi.getOptions(); //#forTesting
        // this.refreshList(); //#forTesting
      });
  }

  refreshList() {
    console.log("this.refreshList got called");
    this.tag("List").items = this.options.map((item, index) => {
      return {
        w: 500,
        h: 90,
        type: TvOverlaySettingsItem,
        item: item,
      };
    });
  }

  _focus() {
    // this.refreshList(); //#forTesting
    console.log("index: ", this.tag("List").index);
    this.tag("List").setIndex(0);
    this.checkCustomStatus();
  }

  checkCustomStatus() {
    this.customFlag = false;
    let colorTempFlag = false;
    let pictureModeFlag = false;
    this.pictureApi
      .getSettingsValue("_colorTemp")
      .then((res) => {
        if (res === "User Defined") {
          colorTempFlag = true;
          this.customFlag = colorTempFlag && pictureModeFlag;
        }
      })
      .catch((err) => {
        console.log(
          "Error from getting _colorTemp on focus on overlay: ",
          JSON.stringify(err)
        );
        // colorTempFlag = true; //#forTesting
        // this.customFlag = colorTempFlag && pictureModeFlag; //#forTesting
        console.log(
          "colorTempFlag: ",
          colorTempFlag,
          " pictureModeFlag: ",
          pictureModeFlag,
          " customFlag: ",
          this.customFlag
        );
      });
    this.pictureApi
      .getSettingsValue("_pictureMode")
      .then((res) => {
        if (res === "custom") {
          pictureModeFlag = true;
          this.customFlag = colorTempFlag && pictureModeFlag;
        }
      })
      .catch((err) => {
        console.log(
          "Error from getting _pictureMode on focus on overlay: ",
          JSON.stringify(err)
        );
        // pictureModeFlag = true; //#forTesting
        // this.customFlag = colorTempFlag && pictureModeFlag; //#forTesting
        console.log(
          "colorTempFlag: ",
          colorTempFlag,
          " pictureModeFlag: ",
          pictureModeFlag,
          " customFlag: ",
          this.customFlag
        );
      });
  }
  _getFocused() {
    return this.tag("List").element;
  }

  _handleDown() {
    if (this.tag("List").index < this.tag("List").length - 1) {
      //to prevent circular scrolling
      if (this.tag("List").index >= 1) {
        //to check if user should be moving to third item
        console.log("customFlag: ", this.customFlag);
        if (this.customFlag) {
          //to check if picture mode and color are set to custom
          this.tag("List").setNext();
        } else {
          this.tag("List").setIndex(1);
          console.log("refreshing custom status...");
          this.checkCustomStatus(); //refresh and check if picturemode and colorTemp are custom
        }
      } else {
        this.tag("List").setNext();
      }
    }
  }

  _handleUp() {
    if (this.tag("List").index > 0) {
      //to prevent circular scrolling
      this.tag("List").setPrevious();
    }
  }
}
