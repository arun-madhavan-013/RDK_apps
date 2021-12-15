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
import { Lightning, Language } from '@lightningjs/sdk'
import { COLORS } from '../../colors/Colors'
import { CONFIG } from '../../Config/Config'
import AppApi from '../../api/AppApi.js';

/**
 * Class for Video and Audio screen.
 */

export default class DeviceInformationScreen extends Lightning.Component {
    static _template() {
        return {
            x: 0, y: 0,
            h: 1080,
            w: 1920,
            clipping: true,
            DeviceInfoContents: {
                y: 2,
                Line1: {
                    y: 0,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                ChipSet: {
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`Chipset`),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: `unavailable`,
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    }
                },
                Line2: {
                    y: 90,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                SerialNumber: {
                    Title: {
                        x: 10,
                        y: 135,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`Serial Number`),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 135,
                        mountY: 0.5,
                        text: {
                            text: `unavailable`,
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                Line3: {
                    y: 180,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                Location: {
                    Title: {
                        x: 10,
                        y: 225,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`Location`),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 225,
                        mountY: 0.5,
                        text: {
                            text: `City: unavailable , Country: unavailable `,
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                Line4: {
                    y: 270,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                SupportedDRM: {
                    Title: {
                        x: 10,
                        y: 360,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`Supported DRM & Key-System`),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            wordWrapWidth: 1600,
                            wordWrap: true,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 360,
                        mountY: 0.5,
                        text: {
                            text: `unavailable`,
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            wordWrapWidth: 1200,
                            wordWrap: true,
                            fontSize: 25,
                        }
                    },
                },
                Line5: {
                    y: 450,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                FirmwareVersions: {
                    Title: {
                        x: 10,
                        y: 540,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`Firmware version`),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 540,
                        mountY: 0.5,
                        text: {
                            text: `UI Version: 3.4, Build Version: , Timestamp: `,
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                Line6: {
                    y: 630,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                AppVersions: {
                    Title: {
                        x: 10,
                        y: 720,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`App Versions`),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 720,
                        mountY: 0.5,
                        text: {
                            text: "Youtube:\nAmazon Prime:\nNetflix:",
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                Line7: {
                    y: 810,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
            },
        }
    }

    _focus() {
        this._setState('DeviceInformationScreen')
        this.appApi = new AppApi();
        this.appApi.getSerialNumber().then(result => {
            this.tag("SerialNumber.Value").text.text = `${result.serialNumber}`;
        })

        this.appApi.getSystemVersions().then(res => {
            this.tag('FirmwareVersions.Value').text.text = `UI Version - 3.4 \nBuild Version - ${res.stbVersion} \nTime Stamp - ${res.stbTimestamp} `
        })
            .catch(err => { console.error(`error while getting the system versions`) })

        this.appApi.getDRMS().then(result => {
            console.log('from device info supported drms ' + JSON.stringify(result))
            var drms = ""
            result.forEach(element => {
                drms += `${element.name} :`
                if (element.keysystems) {
                    drms += "\t"
                    element.keysystems.forEach(keySystem => {
                        drms += `${keySystem}, `
                    })
                    drms += "\n"
                } else {
                    drms += "\n"
                }
            });
            this.tag('SupportedDRM.Value').text.text = `${drms.substring(0, drms.length - 1)}`
        })
        this.appApi.getLocation().then(result => {
            console.log("getLocation from device info " + JSON.stringify(result))
            var locationInfo = ""
            if (result.city.length !== 0) {
                locationInfo = "City: " + result.city
            }
            else {
                locationInfo = "City: unavailable "
            }
            if (result.country.length !== 0) {
                locationInfo += ", Country: " + result.country;
            }
            else {
                locationInfo += ", Country: unavailable "
            }
            this.tag('Location.Value').text.text = `${locationInfo}`
        })

        this.appApi.getDeviceIdentification().then(result => {
            console.log('from device Information screen getDeviceIdentification: ' + JSON.stringify(result))
            this.tag('ChipSet.Value').text.text = `${result.chipset}`
            // this.tag('FirmwareVersions.Value').text.text = `${result.firmwareversion}`
        })
        this.appApi.registerChangeLocation()
    }

    _handleDown() {
        if (this.tag("DeviceInfoContents").y > -200) {
            this.tag("DeviceInfoContents").y -= 35;
        }
    }
    _handleUp() {
        if (this.tag("DeviceInfoContents").y < 35) {
            this.tag("DeviceInfoContents").y += 35;
        }
    }
}