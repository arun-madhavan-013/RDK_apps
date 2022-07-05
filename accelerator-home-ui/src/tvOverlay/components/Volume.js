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

import { Lightning, Registry, Router, Storage, Utils } from "@lightningjs/sdk";
import AppApi from "../../api/AppApi";
import { CONFIG } from "../../Config/Config";

export default class Volume extends Lightning.Component {
    static _template() {
        return {
            rect: true, w: 1920, h: 320, color: 0xFF000000, y: -320, alpha: 0.9,
            transitions: {
                y: { duration: .3, timingFunction: 'cubic-bezier(0.17, 0.9, 0.32, 1.3)' },
                h: { duration: .3, timingFunction: 'cubic-bezier(0.17, 0.9, 0.32, 1.3)' }
            },
            Overlay: {
                Line: {
                    y: 318,
                    h: 3,
                    w: 1920,
                    rect: true,
                    color: 0xffffffff
                }
            },
            VolumeInfo: {
                alpha: 1,
                zIndex: 2,
                y: 160,
                x: 960,
                mountX: 0.5,
                mountY: 0.5,
                h: 100,
                w: 100,
                src: Utils.asset('/images/volume/Volume.png'),
                Text: {
                    x: 100,
                    y: 0,
                    text: {
                        text: 0,
                        fontSize: 80,
                        fontFace: CONFIG.language.font
                    }
                },
            }
        }
    }

    _firstEnable() {
        this.switch = false
        this.appApi = new AppApi()
        this.volTimeout = null
        this.volume = 0
        this.mute = false;
        this.appApi.getConnectedAudioPorts()
            .then(res => {
                this.appApi.getVolumeLevel(res.connectedAudioPorts[0])
                    .then(res1 => {
                        this.appApi.muteStatus(res.connectedAudioPorts[0])
                            .then(result => {
                                this.mute = result.muted;
                            });
                        if (res1) {
                            this.volume = parseInt(res1.volumeLevel);
                            this._updateText(this.volume);
                        }
                    });


            })
            .catch(err => {
                this._updateText(this.volume)
            })
    }

    /**
     * @param {flag} args
     */
    set params(args) {
        this.options = args
        if (args.flag) {
            this.switch = true
        }
    }

    onVolumeKeyDown() {
        this.volTimeout && Registry.clearTimeout(this.volTimeout)
        this.volTimeout = Registry.setTimeout(() => {
            this._handleBack()
        }, 2000)
        if (this.volume > 0) {
            this.volume -= 5;
            if (this.setVolume(this.volume))
                this._updateText(this.volume)
        }
    }

    onVolumeKeyUp() {
        this.volTimeout && Registry.clearTimeout(this.volTimeout)
        this.volTimeout = Registry.setTimeout(() => {
            this._handleBack()
        }, 2000)
        if (this.volume < 100) {
            this.volume += 5;
            if (this.setVolume(this.volume))
                this._updateText(this.volume)
        }
    }

    onVolumeMute() {
        this.volTimeout && Registry.clearTimeout(this.volTimeout)
        this.volTimeout = Registry.setTimeout(() => {
            this._handleBack()
        }, 2000)
        if (this.setMute(!this.mute)) {
            this.mute = !this.mute
            this._updateIcon(this.mute)
        }
    }

    setVolume = async (val) => {
        const value = await this.appApi.setVolumeLevel('HDMI0', val)
        return value
    }

    setMute = async (val) => {
        const status = await this.appApi.audio_mute('HDMI0', val)
        return status
    }

    _updateText(val) {
        this.tag('Text').text.text = val
    }
    _updateIcon(check) {
        if (check) {
            this.tag('VolumeInfo').src = Utils.asset('images/volume/Volume_Mute.png');
        } else {
            this.tag('VolumeInfo').src = Utils.asset('/images/volume/Volume.png');
        }
    }

    _focus() {
        this.volTimeout = Registry.setTimeout(() => {
            this._handleBack()
        }, 2000)
        this.patch({
            smooth: {
                y: -30
            }
        })
    }

    _unfocus() {
        this.volTimeout && Registry.clearTimeout(this.volTimeout)
        this.patch({
            smooth: {
                y: -320
            }
        })
        this.switch = false
    }

    _handleBack() {
        console.log(Storage.get('applicationType'))
        if (this.switch) {
            console.log(this.options)
            this.appApi.visibile('ResidentApp', false)
            this.appApi.setVisibility(Storage.get('applicationType'), true)
            // console.log('going back to route')
            // Router.back()
        }
        else {
            Router.focusPage()
        }
    }

    static _states() {
        return [];
    }
}