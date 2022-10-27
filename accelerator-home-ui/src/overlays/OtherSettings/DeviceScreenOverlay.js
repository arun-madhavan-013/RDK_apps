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
 import { Lightning, Utils, Language, Router } from '@lightningjs/sdk'
 import SettingsMainItem from '../../items/SettingsMainItem'
 import { COLORS } from '../../colors/Colors'
 import { CONFIG } from '../../Config/Config'
 import AppApi from '../../api/AppApi';
 import NetworkApi from '../../api/NetworkApi'
 import DeviceInformationScreen from './DeviceInformationOverlay';
 import TimeZoneOverlay from './TimeZoneOverlay';
 import FirmwareScreen from './FirmWareOverlay';
 /**
  * Class for Video and Audio screen.
  */
 
 export default class DeviceScreen extends Lightning.Component {
     static _template() {
         return {
             DeviceScreenContents: {
                 x: 200,
                 y: 275,
                 Info: {
                     type: SettingsMainItem,
                     Title: {
                         x: 10,
                         y: 45,
                         mountY: 0.5,
                         text: {
                             text: Language.translate('Info'),
                             textColor: COLORS.titleColor,
                             fontFace: CONFIG.language.font,
                             fontSize: 25,
                         }
                     },
                     Button: {
                         h: 45,
                         w: 45,
                         x: 1600,
                         mountX: 1,
                         y: 45,
                         mountY: 0.5,
                         src: Utils.asset('images/settings/Arrow.png'),
                     },
                 },
                 TimeZone: {
                     y: 90,
                     type: SettingsMainItem,
                     Title: {
                         x: 10,
                         y: 45,
                         mountY: 0.5,
                         text: {
                             text: Language.translate('Time Zone'),
                             textColor: COLORS.titleColor,
                             fontFace: CONFIG.language.font,
                             fontSize: 25,
                         }
                     },
                     Button: {
                         h: 45,
                         w: 45,
                         x: 1600,
                         mountX: 1,
                         y: 45,
                         mountY: 0.5,
                         src: Utils.asset('images/settings/Arrow.png'),
                     },
                 },
                 Firmware: {
                     y: 180,
                     type: SettingsMainItem,
                     Title: {
                         x: 10,
                         y: 45,
                         mountY: 0.5,
                         text: {
                             text: Language.translate('Check for Firmware Update'),
                             textColor: COLORS.titleColor,
                             fontFace: CONFIG.language.font,
                             fontSize: 25,
                         }
                     },
                     Button: {
                         h: 45,
                         w: 45,
                         x: 1600,
                         mountX: 1,
                         y: 45,
                         mountY: 0.5,
                         src: Utils.asset('images/settings/Arrow.png'),
                     },
                 },
                 Reboot: {
                     y: 270,
                     type: SettingsMainItem,
                     Title: {
                         x: 10,
                         y: 45,
                         mountY: 0.5,
                         text: {
                             text: Language.translate('Reboot'),
                             textColor: COLORS.titleColor,
                             fontFace: CONFIG.language.font,
                             fontSize: 25,
                         }
                     },
                 },
                 Reset: {
                     y: 360,
                     alpha: 0.3, // disabled
                     type: SettingsMainItem,
                     Title: {
                         x: 10,
                         y: 45,
                         mountY: 0.5,
                         text: {
                             text: Language.translate('Factory Reset'),
                             textColor: COLORS.titleColor,
                             fontFace: CONFIG.language.font,
                             fontSize: 25,
                         }
                     },
                     Button: {
                         h: 45,
                         w: 45,
                         x: 1600,
                         mountX: 1,
                         y: 45,
                         mountY: 0.5,
                         src: Utils.asset('images/settings/Arrow.png'),
                     },
                 },
             },
             DeviceInformationScreen:{
                type: DeviceInformationScreen,
                visible: false
             },
             TimeZoneOverlay:{
                type: TimeZoneOverlay,
                visible: false
             },
             FirmwareScreen:{
                type: FirmwareScreen,
                visible: false
             }
         }
 
     }
 
     _init() {
         this._appApi = new AppApi();
         this._network = new NetworkApi();
         this._setState('Info')
     }
 
     _focus() {
        this._setState('Info')
     }
 
    //  _handleBack() {
    //      Router.navigate('settings/advanced')
    //  }
    hide() {
        this.tag('DeviceScreenContents').visible = false
       
     }
    
     show() {
        this.tag('DeviceScreenContents').visible = true
      }
 
     static _states() {
         return [
             class Info extends this{
                 $enter() {
                     this.tag('Info')._focus()
                 }
                 $exit() {
                     this.tag('Info')._unfocus()
                 }
                 _handleUp() {
                     this._setState('Reboot');
                 }
                 _handleDown() {
                     this._setState('TimeZone')
                 }
                 _handleEnter() {
                    this._setState("DeviceInformationScreen")
                     //Router.navigate('settings/advanced/device/info')
                 }
             },
             class TimeZone extends this{
                 $enter() {
                     this.tag('TimeZone')._focus()
                 }
                 $exit() {
                     this.tag('TimeZone')._unfocus()
                 }
                 _handleUp() {
                     this._setState('Info');
                 }
                 _handleDown() {
                     this._setState('Firmware')
                 }
                 _handleEnter() {
                    this._setState("TimeZoneOverlay")
                     //Router.navigate('settings/advanced/device/timezone')
                 }
             },
             class Firmware extends this{
                 $enter() {
                     this.tag('Firmware')._focus()
                 }
                 $exit() {
                     this.tag('Firmware')._unfocus()
                 }
                 _handleUp() {
                     this._setState('Info');
                 }
                 _handleDown() {
                     this._setState('Reboot')
                 }
                 _handleEnter() {
                    this._setState("FirmwareScreen")
                     //Router.navigate('settings/advanced/device/firmware')
                 }
             },
             class Reboot extends this{
                 $enter() {
                     this.tag('Reboot')._focus()
                 }
                 $exit() {
                     this.tag('Reboot')._unfocus()
                 }
                 _handleUp() {
                     this._setState('Firmware');
                 }
                 _handleDown() {
                     this._setState('Info')
                 }
                 _handleEnter() {
                     Router.navigate('settings/advanced/device/reboot')
                 }
             },
             class Reset extends this{
                 $enter() {
                     this.tag('Reset')._focus()
                 }
                 $exit() {
                     this.tag('Reset')._unfocus()
                 }
                 _handleUp() {
                     //this._setState('Reboot');
                 }
                 _handleDown() {
                     //this._setState('Info')
                 }
                 _handleEnter() {
 
                 }
             },
             class DeviceInformationScreen extends this {
                $enter() {
                  ////console.log("bpscreen")
                  this.hide()
                  this.tag('DeviceInformationScreen').visible = true
                  this.fireAncestors("$updatePageTitle",'Settings  Other Settings  Advanced Settings  Device  Info')
                }
                _getFocused() {
                  //console.log("getfocusedbp")
                  return this.tag('DeviceInformationScreen')
                }
                $exit() {
                  this.show()
                  this.tag('DeviceInformationScreen').visible = false
                  this.fireAncestors("$updatePageTitle",'Settings  Other Settings  Device ')
                }
                _handleBack() {
                  this._setState('Info')
                }
              },
              //TimeZoneOverlay
              class TimeZoneOverlay extends this {
                $enter() {
                  ////console.log("bpscreen")
                  this.hide()
                  this.tag('TimeZoneOverlay').visible = true
                  this.fireAncestors("$updatePageTitle",'Settings  Other Settings  Advanced Settings  Device  Time')
                }
                _getFocused() {
                  //console.log("getfocusedbp")
                  return this.tag('TimeZoneOverlay')
                }
                $exit() {
                  this.show()
                  this.tag('TimeZoneOverlay').visible = false
                  this.fireAncestors("$updatePageTitle",'Settings  Other Settings  Advanced Settings  Device ')
                }
                _handleBack() {
                  this._setState('TimeZone')
                }
              },
              class FirmwareScreen extends this {
                $enter() {
                  ////console.log("bpscreen")
                  this.hide()
                  this.tag('FirmwareScreen').visible = true
                  this.fireAncestors("$updatePageTitle",'Settings  Other Settings  Advanced Settings  Device  Firmware Update')
                }
                _getFocused() {
                  //console.log("getfocusedbp")
                  return this.tag('FirmwareScreen')
                }
                $exit() {
                  this.show()
                  this.tag('FirmwareScreen').visible = false
                  this.fireAncestors("$updatePageTitle",'Settings  Other Settings  Advanced Settings  Device ')
                }
                _handleBack() {
                  this._setState('Firmware')
                }
              },
         ]
     }
 
 
 }