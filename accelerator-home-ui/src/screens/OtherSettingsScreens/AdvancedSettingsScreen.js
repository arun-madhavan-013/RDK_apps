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
import CECApi from '../../api/CECApi'
import ThunderJS from 'ThunderJS'

const config = {
    host: '127.0.0.1',
    port: 9998,
    default: 1,
}
let thunder = ThunderJS(config);
/**
 * Class for AdvancedSettings screen.
 */

export default class AdvanceSettingsScreen extends Lightning.Component {

    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Settings  Other Settings  Advanced Settings'));
    }

    pageTransition() {
        return 'left'
    }


    static _template() {
        return {
            rect: true,
            color: 0xff000000,
            w: 1920,
            h: 1080,
            AdvanceScreenContents: {
                x: 200,
                y: 275,
                UIVoice: {
                    alpha: 0.3, // disabled
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: 'UI Voice',
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
                TTSOptions: {
                    y: 90,
                    alpha: 0.3, // disabled
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: 'TTS Options',
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
                CECControl: {
                    y: 180,
                    // alpha: 0.3, // disabled
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('CEC Control'),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Button: {
                        h: 45,
                        w: 67,
                        x: 1600,
                        mountX: 1,
                        y: 45,
                        mountY: 0.5,
                        src: Utils.asset('images/settings/ToggleOffWhite.png'),
                    },
                },
                Bug: {
                    y: 270,
                    alpha: 0.3, // disabled
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: 'Bug Report',
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
                Contact: {
                    alpha: 0.3, // disabled
                    y: 360,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: 'Contact Support',
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
                Device: {
                    y: 450,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Device'),
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
        }

    }

    _init() {
        this.cecApi = new CECApi()
        this.cecApi.activate()
            .then(() => {
                this.tag('CECControl.Button').src = Utils.asset('images/settings/ToggleOnOrange.png')
                this.performOTPAction()
            })
        this._setState('CECControl')
    }
    _focus() {
        this._setState(this.state)
    }

    _handleBack() {
        Router.navigate('settings/other')
    }

    performOTPAction() {
        this.cecApi.setEnabled().then(res => {
            if (res.success) {
                this.cecApi.performOTP().then(otpRes => {
                    if (otpRes.success) {
                        console.log('Otp Action success full')
                    }
                })
            }
        })
    }

    toggleCEC() {
        this.cecApi.getEnabled()
            .then(res => {
                console.log(res)
                if (res.enabled) {
                    this.cecApi.deactivate()
                        .then(() => {
                            this.tag('CECControl.Button').src = Utils.asset('images/settings/ToggleOffWhite.png')
                        })
                }
                else {
                    this.cecApi.activate()
                        .then(() => {
                            this.tag('CECControl.Button').src = Utils.asset('images/settings/ToggleOnOrange.png')
                        })
                }
            })
    }
    static _states() {
        return [
            class UIVoice extends this{
                $enter() {
                    this.tag('UIVoice')._focus()
                }
                $exit() {
                    this.tag('UIVoice')._unfocus()
                }
                _handleUp() {
                    //this._setState('Reset');
                }
                _handleDown() {
                    //this._setState('TTSOptions')
                }
                _handleEnter() {

                }
            },
            class TTSOptions extends this{
                $enter() {
                    this.tag('TTSOptions')._focus()
                }
                $exit() {
                    this.tag('TTSOptions')._unfocus()
                }
                _handleUp() {
                    //this._setState('UIVoice');
                }
                _handleDown() {
                    //this._setState('CECControl')
                }
                _handleEnter() {

                }
            },
            class CECControl extends this{
                $enter() {
                    this.tag('CECControl')._focus()
                }
                $exit() {
                    this.tag('CECControl')._unfocus()
                }
                _handleUp() {
                    //this._setState('TTSOptions');
                }
                _handleDown() {
                    this._setState('Device')
                }
                _handleEnter() {
                    this.toggleCEC()
                }
            },
            class Bug extends this{
                $enter() {
                    this.tag('Bug')._focus()
                }
                $exit() {
                    this.tag('Bug')._unfocus()
                }
                _handleUp() {
                    //this._setState('CECControl');
                }
                _handleDown() {
                    //this._setState('Contact')
                }
                _handleEnter() {

                }
            },
            class Contact extends this{
                $enter() {
                    this.tag('Contact')._focus()
                }
                $exit() {
                    this.tag('Contact')._unfocus()
                }
                _handleUp() {
                    //this._setState('Bug');
                }
                _handleDown() {
                    //this._setState('Device')
                }
                _handleEnter() {

                }
            },
            class Device extends this{
                $enter() {
                    this.tag('Device')._focus()
                }
                $exit() {
                    this.tag('Device')._unfocus()
                }
                _handleUp() {
                    this._setState('CECControl');
                }
                _handleDown() {
                    //this._setState('UI Voice')
                }
                _handleEnter() {
                    Router.navigate('settings/advanced/device')
                }
            },
        ]
    }


}