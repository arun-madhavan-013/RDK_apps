/**
 * App version: 1.0.0
 * SDK version: 4.8.3
 * CLI version: 2.8.1
 * 
 * Generated: Tue, 30 Aug 2022 16:17:11 GMT
 */

var APP_com_metrological_app_TinyRDK = (function () {
  'use strict';

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  const settings = {};
  const subscribers = {};
  const initSettings = (appSettings, platformSettings) => {
    settings['app'] = appSettings;
    settings['platform'] = platformSettings;
    settings['user'] = {};
  };

  const publish = (key, value) => {
    subscribers[key] && subscribers[key].forEach(subscriber => subscriber(value));
  };

  const dotGrab = function () {
    let obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    let key = arguments.length > 1 ? arguments[1] : undefined;
    if (obj === null) return undefined;
    const keys = key.split('.');

    for (let i = 0; i < keys.length; i++) {
      obj = obj[keys[i]] = obj[keys[i]] !== undefined ? obj[keys[i]] : {};
    }

    return typeof obj === 'object' && obj !== null ? Object.keys(obj).length ? obj : undefined : obj;
  };

  var Settings = {
    get(type, key) {
      let fallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
      const val = dotGrab(settings[type], key);
      return val !== undefined ? val : fallback;
    },

    has(type, key) {
      return !!this.get(type, key);
    },

    set(key, value) {
      settings['user'][key] = value;
      publish(key, value);
    },

    subscribe(key, callback) {
      subscribers[key] = subscribers[key] || [];
      subscribers[key].push(callback);
    },

    unsubscribe(key, callback) {
      if (callback) {
        const index = subscribers[key] && subscribers[key].findIndex(cb => cb === callback);
        index > -1 && subscribers[key].splice(index, 1);
      } else {
        if (key in subscribers) {
          subscribers[key] = [];
        }
      }
    },

    clearSubscribers() {
      for (const key of Object.getOwnPropertyNames(subscribers)) {
        delete subscribers[key];
      }
    }

  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */

  const prepLog = (type, args) => {
    const colors = {
      Info: 'green',
      Debug: 'gray',
      Warn: 'orange',
      Error: 'red'
    };
    args = Array.from(args);
    return ['%c' + (args.length > 1 && typeof args[0] === 'string' ? args.shift() : type), 'background-color: ' + colors[type] + '; color: white; padding: 2px 4px; border-radius: 2px', args];
  };

  var Log = {
    info() {
      Settings.get('platform', 'log') && console.log.apply(console, prepLog('Info', arguments));
    },

    debug() {
      Settings.get('platform', 'log') && console.debug.apply(console, prepLog('Debug', arguments));
    },

    error() {
      Settings.get('platform', 'log') && console.error.apply(console, prepLog('Error', arguments));
    },

    warn() {
      Settings.get('platform', 'log') && console.warn.apply(console, prepLog('Warn', arguments));
    }

  };

  var executeAsPromise = (function (method) {
    let args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    let context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    let result;

    if (method && typeof method === 'function') {
      try {
        result = method.apply(context, args);
      } catch (e) {
        result = e;
      }
    } else {
      result = method;
    } // if it looks like a duck .. ehm ... promise and talks like a promise, let's assume it's a promise


    if (result !== null && typeof result === 'object' && result.then && typeof result.then === 'function') {
      return result;
    } // otherwise make it into a promise
    else {
      return new Promise((resolve, reject) => {
        if (result instanceof Error) {
          reject(result);
        } else {
          resolve(result);
        }
      });
    }
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */

  let sendMetric = (type, event, params) => {
    Log.info('Sending metric', type, event, params);
  };

  const initMetrics = config => {
    sendMetric = config.sendMetric;
  }; // available metric per category

  const metrics$1 = {
    app: ['launch', 'loaded', 'ready', 'close'],
    page: ['view', 'leave'],
    user: ['click', 'input'],
    media: ['abort', 'canplay', 'ended', 'pause', 'play', // with some videos there occur almost constant suspend events ... should investigate
    // 'suspend',
    'volumechange', 'waiting', 'seeking', 'seeked']
  }; // error metric function (added to each category)

  const errorMetric = function (type, message, code, visible) {
    let params = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    params = {
      params,
      ...{
        message,
        code,
        visible
      }
    };
    sendMetric(type, 'error', params);
  };

  const Metric = function (type, events) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    return events.reduce((obj, event) => {
      obj[event] = function (name) {
        let params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        params = { ...options,
          ...(name ? {
            name
          } : {}),
          ...params
        };
        sendMetric(type, event, params);
      };

      return obj;
    }, {
      error(message, code, params) {
        errorMetric(type, message, code, params);
      },

      event(name, params) {
        sendMetric(type, name, params);
      }

    });
  };

  const Metrics = types => {
    return Object.keys(types).reduce((obj, type) => {
      // media metric works a bit different!
      // it's a function that accepts a url and returns an object with the available metrics
      // url is automatically passed as a param in every metric
      type === 'media' ? obj[type] = url => Metric(type, types[type], {
        url
      }) : obj[type] = Metric(type, types[type]);
      return obj;
    }, {
      error: errorMetric,
      event: sendMetric
    });
  };

  var Metrics$1 = Metrics(metrics$1);

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  var events$1 = {
    abort: 'Abort',
    canplay: 'CanPlay',
    canplaythrough: 'CanPlayThrough',
    durationchange: 'DurationChange',
    emptied: 'Emptied',
    encrypted: 'Encrypted',
    ended: 'Ended',
    error: 'Error',
    interruptbegin: 'InterruptBegin',
    interruptend: 'InterruptEnd',
    loadeddata: 'LoadedData',
    loadedmetadata: 'LoadedMetadata',
    loadstart: 'LoadStart',
    pause: 'Pause',
    play: 'Play',
    playing: 'Playing',
    progress: 'Progress',
    ratechange: 'Ratechange',
    seeked: 'Seeked',
    seeking: 'Seeking',
    stalled: 'Stalled',
    // suspend: 'Suspend', // this one is called a looooot for some videos
    timeupdate: 'TimeUpdate',
    volumechange: 'VolumeChange',
    waiting: 'Waiting'
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  var autoSetupMixin = (function (sourceObject) {
    let setup = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : () => {};
    let ready = false;

    const doSetup = () => {
      if (ready === false) {
        setup();
        ready = true;
      }
    };

    return Object.keys(sourceObject).reduce((obj, key) => {
      if (typeof sourceObject[key] === 'function') {
        obj[key] = function () {
          doSetup();
          return sourceObject[key].apply(sourceObject, arguments);
        };
      } else if (typeof Object.getOwnPropertyDescriptor(sourceObject, key).get === 'function') {
        obj.__defineGetter__(key, function () {
          doSetup();
          return Object.getOwnPropertyDescriptor(sourceObject, key).get.apply(sourceObject);
        });
      } else if (typeof Object.getOwnPropertyDescriptor(sourceObject, key).set === 'function') {
        obj.__defineSetter__(key, function () {
          doSetup();
          return Object.getOwnPropertyDescriptor(sourceObject, key).set.sourceObject[key].apply(sourceObject, arguments);
        });
      } else {
        obj[key] = sourceObject[key];
      }

      return obj;
    }, {});
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  let timeout$1 = null;
  var easeExecution = ((cb, delay) => {
    clearTimeout(timeout$1);
    timeout$1 = setTimeout(() => {
      cb();
    }, delay);
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  let basePath;
  let proxyUrl;
  const initUtils = config => {
    basePath = ensureUrlWithProtocol(makeFullStaticPath(window.location.pathname, config.path || '/'));

    if (config.proxyUrl) {
      proxyUrl = ensureUrlWithProtocol(config.proxyUrl);
    }
  };
  var Utils = {
    asset(relPath) {
      return basePath + relPath;
    },

    proxyUrl(url) {
      let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return proxyUrl ? proxyUrl + '?' + makeQueryString(url, options) : url;
    },

    makeQueryString() {
      return makeQueryString(...arguments);
    },

    // since imageworkers don't work without protocol
    ensureUrlWithProtocol() {
      return ensureUrlWithProtocol(...arguments);
    }

  };
  const ensureUrlWithProtocol = url => {
    if (/^\/\//.test(url)) {
      return window.location.protocol + url;
    }

    if (!/^(?:https?:)/i.test(url)) {
      return window.location.origin + url;
    }

    return url;
  };
  const makeFullStaticPath = function () {
    let pathname = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';
    let path = arguments.length > 1 ? arguments[1] : undefined;
    // ensure path has traling slash
    path = path.charAt(path.length - 1) !== '/' ? path + '/' : path; // if path is URL, we assume it's already the full static path, so we just return it

    if (/^(?:https?:)?(?:\/\/)/.test(path)) {
      return path;
    }

    if (path.charAt(0) === '/') {
      return path;
    } else {
      // cleanup the pathname (i.e. remove possible index.html)
      pathname = cleanUpPathName(pathname); // remove possible leading dot from path

      path = path.charAt(0) === '.' ? path.substr(1) : path; // ensure path has leading slash

      path = path.charAt(0) !== '/' ? '/' + path : path;
      return pathname + path;
    }
  };
  const cleanUpPathName = pathname => {
    if (pathname.slice(-1) === '/') return pathname.slice(0, -1);
    const parts = pathname.split('/');
    if (parts[parts.length - 1].indexOf('.') > -1) parts.pop();
    return parts.join('/');
  };

  const makeQueryString = function (url) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'url';
    // add operator as an option
    options.operator = 'metrological'; // Todo: make this configurable (via url?)
    // add type (= url or qr) as an option, with url as the value

    options[type] = url;
    return Object.keys(options).map(key => {
      return encodeURIComponent(key) + '=' + encodeURIComponent('' + options[key]);
    }).join('&');
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */

  const initProfile = config => {
    config.getInfo;
    config.setInfo;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  var lng$1 = window.lng;

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  const events = ['timeupdate', 'error', 'ended', 'loadeddata', 'canplay', 'play', 'playing', 'pause', 'loadstart', 'seeking', 'seeked', 'encrypted'];

  let mediaUrl$1 = url => url;

  const initMediaPlayer = config => {
    if (config.mediaUrl) {
      mediaUrl$1 = config.mediaUrl;
    }
  };
  class Mediaplayer extends lng$1.Component {
    _construct() {
      this._skipRenderToTexture = false;
      this._metrics = null;
      this._textureMode = Settings.get('platform', 'textureMode') || false;
      Log.info('Texture mode: ' + this._textureMode);
      console.warn(["The 'MediaPlayer'-plugin in the Lightning-SDK is deprecated and will be removed in future releases.", "Please consider using the new 'VideoPlayer'-plugin instead.", 'https://rdkcentral.github.io/Lightning-SDK/#/plugins/videoplayer'].join('\n\n'));
    }

    static _template() {
      return {
        Video: {
          VideoWrap: {
            VideoTexture: {
              visible: false,
              pivot: 0.5,
              texture: {
                type: lng$1.textures.StaticTexture,
                options: {}
              }
            }
          }
        }
      };
    }

    set skipRenderToTexture(v) {
      this._skipRenderToTexture = v;
    }

    get textureMode() {
      return this._textureMode;
    }

    get videoView() {
      return this.tag('Video');
    }

    _init() {
      //re-use videotag if already there
      const videoEls = document.getElementsByTagName('video');
      if (videoEls && videoEls.length > 0) this.videoEl = videoEls[0];else {
        this.videoEl = document.createElement('video');
        this.videoEl.setAttribute('id', 'video-player');
        this.videoEl.style.position = 'absolute';
        this.videoEl.style.zIndex = '1';
        this.videoEl.style.display = 'none';
        this.videoEl.setAttribute('width', '100%');
        this.videoEl.setAttribute('height', '100%');
        this.videoEl.style.visibility = this.textureMode ? 'hidden' : 'visible';
        document.body.appendChild(this.videoEl);
      }

      if (this.textureMode && !this._skipRenderToTexture) {
        this._createVideoTexture();
      }

      this.eventHandlers = [];
    }

    _registerListeners() {
      events.forEach(event => {
        const handler = e => {
          if (this._metrics && this._metrics[event] && typeof this._metrics[event] === 'function') {
            this._metrics[event]({
              currentTime: this.videoEl.currentTime
            });
          }

          this.fire(event, {
            videoElement: this.videoEl,
            event: e
          });
        };

        this.eventHandlers.push(handler);
        this.videoEl.addEventListener(event, handler);
      });
    }

    _deregisterListeners() {
      Log.info('Deregistering event listeners MediaPlayer');
      events.forEach((event, index) => {
        this.videoEl.removeEventListener(event, this.eventHandlers[index]);
      });
      this.eventHandlers = [];
    }

    _attach() {
      this._registerListeners();
    }

    _detach() {
      this._deregisterListeners();

      this.close();
    }

    _createVideoTexture() {
      const stage = this.stage;
      const gl = stage.gl;
      const glTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, glTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.videoTexture.options = {
        source: glTexture,
        w: this.videoEl.width,
        h: this.videoEl.height
      };
    }

    _startUpdatingVideoTexture() {
      if (this.textureMode && !this._skipRenderToTexture) {
        const stage = this.stage;

        if (!this._updateVideoTexture) {
          this._updateVideoTexture = () => {
            if (this.videoTexture.options.source && this.videoEl.videoWidth && this.active) {
              const gl = stage.gl;
              const currentTime = new Date().getTime(); // When BR2_PACKAGE_GST1_PLUGINS_BAD_PLUGIN_DEBUGUTILS is not set in WPE, webkitDecodedFrameCount will not be available.
              // We'll fallback to fixed 30fps in this case.

              const frameCount = this.videoEl.webkitDecodedFrameCount;
              const mustUpdate = frameCount ? this._lastFrame !== frameCount : this._lastTime < currentTime - 30;

              if (mustUpdate) {
                this._lastTime = currentTime;
                this._lastFrame = frameCount;

                try {
                  gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
                  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.videoEl);
                  this._lastFrame = this.videoEl.webkitDecodedFrameCount;
                  this.videoTextureView.visible = true;
                  this.videoTexture.options.w = this.videoEl.videoWidth;
                  this.videoTexture.options.h = this.videoEl.videoHeight;
                  const expectedAspectRatio = this.videoTextureView.w / this.videoTextureView.h;
                  const realAspectRatio = this.videoEl.videoWidth / this.videoEl.videoHeight;

                  if (expectedAspectRatio > realAspectRatio) {
                    this.videoTextureView.scaleX = realAspectRatio / expectedAspectRatio;
                    this.videoTextureView.scaleY = 1;
                  } else {
                    this.videoTextureView.scaleY = expectedAspectRatio / realAspectRatio;
                    this.videoTextureView.scaleX = 1;
                  }
                } catch (e) {
                  Log.error('texImage2d video', e);

                  this._stopUpdatingVideoTexture();

                  this.videoTextureView.visible = false;
                }

                this.videoTexture.source.forceRenderUpdate();
              }
            }
          };
        }

        if (!this._updatingVideoTexture) {
          stage.on('frameStart', this._updateVideoTexture);
          this._updatingVideoTexture = true;
        }
      }
    }

    _stopUpdatingVideoTexture() {
      if (this.textureMode) {
        const stage = this.stage;
        stage.removeListener('frameStart', this._updateVideoTexture);
        this._updatingVideoTexture = false;
        this.videoTextureView.visible = false;

        if (this.videoTexture.options.source) {
          const gl = stage.gl;
          gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
          gl.clearColor(0, 0, 0, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
      }
    }

    updateSettings() {
      let settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      // The Component that 'consumes' the media player.
      this._consumer = settings.consumer;

      if (this._consumer && this._consumer.getMediaplayerSettings) {
        // Allow consumer to add settings.
        settings = Object.assign(settings, this._consumer.getMediaplayerSettings());
      }

      if (!lng$1.Utils.equalValues(this._stream, settings.stream)) {
        if (settings.stream && settings.stream.keySystem) {
          navigator.requestMediaKeySystemAccess(settings.stream.keySystem.id, settings.stream.keySystem.config).then(keySystemAccess => {
            return keySystemAccess.createMediaKeys();
          }).then(createdMediaKeys => {
            return this.videoEl.setMediaKeys(createdMediaKeys);
          }).then(() => {
            if (settings.stream && settings.stream.src) this.open(settings.stream.src);
          }).catch(() => {
            console.error('Failed to set up MediaKeys');
          });
        } else if (settings.stream && settings.stream.src) {
          // This is here to be backwards compatible, will be removed
          // in future sdk release
          if (Settings.get('app', 'hls')) {
            if (!window.Hls) {
              window.Hls = class Hls {
                static isSupported() {
                  console.warn('hls-light not included');
                  return false;
                }

              };
            }

            if (window.Hls.isSupported()) {
              if (!this._hls) this._hls = new window.Hls({
                liveDurationInfinity: true
              });

              this._hls.loadSource(settings.stream.src);

              this._hls.attachMedia(this.videoEl);

              this.videoEl.style.display = 'block';
            }
          } else {
            this.open(settings.stream.src);
          }
        } else {
          this.close();
        }

        this._stream = settings.stream;
      }

      this._setHide(settings.hide);

      this._setVideoArea(settings.videoPos);
    }

    _setHide(hide) {
      if (this.textureMode) {
        this.tag('Video').setSmooth('alpha', hide ? 0 : 1);
      } else {
        this.videoEl.style.visibility = hide ? 'hidden' : 'visible';
      }
    }

    open(url) {
      let settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        hide: false,
        videoPosition: null
      };
      // prep the media url to play depending on platform (mediaPlayerplugin)
      url = mediaUrl$1(url);
      this._metrics = Metrics$1.media(url);
      Log.info('Playing stream', url);

      if (this.application.noVideo) {
        Log.info('noVideo option set, so ignoring: ' + url);
        return;
      } // close the video when opening same url as current (effectively reloading)


      if (this.videoEl.getAttribute('src') === url) {
        this.close();
      }

      this.videoEl.setAttribute('src', url); // force hide, then force show (in next tick!)
      // (fixes comcast playback rollover issue)

      this.videoEl.style.visibility = 'hidden';
      this.videoEl.style.display = 'none';
      setTimeout(() => {
        this.videoEl.style.display = 'block';
        this.videoEl.style.visibility = 'visible';
      });

      this._setHide(settings.hide);

      this._setVideoArea(settings.videoPosition || [0, 0, 1920, 1080]);
    }

    close() {
      // We need to pause first in order to stop sound.
      this.videoEl.pause();
      this.videoEl.removeAttribute('src'); // force load to reset everything without errors

      this.videoEl.load();

      this._clearSrc();

      this.videoEl.style.display = 'none';
    }

    playPause() {
      if (this.isPlaying()) {
        this.doPause();
      } else {
        this.doPlay();
      }
    }

    get muted() {
      return this.videoEl.muted;
    }

    set muted(v) {
      this.videoEl.muted = v;
    }

    get loop() {
      return this.videoEl.loop;
    }

    set loop(v) {
      this.videoEl.loop = v;
    }

    isPlaying() {
      return this._getState() === 'Playing';
    }

    doPlay() {
      this.videoEl.play();
    }

    doPause() {
      this.videoEl.pause();
    }

    reload() {
      var url = this.videoEl.getAttribute('src');
      this.close();
      this.videoEl.src = url;
    }

    getPosition() {
      return Promise.resolve(this.videoEl.currentTime);
    }

    setPosition(pos) {
      this.videoEl.currentTime = pos;
    }

    getDuration() {
      return Promise.resolve(this.videoEl.duration);
    }

    seek(time) {
      let absolute = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (absolute) {
        this.videoEl.currentTime = time;
      } else {
        this.videoEl.currentTime += time;
      }
    }

    get videoTextureView() {
      return this.tag('Video').tag('VideoTexture');
    }

    get videoTexture() {
      return this.videoTextureView.texture;
    }

    _setVideoArea(videoPos) {
      if (lng$1.Utils.equalValues(this._videoPos, videoPos)) {
        return;
      }

      this._videoPos = videoPos;

      if (this.textureMode) {
        this.videoTextureView.patch({
          smooth: {
            x: videoPos[0],
            y: videoPos[1],
            w: videoPos[2] - videoPos[0],
            h: videoPos[3] - videoPos[1]
          }
        });
      } else {
        const precision = this.stage.getRenderPrecision();
        this.videoEl.style.left = Math.round(videoPos[0] * precision) + 'px';
        this.videoEl.style.top = Math.round(videoPos[1] * precision) + 'px';
        this.videoEl.style.width = Math.round((videoPos[2] - videoPos[0]) * precision) + 'px';
        this.videoEl.style.height = Math.round((videoPos[3] - videoPos[1]) * precision) + 'px';
      }
    }

    _fireConsumer(event, args) {
      if (this._consumer) {
        this._consumer.fire(event, args);
      }
    }

    _equalInitData(buf1, buf2) {
      if (!buf1 || !buf2) return false;
      if (buf1.byteLength != buf2.byteLength) return false;
      const dv1 = new Int8Array(buf1);
      const dv2 = new Int8Array(buf2);

      for (let i = 0; i != buf1.byteLength; i++) if (dv1[i] != dv2[i]) return false;

      return true;
    }

    error(args) {
      this._fireConsumer('$mediaplayerError', args);

      this._setState('');

      return '';
    }

    loadeddata(args) {
      this._fireConsumer('$mediaplayerLoadedData', args);
    }

    play(args) {
      this._fireConsumer('$mediaplayerPlay', args);
    }

    playing(args) {
      this._fireConsumer('$mediaplayerPlaying', args);

      this._setState('Playing');
    }

    canplay(args) {
      this.videoEl.play();

      this._fireConsumer('$mediaplayerStart', args);
    }

    loadstart(args) {
      this._fireConsumer('$mediaplayerLoad', args);
    }

    seeked() {
      this._fireConsumer('$mediaplayerSeeked', {
        currentTime: this.videoEl.currentTime,
        duration: this.videoEl.duration || 1
      });
    }

    seeking() {
      this._fireConsumer('$mediaplayerSeeking', {
        currentTime: this.videoEl.currentTime,
        duration: this.videoEl.duration || 1
      });
    }

    durationchange(args) {
      this._fireConsumer('$mediaplayerDurationChange', args);
    }

    encrypted(args) {
      const video = args.videoElement;
      const event = args.event; // FIXME: Double encrypted events need to be properly filtered by Gstreamer

      if (video.mediaKeys && !this._equalInitData(this._previousInitData, event.initData)) {
        this._previousInitData = event.initData;

        this._fireConsumer('$mediaplayerEncrypted', args);
      }
    }

    static _states() {
      return [class Playing extends this {
        $enter() {
          this._startUpdatingVideoTexture();
        }

        $exit() {
          this._stopUpdatingVideoTexture();
        }

        timeupdate() {
          this._fireConsumer('$mediaplayerProgress', {
            currentTime: this.videoEl.currentTime,
            duration: this.videoEl.duration || 1
          });
        }

        ended(args) {
          this._fireConsumer('$mediaplayerEnded', args);

          this._setState('');
        }

        pause(args) {
          this._fireConsumer('$mediaplayerPause', args);

          this._setState('Playing.Paused');
        }

        _clearSrc() {
          this._fireConsumer('$mediaplayerStop', {});

          this._setState('');
        }

        static _states() {
          return [class Paused extends this {}];
        }

      }];
    }

  }

  class localCookie {
    constructor(e) {
      return e = e || {}, this.forceCookies = e.forceCookies || !1, !0 === this._checkIfLocalStorageWorks() && !0 !== e.forceCookies ? {
        getItem: this._getItemLocalStorage,
        setItem: this._setItemLocalStorage,
        removeItem: this._removeItemLocalStorage,
        clear: this._clearLocalStorage,
        keys: this._getLocalStorageKeys
      } : {
        getItem: this._getItemCookie,
        setItem: this._setItemCookie,
        removeItem: this._removeItemCookie,
        clear: this._clearCookies,
        keys: this._getCookieKeys
      };
    }

    _checkIfLocalStorageWorks() {
      if ("undefined" == typeof localStorage) return !1;

      try {
        return localStorage.setItem("feature_test", "yes"), "yes" === localStorage.getItem("feature_test") && (localStorage.removeItem("feature_test"), !0);
      } catch (e) {
        return !1;
      }
    }

    _getItemLocalStorage(e) {
      return window.localStorage.getItem(e);
    }

    _setItemLocalStorage(e, t) {
      return window.localStorage.setItem(e, t);
    }

    _removeItemLocalStorage(e) {
      return window.localStorage.removeItem(e);
    }

    _clearLocalStorage() {
      return window.localStorage.clear();
    }

    _getLocalStorageKeys() {
      return Object.keys(window.localStorage);
    }

    _getItemCookie(e) {
      var t = document.cookie.match(RegExp("(?:^|;\\s*)" + function (e) {
        return e.replace(/([.*+?\^${}()|\[\]\/\\])/g, "\\$1");
      }(e) + "=([^;]*)"));
      return t && "" === t[1] && (t[1] = null), t ? t[1] : null;
    }

    _setItemCookie(e, t) {
      var o = new Date(),
          r = new Date(o.getTime() + 15768e7);
      document.cookie = "".concat(e, "=").concat(t, "; expires=").concat(r.toUTCString(), ";");
    }

    _removeItemCookie(e) {
      document.cookie = "".concat(e, "=;Max-Age=-99999999;");
    }

    _clearCookies() {
      document.cookie.split(";").forEach(e => {
        document.cookie = e.replace(/^ +/, "").replace(/=.*/, "=;expires=Max-Age=-99999999");
      });
    }

    _getCookieKeys() {
      return document.cookie.split(";").map(e => e.split("=")[0]);
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  let namespace;
  let lc;
  const initStorage = () => {
    namespace = Settings.get('platform', 'id'); // todo: pass options (for example to force the use of cookies)

    lc = new localCookie();
  };

  const namespacedKey = key => namespace ? [namespace, key].join('.') : key;

  var Storage = {
    get(key) {
      try {
        return JSON.parse(lc.getItem(namespacedKey(key)));
      } catch (e) {
        return null;
      }
    },

    set(key, value) {
      try {
        lc.setItem(namespacedKey(key), JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    },

    remove(key) {
      lc.removeItem(namespacedKey(key));
    },

    clear() {
      if (namespace) {
        lc.keys().forEach(key => {
          // remove the item if in the namespace
          key.indexOf(namespace + '.') === 0 ? lc.removeItem(key) : null;
        });
      } else {
        lc.clear();
      }
    }

  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  const hasRegex = /\{\/(.*?)\/([igm]{0,3})\}/g;
  const isWildcard = /^[!*$]$/;
  const hasLookupId = /\/:\w+?@@([0-9]+?)@@/;
  const isNamedGroup = /^\/:/;
  /**
   * Test if a route is part regular expressed
   * and replace it for a simple character
   * @param route
   * @returns {*}
   */

  const stripRegex = function (route) {
    let char = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'R';

    // if route is part regular expressed we replace
    // the regular expression for a character to
    // simplify floor calculation and backtracking
    if (hasRegex.test(route)) {
      route = route.replace(hasRegex, char);
    }

    return route;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */

  /**
   * Create a local request register
   * @param flags
   * @returns {Map<any, any>}
   */
  const createRegister = flags => {
    const reg = new Map() // store user defined and router
    // defined flags in register
    ;
    [...Object.keys(flags), ...Object.getOwnPropertySymbols(flags)].forEach(key => {
      reg.set(key, flags[key]);
    });
    return reg;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  class Request {
    constructor() {
      let hash = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      let navArgs = arguments.length > 1 ? arguments[1] : undefined;
      let storeCaller = arguments.length > 2 ? arguments[2] : undefined;

      /**
       * Hash we navigate to
       * @type {string}
       * @private
       */
      this._hash = hash;
      /**
       * Do we store previous hash in history
       * @type {boolean}
       * @private
       */

      this._storeCaller = storeCaller;
      /**
       * Request and navigate data
       * @type {Map}
       * @private
       */

      this._register = new Map();
      /**
       * Flag if the instance is created due to
       * this request
       * @type {boolean}
       * @private
       */

      this._isCreated = false;
      /**
       * Flag if the instance is shared between
       * previous and current request
       * @type {boolean}
       * @private
       */

      this._isSharedInstance = false;
      /**
       * Flag if the request has been cancelled
       * @type {boolean}
       * @private
       */

      this._cancelled = false;
      /**
       * if instance is shared between requests we copy state object
       * from instance before the new request overrides state
       * @type {null}
       * @private
       */

      this._copiedHistoryState = null; // if there are arguments attached to navigate()
      // we store them in new request

      if (isObject(navArgs)) {
        this._register = createRegister(navArgs);
      } else if (isBoolean(navArgs)) {
        // if second navigate() argument is explicitly
        // set to false we prevent the calling page
        // from ending up in history
        this._storeCaller = navArgs;
      } // @todo: remove because we can simply check
      // ._storeCaller property


      this._register.set(symbols.store, this._storeCaller);
    }

    cancel() {
      Log.debug('[router]:', "cancelled ".concat(this._hash));
      this._cancelled = true;
    }

    get url() {
      return this._hash;
    }

    get register() {
      return this._register;
    }

    get hash() {
      return this._hash;
    }

    set hash(args) {
      this._hash = args;
    }

    get route() {
      return this._route;
    }

    set route(args) {
      this._route = args;
    }

    get provider() {
      return this._provider;
    }

    set provider(args) {
      this._provider = args;
    }

    get providerType() {
      return this._providerType;
    }

    set providerType(args) {
      this._providerType = args;
    }

    set page(args) {
      this._page = args;
    }

    get page() {
      return this._page;
    }

    set isCreated(args) {
      this._isCreated = args;
    }

    get isCreated() {
      return this._isCreated;
    }

    get isSharedInstance() {
      return this._isSharedInstance;
    }

    set isSharedInstance(args) {
      this._isSharedInstance = args;
    }

    get isCancelled() {
      return this._cancelled;
    }

    set copiedHistoryState(v) {
      this._copiedHistoryState = v;
    }

    get copiedHistoryState() {
      return this._copiedHistoryState;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  class Route {
    constructor() {
      let config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      // keep backwards compatible
      let type = ['on', 'before', 'after'].reduce((acc, type) => {
        return isFunction(config[type]) ? type : acc;
      }, undefined);
      this._cfg = config;

      if (type) {
        this._provider = {
          type,
          request: config[type]
        };
      }
    }

    get path() {
      return this._cfg.path;
    }

    get component() {
      return this._cfg.component;
    }

    get options() {
      return this._cfg.options;
    }

    get widgets() {
      return this._cfg.widgets;
    }

    get cache() {
      return this._cfg.cache;
    }

    get hook() {
      return this._cfg.hook;
    }

    get beforeNavigate() {
      return this._cfg.beforeNavigate;
    }

    get provider() {
      return this._provider;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  /**
   * Simple route length calculation
   * @param route {string}
   * @returns {number} - floor
   */

  const getFloor = route => {
    return stripRegex(route).split('/').length;
  };
  /**
   * return all stored routes that live on the same floor
   * @param floor
   * @returns {Array}
   */

  const getRoutesByFloor = floor => {
    const matches = []; // simple filter of level candidates

    for (let [route] of routes$1.entries()) {
      if (getFloor(route) === floor) {
        matches.push(route);
      }
    }

    return matches;
  };
  /**
   * return a matching route by provided hash
   * hash: home/browse/12 will match:
   * route: home/browse/:categoryId
   * @param hash {string}
   * @returns {boolean|{}} - route
   */


  const getRouteByHash = hash => {
    // @todo: clean up on handleHash
    hash = hash.replace(/^#/, '');
    const getUrlParts = /(\/?:?[^/]+)/g; // grab possible candidates from stored routes

    const candidates = getRoutesByFloor(getFloor(hash)); // break hash down in chunks

    const hashParts = hash.match(getUrlParts) || []; // to simplify the route matching and prevent look around
    // in our getUrlParts regex we get the regex part from
    // route candidate and store them so that we can reference
    // them when we perform the actual regex against hash

    let regexStore = [];
    let matches = candidates.filter(route => {
      let isMatching = true; // replace regex in route with lookup id => @@{storeId}@@

      if (hasRegex.test(route)) {
        const regMatches = route.match(hasRegex);

        if (regMatches && regMatches.length) {
          route = regMatches.reduce((fullRoute, regex) => {
            const lookupId = regexStore.length;
            fullRoute = fullRoute.replace(regex, "@@".concat(lookupId, "@@"));
            regexStore.push(regex.substring(1, regex.length - 1));
            return fullRoute;
          }, route);
        }
      }

      const routeParts = route.match(getUrlParts) || [];

      for (let i = 0, j = routeParts.length; i < j; i++) {
        const routePart = routeParts[i];
        const hashPart = hashParts[i]; // Since we support catch-all and regex driven name groups
        // we first test for regex lookup id and see if the regex
        // matches the value from the hash

        if (hasLookupId.test(routePart)) {
          const routeMatches = hasLookupId.exec(routePart);
          const storeId = routeMatches[1];
          const routeRegex = regexStore[storeId]; // split regex and modifiers so we can use both
          // to create a new RegExp
          // eslint-disable-next-line

          const regMatches = /\/([^\/]+)\/([igm]{0,3})/.exec(routeRegex);

          if (regMatches && regMatches.length) {
            const expression = regMatches[1];
            const modifiers = regMatches[2];
            const regex = new RegExp("^/".concat(expression, "$"), modifiers);

            if (!regex.test(hashPart)) {
              isMatching = false;
            }
          }
        } else if (isNamedGroup.test(routePart)) {
          // we kindly skip namedGroups because this is dynamic
          // we only need to the static and regex drive parts
          continue;
        } else if (hashPart && routePart.toLowerCase() !== hashPart.toLowerCase()) {
          isMatching = false;
        }
      }

      return isMatching;
    });

    if (matches.length) {
      if (matches.indexOf(hash) !== -1) {
        const match = matches[matches.indexOf(hash)];
        return routes$1.get(match);
      } else {
        // we give prio to static routes over dynamic
        matches = matches.sort(a => {
          return isNamedGroup.test(a) ? -1 : 1;
        }); // would be strange if this fails
        // but still we test

        if (routeExists(matches[0])) {
          return routes$1.get(matches[0]);
        }
      }
    }

    return false;
  };
  const getValuesFromHash = function () {
    let hash = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    let path = arguments.length > 1 ? arguments[1] : undefined;
    // replace the regex definition from the route because
    // we already did the matching part
    path = stripRegex(path, '');
    const getUrlParts = /(\/?:?[\w%\s:.-]+)/g;
    const hashParts = hash.match(getUrlParts) || [];
    const routeParts = path.match(getUrlParts) || [];
    const getNamedGroup = /^\/:([\w-]+)\/?/;
    return routeParts.reduce((storage, value, index) => {
      const match = getNamedGroup.exec(value);

      if (match && match.length) {
        storage.set(match[1], decodeURIComponent(hashParts[index].replace(/^\//, '')));
      }

      return storage;
    }, new Map());
  };
  const getOption = (stack, prop) => {
    // eslint-disable-next-line
    if (stack && stack.hasOwnProperty(prop)) {
      return stack[prop];
    } // we explicitly return undefined since we're testing
    // for explicit test values

  };
  /**
   * create and return new Route instance
   * @param config
   */

  const createRoute = config => {
    // we need to provide a bit of additional logic
    // for the bootComponent
    if (config.path === '$') {
      let options = {
        preventStorage: true
      };

      if (isObject(config.options)) {
        options = { ...config.options,
          ...options
        };
      }

      config.options = options; // if configured add reference to bootRequest
      // as router after provider

      if (bootRequest) {
        config.after = bootRequest;
      }
    }

    return new Route(config);
  };
  /**
   * Create a new Router request object
   * @param url
   * @param args
   * @param store
   * @returns {*}
   */

  const createRequest = (url, args, store) => {
    return new Request(url, args, store);
  };
  const getHashByName = obj => {
    if (!obj.to && !obj.name) {
      return false;
    }

    const route = getRouteByName(obj.to || obj.name);
    const hasDynamicGroup = /\/:([\w-]+)\/?/;
    let hash = route; // if route contains dynamic group
    // we replace them with the provided params

    if (hasDynamicGroup.test(route)) {
      if (obj.params) {
        const keys = Object.keys(obj.params);
        hash = keys.reduce((acc, key) => {
          return acc.replace(":".concat(key), obj.params[key]);
        }, route);
      }

      if (obj.query) {
        return "".concat(hash).concat(objectToQueryString(obj.query));
      }
    }

    return hash;
  };

  const getRouteByName = name => {
    for (let [path, route] of routes$1.entries()) {
      if (route.name === name) {
        return path;
      }
    }

    return false;
  };

  const keepActivePageAlive = (route, request) => {
    if (isString(route)) {
      const routes = getRoutes();

      if (routes.has(route)) {
        route = routes.get(route);
      } else {
        return false;
      }
    }

    const register = request.register;
    const routeOptions = route.options;

    if (register.has('keepAlive')) {
      return register.get('keepAlive');
    } else if (routeOptions && routeOptions.keepAlive) {
      return routeOptions.keepAlive;
    }

    return false;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  var emit$1 = (function (page) {
    let events = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!isArray(events)) {
      events = [events];
    }

    events.forEach(e => {
      const event = "_on".concat(ucfirst(e));

      if (isFunction(page[event])) {
        page[event](params);
      }
    });
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  let activeWidget = null;
  const getReferences = () => {
    if (!widgetsHost) {
      return;
    }

    return widgetsHost.get().reduce((storage, widget) => {
      const key = widget.ref.toLowerCase();
      storage[key] = widget;
      return storage;
    }, {});
  };
  /**
   * update the visibility of the available widgets
   * for the current page / route
   * @param page
   */

  const updateWidgets = (widgets, page) => {
    // force lowercase lookup
    const configured = (widgets || []).map(ref => ref.toLowerCase());
    widgetsHost.forEach(widget => {
      widget.visible = configured.indexOf(widget.ref.toLowerCase()) !== -1;

      if (widget.visible) {
        emit$1(widget, ['activated'], page);
      }
    });

    if (app.state === 'Widgets' && activeWidget && !activeWidget.visible) {
      app._setState('');
    }
  };

  const getWidgetByName = name => {
    name = ucfirst(name);
    return widgetsHost.getByRef(name) || false;
  };
  /**
   * delegate app focus to a on-screen widget
   * @param name - {string}
   */


  const focusWidget = name => {
    const widget = getWidgetByName(name);

    if (widget) {
      setActiveWidget(widget); // if app is already in 'Widgets' state we can assume that
      // focus has been delegated from one widget to another so
      // we need to set the new widget reference and trigger a
      // new focus calculation of Lightning's focuspath

      if (app.state === 'Widgets') {
        app.reload(activeWidget);
      } else {
        app._setState('Widgets', [activeWidget]);
      }
    }
  };
  const restoreFocus = () => {
    activeWidget = null;

    app._setState('');
  };
  const getActiveWidget = () => {
    return activeWidget;
  };
  const setActiveWidget = instance => {
    activeWidget = instance;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  const createComponent = (stage, type) => {
    return stage.c({
      type,
      visible: false,
      widgets: getReferences()
    });
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  /**
   * Simple flat array that holds the visited hashes + state Object
   * so the router can navigate back to them
   * @type {Array}
   */

  let history = [];
  const updateHistory = request => {
    const hash = getActiveHash();

    if (!hash) {
      return;
    } // navigate storage flag


    const register = request.register;
    const forceNavigateStore = register.get(symbols.store); // test preventStorage on route configuration

    const activeRoute = getRouteByHash(hash);
    const preventStorage = getOption(activeRoute.options, 'preventStorage'); // we give prio to navigate storage flag

    let store = isBoolean(forceNavigateStore) ? forceNavigateStore : !preventStorage;

    if (store) {
      const toStore = hash.replace(/^\//, '');
      const location = locationInHistory(toStore);
      const stateObject = getStateObject(getActivePage(), request);
      const routerConfig = getRouterConfig(); // store hash if it's not a part of history or flag for
      // storage of same hash is true

      if (location === -1 || routerConfig.get('storeSameHash')) {
        history.push({
          hash: toStore,
          state: stateObject
        });
      } else {
        // if we visit the same route we want to sync history
        const prev = history.splice(location, 1)[0];
        history.push({
          hash: prev.hash,
          state: stateObject
        });
      }
    }
  };

  const locationInHistory = hash => {
    for (let i = 0; i < history.length; i++) {
      if (history[i].hash === hash) {
        return i;
      }
    }

    return -1;
  };

  const getHistoryState = hash => {
    let state = null;

    if (history.length) {
      // if no hash is provided we get the last
      // pushed history record
      if (!hash) {
        const record = history[history.length - 1]; // could be null

        state = record.state;
      } else {
        if (locationInHistory(hash) !== -1) {
          const record = history[locationInHistory(hash)];
          state = record.state;
        }
      }
    }

    return state;
  };
  const replaceHistoryState = function () {
    let state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    let hash = arguments.length > 1 ? arguments[1] : undefined;

    if (!history.length) {
      return;
    }

    const location = hash ? locationInHistory(hash) : history.length - 1;

    if (location !== -1 && isObject(state)) {
      history[location].state = state;
    }
  };

  const getStateObject = (page, request) => {
    // if the new request shared instance with the
    // previous request we used the copied state object
    if (request.isSharedInstance) {
      if (request.copiedHistoryState) {
        return request.copiedHistoryState;
      }
    } else if (page && isFunction(page.historyState)) {
      return page.historyState();
    }

    return null;
  };

  const getHistory = () => {
    return history.slice(0);
  };
  const setHistory = function () {
    let arr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    if (isArray(arr)) {
      history = arr;
    }
  };

  var isMergeableObject = function isMergeableObject(value) {
    return isNonNullObject(value) && !isSpecial(value);
  };

  function isNonNullObject(value) {
    return !!value && typeof value === 'object';
  }

  function isSpecial(value) {
    var stringValue = Object.prototype.toString.call(value);
    return stringValue === '[object RegExp]' || stringValue === '[object Date]' || isReactElement(value);
  } // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25


  var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
  var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

  function isReactElement(value) {
    return value.$$typeof === REACT_ELEMENT_TYPE;
  }

  function emptyTarget(val) {
    return Array.isArray(val) ? [] : {};
  }

  function cloneUnlessOtherwiseSpecified(value, options) {
    return options.clone !== false && options.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
  }

  function defaultArrayMerge(target, source, options) {
    return target.concat(source).map(function (element) {
      return cloneUnlessOtherwiseSpecified(element, options);
    });
  }

  function getMergeFunction(key, options) {
    if (!options.customMerge) {
      return deepmerge;
    }

    var customMerge = options.customMerge(key);
    return typeof customMerge === 'function' ? customMerge : deepmerge;
  }

  function getEnumerableOwnPropertySymbols(target) {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(function (symbol) {
      return target.propertyIsEnumerable(symbol);
    }) : [];
  }

  function getKeys(target) {
    return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
  }

  function propertyIsOnObject(object, property) {
    try {
      return property in object;
    } catch (_) {
      return false;
    }
  } // Protects from prototype poisoning and unexpected merging up the prototype chain.


  function propertyIsUnsafe(target, key) {
    return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
    && !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
    && Object.propertyIsEnumerable.call(target, key)); // and also unsafe if they're nonenumerable.
  }

  function mergeObject(target, source, options) {
    var destination = {};

    if (options.isMergeableObject(target)) {
      getKeys(target).forEach(function (key) {
        destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
      });
    }

    getKeys(source).forEach(function (key) {
      if (propertyIsUnsafe(target, key)) {
        return;
      }

      if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
        destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
      } else {
        destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
      }
    });
    return destination;
  }

  function deepmerge(target, source, options) {
    options = options || {};
    options.arrayMerge = options.arrayMerge || defaultArrayMerge;
    options.isMergeableObject = options.isMergeableObject || isMergeableObject; // cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
    // implementations can use it. The caller may not replace it.

    options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
    var sourceIsArray = Array.isArray(source);
    var targetIsArray = Array.isArray(target);
    var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

    if (!sourceAndTargetTypesMatch) {
      return cloneUnlessOtherwiseSpecified(source, options);
    } else if (sourceIsArray) {
      return options.arrayMerge(target, source, options);
    } else {
      return mergeObject(target, source, options);
    }
  }

  deepmerge.all = function deepmergeAll(array, options) {
    if (!Array.isArray(array)) {
      throw new Error('first argument should be an array');
    }

    return array.reduce(function (prev, next) {
      return deepmerge(prev, next, options);
    }, {});
  };

  var deepmerge_1 = deepmerge;
  var cjs = deepmerge_1;

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  let warned = false;

  const deprecated = function () {
    let force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    if (force === true || warned === false) {
      console.warn(["The 'Locale'-plugin in the Lightning-SDK is deprecated and will be removed in future releases.", "Please consider using the new 'Language'-plugin instead.", 'https://rdkcentral.github.io/Lightning-SDK/#/plugins/language'].join('\n\n'));
    }

    warned = true;
  };

  class Locale {
    constructor() {
      this.__enabled = false;
    }
    /**
     * Loads translation object from external json file.
     *
     * @param {String} path Path to resource.
     * @return {Promise}
     */


    async load(path) {
      if (!this.__enabled) {
        return;
      }

      await fetch(path).then(resp => resp.json()).then(resp => {
        this.loadFromObject(resp);
      });
    }
    /**
     * Sets language used by module.
     *
     * @param {String} lang
     */


    setLanguage(lang) {
      deprecated();
      this.__enabled = true;
      this.language = lang;
    }
    /**
     * Returns reference to translation object for current language.
     *
     * @return {Object}
     */


    get tr() {
      deprecated(true);
      return this.__trObj[this.language];
    }
    /**
     * Loads translation object from existing object (binds existing object).
     *
     * @param {Object} trObj
     */


    loadFromObject(trObj) {
      deprecated();
      const fallbackLanguage = 'en';

      if (Object.keys(trObj).indexOf(this.language) === -1) {
        Log.warn('No translations found for: ' + this.language);

        if (Object.keys(trObj).indexOf(fallbackLanguage) > -1) {
          Log.warn('Using fallback language: ' + fallbackLanguage);
          this.language = fallbackLanguage;
        } else {
          const error = 'No translations found for fallback language: ' + fallbackLanguage;
          Log.error(error);
          throw Error(error);
        }
      }

      this.__trObj = trObj;

      for (const lang of Object.values(this.__trObj)) {
        for (const str of Object.keys(lang)) {
          lang[str] = new LocalizedString(lang[str]);
        }
      }
    }

  }
  /**
   * Extended string class used for localization.
   */


  class LocalizedString extends String {
    /**
     * Returns formatted LocalizedString.
     * Replaces each placeholder value (e.g. {0}, {1}) with corresponding argument.
     *
     * E.g.:
     * > new LocalizedString('{0} and {1} and {0}').format('A', 'B');
     * A and B and A
     *
     * @param  {...any} args List of arguments for placeholders.
     */
    format() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      const sub = args.reduce((string, arg, index) => string.split("{".concat(index, "}")).join(arg), this);
      return new LocalizedString(sub);
    }

  }

  var Locale$1 = new Locale();

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  class VersionLabel extends lng$1.Component {
    static _template() {
      return {
        rect: true,
        color: 0xbb0078ac,
        h: 40,
        w: 100,
        x: w => w - 50,
        y: h => h - 50,
        mount: 1,
        Text: {
          w: w => w,
          h: h => h,
          y: 5,
          x: 20,
          text: {
            fontSize: 22,
            lineHeight: 26
          }
        }
      };
    }

    _firstActive() {
      this.tag('Text').text = "APP - v".concat(this.version, "\nSDK - v").concat(this.sdkVersion);
      this.tag('Text').loadTexture();
      this.w = this.tag('Text').renderWidth + 40;
      this.h = this.tag('Text').renderHeight + 5;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  class FpsIndicator extends lng$1.Component {
    static _template() {
      return {
        rect: true,
        color: 0xffffffff,
        texture: lng$1.Tools.getRoundRect(80, 80, 40),
        h: 80,
        w: 80,
        x: 100,
        y: 100,
        mount: 1,
        Background: {
          x: 3,
          y: 3,
          texture: lng$1.Tools.getRoundRect(72, 72, 36),
          color: 0xff008000
        },
        Counter: {
          w: w => w,
          h: h => h,
          y: 10,
          text: {
            fontSize: 32,
            textAlign: 'center'
          }
        },
        Text: {
          w: w => w,
          h: h => h,
          y: 48,
          text: {
            fontSize: 15,
            textAlign: 'center',
            text: 'FPS'
          }
        }
      };
    }

    _setup() {
      this.config = { ...{
          log: false,
          interval: 500,
          threshold: 1
        },
        ...Settings.get('platform', 'showFps')
      };
      this.fps = 0;
      this.lastFps = this.fps - this.config.threshold;

      const fpsCalculator = () => {
        this.fps = ~~(1 / this.stage.dt);
      };

      this.stage.on('frameStart', fpsCalculator);
      this.stage.off('framestart', fpsCalculator);
      this.interval = setInterval(this.showFps.bind(this), this.config.interval);
    }

    _firstActive() {
      this.showFps();
    }

    _detach() {
      clearInterval(this.interval);
    }

    showFps() {
      if (Math.abs(this.lastFps - this.fps) <= this.config.threshold) return;
      this.lastFps = this.fps; // green

      let bgColor = 0xff008000; // orange

      if (this.fps <= 40 && this.fps > 20) bgColor = 0xffffa500; // red
      else if (this.fps <= 20) bgColor = 0xffff0000;
      this.tag('Background').setSmooth('color', bgColor);
      this.tag('Counter').text = "".concat(this.fps);
      this.config.log && Log.info('FPS', this.fps);
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  let meta = {};
  let translations = {};
  let language$1 = null;
  let dictionary = null;
  const initLanguage = function (file) {
    let language = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    return new Promise((resolve, reject) => {
      fetch(file).then(response => response.json()).then(json => {
        setTranslations(json); // set language (directly or in a promise)

        typeof language === 'object' && 'then' in language && typeof language.then === 'function' ? language.then(lang => setLanguage(lang).then(resolve).catch(reject)).catch(e => {
          Log.error(e);
          reject(e);
        }) : setLanguage(language).then(resolve).catch(reject);
      }).catch(() => {
        const error = 'Language file ' + file + ' not found';
        Log.error(error);
        reject(error);
      });
    });
  };

  const setTranslations = obj => {
    if ('meta' in obj) {
      meta = { ...obj.meta
      };
      delete obj.meta;
    }

    translations = obj;
  };

  const getLanguage = () => {
    return language$1;
  };

  const setLanguage = lng => {
    language$1 = null;
    dictionary = null;
    return new Promise((resolve, reject) => {
      if (lng in translations) {
        language$1 = lng;
      } else {
        if ('map' in meta && lng in meta.map && meta.map[lng] in translations) {
          language$1 = meta.map[lng];
        } else if ('default' in meta && meta.default in translations) {
          const error = 'Translations for Language ' + language$1 + ' not found. Using default language ' + meta.default;
          Log.warn(error);
          language$1 = meta.default;
        } else {
          const error = 'Translations for Language ' + language$1 + ' not found.';
          Log.error(error);
          reject(error);
        }
      }

      if (language$1) {
        Log.info('Setting language to', language$1);
        const translationsObj = translations[language$1];

        if (typeof translationsObj === 'object') {
          dictionary = translationsObj;
          resolve();
        } else if (typeof translationsObj === 'string') {
          const url = Utils.asset(translationsObj);
          fetch(url).then(response => response.json()).then(json => {
            // save the translations for this language (to prevent loading twice)
            translations[language$1] = json;
            dictionary = json;
            resolve();
          }).catch(e => {
            const error = 'Error while fetching ' + url;
            Log.error(error, e);
            reject(error);
          });
        }
      }
    });
  };

  var Language = {
    translate(key) {
      let replacements = [...arguments].slice(1); // no replacements so just translated string

      if (replacements.length === 0) {
        return dictionary && dictionary[key] || key;
      } else {
        if (replacements.length === 1 && typeof replacements[0] === 'object') {
          replacements = replacements.pop();
        }

        return Object.keys( // maps array input to an object {0: 'item1', 1: 'item2'}
        Array.isArray(replacements) ? Object.assign({}, replacements) : replacements).reduce((text, replacementKey) => {
          return text.replace(new RegExp('{\\s?' + replacementKey + '\\s?}', 'g'), replacements[replacementKey]);
        }, dictionary && dictionary[key] || key);
      }
    },

    translations(obj) {
      setTranslations(obj);
    },

    set(language) {
      return setLanguage(language);
    },

    get() {
      return getLanguage();
    },

    available() {
      const languageKeys = Object.keys(translations);
      return languageKeys.map(key => ({
        code: key,
        name: meta.names && meta.names[key] || key
      }));
    }

  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  const registry = {
    eventListeners: [],
    timeouts: [],
    intervals: [],
    targets: []
  };
  var Registry = {
    // Timeouts
    setTimeout(cb, timeout) {
      for (var _len = arguments.length, params = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        params[_key - 2] = arguments[_key];
      }

      const timeoutId = setTimeout(() => {
        registry.timeouts = registry.timeouts.filter(id => id !== timeoutId);
        cb.apply(null, params);
      }, timeout, params);
      Log.info('Set Timeout', 'ID: ' + timeoutId);
      registry.timeouts.push(timeoutId);
      return timeoutId;
    },

    clearTimeout(timeoutId) {
      if (registry.timeouts.indexOf(timeoutId) > -1) {
        registry.timeouts = registry.timeouts.filter(id => id !== timeoutId);
        Log.info('Clear Timeout', 'ID: ' + timeoutId);
        clearTimeout(timeoutId);
      } else {
        Log.error('Clear Timeout', 'ID ' + timeoutId + ' not found');
      }
    },

    clearTimeouts() {
      registry.timeouts.forEach(timeoutId => {
        this.clearTimeout(timeoutId);
      });
    },

    // Intervals
    setInterval(cb, interval) {
      for (var _len2 = arguments.length, params = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        params[_key2 - 2] = arguments[_key2];
      }

      const intervalId = setInterval(() => {
        registry.intervals.filter(id => id !== intervalId);
        cb.apply(null, params);
      }, interval, params);
      Log.info('Set Interval', 'ID: ' + intervalId);
      registry.intervals.push(intervalId);
      return intervalId;
    },

    clearInterval(intervalId) {
      if (registry.intervals.indexOf(intervalId) > -1) {
        registry.intervals = registry.intervals.filter(id => id !== intervalId);
        Log.info('Clear Interval', 'ID: ' + intervalId);
        clearInterval(intervalId);
      } else {
        Log.error('Clear Interval', 'ID ' + intervalId + ' not found');
      }
    },

    clearIntervals() {
      registry.intervals.forEach(intervalId => {
        this.clearInterval(intervalId);
      });
    },

    // Event listeners
    addEventListener(target, event, handler) {
      target.addEventListener(event, handler);
      const targetIndex = registry.targets.indexOf(target) > -1 ? registry.targets.indexOf(target) : registry.targets.push(target) - 1;
      registry.eventListeners[targetIndex] = registry.eventListeners[targetIndex] || {};
      registry.eventListeners[targetIndex][event] = registry.eventListeners[targetIndex][event] || [];
      registry.eventListeners[targetIndex][event].push(handler);
      Log.info('Add eventListener', 'Target:', target, 'Event: ' + event, 'Handler:', handler.toString());
    },

    removeEventListener(target, event, handler) {
      const targetIndex = registry.targets.indexOf(target);

      if (targetIndex > -1 && registry.eventListeners[targetIndex] && registry.eventListeners[targetIndex][event] && registry.eventListeners[targetIndex][event].indexOf(handler) > -1) {
        registry.eventListeners[targetIndex][event] = registry.eventListeners[targetIndex][event].filter(fn => fn !== handler);
        Log.info('Remove eventListener', 'Target:', target, 'Event: ' + event, 'Handler:', handler.toString());
        target.removeEventListener(event, handler);
      } else {
        Log.error('Remove eventListener', 'Not found', 'Target', target, 'Event: ' + event, 'Handler', handler.toString());
      }
    },

    // if `event` is omitted, removes all registered event listeners for target
    // if `target` is also omitted, removes all registered event listeners
    removeEventListeners(target, event) {
      if (target && event) {
        const targetIndex = registry.targets.indexOf(target);

        if (targetIndex > -1) {
          registry.eventListeners[targetIndex][event].forEach(handler => {
            this.removeEventListener(target, event, handler);
          });
        }
      } else if (target) {
        const targetIndex = registry.targets.indexOf(target);

        if (targetIndex > -1) {
          Object.keys(registry.eventListeners[targetIndex]).forEach(_event => {
            this.removeEventListeners(target, _event);
          });
        }
      } else {
        Object.keys(registry.eventListeners).forEach(targetIndex => {
          this.removeEventListeners(registry.targets[targetIndex]);
        });
      }
    },

    // Clear everything (to be called upon app close for proper cleanup)
    clear() {
      this.clearTimeouts();
      this.clearIntervals();
      this.removeEventListeners();
      registry.eventListeners = [];
      registry.timeouts = [];
      registry.intervals = [];
      registry.targets = [];
    }

  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  const isObject$1 = v => {
    return typeof v === 'object' && v !== null;
  };
  const isString$1 = v => {
    return typeof v === 'string';
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  let colors = {
    white: '#ffffff',
    black: '#000000',
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
    yellow: '#feff00',
    cyan: '#00feff',
    magenta: '#ff00ff'
  };
  const normalizedColors = {//store for normalized colors
  };

  const addColors = (colorsToAdd, value) => {
    if (isObject$1(colorsToAdd)) {
      // clean up normalizedColors if they exist in the to be added colors
      Object.keys(colorsToAdd).forEach(color => cleanUpNormalizedColors(color));
      colors = Object.assign({}, colors, colorsToAdd);
    } else if (isString$1(colorsToAdd) && value) {
      cleanUpNormalizedColors(colorsToAdd);
      colors[colorsToAdd] = value;
    }
  };

  const cleanUpNormalizedColors = color => {
    for (let c in normalizedColors) {
      if (c.indexOf(color) > -1) {
        delete normalizedColors[c];
      }
    }
  };

  const initColors = file => {
    return new Promise((resolve, reject) => {
      if (typeof file === 'object') {
        addColors(file);
        return resolve();
      }

      fetch(file).then(response => response.json()).then(json => {
        addColors(json);
        return resolve();
      }).catch(() => {
        const error = 'Colors file ' + file + ' not found';
        Log.error(error);
        return reject(error);
      });
    });
  };

  var name = "@lightningjs/sdk";
  var version = "4.8.3";
  var license = "Apache-2.0";
  var scripts = {
  	postinstall: "node ./scripts/postinstall.js",
  	lint: "eslint '**/*.js'",
  	release: "npm publish --access public"
  };
  var husky = {
  	hooks: {
  		"pre-commit": "lint-staged"
  	}
  };
  var dependencies = {
  	"@babel/polyfill": "^7.11.5",
  	"@lightningjs/core": "*",
  	"@michieljs/execute-as-promise": "^1.0.0",
  	deepmerge: "^4.2.2",
  	localCookie: "github:WebPlatformForEmbedded/localCookie",
  	shelljs: "^0.8.5",
  	"url-polyfill": "^1.1.10",
  	"whatwg-fetch": "^3.0.0"
  };
  var devDependencies = {
  	"@babel/core": "^7.11.6",
  	"@babel/plugin-transform-parameters": "^7.10.5 ",
  	"@babel/plugin-transform-spread": "^7.11.0",
  	"@babel/preset-env": "^7.11.5",
  	"babel-eslint": "^10.1.0",
  	eslint: "^7.10.0",
  	"eslint-config-prettier": "^6.12.0",
  	"eslint-plugin-prettier": "^3.1.4",
  	husky: "^4.3.0",
  	"lint-staged": "^10.4.0",
  	prettier: "^1.19.1",
  	rollup: "^1.32.1",
  	"rollup-plugin-babel": "^4.4.0"
  };
  var repository = {
  	type: "git",
  	url: "git@github.com:rdkcentral/Lightning-SDK.git"
  };
  var bugs = {
  	url: "https://github.com/rdkcentral/Lightning-SDK/issues"
  };
  var packageInfo = {
  	name: name,
  	version: version,
  	license: license,
  	scripts: scripts,
  	"lint-staged": {
  	"*.js": [
  		"eslint --fix"
  	],
  	"src/startApp.js": [
  		"rollup -c ./rollup.config.js"
  	]
  },
  	husky: husky,
  	dependencies: dependencies,
  	devDependencies: devDependencies,
  	repository: repository,
  	bugs: bugs
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  let AppInstance;
  const defaultOptions = {
    stage: {
      w: 1920,
      h: 1080,
      clearColor: 0x00000000,
      canvas2d: false
    },
    debug: false,
    defaultFontFace: 'RobotoRegular',
    keys: {
      8: 'Back',
      13: 'Enter',
      27: 'Menu',
      37: 'Left',
      38: 'Up',
      39: 'Right',
      40: 'Down',
      174: 'ChannelDown',
      175: 'ChannelUp',
      178: 'Stop',
      250: 'PlayPause',
      191: 'Search',
      // Use "/" for keyboard
      409: 'Search'
    }
  };
  const customFontFaces = [];

  const fontLoader = (fonts, store) => new Promise((resolve, reject) => {
    fonts.map(_ref => {
      let {
        family,
        url,
        urls,
        descriptors
      } = _ref;
      return () => {
        const src = urls ? urls.map(url => {
          return 'url(' + url + ')';
        }) : 'url(' + url + ')';
        const fontFace = new FontFace(family, src, descriptors || {});
        store.push(fontFace);
        Log.info('Loading font', family);
        document.fonts.add(fontFace);
        return fontFace.load();
      };
    }).reduce((promise, method) => {
      return promise.then(() => method());
    }, Promise.resolve(null)).then(resolve).catch(reject);
  });

  function Application (App, appData, platformSettings) {
    const {
      width,
      height
    } = platformSettings;

    if (width && height) {
      defaultOptions.stage['w'] = width;
      defaultOptions.stage['h'] = height;
      defaultOptions.stage['precision'] = width / 1920;
    } // support for 720p browser


    if (!width && !height && window.innerHeight === 720) {
      defaultOptions.stage['w'] = 1280;
      defaultOptions.stage['h'] = 720;
      defaultOptions.stage['precision'] = 1280 / 1920;
    }

    return class Application extends lng$1.Application {
      constructor(options) {
        const config = cjs(defaultOptions, options); // Deepmerge breaks HTMLCanvasElement, so restore the passed in canvas.

        if (options.stage.canvas) {
          config.stage.canvas = options.stage.canvas;
        }

        super(config);
        this.config = config;
      }

      static _template() {
        return {
          w: 1920,
          h: 1080
        };
      }

      _setup() {
        Promise.all([this.loadFonts(App.config && App.config.fonts || App.getFonts && App.getFonts() || []), // to be deprecated
        Locale$1.load(App.config && App.config.locale || App.getLocale && App.getLocale()), App.language && this.loadLanguage(App.language()), App.colors && this.loadColors(App.colors())]).then(() => {
          Metrics$1.app.loaded();
          AppInstance = this.stage.c({
            ref: 'App',
            type: App,
            zIndex: 1,
            forceZIndexContext: !!platformSettings.showVersion || !!platformSettings.showFps
          });
          this.childList.a(AppInstance);

          this._refocus();

          Log.info('App version', this.config.version);
          Log.info('SDK version', packageInfo.version);

          if (platformSettings.showVersion) {
            this.childList.a({
              ref: 'VersionLabel',
              type: VersionLabel,
              version: this.config.version,
              sdkVersion: packageInfo.version,
              zIndex: 1
            });
          }

          if (platformSettings.showFps) {
            this.childList.a({
              ref: 'FpsCounter',
              type: FpsIndicator,
              zIndex: 1
            });
          }

          super._setup();
        }).catch(console.error);
      }

      _handleBack() {
        this.closeApp();
      }

      _handleExit() {
        this.closeApp();
      }

      closeApp() {
        Log.info('Signaling App Close');

        if (platformSettings.onClose && typeof platformSettings.onClose === 'function') {
          platformSettings.onClose(...arguments);
        } else {
          this.close();
        }
      }

      close() {
        Log.info('Closing App');
        Settings.clearSubscribers();
        Registry.clear();
        this.childList.remove(this.tag('App'));
        this.cleanupFonts(); // force texture garbage collect

        this.stage.gc();
        this.destroy();
      }

      loadFonts(fonts) {
        return platformSettings.fontLoader && typeof platformSettings.fontLoader === 'function' ? platformSettings.fontLoader(fonts, customFontFaces) : fontLoader(fonts, customFontFaces);
      }

      cleanupFonts() {
        if ('delete' in document.fonts) {
          customFontFaces.forEach(fontFace => {
            Log.info('Removing font', fontFace.family);
            document.fonts.delete(fontFace);
          });
        } else {
          Log.info('No support for removing manually-added fonts');
        }
      }

      loadLanguage(config) {
        let file = Utils.asset('translations.json');
        let language = config;

        if (typeof language === 'object') {
          language = config.language || null;
          file = config.file || file;
        }

        return initLanguage(file, language);
      }

      loadColors(config) {
        let file = Utils.asset('colors.json');

        if (config && (typeof config === 'string' || typeof config === 'object')) {
          file = config;
        }

        return initColors(file);
      }

      set focus(v) {
        this._focussed = v;

        this._refocus();
      }

      _getFocused() {
        return this._focussed || this.tag('App');
      }

    };
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  /**
   * @type {Lightning.Application}
   */

  let application;
  /**
   * Actual instance of the app
   * @type {Lightning.Component}
   */

  let app;
  /**
   * Component that hosts all routed pages
   * @type {Lightning.Component}
   */

  let pagesHost;
  /**
   * @type {Lightning.Stage}
   */

  let stage;
  /**
   * Platform driven Router configuration
   * @type {Map<string>}
   */

  let routerConfig;
  /**
   * Component that hosts all attached widgets
   * @type {Lightning.Component}
   */

  let widgetsHost;
  /**
   * Hash we point the browser to when we boot the app
   * and there is no deep-link provided
   * @type {string|Function}
   */

  let rootHash;
  /**
   * Boot request will fire before app start
   * can be used to execute some global logic
   * and can be configured
   */

  let bootRequest;
  /**
   * Flag if we need to update the browser location hash.
   * Router can work without.
   * @type {boolean}
   */

  let updateHash = true;
  /**
   * Will be called before a route starts, can be overridden
   * via routes config
   * @param from - route we came from
   * @param to - route we navigate to
   * @returns {Promise<*>}
   */
  // eslint-disable-next-line

  let beforeEachRoute = async (from, to) => {
    return true;
  };
  /**
   *  * Will be called after a navigate successfully resolved,
   * can be overridden via routes config
   */

  let afterEachRoute = () => {};
  /**
   * All configured routes
   * @type {Map<string, object>}
   */

  let routes$1 = new Map();
  /**
   * Store all page components per route
   * @type {Map<string, object>}
   */

  let components = new Map();
  /**
   * Flag if router has been initialised
   * @type {boolean}
   */

  let initialised = false;
  /**
   * Current page being rendered on screen
   * @type {null}
   */

  let activePage = null;
  let activeHash;
  let activeRoute;
  /**
   *  During the process of a navigation request a new
   *  request can start, to prevent unwanted behaviour
   *  the navigate()-method stores the last accepted hash
   *  so we can invalidate any prior requests
   */

  let lastAcceptedHash;
  /**
   * With on()-data providing behaviour the Router forced the App
   * in a Loading state. When the data-provider resolves we want to
   * change the state back to where we came from
   */

  let previousState;

  const mixin = app => {
    // by default the Router Baseclass provides the component
    // reference in which we store our pages
    if (app.pages) {
      pagesHost = app.pages.childList;
    } // if the app is using widgets we grab refs
    // and hide all the widgets


    if (app.widgets && app.widgets.children) {
      widgetsHost = app.widgets.childList; // hide all widgets on boot

      widgetsHost.forEach(w => w.visible = false);
    }

    app._handleBack = e => {
      step(-1);
      e.preventDefault();
    };
  };

  const bootRouter = (config, instance) => {
    let {
      appInstance,
      routes
    } = config; // if instance is provided and it's and Lightning Component instance

    if (instance && isPage(instance)) {
      app = instance;
    }

    if (!app) {
      app = appInstance || AppInstance;
    }

    application = app.application;
    pagesHost = application.childList;
    stage = app.stage;
    routerConfig = getConfigMap();
    mixin(app);

    if (isArray(routes)) {
      setup(config);
    } else if (isFunction(routes)) {
      console.warn('[Router]: Calling Router.route() directly is deprecated.');
      console.warn('Use object config: https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    }
  };

  const setup = config => {
    if (!initialised) {
      init(config);
    }

    config.routes.forEach(r => {
      const path = cleanHash(r.path);

      if (!routeExists(path)) {
        const route = createRoute(r);
        routes$1.set(path, route); // if route has a configured component property
        // we store it in a different map to simplify
        // the creating and destroying per route

        if (route.component) {
          let type = route.component;

          if (isComponentConstructor(type)) {
            if (!routerConfig.get('lazyCreate')) {
              type = createComponent(stage, type);
              pagesHost.a(type);
            }
          }

          components.set(path, type);
        }
      } else {
        console.error("".concat(path, " already exists in routes configuration"));
      }
    });
  };

  const init = config => {
    rootHash = config.root;

    if (isFunction(config.boot)) {
      bootRequest = config.boot;
    }

    if (isBoolean(config.updateHash)) {
      updateHash = config.updateHash;
    }

    if (isFunction(config.beforeEachRoute)) {
      beforeEachRoute = config.beforeEachRoute;
    }

    if (isFunction(config.afterEachRoute)) {
      afterEachRoute = config.afterEachRoute;
    }

    if (config.bootComponent) {
      console.warn('[Router]: Boot Component is now available as a special router: https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration?id=special-routes');
      console.warn('[Router]: setting { bootComponent } property will be deprecated in a future release');

      if (isPage(config.bootComponent)) {
        config.routes.push({
          path: '$',
          component: config.bootComponent,
          // we try to assign the bootRequest as after data-provider
          // so it will behave as any other component
          after: bootRequest || null,
          options: {
            preventStorage: true
          }
        });
      } else {
        console.error("[Router]: ".concat(config.bootComponent, " is not a valid boot component"));
      }
    }

    initialised = true;
  };

  const storeComponent = (route, type) => {
    if (components.has(route)) {
      components.set(route, type);
    }
  };
  const getComponent = route => {
    if (components.has(route)) {
      return components.get(route);
    }

    return null;
  };
  /**
   * Test if router needs to update browser location hash
   * @returns {boolean}
   */

  const mustUpdateLocationHash = () => {
    if (!routerConfig || !routerConfig.size) {
      return false;
    } // we need support to either turn change hash off
    // per platform or per app


    const updateConfig = routerConfig.get('updateHash');
    return !(isBoolean(updateConfig) && !updateConfig || isBoolean(updateHash) && !updateHash);
  };
  /**
   * Will be called when a new navigate() request has completed
   * and has not been expired due to it's async nature
   * @param request
   */

  const onRequestResolved = request => {
    const hash = request.hash;
    const route = request.route;
    const register = request.register;
    const page = request.page; // clean up history if modifier is set

    if (getOption(route.options, 'clearHistory')) {
      setHistory([]);
    } else if (hash && !isWildcard.test(route.path)) {
      updateHistory(request);
    } // we only update the stackLocation if a route
    // is not expired before it resolves


    storeComponent(route.path, page);

    if (request.isSharedInstance || !request.isCreated) {
      emit$1(page, 'changed');
    } else if (request.isCreated) {
      emit$1(page, 'mounted');
    } // only update widgets if we have a host


    if (widgetsHost) {
      updateWidgets(route.widgets, page);
    } // we want to clean up if there is an
    // active page that is not being shared
    // between current and previous route


    if (getActivePage() && !request.isSharedInstance) {
      cleanUp(activePage, request);
    } // provide history object to active page


    if (register.get(symbols.historyState) && isFunction(page.historyState)) {
      page.historyState(register.get(symbols.historyState));
    }

    setActivePage(page);
    activeHash = request.hash;
    activeRoute = route.path; // cleanup all cancelled requests

    for (let request of navigateQueue.values()) {
      if (request.isCancelled && request.hash) {
        navigateQueue.delete(request.hash);
      }
    }

    afterEachRoute(request);
    Log.info('[route]:', route.path);
    Log.info('[hash]:', hash);
  };

  const cleanUp = (page, request) => {
    const route = activeRoute;
    const register = request.register;
    const lazyDestroy = routerConfig.get('lazyDestroy');
    const destroyOnBack = routerConfig.get('destroyOnHistoryBack');
    const keepAlive = register.get('keepAlive');
    const isFromHistory = register.get(symbols.backtrack);
    let doCleanup = false; // if this request is executed due to a step back in history
    // and we have configured to destroy active page when we go back
    // in history or lazyDestory is enabled

    if (isFromHistory && (destroyOnBack || lazyDestroy)) {
      doCleanup = true;
    } // clean up if lazyDestroy is enabled and the keepAlive flag
    // in navigation register is false


    if (lazyDestroy && !keepAlive) {
      doCleanup = true;
    } // if the current and new request share the same route blueprint


    if (activeRoute === request.route.path) {
      doCleanup = true;
    }

    if (doCleanup) {
      // grab original class constructor if
      // statemachine routed else store constructor
      storeComponent(route, page._routedType || page.constructor); // actual remove of page from memory

      pagesHost.remove(page); // force texture gc() if configured
      // so we can cleanup textures in the same tick

      if (routerConfig.get('gcOnUnload')) {
        stage.gc();
      }
    } else {
      // If we're not removing the page we need to
      // reset it's properties
      page.patch({
        x: 0,
        y: 0,
        scale: 1,
        alpha: 1,
        visible: false
      });
    }
  };

  const getActiveHash = () => {
    return activeHash;
  };
  const setActivePage = page => {
    activePage = page;
  };
  const getActivePage = () => {
    return activePage;
  };
  const getActiveRoute = () => {
    return activeRoute;
  };
  const getLastHash = () => {
    return lastAcceptedHash;
  };
  const setLastHash = hash => {
    lastAcceptedHash = hash;
  };
  const getPreviousState = () => {
    return previousState;
  };
  const routeExists = key => {
    return routes$1.has(key);
  };
  const getRootHash = () => {
    return rootHash;
  };
  const getBootRequest = () => {
    return bootRequest;
  };
  const getRouterConfig = () => {
    return routerConfig;
  };
  const getRoutes = () => {
    return routes$1;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  const isFunction = v => {
    return typeof v === 'function';
  };
  const isObject = v => {
    return typeof v === 'object' && v !== null;
  };
  const isBoolean = v => {
    return typeof v === 'boolean';
  };
  const isPage = v => {
    if (v instanceof lng$1.Element || isComponentConstructor(v)) {
      return true;
    }

    return false;
  };
  const isComponentConstructor = type => {
    return type.prototype && 'isComponent' in type.prototype;
  };
  const isArray = v => {
    return Array.isArray(v);
  };
  const ucfirst = v => {
    return "".concat(v.charAt(0).toUpperCase()).concat(v.slice(1));
  };
  const isString = v => {
    return typeof v === 'string';
  };
  const isPromise = method => {
    let result;

    if (isFunction(method)) {
      try {
        result = method.apply(null);
      } catch (e) {
        result = e;
      }
    } else {
      result = method;
    }

    return isObject(result) && isFunction(result.then);
  };
  const cleanHash = function () {
    let hash = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return hash.replace(/^#/, '').replace(/\/+$/, '');
  };
  const getConfigMap = () => {
    const routerSettings = Settings.get('platform', 'router');
    const isObj = isObject(routerSettings);
    return ['backtrack', 'gcOnUnload', 'destroyOnHistoryBack', 'lazyCreate', 'lazyDestroy', 'reuseInstance', 'autoRestoreRemote', 'numberNavigation', 'updateHash', 'storeSameHash'].reduce((config, key) => {
      config.set(key, isObj ? routerSettings[key] : Settings.get('platform', key));
      return config;
    }, new Map());
  };
  const getQueryStringParams = function () {
    let hash = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getActiveHash();
    const resumeHash = getResumeHash();

    if ((hash === '$' || !hash) && resumeHash) {
      if (isString(resumeHash)) {
        hash = resumeHash;
      }
    }

    let parse = '';
    const getQuery = /([?&].*)/;
    const matches = getQuery.exec(hash);
    const params = {};

    if (document.location && document.location.search) {
      parse = document.location.search;
    }

    if (matches && matches.length) {
      let hashParams = matches[1];

      if (parse) {
        // if location.search is not empty we
        // remove the leading ? to create a
        // valid string
        hashParams = hashParams.replace(/^\?/, ''); // we parse hash params last so they we can always
        // override search params with hash params

        parse = "".concat(parse, "&").concat(hashParams);
      } else {
        parse = hashParams;
      }
    }

    if (parse) {
      const urlParams = new URLSearchParams(parse);

      for (const [key, value] of urlParams.entries()) {
        params[key] = value;
      }

      return params;
    } else {
      return false;
    }
  };
  const objectToQueryString = obj => {
    if (!isObject(obj)) {
      return '';
    }

    return '?' + Object.keys(obj).map(key => {
      return "".concat(key, "=").concat(obj[key]);
    }).join('&');
  };
  const symbols = {
    route: Symbol('route'),
    hash: Symbol('hash'),
    store: Symbol('store'),
    fromHistory: Symbol('fromHistory'),
    expires: Symbol('expires'),
    resume: Symbol('resume'),
    backtrack: Symbol('backtrack'),
    historyState: Symbol('historyState'),
    queryParams: Symbol('queryParams')
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  const dataHooks = {
    on: request => {
      app.state || '';

      app._setState('Loading');

      return execProvider(request);
    },
    before: request => {
      return execProvider(request);
    },
    after: request => {
      try {
        execProvider(request, true);
      } catch (e) {// for now we fail silently
      }

      return Promise.resolve();
    }
  };

  const execProvider = (request, emitProvided) => {
    const route = request.route;
    const provider = route.provider;
    const expires = route.cache ? route.cache * 1000 : 0;
    const params = addPersistData(request);
    return provider.request(request.page, { ...params
    }).then(() => {
      request.page[symbols.expires] = Date.now() + expires;

      if (emitProvided) {
        emit$1(request.page, 'dataProvided');
      }
    }).catch(e => {
      request.page[symbols.expires] = Date.now();
      throw e;
    });
  };

  const addPersistData = _ref => {
    let {
      page,
      route,
      hash,
      register = new Map()
    } = _ref;
    const urlValues = getValuesFromHash(hash, route.path);
    const queryParams = getQueryStringParams(hash);
    const pageData = new Map([...urlValues, ...register]);
    const params = {}; // make dynamic url data available to the page
    // as instance properties

    for (let [name, value] of pageData) {
      params[name] = value;
    }

    if (queryParams) {
      params[symbols.queryParams] = queryParams;
    } // check navigation register for persistent data


    if (register.size) {
      const obj = {};

      for (let [k, v] of register) {
        obj[k] = v;
      }

      page.persist = obj;
    } // make url data and persist data available
    // via params property


    page.params = params;
    emit$1(page, ['urlParams'], params);
    return params;
  };
  /**
   * Test if page passed cache-time
   * @param page
   * @returns {boolean}
   */

  const isPageExpired = page => {
    if (!page[symbols.expires]) {
      return false;
    }

    const expires = page[symbols.expires];
    const now = Date.now();
    return now >= expires;
  };
  const hasProvider = path => {
    if (routeExists(path)) {
      const record = routes$1.get(path);
      return !!record.provider;
    }

    return false;
  };
  const getProvider = route => {
    // @todo: fix, route already is passed in
    if (routeExists(route.path)) {
      const {
        provider
      } = routes$1.get(route.path);
      return {
        type: provider.type,
        provider: provider.request
      };
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  const fade = (i, o) => {
    return new Promise(resolve => {
      i.patch({
        alpha: 0,
        visible: true,
        smooth: {
          alpha: [1, {
            duration: 0.5,
            delay: 0.1
          }]
        }
      }); // resolve on y finish

      i.transition('alpha').on('finish', () => {
        if (o) {
          o.visible = false;
        }

        resolve();
      });
    });
  };

  const crossFade = (i, o) => {
    return new Promise(resolve => {
      i.patch({
        alpha: 0,
        visible: true,
        smooth: {
          alpha: [1, {
            duration: 0.5,
            delay: 0.1
          }]
        }
      });

      if (o) {
        o.patch({
          smooth: {
            alpha: [0, {
              duration: 0.5,
              delay: 0.3
            }]
          }
        });
      } // resolve on y finish


      i.transition('alpha').on('finish', () => {
        resolve();
      });
    });
  };

  const moveOnAxes = (axis, direction, i, o) => {
    const bounds = axis === 'x' ? 1920 : 1080;
    return new Promise(resolve => {
      i.patch({
        ["".concat(axis)]: direction ? bounds * -1 : bounds,
        visible: true,
        smooth: {
          ["".concat(axis)]: [0, {
            duration: 0.4,
            delay: 0.2
          }]
        }
      }); // out is optional

      if (o) {
        o.patch({
          ["".concat(axis)]: 0,
          smooth: {
            ["".concat(axis)]: [direction ? bounds : bounds * -1, {
              duration: 0.4,
              delay: 0.2
            }]
          }
        });
      } // resolve on y finish


      i.transition(axis).on('finish', () => {
        resolve();
      });
    });
  };

  const up = (i, o) => {
    return moveOnAxes('y', 0, i, o);
  };

  const down = (i, o) => {
    return moveOnAxes('y', 1, i, o);
  };

  const left = (i, o) => {
    return moveOnAxes('x', 0, i, o);
  };

  const right = (i, o) => {
    return moveOnAxes('x', 1, i, o);
  };

  var Transitions = {
    fade,
    crossFade,
    up,
    down,
    left,
    right
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  /**
   * execute transition between new / old page and
   * toggle the defined widgets
   * @todo: platform override default transition
   * @param pageIn
   * @param pageOut
   */

  const executeTransition = function (pageIn) {
    let pageOut = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    const transition = pageIn.pageTransition || pageIn.easing;
    const hasCustomTransitions = !!(pageIn.smoothIn || pageIn.smoothInOut || transition);
    const transitionsDisabled = getRouterConfig().get('disableTransitions');

    if (pageIn.easing) {
      console.warn('easing() method is deprecated and will be removed. Use pageTransition()');
    } // default behaviour is a visibility toggle


    if (!hasCustomTransitions || transitionsDisabled) {
      pageIn.visible = true;

      if (pageOut) {
        pageOut.visible = false;
      }

      return Promise.resolve();
    }

    if (transition) {
      let type;

      try {
        type = transition.call(pageIn, pageIn, pageOut);
      } catch (e) {
        type = 'crossFade';
      }

      if (isPromise(type)) {
        return type;
      }

      if (isString(type)) {
        const fn = Transitions[type];

        if (fn) {
          return fn(pageIn, pageOut);
        }
      } // keep backwards compatible for now


      if (pageIn.smoothIn) {
        // provide a smooth function that resolves itself
        // on transition finish
        const smooth = function (p, v) {
          let args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
          return new Promise(resolve => {
            pageIn.visible = true;
            pageIn.setSmooth(p, v, args);
            pageIn.transition(p).on('finish', () => {
              resolve();
            });
          });
        };

        return pageIn.smoothIn({
          pageIn,
          smooth
        });
      }
    }

    return Transitions.crossFade(pageIn, pageOut);
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  /**
   * The actual loading of the component
   * */

  const load = async request => {
    let expired = false;

    try {
      request = await loader$1(request);

      if (request && !request.isCancelled) {
        // in case of on() providing we need to reset
        // app state;
        if (app.state === 'Loading') {
          if (getPreviousState() === 'Widgets') ; else {
            app._setState('');
          }
        } // Do page transition if instance
        // is not shared between the routes


        if (!request.isSharedInstance && !request.isCancelled) {
          await executeTransition(request.page, getActivePage());
        }
      } else {
        expired = true;
      } // on expired we only cleanup


      if (expired || request.isCancelled) {
        Log.debug('[router]:', "Rejected ".concat(request.hash, " because route to ").concat(getLastHash(), " started"));

        if (request.isCreated && !request.isSharedInstance) {
          // remove from render-tree
          pagesHost.remove(request.page);
        }
      } else {
        onRequestResolved(request); // resolve promise

        return request.page;
      }
    } catch (request) {
      if (!request.route) {
        console.error(request);
      } else if (!expired) {
        // @todo: revisit
        const {
          route
        } = request; // clean up history if modifier is set

        if (getOption(route.options, 'clearHistory')) {
          setHistory([]);
        } else if (!isWildcard.test(route.path)) {
          updateHistory(request);
        }

        if (request.isCreated && !request.isSharedInstance) {
          // remove from render-tree
          pagesHost.remove(request.page);
        }

        handleError(request);
      }
    }
  };

  const loader$1 = async request => {
    const route = request.route;
    const hash = request.hash;
    const register = request.register; // todo: grab from Route instance

    let type = getComponent(route.path);
    let isConstruct = isComponentConstructor(type);
    let provide = false; // if it's an instance bt we're not coming back from
    // history we test if we can re-use this instance

    if (!isConstruct && !register.get(symbols.backtrack)) {
      if (!mustReuse(route)) {
        type = type.constructor;
        isConstruct = true;
      }
    } // If page is Lightning Component instance


    if (!isConstruct) {
      request.page = type; // if we have have a data route for current page

      if (hasProvider(route.path)) {
        if (isPageExpired(type) || type[symbols.hash] !== hash) {
          provide = true;
        }
      }

      let currentRoute = getActivePage() && getActivePage()[symbols.route]; // if the new route is equal to the current route it means that both
      // route share the Component instance and stack location / since this case
      // is conflicting with the way before() and after() loading works we flag it,
      // and check platform settings in we want to re-use instance

      if (route.path === currentRoute) {
        request.isSharedInstance = true; // since we're re-using the instance we must attach
        // historyState to the request to prevent it from
        // being overridden.

        if (isFunction(request.page.historyState)) {
          request.copiedHistoryState = request.page.historyState();
        }
      }
    } else {
      request.page = createComponent(stage, type);
      pagesHost.a(request.page); // test if need to request data provider

      if (hasProvider(route.path)) {
        provide = true;
      }

      request.isCreated = true;
    } // we store hash and route as properties on the page instance
    // that way we can easily calculate new behaviour on page reload


    request.page[symbols.hash] = hash;
    request.page[symbols.route] = route.path;

    try {
      if (provide) {
        // extract attached data-provider for route
        // we're processing
        const {
          type: loadType,
          provider
        } = getProvider(route); // update running request

        request.provider = provider;
        request.providerType = loadType;
        await dataHooks[loadType](request); // we early exit if the current request is expired

        if (hash !== getLastHash()) {
          return false;
        } else {
          if (request.providerType !== 'after') {
            emit$1(request.page, 'dataProvided');
          } // resolve promise


          return request;
        }
      } else {
        addPersistData(request);
        return request;
      }
    } catch (e) {
      request.error = e;
      return Promise.reject(request);
    }
  };

  const handleError = request => {
    if (request && request.error) {
      console.error(request.error);
    } else if (request) {
      Log.error(request);
    }

    if (request.page && routeExists('!')) {
      navigate('!', {
        request
      }, false);
    }
  };

  const mustReuse = route => {
    const opt = getOption(route.options, 'reuseInstance');
    const config = routerConfig.get('reuseInstance'); // route always has final decision

    if (isBoolean(opt)) {
      return opt;
    }

    return !(isBoolean(config) && config === false);
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  class RoutedApp extends lng$1.Component {
    static _template() {
      return {
        Pages: {
          forceZIndexContext: true
        },

        /**
         * This is a default Loading page that will be made visible
         * during data-provider on() you CAN override in child-class
         */
        Loading: {
          rect: true,
          w: 1920,
          h: 1080,
          color: 0xff000000,
          visible: false,
          zIndex: 99,
          Label: {
            mount: 0.5,
            x: 960,
            y: 540,
            text: {
              text: 'Loading..'
            }
          }
        }
      };
    }

    static _states() {
      return [class Loading extends this {
        $enter() {
          this.tag('Loading').visible = true;
        }

        $exit() {
          this.tag('Loading').visible = false;
        }

      }, class Widgets extends this {
        $enter(args, widget) {
          // store widget reference
          this._widget = widget; // since it's possible that this behaviour
          // is non-remote driven we force a recalculation
          // of the focuspath

          this._refocus();
        }

        _getFocused() {
          // we delegate focus to selected widget
          // so it can consume remotecontrol presses
          return this._widget;
        } // if we want to widget to widget focus delegation


        reload(widget) {
          this._widget = widget;

          this._refocus();
        }

        _handleKey() {
          const restoreFocus = routerConfig.get('autoRestoreRemote');
          /**
           * The Router used to delegate focus back to the page instance on
           * every unhandled key. This is barely usefull in any situation
           * so for now we offer the option to explicity turn that behaviour off
           * so we don't don't introduce a breaking change.
           */

          if (!isBoolean(restoreFocus) || restoreFocus === true) {
            Router.focusPage();
          }
        }

      }];
    }
    /**
     * Return location where pages need to be stored
     */


    get pages() {
      return this.tag('Pages');
    }
    /**
     * Tell router where widgets are stored
     */


    get widgets() {
      return this.tag('Widgets');
    }
    /**
     * we MUST register _handleBack method so the Router
     * can override it
     * @private
     */


    _handleBack() {}
    /**
     * We MUST return Router.activePage() so the new Page
     * can listen to the remote-control.
     */


    _getFocused() {
      return Router.getActivePage();
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  /*
  rouThor ==[x]
   */

  let navigateQueue = new Map();
  let forcedHash = '';
  let resumeHash = '';
  /**
   * Start routing the app
   * @param config - route config object
   * @param instance - instance of the app
   */

  const startRouter = (config, instance) => {
    bootRouter(config, instance);
    registerListener();
    start();
  }; // start translating url


  const start = () => {
    let hash = (getHash() || '').replace(/^#/, '');
    const bootKey = '$';
    const params = getQueryStringParams(hash);
    const bootRequest = getBootRequest();
    const rootHash = getRootHash();
    const isDirectLoad = hash.indexOf(bootKey) !== -1; // prevent direct reload of wildcard routes
    // expect bootComponent

    if (isWildcard.test(hash) && hash !== bootKey) {
      hash = '';
    } // store resume point for manual resume


    resumeHash = isDirectLoad ? rootHash : hash || rootHash;

    const ready = () => {
      if (!hash && rootHash) {
        if (isString(rootHash)) {
          navigate(rootHash);
        } else if (isFunction(rootHash)) {
          rootHash().then(res => {
            if (isObject(res)) {
              navigate(res.path, res.params);
            } else {
              navigate(res);
            }
          });
        }
      } else {
        queue(hash);
        handleHashChange().then(() => {
          app._refocus();
        }).catch(e => {
          console.error(e);
        });
      }
    };

    if (routeExists(bootKey)) {
      if (hash && !isDirectLoad) {
        if (!getRouteByHash(hash)) {
          navigate('*', {
            failedHash: hash
          });
          return;
        }
      }

      navigate(bootKey, {
        resume: resumeHash,
        reload: bootKey === hash
      }, false);
    } else if (isFunction(bootRequest)) {
      bootRequest(params).then(() => {
        ready();
      }).catch(e => {
        handleBootError(e);
      });
    } else {
      ready();
    }
  };

  const handleBootError = e => {
    if (routeExists('!')) {
      navigate('!', {
        request: {
          error: e
        }
      });
    } else {
      console.error(e);
    }
  };
  /**
   * start a new request
   * @param url
   * @param args
   * @param store
   */


  const navigate = function (url) {
    let args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let store = arguments.length > 2 ? arguments[2] : undefined;

    if (isObject(url)) {
      url = getHashByName(url);

      if (!url) {
        return;
      }
    }

    let hash = getHash();

    if (!mustUpdateLocationHash() && forcedHash) {
      hash = forcedHash;
    }

    if (hash.replace(/^#/, '') !== url) {
      // push request in the queue
      queue(url, args, store);
      setHash(url);

      if (!mustUpdateLocationHash()) {
        forcedHash = url;
        handleHashChange(url).then(() => {
          app._refocus();
        }).catch(e => {
          console.error(e);
        });
      }
    } else if (args.reload) {
      // push request in the queue
      queue(url, args, store);
      handleHashChange(url).then(() => {
        app._refocus();
      }).catch(e => {
        console.error(e);
      });
    }
  };

  const queue = function (hash) {
    let args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let store = arguments.length > 2 ? arguments[2] : undefined;
    hash = cleanHash(hash);

    if (!navigateQueue.has(hash)) {
      for (let request of navigateQueue.values()) {
        request.cancel();
      }

      const request = createRequest(hash, args, store);
      navigateQueue.set(decodeURIComponent(hash), request);
      return request;
    }

    return false;
  };
  /**
   * Handle change of hash
   * @param override
   * @returns {Promise<void>}
   */


  const handleHashChange = async override => {
    const hash = cleanHash(override || getHash());
    const queueId = decodeURIComponent(hash);
    let request = navigateQueue.get(queueId); // handle hash updated manually

    if (!request && !navigateQueue.size) {
      request = queue(hash);
    }

    const route = getRouteByHash(hash);

    if (!route) {
      if (routeExists('*')) {
        navigate('*', {
          failedHash: hash
        });
      } else {
        console.error("Unable to navigate to: ".concat(hash));
      }

      return;
    } // update current processed request


    request.hash = hash;
    request.route = route;
    let result = await beforeEachRoute(getActiveHash(), request); // test if a local hook is configured for the route

    if (result && route.beforeNavigate) {
      result = await route.beforeNavigate(getActiveHash(), request);
    }

    if (isBoolean(result)) {
      // only if resolve value is explicitly true
      // we continue the current route request
      if (result) {
        return resolveHashChange(request);
      }
    } else {
      // if navigation guard didn't return true
      // we cancel the current request
      request.cancel();
      navigateQueue.delete(queueId);

      if (isString(result)) {
        navigate(result);
      } else if (isObject(result)) {
        let store = true;

        if (isBoolean(result.store)) {
          store = result.store;
        }

        navigate(result.path, result.params, store);
      }
    }
  };
  /**
   * Continue processing the hash change if not blocked
   * by global or local hook
   * @param request - {}
   */


  const resolveHashChange = request => {
    const hash = request.hash;
    const route = request.route;
    const queueId = decodeURIComponent(hash); // store last requested hash so we can
    // prevent a route that resolved later
    // from displaying itself

    setLastHash(hash);

    if (route.path) {
      const component = getComponent(route.path); // if a hook is provided for the current route

      if (isFunction(route.hook)) {
        const urlParams = getValuesFromHash(hash, route.path);
        const params = {};

        for (const key of urlParams.keys()) {
          params[key] = urlParams.get(key);
        }

        route.hook(app, { ...params
        });
      } // if there is a component attached to the route


      if (component) {
        // force page to root state to prevent shared state issues
        const activePage = getActivePage();

        if (activePage) {
          const keepAlive = keepActivePageAlive(getActiveRoute(), request);

          if (activePage && route.path === getActiveRoute() && !keepAlive) {
            activePage._setState('');
          }
        }

        if (isPage(component)) {
          load(request).then(() => {
            app._refocus();

            navigateQueue.delete(queueId);
          });
        } else {
          // of the component is not a constructor
          // or a Component instance we can assume
          // that it's a dynamic import
          component().then(contents => {
            return contents.default;
          }).then(module => {
            storeComponent(route.path, module);
            return load(request);
          }).then(() => {
            app._refocus();

            navigateQueue.delete(queueId);
          });
        }
      } else {
        navigateQueue.delete(queueId);
      }
    }
  };
  /**
   * Directional step in history
   * @param level
   */


  const step = function () {
    let level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    if (!level || isNaN(level)) {
      return false;
    }

    const history = getHistory(); // for now we only support negative numbers

    level = Math.abs(level); // we can't step back past the amount
    // of history entries

    if (level > history.length) {
      if (isFunction(app._handleAppClose)) {
        return app._handleAppClose();
      }

      return app.application.closeApp();
    } else if (history.length) {
      // for now we only support history back
      const route = history.splice(history.length - level, level)[0]; // store changed history

      setHistory(history);
      return navigate(route.hash, {
        [symbols.backtrack]: true,
        [symbols.historyState]: route.state
      }, false);
    } else if (routerConfig.get('backtrack')) {
      const hashLastPart = /(\/:?[\w%\s-]+)$/;
      let hash = stripRegex(getHash());
      let floor = getFloor(hash); // test if we got deep-linked

      if (floor > 1) {
        while (floor--) {
          // strip of last part
          hash = hash.replace(hashLastPart, ''); // if we have a configured route
          // we navigate to it

          if (getRouteByHash(hash)) {
            return navigate(hash, {
              [symbols.backtrack]: true
            }, false);
          }
        }
      }
    }

    return false;
  };
  /**
   * Resume Router's page loading process after
   * the BootComponent became visible;
   */

  const resume = () => {
    if (isString(resumeHash)) {
      navigate(resumeHash, false);
      resumeHash = '';
    } else if (isFunction(resumeHash)) {
      resumeHash().then(res => {
        resumeHash = '';

        if (isObject(res)) {
          navigate(res.path, res.params);
        } else {
          navigate(res);
        }
      });
    } else {
      console.warn('[Router]: resume() called but no hash found');
    }
  };
  /**
   * Force reload active hash
   */


  const reload = () => {
    if (!isNavigating()) {
      const hash = getActiveHash();
      navigate(hash, {
        reload: true
      }, false);
    }
  };
  /**
   * Query if the Router is still processing a Request
   * @returns {boolean}
   */


  const isNavigating = () => {
    if (navigateQueue.size) {
      let isProcessing = false;

      for (let request of navigateQueue.values()) {
        if (!request.isCancelled) {
          isProcessing = true;
        }
      }

      return isProcessing;
    }

    return false;
  };

  const getResumeHash = () => {
    return resumeHash;
  };
  /**
   * By default we return the location hash
   * @returns {string}
   */

  let getHash = () => {
    return document.location.hash;
  };
  /**
   * Update location hash
   * @param url
   */


  let setHash = url => {
    document.location.hash = url;
  };
  /**
   * This can be called from the platform / bootstrapper to override
   * the default getting and setting of the hash
   * @param config
   */


  const initRouter = config => {
    if (config.getHash) {
      getHash = config.getHash;
    }

    if (config.setHash) {
      setHash = config.setHash;
    }
  };
  /**
   * On hash change we start processing
   */

  const registerListener = () => {
    Registry.addEventListener(window, 'hashchange', async () => {
      if (mustUpdateLocationHash()) {
        try {
          await handleHashChange();
        } catch (e) {
          console.error(e);
        }
      }
    });
  };
  /**
   * Navigate to root hash
   */


  const root = () => {
    const rootHash = getRootHash();

    if (isString(rootHash)) {
      navigate(rootHash);
    } else if (isFunction(rootHash)) {
      rootHash().then(res => {
        if (isObject(res)) {
          navigate(res.path, res.params);
        } else {
          navigate(res);
        }
      });
    }
  }; // export API


  var Router = {
    startRouter,
    navigate,
    resume,
    step,
    go: step,
    back: step.bind(null, -1),
    activePage: getActivePage,

    getActivePage() {
      // warning
      return getActivePage();
    },

    getActiveRoute,
    getActiveHash,
    focusWidget,
    getActiveWidget,
    restoreFocus,
    isNavigating,
    getHistory,
    setHistory,
    getHistoryState,
    replaceHistoryState,
    getQueryStringParams,
    reload,
    symbols,
    App: RoutedApp,
    // keep backwards compatible
    focusPage: restoreFocus,
    root: root,

    /**
     * Deprecated api methods
     */
    setupRoutes() {
      console.warn('Router: setupRoutes is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    },

    on() {
      console.warn('Router.on() is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    },

    before() {
      console.warn('Router.before() is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    },

    after() {
      console.warn('Router.after() is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    }

  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  const defaultChannels = [{
    number: 1,
    name: 'Metro News 1',
    description: 'New York Cable News Channel',
    entitled: true,
    program: {
      title: 'The Morning Show',
      description: "New York's best morning show",
      startTime: new Date(new Date() - 60 * 5 * 1000).toUTCString(),
      // started 5 minutes ago
      duration: 60 * 30,
      // 30 minutes
      ageRating: 0
    }
  }, {
    number: 2,
    name: 'MTV',
    description: 'Music Television',
    entitled: true,
    program: {
      title: 'Beavis and Butthead',
      description: 'American adult animated sitcom created by Mike Judge',
      startTime: new Date(new Date() - 60 * 20 * 1000).toUTCString(),
      // started 20 minutes ago
      duration: 60 * 45,
      // 45 minutes
      ageRating: 18
    }
  }, {
    number: 3,
    name: 'NBC',
    description: 'NBC TV Network',
    entitled: false,
    program: {
      title: 'The Tonight Show Starring Jimmy Fallon',
      description: 'Late-night talk show hosted by Jimmy Fallon on NBC',
      startTime: new Date(new Date() - 60 * 10 * 1000).toUTCString(),
      // started 10 minutes ago
      duration: 60 * 60,
      // 1 hour
      ageRating: 10
    }
  }];
  const channels = () => Settings.get('platform', 'tv', defaultChannels);
  const randomChannel = () => channels()[~~(channels.length * Math.random())];

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  let currentChannel;
  const callbacks = {};

  const emit = function (event) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    callbacks[event] && callbacks[event].forEach(cb => {
      cb.apply(null, args);
    });
  }; // local mock methods


  let methods = {
    getChannel() {
      if (!currentChannel) currentChannel = randomChannel();
      return new Promise((resolve, reject) => {
        if (currentChannel) {
          const channel = { ...currentChannel
          };
          delete channel.program;
          resolve(channel);
        } else {
          reject('No channel found');
        }
      });
    },

    getProgram() {
      if (!currentChannel) currentChannel = randomChannel();
      return new Promise((resolve, reject) => {
        currentChannel.program ? resolve(currentChannel.program) : reject('No program found');
      });
    },

    setChannel(number) {
      return new Promise((resolve, reject) => {
        if (number) {
          const newChannel = channels().find(c => c.number === number);

          if (newChannel) {
            currentChannel = newChannel;
            const channel = { ...currentChannel
            };
            delete channel.program;
            emit('channelChange', channel);
            resolve(channel);
          } else {
            reject('Channel not found');
          }
        } else {
          reject('No channel number supplied');
        }
      });
    }

  };
  const initTV = config => {
    methods = {};

    if (config.getChannel && typeof config.getChannel === 'function') {
      methods.getChannel = config.getChannel;
    }

    if (config.getProgram && typeof config.getProgram === 'function') {
      methods.getProgram = config.getProgram;
    }

    if (config.setChannel && typeof config.setChannel === 'function') {
      methods.setChannel = config.setChannel;
    }

    if (config.emit && typeof config.emit === 'function') {
      config.emit(emit);
    }
  }; // public API

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  const initPurchase = config => {
    if (config.billingUrl) config.billingUrl;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */

  class PinInput extends lng$1.Component {
    static _template() {
      return {
        w: 120,
        h: 150,
        rect: true,
        color: 0xff949393,
        alpha: 0.5,
        shader: {
          type: lng$1.shaders.RoundedRectangle,
          radius: 10
        },
        Nr: {
          w: w => w,
          y: 24,
          text: {
            text: '',
            textColor: 0xff333333,
            fontSize: 80,
            textAlign: 'center',
            verticalAlign: 'middle'
          }
        }
      };
    }

    set index(v) {
      this.x = v * (120 + 24);
    }

    set nr(v) {
      this._timeout && clearTimeout(this._timeout);

      if (v) {
        this.setSmooth('alpha', 1);
      } else {
        this.setSmooth('alpha', 0.5);
      }

      this.tag('Nr').patch({
        text: {
          text: v && v.toString() || '',
          fontSize: v === '*' ? 120 : 80
        }
      });

      if (v && v !== '*') {
        this._timeout = setTimeout(() => {
          this._timeout = null;
          this.nr = '*';
        }, 750);
      }
    }

  }

  class PinDialog extends lng$1.Component {
    static _template() {
      return {
        zIndex: 1,
        w: w => w,
        h: h => h,
        rect: true,
        color: 0xdd000000,
        alpha: 0.000001,
        Dialog: {
          w: 648,
          h: 320,
          y: h => (h - 320) / 2,
          x: w => (w - 648) / 2,
          rect: true,
          color: 0xdd333333,
          shader: {
            type: lng$1.shaders.RoundedRectangle,
            radius: 10
          },
          Info: {
            y: 24,
            x: 48,
            text: {
              text: 'Please enter your PIN',
              fontSize: 32
            }
          },
          Msg: {
            y: 260,
            x: 48,
            text: {
              text: '',
              fontSize: 28,
              textColor: 0xffffffff
            }
          },
          Code: {
            x: 48,
            y: 96
          }
        }
      };
    }

    _init() {
      const children = [];

      for (let i = 0; i < 4; i++) {
        children.push({
          type: PinInput,
          index: i
        });
      }

      this.tag('Code').children = children;
    }

    get pin() {
      if (!this._pin) this._pin = '';
      return this._pin;
    }

    set pin(v) {
      if (v.length <= 4) {
        const maskedPin = new Array(Math.max(v.length - 1, 0)).fill('*', 0, v.length - 1);
        v.length && maskedPin.push(v.length > this._pin.length ? v.slice(-1) : '*');

        for (let i = 0; i < 4; i++) {
          this.tag('Code').children[i].nr = maskedPin[i] || '';
        }

        this._pin = v;
      }
    }

    get msg() {
      if (!this._msg) this._msg = '';
      return this._msg;
    }

    set msg(v) {
      this._timeout && clearTimeout(this._timeout);
      this._msg = v;

      if (this._msg) {
        this.tag('Msg').text = this._msg;
        this.tag('Info').setSmooth('alpha', 0.5);
        this.tag('Code').setSmooth('alpha', 0.5);
      } else {
        this.tag('Msg').text = '';
        this.tag('Info').setSmooth('alpha', 1);
        this.tag('Code').setSmooth('alpha', 1);
      }

      this._timeout = setTimeout(() => {
        this.msg = '';
      }, 2000);
    }

    _firstActive() {
      this.setSmooth('alpha', 1);
    }

    _handleKey(event) {
      if (this.msg) {
        this.msg = false;
      } else {
        const val = parseInt(event.key);

        if (val > -1) {
          this.pin += val;
        }
      }
    }

    _handleBack() {
      if (this.msg) {
        this.msg = false;
      } else {
        if (this.pin.length) {
          this.pin = this.pin.slice(0, this.pin.length - 1);
        } else {
          Pin.hide();
          this.resolve(false);
        }
      }
    }

    _handleEnter() {
      if (this.msg) {
        this.msg = false;
      } else {
        Pin.submit(this.pin).then(val => {
          this.msg = 'Unlocking ...';
          setTimeout(() => {
            Pin.hide();
          }, 1000);
          this.resolve(val);
        }).catch(e => {
          this.msg = e;
          this.reject(e);
        });
      }
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */

  let unlocked = false;
  const contextItems = ['purchase', 'parental'];

  let submit = (pin, context) => {
    return new Promise((resolve, reject) => {
      if (pin.toString() === Settings.get('platform', 'pin', '0000').toString()) {
        unlocked = true;
        resolve(unlocked);
      } else {
        reject('Incorrect pin');
      }
    });
  };

  let check = context => {
    return new Promise(resolve => {
      resolve(unlocked);
    });
  };

  const initPin = config => {
    if (config.submit && typeof config.submit === 'function') {
      submit = config.submit;
    }

    if (config.check && typeof config.check === 'function') {
      check = config.check;
    }
  };
  let pinDialog = null;

  const contextCheck = context => {
    if (context === undefined) {
      Log.info('Please provide context explicitly');
      return contextItems[0];
    } else if (!contextItems.includes(context)) {
      Log.warn('Incorrect context provided');
      return false;
    }

    return context;
  }; // Public API


  var Pin = {
    show() {
      return new Promise((resolve, reject) => {
        pinDialog = ApplicationInstance.stage.c({
          ref: 'PinDialog',
          type: PinDialog,
          resolve,
          reject
        });
        ApplicationInstance.childList.a(pinDialog);
        ApplicationInstance.focus = pinDialog;
      });
    },

    hide() {
      ApplicationInstance.focus = null;
      ApplicationInstance.children = ApplicationInstance.children.map(child => child !== pinDialog && child);
      pinDialog = null;
    },

    submit(pin, context) {
      return new Promise((resolve, reject) => {
        try {
          context = contextCheck(context);

          if (context) {
            submit(pin, context).then(resolve).catch(reject);
          } else {
            reject('Incorrect Context provided');
          }
        } catch (e) {
          reject(e);
        }
      });
    },

    unlocked(context) {
      return new Promise((resolve, reject) => {
        try {
          context = contextCheck(context);

          if (context) {
            check(context).then(resolve).catch(reject);
          } else {
            reject('Incorrect Context provided');
          }
        } catch (e) {
          reject(e);
        }
      });
    },

    locked(context) {
      return new Promise((resolve, reject) => {
        try {
          context = contextCheck(context);

          if (context) {
            check(context).then(unlocked => resolve(!!!unlocked)).catch(reject);
          } else {
            reject('Incorrect Context provided');
          }
        } catch (e) {
          reject(e);
        }
      });
    }

  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  let ApplicationInstance;
  var Launch = ((App, appSettings, platformSettings, appData) => {
    initSettings(appSettings, platformSettings);
    initUtils(platformSettings);
    initStorage(); // Initialize plugins

    if (platformSettings.plugins) {
      platformSettings.plugins.profile && initProfile(platformSettings.plugins.profile);
      platformSettings.plugins.metrics && initMetrics(platformSettings.plugins.metrics);
      platformSettings.plugins.mediaPlayer && initMediaPlayer(platformSettings.plugins.mediaPlayer);
      platformSettings.plugins.mediaPlayer && initVideoPlayer(platformSettings.plugins.mediaPlayer);
      platformSettings.plugins.ads && initAds(platformSettings.plugins.ads);
      platformSettings.plugins.router && initRouter(platformSettings.plugins.router);
      platformSettings.plugins.tv && initTV(platformSettings.plugins.tv);
      platformSettings.plugins.purchase && initPurchase(platformSettings.plugins.purchase);
      platformSettings.plugins.pin && initPin(platformSettings.plugins.pin);
    }

    const app = Application(App, appData, platformSettings);
    ApplicationInstance = new app(appSettings);
    return ApplicationInstance;
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  class VideoTexture extends lng$1.Component {
    static _template() {
      return {
        Video: {
          alpha: 1,
          visible: false,
          pivot: 0.5,
          texture: {
            type: lng$1.textures.StaticTexture,
            options: {}
          }
        }
      };
    }

    set videoEl(v) {
      this._videoEl = v;
    }

    get videoEl() {
      return this._videoEl;
    }

    get videoView() {
      return this.tag('Video');
    }

    get videoTexture() {
      return this.videoView.texture;
    }

    get isVisible() {
      return this.videoView.alpha === 1 && this.videoView.visible === true;
    }

    _init() {
      this._createVideoTexture();
    }

    _createVideoTexture() {
      const stage = this.stage;
      const gl = stage.gl;
      const glTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, glTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.videoTexture.options = {
        source: glTexture,
        w: this.videoEl.width,
        h: this.videoEl.height
      };
      this.videoView.w = this.videoEl.width / this.stage.getRenderPrecision();
      this.videoView.h = this.videoEl.height / this.stage.getRenderPrecision();
    }

    start() {
      const stage = this.stage;
      this._lastTime = 0;

      if (!this._updateVideoTexture) {
        this._updateVideoTexture = () => {
          if (this.videoTexture.options.source && this.videoEl.videoWidth && this.active) {
            const gl = stage.gl;
            const currentTime = new Date().getTime();
            const getVideoPlaybackQuality = this.videoEl.getVideoPlaybackQuality(); // When BR2_PACKAGE_GST1_PLUGINS_BAD_PLUGIN_DEBUGUTILS is not set in WPE, webkitDecodedFrameCount will not be available.
            // We'll fallback to fixed 30fps in this case.
            // As 'webkitDecodedFrameCount' is about to deprecate, check for the 'totalVideoFrames'

            const frameCount = getVideoPlaybackQuality ? getVideoPlaybackQuality.totalVideoFrames : this.videoEl.webkitDecodedFrameCount;
            const mustUpdate = frameCount ? this._lastFrame !== frameCount : this._lastTime < currentTime - 30;

            if (mustUpdate) {
              this._lastTime = currentTime;
              this._lastFrame = frameCount;

              try {
                gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.videoEl);
                this._lastFrame = this.videoEl.webkitDecodedFrameCount;
                this.videoView.visible = true;
                this.videoTexture.options.w = this.videoEl.width;
                this.videoTexture.options.h = this.videoEl.height;
                const expectedAspectRatio = this.videoView.w / this.videoView.h;
                const realAspectRatio = this.videoEl.width / this.videoEl.height;

                if (expectedAspectRatio > realAspectRatio) {
                  this.videoView.scaleX = realAspectRatio / expectedAspectRatio;
                  this.videoView.scaleY = 1;
                } else {
                  this.videoView.scaleY = expectedAspectRatio / realAspectRatio;
                  this.videoView.scaleX = 1;
                }
              } catch (e) {
                Log.error('texImage2d video', e);
                this.stop();
              }

              this.videoTexture.source.forceRenderUpdate();
            }
          }
        };
      }

      if (!this._updatingVideoTexture) {
        stage.on('frameStart', this._updateVideoTexture);
        this._updatingVideoTexture = true;
      }
    }

    stop() {
      const stage = this.stage;
      stage.removeListener('frameStart', this._updateVideoTexture);
      this._updatingVideoTexture = false;
      this.videoView.visible = false;

      if (this.videoTexture.options.source) {
        const gl = stage.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
    }

    position(top, left) {
      this.videoView.patch({
        smooth: {
          x: left,
          y: top
        }
      });
    }

    size(width, height) {
      this.videoView.patch({
        smooth: {
          w: width,
          h: height
        }
      });
    }

    show() {
      this.videoView.setSmooth('alpha', 1);
    }

    hide() {
      this.videoView.setSmooth('alpha', 0);
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  let mediaUrl = url => url;
  let videoEl;
  let videoTexture;
  let metrics;
  let consumer$1;
  let precision = 1;
  let textureMode = false;
  const initVideoPlayer = config => {
    if (config.mediaUrl) {
      mediaUrl = config.mediaUrl;
    }
  }; // todo: add this in a 'Registry' plugin
  // to be able to always clean this up on app close

  let eventHandlers = {};
  const state$1 = {
    adsEnabled: false,
    playing: false,
    _playingAds: false,

    get playingAds() {
      return this._playingAds;
    },

    set playingAds(val) {
      if (this._playingAds !== val) {
        this._playingAds = val;
        fireOnConsumer$1(val === true ? 'AdStart' : 'AdEnd');
      }
    },

    skipTime: false,
    playAfterSeek: null
  };
  const hooks = {
    play() {
      state$1.playing = true;
    },

    pause() {
      state$1.playing = false;
    },

    seeked() {
      state$1.playAfterSeek === true && videoPlayerPlugin.play();
      state$1.playAfterSeek = null;
    },

    abort() {
      deregisterEventListeners();
    }

  };

  const withPrecision = val => Math.round(precision * val) + 'px';

  const fireOnConsumer$1 = (event, args) => {
    if (consumer$1) {
      consumer$1.fire('$videoPlayer' + event, args, videoEl.currentTime);
      consumer$1.fire('$videoPlayerEvent', event, args, videoEl.currentTime);
    }
  };

  const fireHook = (event, args) => {
    hooks[event] && typeof hooks[event] === 'function' && hooks[event].call(null, event, args);
  };

  let customLoader = null;
  let customUnloader = null;

  const loader = (url, videoEl, config) => {
    return customLoader && typeof customLoader === 'function' ? customLoader(url, videoEl, config) : new Promise(resolve => {
      url = mediaUrl(url);
      videoEl.setAttribute('src', url);
      videoEl.load();
      resolve();
    });
  };

  const unloader = videoEl => {
    return customUnloader && typeof customUnloader === 'function' ? customUnloader(videoEl) : new Promise(resolve => {
      videoEl.removeAttribute('src');
      videoEl.load();
      resolve();
    });
  };

  const setupVideoTag = () => {
    const videoEls = document.getElementsByTagName('video');

    if (videoEls && videoEls.length) {
      return videoEls[0];
    } else {
      const videoEl = document.createElement('video');
      const platformSettingsWidth = Settings.get('platform', 'width') ? Settings.get('platform', 'width') : 1920;
      const platformSettingsHeight = Settings.get('platform', 'height') ? Settings.get('platform', 'height') : 1080;
      videoEl.setAttribute('id', 'video-player');
      videoEl.setAttribute('width', withPrecision(platformSettingsWidth));
      videoEl.setAttribute('height', withPrecision(platformSettingsHeight));
      videoEl.style.position = 'absolute';
      videoEl.style.zIndex = '1';
      videoEl.style.display = 'none';
      videoEl.style.visibility = 'hidden';
      videoEl.style.top = withPrecision(0);
      videoEl.style.left = withPrecision(0);
      videoEl.style.width = withPrecision(platformSettingsWidth);
      videoEl.style.height = withPrecision(platformSettingsHeight);
      document.body.appendChild(videoEl);
      return videoEl;
    }
  };
  const setUpVideoTexture = () => {
    if (!ApplicationInstance.tag('VideoTexture')) {
      const el = ApplicationInstance.stage.c({
        type: VideoTexture,
        ref: 'VideoTexture',
        zIndex: 0,
        videoEl
      });
      ApplicationInstance.childList.addAt(el, 0);
    }

    return ApplicationInstance.tag('VideoTexture');
  };

  const registerEventListeners = () => {
    Log.info('VideoPlayer', 'Registering event listeners');
    Object.keys(events$1).forEach(event => {
      const handler = e => {
        // Fire a metric for each event (if it exists on the metrics object)
        if (metrics && metrics[event] && typeof metrics[event] === 'function') {
          metrics[event]({
            currentTime: videoEl.currentTime
          });
        } // fire an internal hook


        fireHook(event, {
          videoElement: videoEl,
          event: e
        }); // fire the event (with human friendly event name) to the consumer of the VideoPlayer

        fireOnConsumer$1(events$1[event], {
          videoElement: videoEl,
          event: e
        });
      };

      eventHandlers[event] = handler;
      videoEl.addEventListener(event, handler);
    });
  };

  const deregisterEventListeners = () => {
    Log.info('VideoPlayer', 'Deregistering event listeners');
    Object.keys(eventHandlers).forEach(event => {
      videoEl.removeEventListener(event, eventHandlers[event]);
    });
    eventHandlers = {};
  };

  const videoPlayerPlugin = {
    consumer(component) {
      consumer$1 = component;
    },

    loader(loaderFn) {
      customLoader = loaderFn;
    },

    unloader(unloaderFn) {
      customUnloader = unloaderFn;
    },

    position() {
      let top = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      let left = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      videoEl.style.left = withPrecision(left);
      videoEl.style.top = withPrecision(top);

      if (textureMode === true) {
        videoTexture.position(top, left);
      }
    },

    size() {
      let width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1920;
      let height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1080;
      videoEl.style.width = withPrecision(width);
      videoEl.style.height = withPrecision(height);
      videoEl.width = parseFloat(videoEl.style.width);
      videoEl.height = parseFloat(videoEl.style.height);

      if (textureMode === true) {
        videoTexture.size(width, height);
      }
    },

    area() {
      let top = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      let right = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1920;
      let bottom = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1080;
      let left = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      this.position(top, left);
      this.size(right - left, bottom - top);
    },

    open(url) {
      let config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (!this.canInteract) return;
      metrics = Metrics$1.media(url);
      this.hide();
      deregisterEventListeners();

      if (this.src == url) {
        this.clear().then(this.open(url, config));
      } else {
        const adConfig = {
          enabled: state$1.adsEnabled,
          duration: 300
        };

        if (config.videoId) {
          adConfig.caid = config.videoId;
        }

        Ads.get(adConfig, consumer$1).then(ads => {
          state$1.playingAds = true;
          ads.prerolls().then(() => {
            state$1.playingAds = false;
            loader(url, videoEl, config).then(() => {
              registerEventListeners();
              this.show();
              this.play();
            }).catch(e => {
              fireOnConsumer$1('error', {
                videoElement: videoEl,
                event: e
              });
            });
          });
        });
      }
    },

    reload() {
      if (!this.canInteract) return;
      const url = videoEl.getAttribute('src');
      this.close();
      this.open(url);
    },

    close() {
      Ads.cancel();

      if (state$1.playingAds) {
        state$1.playingAds = false;
        Ads.stop(); // call self in next tick

        setTimeout(() => {
          this.close();
        });
      }

      if (!this.canInteract) return;
      this.clear();
      this.hide();
      deregisterEventListeners();
    },

    clear() {
      if (!this.canInteract) return; // pause the video first to disable sound

      this.pause();
      if (textureMode === true) videoTexture.stop();
      return unloader(videoEl).then(() => {
        fireOnConsumer$1('Clear', {
          videoElement: videoEl
        });
      });
    },

    play() {
      if (!this.canInteract) return;
      if (textureMode === true) videoTexture.start();
      executeAsPromise(videoEl.play, null, videoEl).catch(e => {
        fireOnConsumer$1('error', {
          videoElement: videoEl,
          event: e
        });
      });
    },

    pause() {
      if (!this.canInteract) return;
      videoEl.pause();
    },

    playPause() {
      if (!this.canInteract) return;
      this.playing === true ? this.pause() : this.play();
    },

    mute() {
      let muted = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      if (!this.canInteract) return;
      videoEl.muted = muted;
    },

    loop() {
      let looped = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      videoEl.loop = looped;
    },

    seek(time) {
      if (!this.canInteract) return;
      if (!this.src) return; // define whether should continue to play after seek is complete (in seeked hook)

      if (state$1.playAfterSeek === null) {
        state$1.playAfterSeek = !!state$1.playing;
      } // pause before actually seeking


      this.pause(); // currentTime always between 0 and the duration of the video (minus 0.1s to not set to the final frame and stall the video)

      videoEl.currentTime = Math.max(0, Math.min(time, this.duration - 0.1));
    },

    skip(seconds) {
      if (!this.canInteract) return;
      if (!this.src) return;
      state$1.skipTime = (state$1.skipTime || videoEl.currentTime) + seconds;
      easeExecution(() => {
        this.seek(state$1.skipTime);
        state$1.skipTime = false;
      }, 300);
    },

    show() {
      if (!this.canInteract) return;

      if (textureMode === true) {
        videoTexture.show();
      } else {
        videoEl.style.display = 'block';
        videoEl.style.visibility = 'visible';
      }
    },

    hide() {
      if (!this.canInteract) return;

      if (textureMode === true) {
        videoTexture.hide();
      } else {
        videoEl.style.display = 'none';
        videoEl.style.visibility = 'hidden';
      }
    },

    enableAds() {
      let enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      state$1.adsEnabled = enabled;
    },

    /* Public getters */
    get duration() {
      return videoEl && (isNaN(videoEl.duration) ? Infinity : videoEl.duration);
    },

    get currentTime() {
      return videoEl && videoEl.currentTime;
    },

    get muted() {
      return videoEl && videoEl.muted;
    },

    get looped() {
      return videoEl && videoEl.loop;
    },

    get src() {
      return videoEl && videoEl.getAttribute('src');
    },

    get playing() {
      return state$1.playing;
    },

    get playingAds() {
      return state$1.playingAds;
    },

    get canInteract() {
      // todo: perhaps add an extra flag wether we allow interactions (i.e. pauze, mute, etc.) during ad playback
      return state$1.playingAds === false;
    },

    get top() {
      return videoEl && parseFloat(videoEl.style.top);
    },

    get left() {
      return videoEl && parseFloat(videoEl.style.left);
    },

    get bottom() {
      return videoEl && parseFloat(videoEl.style.top - videoEl.style.height);
    },

    get right() {
      return videoEl && parseFloat(videoEl.style.left - videoEl.style.width);
    },

    get width() {
      return videoEl && parseFloat(videoEl.style.width);
    },

    get height() {
      return videoEl && parseFloat(videoEl.style.height);
    },

    get visible() {
      if (textureMode === true) {
        return videoTexture.isVisible;
      } else {
        return videoEl && videoEl.style.display === 'block';
      }
    },

    get adsEnabled() {
      return state$1.adsEnabled;
    },

    // prefixed with underscore to indicate 'semi-private'
    // because it's not recommended to interact directly with the video element
    get _videoEl() {
      return videoEl;
    },

    get _consumer() {
      return consumer$1;
    }

  };
  autoSetupMixin(videoPlayerPlugin, () => {
    precision = ApplicationInstance && ApplicationInstance.stage && ApplicationInstance.stage.getRenderPrecision() || precision;
    videoEl = setupVideoTag();
    textureMode = Settings.get('platform', 'textureMode', false);

    if (textureMode === true) {
      videoEl.setAttribute('crossorigin', 'anonymous');
      videoTexture = setUpVideoTexture();
    }
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  let consumer;

  let getAds = () => {
    // todo: enable some default ads during development, maybe from the settings.json
    return Promise.resolve({
      prerolls: [],
      midrolls: [],
      postrolls: []
    });
  };

  const initAds = config => {
    if (config.getAds) {
      getAds = config.getAds;
    }
  };
  const state = {
    active: false
  };

  const playSlot = function () {
    let slot = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    return slot.reduce((promise, ad) => {
      return promise.then(() => {
        return playAd(ad);
      });
    }, Promise.resolve(null));
  };

  const playAd = ad => {
    return new Promise(resolve => {
      if (state.active === false) {
        Log.info('Ad', 'Skipping add due to inactive state');
        return resolve();
      } // is it safe to rely on videoplayer plugin already created the video tag?


      const videoEl = document.getElementsByTagName('video')[0];
      videoEl.style.display = 'block';
      videoEl.style.visibility = 'visible';
      videoEl.src = mediaUrl(ad.url);
      videoEl.load();
      let timeEvents = null;
      let timeout;

      const cleanup = () => {
        // remove all listeners
        Object.keys(handlers).forEach(handler => videoEl.removeEventListener(handler, handlers[handler]));
        resolve();
      };

      const handlers = {
        play() {
          Log.info('Ad', 'Play ad', ad.url);
          fireOnConsumer('Play', ad);
          sendBeacon(ad.callbacks, 'defaultImpression');
        },

        ended() {
          fireOnConsumer('Ended', ad);
          sendBeacon(ad.callbacks, 'complete');
          cleanup();
        },

        timeupdate() {
          if (!timeEvents && videoEl.duration) {
            // calculate when to fire the time based events (now that duration is known)
            timeEvents = {
              firstQuartile: videoEl.duration / 4,
              midPoint: videoEl.duration / 2,
              thirdQuartile: videoEl.duration / 4 * 3
            };
            Log.info('Ad', 'Calculated quartiles times', {
              timeEvents
            });
          }

          if (timeEvents && timeEvents.firstQuartile && videoEl.currentTime >= timeEvents.firstQuartile) {
            fireOnConsumer('FirstQuartile', ad);
            delete timeEvents.firstQuartile;
            sendBeacon(ad.callbacks, 'firstQuartile');
          }

          if (timeEvents && timeEvents.midPoint && videoEl.currentTime >= timeEvents.midPoint) {
            fireOnConsumer('MidPoint', ad);
            delete timeEvents.midPoint;
            sendBeacon(ad.callbacks, 'midPoint');
          }

          if (timeEvents && timeEvents.thirdQuartile && videoEl.currentTime >= timeEvents.thirdQuartile) {
            fireOnConsumer('ThirdQuartile', ad);
            delete timeEvents.thirdQuartile;
            sendBeacon(ad.callbacks, 'thirdQuartile');
          }
        },

        stalled() {
          fireOnConsumer('Stalled', ad);
          timeout = setTimeout(() => {
            cleanup();
          }, 5000); // make timeout configurable
        },

        canplay() {
          timeout && clearTimeout(timeout);
        },

        error() {
          fireOnConsumer('Error', ad);
          cleanup();
        },

        // this doesn't work reliably on sky box, moved logic to timeUpdate event
        // loadedmetadata() {
        //   // calculate when to fire the time based events (now that duration is known)
        //   timeEvents = {
        //     firstQuartile: videoEl.duration / 4,
        //     midPoint: videoEl.duration / 2,
        //     thirdQuartile: (videoEl.duration / 4) * 3,
        //   }
        // },
        abort() {
          cleanup();
        } // todo: pause, resume, mute, unmute beacons


      }; // add all listeners

      Object.keys(handlers).forEach(handler => videoEl.addEventListener(handler, handlers[handler]));
      videoEl.play();
    });
  };

  const sendBeacon = (callbacks, event) => {
    if (callbacks && callbacks[event]) {
      Log.info('Ad', 'Sending beacon', event, callbacks[event]);
      return callbacks[event].reduce((promise, url) => {
        return promise.then(() => fetch(url) // always resolve, also in case of a fetch error (so we don't block firing the rest of the beacons for this event)
        // note: for fetch failed http responses don't throw an Error :)
        .then(response => {
          if (response.status === 200) {
            fireOnConsumer('Beacon' + event + 'Sent');
          } else {
            fireOnConsumer('Beacon' + event + 'Failed' + response.status);
          }

          Promise.resolve(null);
        }).catch(() => {
          Promise.resolve(null);
        }));
      }, Promise.resolve(null));
    } else {
      Log.info('Ad', 'No callback found for ' + event);
    }
  };

  const fireOnConsumer = (event, args) => {
    if (consumer) {
      consumer.fire('$ad' + event, args);
      consumer.fire('$adEvent', event, args);
    }
  };

  var Ads = {
    get(config, videoPlayerConsumer) {
      if (config.enabled === false) {
        return Promise.resolve({
          prerolls() {
            return Promise.resolve();
          }

        });
      }

      consumer = videoPlayerConsumer;
      return new Promise(resolve => {
        Log.info('Ad', 'Starting session');
        getAds(config).then(ads => {
          Log.info('Ad', 'API result', ads);
          resolve({
            prerolls() {
              if (ads.preroll) {
                state.active = true;
                fireOnConsumer('PrerollSlotImpression', ads);
                sendBeacon(ads.preroll.callbacks, 'slotImpression');
                return playSlot(ads.preroll.ads).then(() => {
                  fireOnConsumer('PrerollSlotEnd', ads);
                  sendBeacon(ads.preroll.callbacks, 'slotEnd');
                  state.active = false;
                });
              }

              return Promise.resolve();
            },

            midrolls() {
              return Promise.resolve();
            },

            postrolls() {
              return Promise.resolve();
            }

          });
        });
      });
    },

    cancel() {
      Log.info('Ad', 'Cancel Ad');
      state.active = false;
    },

    stop() {
      Log.info('Ad', 'Stop Ad');
      state.active = false; // fixme: duplication

      const videoEl = document.getElementsByTagName('video')[0];
      videoEl.pause();
      videoEl.removeAttribute('src');
    }

  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  class ScaledImageTexture extends lng$1.textures.ImageTexture {
    constructor(stage) {
      super(stage);
      this._scalingOptions = undefined;
    }

    set options(options) {
      this.resizeMode = this._scalingOptions = options;
    }

    _getLookupId() {
      return "".concat(this._src, "-").concat(this._scalingOptions.type, "-").concat(this._scalingOptions.w, "-").concat(this._scalingOptions.h);
    }

    getNonDefaults() {
      const obj = super.getNonDefaults();

      if (this._src) {
        obj.src = this._src;
      }

      return obj;
    }

  }

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
  const keyMap = {
    "F1": 112,
    "F2": 113,
    "F3": 114,
    "F4": 115,
    "F5": 116,
    "Amazon": 117,
    //F6
    "Netflix": 118,
    //F7
    "Youtube": 119,
    //F8
    "F11": 122,
    "F12": 123,
    "m": 77,
    "Enter": 13,
    "Space": 32,
    "ArrowUp": 38,
    "ArrowLeft": 37,
    "ArrowRight": 39,
    "ArrowDown": 40,
    "AudioVolumeDown": 174,
    "AudioVolumeUp": 175,
    "AudioVolumeMute": 173,
    "MediaStop": 178,
    "MediaTrackPrevious": 177,
    "MediaPlay": 179,
    "MediaTrackNext": 176,
    "Escape": 27,
    "Pause": 179,
    "Backspace": 8,
    "MediaRewind": 227,
    "MediaFastForward": 228,
    "Power": 116,
    // F5
    "PageUp": 33,
    "PageDown": 34,
    "Home": 36,
    "Settings_Shortcut": 121,
    "Guide_Shortcut": 120,
    "Inputs_Shortcut": 113,
    //F2
    "Picture_Setting_Shortcut": 114 //F3

  };

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

  /**Color constants */
  const themeOptions = {
    partnerOne: {
      hex: 0xfff58233,
      logo: 'RDKLogo.png',
      background: '0xff000000'
    },
    partnerTwo: {
      hex: 0xff91c848,
      logo: 'RDKLogo.png',
      background: '0xff000000'
    }
  };
  const language = {
    English: {
      id: 'en',
      fontSrc: 'Play/Play-Regular.ttf',
      font: 'Play'
    },
    Spanish: {
      id: 'sp',
      fontSrc: 'Play/Play-Regular.ttf',
      font: 'Play'
    }
  };
  const availableLanguages = ['English', 'Spanish'];
  var CONFIG = {
    theme: themeOptions['partnerOne'],
    language: localStorage.getItem('Language') != null && availableLanguages.includes(localStorage.getItem('Language')) ? language[localStorage.getItem('Language')] : language['English']
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  class CollectionWrapper extends lng$1.Component {
    static _template() {
      return {
        Wrapper: {}
      };
    }

    _construct() {
      this._direction = CollectionWrapper.DIRECTION.row;
      this._scrollTransitionSettings = this.stage.transitions.createSettings({});
      this._spacing = 0;
      this._autoResize = false;
      this._requestingItems = false;
      this._requestThreshold = 1;
      this._requestsEnabled = false;
      this._gcThreshold = 5;
      this._gcIncrement = 0;
      this._forceLoad = false;
      this.clear();
    }

    _setup() {
      this._updateScrollTransition();
    }

    _updateScrollTransition() {
      const axis = this._direction === 1 ? 'y' : 'x';
      this.wrapper.transition(axis, this._scrollTransitionSettings);
      this._scrollTransition = this.wrapper.transition(axis);
    }

    _indexChanged(obj) {
      let {
        previousIndex: previous,
        index: target,
        dataLength: max,
        mainIndex,
        previousMainIndex,
        lines
      } = obj;

      if (!isNaN(previousMainIndex) && !isNaN(mainIndex) && !isNaN(lines)) {
        previous = previousMainIndex;
        target = mainIndex;
        max = lines;
      }

      if (this._requestsEnabled && !this._requestingItems) {
        if (previous < target && target + this._requestThreshold >= max) {
          this._requestingItems = true;
          this.signal('onRequestItems', obj).then(response => {
            const type = typeof response;

            if (Array.isArray(response) || type === 'object' || type === 'string' || type === 'number') {
              this.add(response);
            }

            if (response === false) {
              this.enableRequests = false;
            }

            this._requestingItems = false;
          });
        }
      }

      this._refocus();

      this.scrollCollectionWrapper(obj);
      this.signal('onIndexChanged', obj);
    }

    setIndex(index) {
      const targetIndex = limitWithinRange(index, 0, this._items.length - 1);
      const previousIndex = this._index;
      this._index = targetIndex;

      this._indexChanged({
        previousIndex,
        index: targetIndex,
        dataLength: this._items.length
      });

      return previousIndex !== targetIndex;
    }

    clear() {
      this._uids = [];
      this._items = [];
      this._index = 0;

      if (this.wrapper) {
        const hadChildren = this.wrapper.children > 0;
        this.wrapper.patch({
          x: 0,
          y: 0,
          children: []
        });

        if (hadChildren) {
          this._collectGarbage(true);
        }
      }
    }

    add(item) {
      this.addAt(item);
    }

    addAt(item) {
      let index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._items.length;

      if (index >= 0 && index <= this._items.length) {
        if (!Array.isArray(item)) {
          item = [item];
        }

        const items = this._normalizeDataItems(item);

        this._items.splice(index, 0, ...items);

        this.plotItems();
        this.setIndex(this._index);
      } else {
        throw new Error('addAt: The index ' + index + ' is out of bounds ' + this._items.length);
      }
    }

    remove(item) {
      if (this.hasItems && item.assignedID) {
        for (let i = 0; i < this.wrapper.children.length; i++) {
          if (this.wrapper.children[i].assignedID === item.assignedID) {
            return this.removeAt(i);
          }
        }
      } else {
        throw new Error('remove: item not found');
      }
    }

    removeAt(index) {
      let amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      if (index < 0 && index >= this._items.length) {
        throw new Error('removeAt: The index ' + index + ' is out of bounds ' + this._items.length);
      }

      const item = this._items[index];

      this._items.splice(index, amount);

      this.plotItems();
      return item;
    }

    reload(item) {
      this.clear();
      this.add(item);
    }

    plotItems(items, options) {//placeholder
    }

    reposition() {
      let time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 70;

      if (this._repositionDebounce) {
        clearTimeout(this._repositionDebounce);
      }

      this._repositionDebounce = setTimeout(() => {
        this.repositionItems();
      }, time);
    }

    repositionItems() {
      //placeHolder
      this.signal('onItemsRepositioned');
    }

    up() {
      return this._attemptNavigation(-1, 1);
    }

    down() {
      return this._attemptNavigation(1, 1);
    }

    left() {
      return this._attemptNavigation(-1, 0);
    }

    right() {
      return this._attemptNavigation(1, 0);
    }

    first() {
      return this.setIndex(0);
    }

    last() {
      return this.setIndex(this._items.length - 1);
    }

    next() {
      return this.setIndex(this._index + 1);
    }

    previous() {
      return this.setIndex(this._index - 1);
    }

    _attemptNavigation(shift, direction) {
      if (this.hasItems) {
        return this.navigate(shift, direction);
      }

      return false;
    }

    navigate(shift) {
      let direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._direction;

      if (direction !== this._direction) {
        return false;
      }

      return this.setIndex(this._index + shift);
    }

    scrollCollectionWrapper(obj) {
      let {
        previousIndex: previous,
        index: target,
        dataLength: max,
        mainIndex,
        previousMainIndex,
        lines
      } = obj;

      if (!isNaN(previousMainIndex) && !isNaN(mainIndex) && !isNaN(lines)) {
        previous = previousMainIndex;
        target = mainIndex;
        max = lines;
      }

      const {
        directionIsRow,
        main,
        mainDim,
        mainMarginFrom,
        mainMarginTo
      } = this._getPlotProperties(this._direction);

      const cw = this.currentItemWrapper;
      let bound = this[mainDim];

      if (bound === 0) {
        bound = directionIsRow ? 1920 : 1080;
      }

      const offset = Math.min(this.wrapper[main], this._scrollTransition && this._scrollTransition.targetValue || 0);

      const sizes = this._getItemSizes(cw);

      const marginFrom = sizes[mainMarginFrom] || sizes.margin || 0;
      const marginTo = sizes[mainMarginTo] || sizes.margin || 0;
      let scroll = this._scroll;

      if (!isNaN(scroll)) {
        if (scroll >= 0 && scroll <= 1) {
          scroll = bound * scroll - (cw[main] + cw[mainDim] * scroll);
        } else {
          scroll = scroll - cw[main];
        }
      } else if (typeof scroll === 'function') {
        scroll = scroll.apply(this, [cw, obj]);
      } else if (typeof scroll === 'object') {
        const {
          jump = false,
          after = false,
          backward = 0.0,
          forward = 1.0
        } = scroll;

        if (jump) {
          let mod = target % jump;

          if (mod === 0) {
            scroll = marginFrom - cw[main];
          }

          if (mod === jump - 1) {
            const actualSize = marginFrom + cw[mainDim] + marginTo;
            scroll = mod * actualSize + marginFrom - cw[main];
          }
        } else if (after) {
          scroll = 0;

          if (target >= after - 1) {
            const actualSize = marginFrom + cw[mainDim] + marginTo;
            scroll = (after - 1) * actualSize + marginFrom - cw[main];
          }
        } else {
          const backwardBound = bound * this._normalizePixelToPercentage(backward, bound);

          const forwardBound = bound * this._normalizePixelToPercentage(forward, bound);

          if (target < max - 1 && previous < target && offset + cw[main] + cw[mainDim] > forwardBound) {
            scroll = forwardBound - (cw[main] + cw[mainDim]);
          } else if (target > 0 && target < previous && offset + cw[main] < backwardBound) {
            scroll = backwardBound - cw[main];
          } else if (target === max - 1) {
            scroll = bound - (cw[main] + cw[mainDim]);
          } else if (target === 0) {
            scroll = marginFrom - cw[main];
          }
        }
      } else if (isNaN(scroll)) {
        if (previous < target && offset + cw[main] + cw[mainDim] > bound) {
          scroll = bound - (cw[main] + cw[mainDim]);
        } else if (target < previous && offset + cw[main] < 0) {
          scroll = marginFrom - cw[main];
        }
      }

      if (this.active && !isNaN(scroll) && this._scrollTransition) {
        if (this._scrollTransition.isRunning()) {
          this._scrollTransition.reset(scroll, 0.05);
        } else {
          this._scrollTransition.start(scroll);
        }
      } else if (!isNaN(scroll)) {
        this.wrapper[main] = scroll;
      }
    }

    $childInactive(_ref) {
      let {
        child
      } = _ref;

      if (typeof child === 'object') {
        const index = child.componentIndex;

        for (let key in this._items[index]) {
          if (child.component[key] !== undefined) {
            this._items[index][key] = child.component[key];
          }
        }
      }

      this._collectGarbage();
    }

    $getChildComponent(_ref2) {
      let {
        index
      } = _ref2;
      return this._items[index];
    }

    _resizeWrapper(crossSize) {
      let obj = crossSize;

      if (!isNaN(crossSize)) {
        const {
          main,
          mainDim,
          crossDim
        } = this._getPlotProperties(this._direction);

        const lastItem = this.wrapper.childList.last;
        obj = {
          [mainDim]: lastItem[main] + lastItem[mainDim],
          [crossDim]: crossSize
        };
      }

      this.wrapper.patch(obj);

      if (this._autoResize) {
        this.patch(obj);
      }
    }

    _generateUniqueID() {
      let id = '';

      while (this._uids[id] || id === '') {
        id = Math.random().toString(36).substr(2, 9);
      }

      this._uids[id] = true;
      return id;
    }

    _getPlotProperties(direction) {
      const directionIsRow = direction === 0;
      return {
        directionIsRow: directionIsRow ? true : false,
        mainDirection: directionIsRow ? 'rows' : 'columns',
        main: directionIsRow ? 'x' : 'y',
        mainDim: directionIsRow ? 'w' : 'h',
        mainMarginTo: directionIsRow ? 'marginRight' : 'marginBottom',
        mainMarginFrom: directionIsRow ? 'marginLeft' : 'marginUp',
        crossDirection: !directionIsRow ? 'columns' : 'rows',
        cross: directionIsRow ? 'y' : 'x',
        crossDim: directionIsRow ? 'h' : 'w',
        crossMarginTo: directionIsRow ? 'marginBottom' : 'marginRight',
        crossMarginFrom: directionIsRow ? 'marginUp' : 'marginLeft'
      };
    }

    _getItemSizes(item) {
      const itemType = item.type;

      if (item.component && item.component.__attached) {
        item = item.component;
      }

      return {
        w: item.w || itemType && itemType['width'],
        h: item.h || itemType && itemType['height'],
        margin: item.margin || itemType && itemType['margin'] || 0,
        marginLeft: item.marginLeft || itemType && itemType['marginLeft'],
        marginRight: item.marginRight || itemType && itemType['marginRight'],
        marginTop: item.marginTop || itemType && itemType['marginTop'],
        marginBottom: item.marginBottom || itemType && itemType['marginBottom']
      };
    }

    _collectGarbage(immediate) {
      this._gcIncrement++;

      if (immediate || this.active && this._gcThreshold !== 0 && this._gcIncrement >= this._gcThreshold) {
        this._gcIncrement = 0;
        this.stage.gc();
      }
    }

    _normalizeDataItems(array) {
      return array.map((item, index) => {
        return this._normalizeDataItem(item) || index;
      }).filter(item => {
        if (!isNaN(item)) {
          console.warn("Item at index: ".concat(item, ", is not a valid item. Removing it from dataset"));
          return false;
        }

        return true;
      });
    }

    _normalizeDataItem(item, index) {
      if (typeof item === 'string' || typeof item === 'number') {
        item = {
          label: item.toString()
        };
      }

      if (typeof item === 'object') {
        let id = this._generateUniqueID();

        return {
          assignedID: id,
          type: this.itemType,
          collectionWrapper: this,
          isAlive: false,
          ...item
        };
      }

      return index;
    }

    _normalizePixelToPercentage(value, max) {
      if (value && value > 1) {
        return value / max;
      }

      return value || 0;
    }

    _getFocused() {
      if (this.hasItems) {
        return this.currentItemWrapper;
      }

      return this;
    }

    _handleRight() {
      return this.right();
    }

    _handleLeft() {
      return this.left();
    }

    _handleUp() {
      return this.up();
    }

    _handleDown() {
      return this.down();
    }

    _inactive() {
      if (this._repositionDebounce) {
        clearTimeout(this._repositionDebounce);
      }

      this._collectGarbage(true);
    }

    static get itemType() {
      return undefined;
    }

    set forceLoad(bool) {
      this._forceLoad = bool;
    }

    get forceLoad() {
      return this._forceLoad;
    }

    get requestingItems() {
      return this._requestingItems;
    }

    set requestThreshold(num) {
      this._requestThreshold = num;
    }

    get requestThreshold() {
      return this._requestThreshold;
    }

    set enableRequests(bool) {
      this._requestsEnabled = bool;
    }

    get enableRequests() {
      return this._requestsEnabled;
    }

    set gcThreshold(num) {
      this._gcThreshold = num;
    }

    get gcThreshold() {
      return this._gcThreshold;
    }

    get wrapper() {
      return this.tag('Wrapper');
    }

    get hasItems() {
      return this.wrapper && this.wrapper.children && this.wrapper.children.length > 0;
    }

    get currentItemWrapper() {
      return this.wrapper.children[this._index];
    }

    get currentItem() {
      return this.currentItemWrapper.component;
    }

    set direction(string) {
      this._direction = CollectionWrapper.DIRECTION[string] || CollectionWrapper.DIRECTION.row;
    }

    get direction() {
      return Object.keys(CollectionWrapper.DIRECTION)[this._direction];
    }

    set items(array) {
      this.clear();
      this.add(array);
    }

    get items() {
      const itemWrappers = this.itemWrappers;
      return this._items.map((item, index) => {
        if (itemWrappers[index] && itemWrappers[index].component.isAlive) {
          return itemWrappers[index].component;
        }

        return item;
      });
    }

    get length() {
      return this._items.length;
    }

    set index(index) {
      this.setIndex(index);
    }

    get itemWrappers() {
      return this.wrapper.children;
    }

    get index() {
      return this._index;
    }

    set scrollTransition(obj) {
      this._scrollTransitionSettings.patch(obj);

      if (this.active) {
        this._updateScrollTransition();
      }
    }

    get scrollTransition() {
      return this._scrollTransition;
    }

    set scroll(value) {
      this._scroll = value;
    }

    get scrollTo() {
      return this._scroll;
    }

    set autoResize(bool) {
      this._autoResize = bool;
    }

    get autoResize() {
      return this._autoResize;
    }

    set spacing(num) {
      this._spacing = num;
    }

    get spacing() {
      return this._spacing;
    }

  }
  CollectionWrapper.DIRECTION = {
    row: 0,
    column: 1
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  class Cursor extends lng$1.Component {
    static _template() {
      return {
        alpha: 0
      };
    }

    _construct() {
      this._blink = true;
    }

    _init() {
      this._blinkAnimation = this.animation({
        duration: 1,
        repeat: -1,
        actions: [{
          p: 'alpha',
          v: {
            0: 0,
            0.5: 1,
            1: 0
          }
        }]
      });
    }

    show() {
      if (this._blink) {
        this._blinkAnimation.start();
      } else {
        this.alpha = 1;
      }
    }

    hide() {
      if (this._blink) {
        this._blinkAnimation.stop();
      } else {
        this.alpha = 0;
      }
    }

    set blink(bool) {
      this._blink = bool;

      if (this.active) {
        if (bool) {
          this.show();
        } else {
          this.hide();
        }
      }
    }

    get blink() {
      return this._blink;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  class ItemWrapper extends lng$1.Component {
    static _template() {
      return {
        clipbox: true
      };
    }

    create() {
      if (this.children.length > 0) {
        return;
      }

      const component = this.fireAncestors('$getChildComponent', {
        index: this.componentIndex
      });
      component.isAlive = true;
      const {
        w,
        h,
        margin,
        marginUp,
        marginBottom,
        marginRight,
        marginLeft
      } = this;
      this.children = [{ ...component,
        w,
        h,
        margin,
        marginUp,
        marginRight,
        marginLeft,
        marginBottom
      }];

      if (this.hasFocus()) {
        this._refocus();
      }
    }

    get component() {
      return this.children[0] || this.fireAncestors('$getChildComponent', {
        index: this.componentIndex
      });
    }

    _setup() {
      if (this.forceLoad) {
        this.create();
      }
    }

    _active() {
      this.create();
    }

    _inactive() {
      if (!this.forceLoad) {
        this.children[0].isAlive = false;
        this.fireAncestors('$childInactive', {
          child: this
        });
        this.childList.clear();
      }
    }

    _getFocused() {
      return this.children && this.children[0] || this;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  class KeyWrapper extends lng$1.Component {
    static _template() {
      return {
        clipbox: true
      };
    }

    _update() {
      let currentKey = this.children && this.children[0];

      if (currentKey && currentKey.action === this._key.data.action) {
        currentKey.patch({ ...this._key
        });
      } else {
        this.children = [{
          type: this._key.keyType,
          ...this._key
        }];
      }

      if (this.hasFocus()) {
        this._refocus();
      }
    }

    set key(obj) {
      this._key = obj;

      if (this.active) {
        this._update();
      }
    }

    get key() {
      return this._key;
    }

    _active() {
      this._update();
    }

    _inactive() {
      this.childList.clear();
    }

    _getFocused() {
      return this.children && this.children[0] || this;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  const limitWithinRange = (num, min, max) => {
    return Math.min(Math.max(num, min), max);
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  class Grid extends CollectionWrapper {
    _construct() {
      this._crossSpacing = 5;
      this._mainSpacing = 5;
      this._rows = 0;
      this._columns = 0;

      super._construct();
    }

    clear() {
      super.clear();
      this._mainIndex = 0;
      this._crossIndex = 0;
      this._previous = undefined;
    }

    setIndex(index) {
      const targetIndex = limitWithinRange(index, 0, this._items.length - 1);
      const previousIndex = this._index;

      const {
        mainIndex: previousMainIndex,
        crossIndex: previousCrossIndex
      } = this._findLocationOfIndex(this._index);

      const {
        mainIndex,
        crossIndex
      } = this._findLocationOfIndex(targetIndex);

      this._mainIndex = mainIndex;
      this._crossIndex = crossIndex;
      this._index = targetIndex;

      this._indexChanged({
        previousIndex,
        index: targetIndex,
        mainIndex,
        previousMainIndex,
        crossIndex,
        previousCrossIndex,
        lines: this._lines.length,
        dataLength: this._items.length
      });
    }

    _findLocationOfIndex(index) {
      for (let i = 0; i < this._lines.length; i++) {
        if (this._lines[i].includes(index)) {
          return {
            mainIndex: i,
            crossIndex: this._lines[i].indexOf(index)
          };
        }
      }

      return {
        mainIndex: -1,
        crossIndex: -1
      };
    }

    plotItems() {
      const items = this._items;
      const wrapper = this.wrapper;

      const {
        directionIsRow,
        mainDirection,
        main,
        mainDim,
        mainMarginTo,
        mainMarginFrom,
        cross,
        crossDim,
        crossMarginTo,
        crossMarginFrom
      } = this._getPlotProperties(this._direction);

      const crossSize = this[crossDim];
      let mainPos = 0,
          crossPos = 0,
          lineIndex = 0;
      const animateItems = [];
      const viewboundMain = directionIsRow ? 1920 : 1080;
      const viewboundCross = directionIsRow ? 1080 : 1920;
      const renderContext = this.core.renderContext;
      this._lines = [[]]; //create empty line array

      let cl = [];
      const newChildren = items.map((item, index) => {
        const sizes = this._getItemSizes(item);

        const targetCrossFromMargin = sizes[crossMarginFrom] || sizes.margin || 0;

        if (index === 0) {
          mainPos += sizes[mainMarginFrom] || sizes.margin || 0;
        }

        if (cl.length > 0 && (this[mainDirection] > 0 && this[mainDirection] === cl.length || this[mainDirection] === 0 && crossPos + targetCrossFromMargin + sizes[crossDim] > crossSize)) {
          const bil = this._getBiggestInLine(cl);

          mainPos = bil[main] + bil[mainDim] + (bil[mainMarginTo] || bil.margin || this._mainSpacing);
          crossPos = targetCrossFromMargin;

          this._lines.push([]);

          cl = [];
          lineIndex++;
        } else {
          crossPos += targetCrossFromMargin;
        }

        const ref = "IW-".concat(item.assignedID);
        let tmp = mainPos;
        let tcp = crossPos;
        const existingItemWrapper = wrapper.tag(ref);

        if (existingItemWrapper && (existingItemWrapper.active && (crossPos !== existingItemWrapper[cross] || mainPos !== existingItemWrapper[main]) || !existingItemWrapper.active && (renderContext["p".concat(main)] + wrapper[main] + mainPos <= viewboundMain || renderContext["p".concat(cross)] + wrapper[cross] + crossPos <= viewboundCross))) {
          tmp = existingItemWrapper[main];
          tcp = existingItemWrapper[cross];
          animateItems.push(index);
        }

        const newItem = {
          ref,
          type: ItemWrapper,
          componentIndex: index,
          forceLoad: this._forceLoad,
          ...sizes,
          ["assigned".concat(main.toUpperCase())]: mainPos,
          ["assigned".concat(cross.toUpperCase())]: crossPos,
          [main]: tmp,
          [cross]: tcp
        };
        crossPos += sizes[crossDim] + (sizes[crossMarginTo] || sizes.margin || this._crossSpacing);

        this._lines[lineIndex].push(index);

        cl.push(newItem);
        return newItem;
      });
      wrapper.children = newChildren;
      animateItems.forEach(index => {
        const item = wrapper.children[index];
        item.patch({
          smooth: {
            x: item.assignedX,
            y: item.assignedY
          }
        });
      });

      const biggestInLastLine = this._getBiggestInLine(cl);

      this._resizeWrapper({
        [mainDim]: biggestInLastLine[main] + biggestInLastLine[mainDim],
        [crossDim]: crossSize
      });
    }

    repositionItems() {
      const wrapper = this.wrapper;

      if (!wrapper && wrapper.children.length) {
        return true;
      }

      const {
        main,
        mainDim,
        mainMarginTo,
        mainMarginFrom,
        cross,
        crossDim,
        crossMarginTo,
        crossMarginFrom
      } = this._getPlotProperties(this._direction);

      const crossSize = this[crossDim];
      let mainPos = 0,
          crossPos = 0,
          lineIndex = 0; //create empty line array

      let cl = [];
      this.lines = [[]];
      wrapper.children.forEach((item, index) => {
        const sizes = this._getItemSizes(item);

        const targetCrossFromMargin = sizes[crossMarginFrom] || sizes.margin || 0;

        if (index === 0) {
          mainPos += sizes[mainMarginFrom] || sizes.margin || 0;
        }

        if (cl.length > 0 && (this[mainDirection] > 0 && this[mainDirection] === cl.length || this[mainDirection] === 0 && crossPos + targetCrossFromMargin + sizes[crossDim] > crossSize)) {
          const bil = this._getBiggestInLine(cl);

          mainPos = bil[main] + bil[mainDim] + (bil[mainMarginTo] || bil.margin || this._mainSpacing);
          crossPos = targetCrossFromMargin;

          this._lines.push([]);

          cl = [];
          lineIndex++;
        } else {
          crossPos += targetCrossFromMargin;
        }

        item.patch({
          ["assigned".concat(main.toUpperCase())]: mainPos,
          ["assigned".concat(cross.toUpperCase())]: crossPos,
          [main]: mainPos,
          [cross]: crossPos
        });
        crossPos += sizes[crossDim] + (sizes[crossMarginTo] || sizes.margin || this._crossSpacing);

        this._lines[lineIndex].push(index);

        cl.push(newItem);
      });

      const biggestInLastLine = this._getBiggestInLine(cl);

      this._resizeWrapper({
        [mainDim]: biggestInLastLine[main] + biggestInLastLine[mainDim],
        [crossDim]: crossSize
      });

      super.repositionItems();
    }

    _getBiggestInLine(line) {
      const {
        mainDim
      } = this._getPlotProperties(this._direction);

      return line.reduce((biggestItem, newItem) => {
        if (newItem[mainDim] > biggestItem[mainDim]) {
          return newItem;
        }

        return biggestItem;
      });
    }

    navigate(shift, direction) {
      const {
        directionIsRow,
        cross,
        crossDim
      } = this._getPlotProperties(this._direction);

      const overCross = directionIsRow && direction === CollectionWrapper.DIRECTION.column || !directionIsRow && direction === CollectionWrapper.DIRECTION.row;
      let targetMainIndex = this._mainIndex + !!!overCross * shift;
      let targetCrossIndex = this._crossIndex + !!overCross * shift;
      let targetIndex = this._index;

      if (overCross && targetCrossIndex > -1 && targetCrossIndex <= this._lines[targetMainIndex].length) {
        if (this._lines[targetMainIndex][targetCrossIndex] !== undefined) {
          targetIndex = this._lines[targetMainIndex][targetCrossIndex];
          this._previous = undefined;
        }
      } else if (!overCross && targetMainIndex < this._lines.length && targetMainIndex > -1) {
        const targetLine = this._lines[targetMainIndex];

        if (this._previous && this._previous.mainIndex === targetMainIndex) {
          targetIndex = this._previous.realIndex;
          targetCrossIndex = this._previous.crossIndex;
        } else if (targetLine) {
          const currentItem = this.currentItemWrapper;
          const m = targetLine.map(item => {
            const targetItem = this.wrapper.children[item];

            if (targetItem[cross] <= currentItem[cross] && currentItem[cross] <= targetItem[cross] + targetItem[crossDim]) {
              return targetItem[cross] + targetItem[crossDim] - currentItem[cross];
            }

            if (targetItem[cross] >= currentItem[cross] && targetItem[cross] <= currentItem[cross] + currentItem[crossDim]) {
              return currentItem[cross] + currentItem[crossDim] - targetItem[cross];
            }

            return -1;
          });
          let acc = -1;
          let t = -1;

          for (let i = 0; i < m.length; i++) {
            if (m[i] === -1 && acc > -1) {
              break;
            }

            if (m[i] > acc) {
              acc = m[i];
              t = i;
            }
          }

          if (t > -1) {
            targetCrossIndex = t;
            targetIndex = targetLine[t];
          }
        }

        this._previous = {
          mainIndex: this._mainIndex,
          crossIndex: this._crossIndex,
          realIndex: this._index
        };
      }

      if (this._index !== targetIndex) {
        this.setIndex(targetIndex);
        return true;
      }

      return false;
    }

    set rows(num) {
      this._rows = num;
      this.direction = 'row';
    }

    get rows() {
      return this._rows;
    }

    set columns(num) {
      this._columns = num;
      this.direction = 'column';
    }

    get columns() {
      return this._columns;
    }

    set crossSpacing(num) {
      this._crossSpacing = num;
    }

    get crossSpacing() {
      return this._crossSpacing;
    }

    set mainSpacing(num) {
      this._mainSpacing = num;
    }

    get mainSpacing() {
      return this._mainSpacing;
    }

    set spacing(num) {
      this._spacing = num;
      this._mainSpacing = num;
      this._crossSpacing = num;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  class InputField extends lng$1.Component {
    static _template() {
      return {
        PreLabel: {
          renderOffscreen: true
        },
        PostLabel: {
          renderOffscreen: true
        },
        Cursor: {
          type: Cursor,
          rect: true,
          w: 4,
          h: 54,
          x: 0,
          y: 0
        }
      };
    }

    _construct() {
      this._input = '';
      this._previousInput = '';
      this._description = '';
      this._cursorX = 0;
      this._cursorIndex = 0;
      this._passwordMask = '*';
      this._passwordMode = false;
      this._autoHideCursor = true;
      this._labelPositionStatic = true;
      this._maxLabelWidth = 0;
    }

    _init() {
      this.tag('PreLabel').on('txLoaded', () => {
        this._labelTxLoaded();
      });
      this.tag('PostLabel').on('txLoaded', () => {
        this._labelTxLoaded;
      });
    }

    onInputChanged(_ref) {
      let {
        input = ''
      } = _ref;
      let targetIndex = Math.max(input.length - this._input.length + this._cursorIndex, 0);
      this._input = input;

      this._update(targetIndex);
    }

    toggleCursor() {
      let bool = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !this._cursorVisible;
      this._cursorVisible = bool;
      this.cursor[bool ? 'show' : 'hide']();
    }

    _labelTxLoaded() {
      const preLabel = this.tag('PreLabel');
      const cursor = this.tag('Cursor');
      const postLabel = this.tag('PostLabel');
      this.h = preLabel.renderHeight || postLabel.renderHeight;
      cursor.x = preLabel.renderWidth + this._cursorX;
      postLabel.x = cursor.x + cursor.w * (1 - cursor.mountX);
      this.setSmooth('x', this._labelOffset);

      if (!this.autoHideCursor) {
        this.toggleCursor(true);
      }
    }

    _update() {
      let index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      const hasInput = this._input.length > 0;
      let pre = this._description + '';
      let post = '';

      if (hasInput) {
        pre = this._input.substring(0, index);
        post = this._input.substring(index, this._input.length);

        if (this._passwordMode) {
          pre = this._passwordMask.repeat(pre.length);
          post = this._passwordMask.repeat(post.length);
        }

        this.toggleCursor(true);
      } else if (this._autoHideCursor) {
        this.toggleCursor(false);
      }

      this.patch({
        PreLabel: {
          text: {
            text: pre
          }
        },
        PostLabel: {
          text: {
            text: post
          }
        }
      });

      if (this.h === 0) {
        this.tag('PreLabel').loadTexture();
        this.h = this.tag('PreLabel').renderHeight;
      }

      this._cursorIndex = index;
    }

    _handleRight() {
      this._update(Math.min(this._input.length, this._cursorIndex + 1));
    }

    _handleLeft() {
      this._update(Math.max(0, this._cursorIndex - 1));
    }

    _firstActive() {
      this._labelTxLoaded();

      this._update();
    }

    get input() {
      return this._input;
    }

    get hasInput() {
      return this._input.length > 0;
    }

    get cursorIndex() {
      return this._cursorIndex;
    }

    set inputText(obj) {
      this._inputText = obj;
      this.tag('PreLabel').patch({
        text: obj
      });
      this.tag('PostLabel').patch({
        text: obj
      });
    }

    get inputText() {
      return this._inputText;
    }

    set description(str) {
      this._description = str;
    }

    get description() {
      return this._description;
    }

    set cursor(obj) {
      if (obj.x) {
        this._cursorX = obj.x;
        delete obj.x;
      }

      this.tag('Cursor').patch(obj);
    }

    get cursor() {
      return this.tag('Cursor');
    }

    get cursorVisible() {
      return this._cursorVisible;
    }

    set autoHideCursor(bool) {
      this._autoHideCursor = bool;
    }

    get autoHideCursor() {
      return this._autoHideCursor;
    }

    set passwordMode(val) {
      this._passwordMode = val;
    }

    get passwordMode() {
      return this._passwordMode;
    }

    set passwordMask(str) {
      this._passwordMask = str;
    }

    get passwordmask() {
      return this._passwordMask;
    } // the width at which the text start scrolling


    set maxLabelWidth(val) {
      this._maxLabelWidth = val;
    }

    get maxLabelWidth() {
      return this._maxLabelWidth;
    }

    set labelPositionStatic(val) {
      this._labelPositionStatic = val;
    }

    get labelPositionStatic() {
      return this._labelPositionStatic;
    }

    get _labelOffset() {
      if (this._labelPositionStatic) return 0;
      let offset = this.maxLabelWidth - this.tag('Cursor').x;
      return offset < 0 ? offset : 0;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  class Key$1 extends lng$1.Component {
    static _template() {
      return {
        Background: {
          w: w => w,
          h: h => h,
          rect: true
        },
        Label: {
          mount: 0.5,
          x: w => w / 2,
          y: h => h / 2
        }
      };
    }

    _construct() {
      this._backgroundColors = {};
      this._labelColors = {};
    }

    set data(obj) {
      this._data = obj;

      this._update();
    }

    get data() {
      return this._data;
    }

    set labelText(obj) {
      this._labelText = obj;
      this.tag('Label').patch({
        text: obj
      });
    }

    get labelText() {
      return this._labelText;
    }

    set label(obj) {
      this.tag('Label').patch(obj);
    }

    get label() {
      return this.tag('Label');
    }

    set labelColors(obj) {
      this._labelColors = obj;

      this._update();
    }

    get labelColors() {
      return this._labelColors;
    }

    set backgroundColors(obj) {
      this._backgroundColors = obj;

      this._update();
    }

    get backgroundColors() {
      return this._backgroundColors;
    }

    set background(obj) {
      this.tag('Background').patch(obj);
    }

    get background() {
      return this.tag('Background');
    }

    _update() {
      if (!this.active) {
        return;
      }

      const {
        label = ''
      } = this._data;
      const hasFocus = this.hasFocus();
      let {
        focused,
        unfocused = 0xff000000
      } = this._backgroundColors;
      let {
        focused: labelFocused,
        unfocused: labelUnfocused = 0xffffffff
      } = this._labelColors;
      this.patch({
        Background: {
          color: hasFocus && focused ? focused : unfocused
        },
        Label: {
          text: {
            text: label
          },
          color: hasFocus && labelFocused ? labelFocused : labelUnfocused
        }
      });
    }

    _firstActive() {
      this._update();
    }

    _focus() {
      let {
        focused,
        unfocused = 0xff000000
      } = this._backgroundColors;
      let {
        focused: labelFocused,
        unfocused: labelUnfocused = 0xffffffff
      } = this._labelColors;
      this.patch({
        Background: {
          smooth: {
            color: focused || unfocused
          }
        },
        Label: {
          smooth: {
            color: labelFocused || labelUnfocused
          }
        }
      });
    }

    _unfocus() {
      let {
        unfocused = 0xff000000
      } = this._backgroundColors;
      let {
        unfocused: labelUnfocused = 0xffffffff
      } = this._labelColors;
      this.patch({
        Background: {
          smooth: {
            color: unfocused
          }
        },
        Label: {
          smooth: {
            color: labelUnfocused
          }
        }
      });
    }

    static get width() {
      return 80;
    }

    static get height() {
      return 80;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  class Keyboard$1 extends lng$1.Component {
    static _template() {
      return {
        Keys: {
          w: w => w
        }
      };
    }

    _construct() {
      this._input = '';
      this._inputField = undefined;
      this._maxCharacters = 56;
      this.navigationWrapAround = false;
      this.resetFocus();
    }

    resetFocus() {
      this._columnIndex = 0;
      this._rowIndex = 0;
      this._previousKey = null;
    }

    _setup() {
      this._keys = this.tag('Keys');

      this._update();
    }

    _update() {
      const {
        layouts,
        buttonTypes = {},
        styling = {}
      } = this._config;

      if (!this._layout || this._layout && layouts[this._layout] === undefined) {
        console.error("Configured layout \"".concat(this._layout, "\" does not exist. Picking first available: \"").concat(Object.keys(layouts)[0], "\""));
        this._layout = Object.keys(layouts)[0];
      }

      const {
        horizontalSpacing = 0,
        verticalSpacing = 0,
        align = 'left'
      } = styling;
      let rowPosition = 0;
      const isEvent = /^[A-Z][A-Za-z0-9]{1}/;
      const hasLabel = /\:/;

      if (buttonTypes.default === undefined) {
        buttonTypes.default = Key$1;
      }

      this._keys.children = layouts[this._layout].map((row, rowIndex) => {
        const {
          x = 0,
          margin = 0,
          marginRight,
          marginLeft,
          marginTop,
          marginBottom,
          spacing: rowHorizontalSpacing = horizontalSpacing || 0,
          align: rowAlign = align
        } = styling["Row".concat(rowIndex + 1)] || {};
        let keyPosition = 0;
        let rowHeight = 0;
        const rowKeys = row.map((key, keyIndex) => {
          const origin = key;
          let keyType = buttonTypes.default;
          let action = 'Input';
          let label = key;

          if (isEvent.test(key)) {
            if (hasLabel.test(key)) {
              key = key.split(':');
              label = key[1].toString();
              key = key[0];
            }

            if (buttonTypes[key]) {
              keyType = buttonTypes[key];
              action = key.action || key;
            }
          }

          const keySpacing = keyType.margin || keyType.type.margin;
          const {
            w = keyType.type.width || 0,
            h = keyType.type.height || 0,
            marginLeft = keyType.type.marginLeft || keySpacing || 0,
            marginRight = keyType.type.marginRight || keySpacing || rowHorizontalSpacing
          } = keyType;
          rowHeight = h > rowHeight ? h : rowHeight;
          const currentPosition = keyPosition + marginLeft;
          keyPosition += marginLeft + w + marginRight;
          return {
            ref: "Key-{".concat(keyIndex + 1, "}"),
            type: KeyWrapper,
            keyboard: this,
            x: currentPosition,
            w,
            h,
            key: {
              data: {
                origin,
                key,
                label,
                action
              },
              w,
              h,
              ...keyType
            }
          };
        });
        let rowOffset = x + (marginLeft || margin);
        let rowMount = 0;

        if (this.w && rowAlign === 'center') {
          rowOffset = this.w / 2;
          rowMount = 0.5;
        }

        if (this.w && rowAlign === 'right') {
          rowOffset = this.w - (marginRight || margin);
          rowMount = 1;
        }

        const currentPosition = rowPosition + (marginTop || margin);
        rowPosition = currentPosition + rowHeight + (marginBottom || margin || verticalSpacing);
        return {
          ref: "Row-".concat(rowIndex + 1),
          x: rowOffset,
          mountX: rowMount,
          w: keyPosition,
          y: currentPosition,
          children: rowKeys
        };
      });

      this._refocus();
    }

    _getFocused() {
      return this.currentKeyWrapper || this;
    }

    _handleRight() {
      return this.navigate('row', 1);
    }

    _handleLeft() {
      return this.navigate('row', -1);
    }

    _handleUp() {
      return this.navigate('column', -1);
    }

    _handleDown() {
      return this.navigate('column', 1);
    }

    _handleKey(_ref) {
      let {
        key,
        code = 'CustomKey'
      } = _ref;

      if (code === 'Backspace' && this._input.length === 0) {
        return false;
      }

      if (key === ' ') {
        key = 'Space';
      }

      const targetFound = this._findKey(key);

      if (targetFound) {
        this._handleEnter();
      }

      return targetFound;
    }

    _findKey(str) {
      const rows = this._config.layouts[this._layout];
      let i = 0,
          j = 0;

      for (; i < rows.length; i++) {
        for (j = 0; j < rows[i].length; j++) {
          let key = rows[i][j];

          if (str.length > 1 && key.indexOf(str) > -1 || key.toUpperCase() === str.toUpperCase()) {
            this._rowIndex = i;
            this._columnIndex = j;
            return true;
          }
        }
      }

      return false;
    }

    _handleEnter() {
      const {
        origin,
        action
      } = this.currentKey.data;
      const event = {
        index: this._input.length,
        key: origin
      };

      if (this._inputField && this._inputField.cursorIndex) {
        event.index = this._inputField.cursorIndex;
      }

      if (action !== 'Input') {
        const split = event.key.split(':');
        const call = "on".concat(split[0]);
        const eventFunction = this[call];
        event.key = split[1];

        if (eventFunction && eventFunction.apply && eventFunction.call) {
          eventFunction.call(this, event);
        }

        this.signal(call, {
          input: this._input,
          keyboard: this,
          ...event
        });
      } else {
        this.addAt(event.key, event.index);
      }
    }

    _changeInput(input) {
      if (input.length > this._maxCharacters) {
        return;
      }

      const eventData = {
        previousInput: this._input,
        input: this._input = input
      };

      if (this._inputField && this._inputField.onInputChanged) {
        this._inputField.onInputChanged(eventData);
      }

      this.signal('onInputChanged', eventData);
    }

    focus(str) {
      this._findKey(str);
    }

    add(str) {
      this._changeInput(this._input + str);
    }

    addAt(str, index) {
      if (index > this._input.length - 1) {
        this.add(str);
      } else if (index > -1) {
        this._changeInput(this._input.substring(0, index) + str + this._input.substring(index, this._input.length));
      }
    }

    remove() {
      this._changeInput(this._input.substring(0, this._input.length - 1));
    }

    removeAt(index) {
      if (index > this._input.length - 1) {
        this.remove();
      } else if (index > -1) {
        this._changeInput(this._input.substring(0, index - 1) + this._input.substring(index, this._input.length));
      }
    }

    clear() {
      this._changeInput('');
    }

    layout(key) {
      if (key === this._layout) {
        return;
      }

      this._layout = key;

      if (this.attached) {
        this.resetFocus();

        this._update();
      }
    }

    inputField(component) {
      if (component && component.isComponent) {
        this._rowIndex = 0;
        this._columnIndex = 0;
        this._input = component.input !== undefined ? component.input : '';
        this._inputField = component;
      } else {
        this._rowIndex = 0;
        this._columnIndex = 0;
        this._input = '';
        this._inputField = undefined;
      }
    }

    navigate(direction, shift) {
      const targetIndex = (direction === 'row' ? this._columnIndex : this._rowIndex) + shift;
      const currentRow = this.rows[this._rowIndex];

      if (direction === 'row' && targetIndex > -1 && targetIndex < currentRow.children.length) {
        this._previous = null;
        return this._columnIndex = targetIndex;
      } else if (direction === 'row' && this.navigationWrapAround) {
        this._previous = null;
        let rowLen = currentRow.children.length;
        return this._columnIndex = (targetIndex % rowLen + rowLen) % rowLen;
      }

      if (direction === 'column' && targetIndex > -1 && targetIndex < this.rows.length) {
        const currentRowIndex = this._rowIndex;
        const currentColumnIndex = this._columnIndex;

        if (this._previous && this._previous.row === targetIndex) {
          const tmp = this._previous.column;
          this._previous.column = this._columnIndex;
          this._columnIndex = tmp;
          this._rowIndex = this._previous.row;
        } else {
          const targetRow = this.rows[targetIndex];
          const currentKey = this.currentKeyWrapper;
          const currentRow = this.rows[this._rowIndex];
          const currentX = currentRow.x - currentRow.w * currentRow.mountX + currentKey.x;
          const m = targetRow.children.map(key => {
            const keyX = targetRow.x - targetRow.w * targetRow.mountX + key.x;

            if (keyX <= currentX && currentX < keyX + key.w) {
              return keyX + key.w - currentX;
            }

            if (keyX >= currentX && keyX <= currentX + currentKey.w) {
              return currentX + currentKey.w - keyX;
            }

            return -1;
          });
          let acc = -1;
          let t = -1;

          for (let i = 0; i < m.length; i++) {
            if (m[i] === -1 && acc > -1) {
              break;
            }

            if (m[i] > acc) {
              acc = m[i];
              t = i;
            }
          }

          if (t > -1) {
            this._rowIndex = targetIndex;
            this._columnIndex = t;
          } // if no next row found and wraparound is on, loop back to first row
          else if (this.navigationWrapAround) {
            this._columnIndex = Math.min(this.rows[0].children.length - 1, this._columnIndex);
            return this._rowIndex = 0;
          }
        }

        if (this._rowIndex !== currentRowIndex) {
          this._previous = {
            column: currentColumnIndex,
            row: currentRowIndex
          };
          return this._rowIndex = targetIndex;
        }
      } else if (direction === 'column' && this.navigationWrapAround) {
        this._previous = {
          column: this._columnIndex,
          row: this._rowIndex
        };
        let nrRows = this.rows.length;
        this._rowIndex = (targetIndex % nrRows + nrRows) % nrRows;
        this._columnIndex = Math.min(this.rows[this._rowIndex].children.length - 1, this._columnIndex);
      }

      return false;
    }

    onSpace(_ref2) {
      let {
        index
      } = _ref2;
      this.addAt(' ', index);
    }

    onBackspace(_ref3) {
      let {
        index
      } = _ref3;
      this.removeAt(index);
    }

    onClear() {
      this.clear();
    }

    onLayout(_ref4) {
      let {
        key
      } = _ref4;
      this.layout(key);
    }

    set config(obj) {
      this._config = obj;

      if (this.active) {
        this._update();
      }
    }

    get config() {
      return this._config;
    }

    set currentInputField(component) {
      this.inputField(component);
    }

    get currentInputField() {
      return this._inputField;
    }

    set currentLayout(str) {
      this.layout(str);
    }

    get currentLayout() {
      return this._layout;
    }

    set maxCharacters(num) {
      this._maxCharacters = num;
    }

    get maxCharacters() {
      return this._maxCharacters;
    }

    get rows() {
      return this._keys && this._keys.children;
    }

    get currentKeyWrapper() {
      return this.rows && this.rows[this._rowIndex].children[this._columnIndex];
    }

    get currentKey() {
      return this.currentKeyWrapper && this.currentKeyWrapper.key;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  class List extends CollectionWrapper {
    plotItems() {
      const items = this._items;
      const wrapper = this.wrapper;

      const {
        directionIsRow,
        main,
        mainDim,
        mainMarginTo,
        mainMarginFrom,
        cross,
        crossDim
      } = this._getPlotProperties(this._direction);

      let crossPos = 0,
          crossSize = 0,
          position = 0;
      const animateItems = [];
      const viewboundMain = directionIsRow ? 1920 : 1080;
      const viewboundCross = directionIsRow ? 1080 : 1920;
      const renderContext = this.core.renderContext;
      const newChildren = items.map((item, index) => {
        const sizes = this._getItemSizes(item);

        position += sizes[mainMarginFrom] || sizes.margin || 0;

        if (crossSize < sizes[crossDim]) {
          crossSize = sizes[crossDim];
        }

        const ref = "IW-".concat(item.assignedID);
        let mainPos = position;
        crossPos = item[cross] || crossPos;
        let tmp = mainPos;
        let tcp = crossPos;
        const existingItemWrapper = wrapper.tag(ref);

        if (existingItemWrapper && (existingItemWrapper.active && (crossPos !== existingItemWrapper[cross] || mainPos !== existingItemWrapper[main]) || !existingItemWrapper.active && (renderContext["p".concat(main)] + wrapper[main] + mainPos <= viewboundMain || renderContext["p".concat(cross)] + wrapper[cross] + crossPos <= viewboundCross))) {
          tmp = existingItemWrapper[main];
          tcp = existingItemWrapper[cross];
          animateItems.push(index);
        }

        position += sizes[mainDim] + (sizes[mainMarginTo] || sizes.margin || this._spacing);
        return {
          ref,
          type: ItemWrapper,
          componentIndex: index,
          forceLoad: this._forceLoad,
          ...sizes,
          ["assigned".concat(main.toUpperCase())]: mainPos,
          ["assigned".concat(cross.toUpperCase())]: crossPos,
          [main]: tmp,
          [cross]: tcp
        };
      });
      wrapper.children = newChildren;
      animateItems.forEach(index => {
        const item = wrapper.children[index];
        item.patch({
          smooth: {
            x: item.assignedX,
            y: item.assignedY
          }
        });
      });

      this._resizeWrapper(crossSize);
    }

    repositionItems() {
      const wrapper = this.wrapper;

      if (!wrapper && wrapper.children.length) {
        return true;
      }

      const {
        main,
        mainDim,
        mainMarginTo,
        mainMarginFrom,
        cross,
        crossDim
      } = this._getPlotProperties(this._direction);

      let crossPos = 0,
          crossSize = 0,
          position = 0;
      wrapper.children.forEach(item => {
        const sizes = this._getItemSizes(item.component);

        position += sizes[mainMarginFrom] || sizes.margin || 0;
        crossPos = item[cross] || crossPos;

        if (crossSize < sizes[crossDim]) {
          crossSize = sizes[crossDim];
        }

        const mainPos = position;
        position += sizes[mainDim] + (sizes[mainMarginTo] || sizes.margin || this.spacing);
        item.patch({
          ["assigned".concat(main.toUpperCase())]: mainPos,
          ["assigned".concat(cross.toUpperCase())]: 0,
          [main]: mainPos,
          [cross]: crossPos,
          ...sizes
        });
      });

      this._resizeWrapper(crossSize);

      super.repositionItems();
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  class ScrollingLabel extends lng$1.Component {
    static _template() {
      return {
        LabelClipper: {
          w: w => w,
          rtt: true,
          shader: {
            type: lng$1.shaders.FadeOut
          },
          LabelWrapper: {
            Label: {
              renderOffscreen: true
            },
            LabelCopy: {
              renderOffscreen: true
            }
          }
        }
      };
    }

    _construct() {
      this._autoStart = true;
      this._scrollAnimation = false;
      this._fade = 30;
      this._spacing = 30;
      this._label = {};
      this._align = 'left';
      this._animationSettings = {
        delay: 0.7,
        repeat: -1,
        stopMethod: 'immediate'
      };
    }

    _init() {
      const label = this.tag('Label');
      label.on('txLoaded', () => {
        this._update(label);

        this._updateAnimation(label);

        if (this._autoStart) {
          this.start();
        }
      });
    }

    _update() {
      let label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.tag('Label');
      const renderWidth = label.renderWidth;
      const noScroll = renderWidth <= this.w;
      let labelPos = 0;

      if (noScroll && this._align !== 'left') {
        labelPos = (this.w - renderWidth) * ScrollingLabel.ALIGN[this._align];
      }

      this.tag('LabelClipper').patch({
        h: label.renderHeight,
        shader: {
          right: noScroll ? 0 : this._fade
        },
        LabelWrapper: {
          x: 0,
          Label: {
            x: labelPos
          },
          LabelCopy: {
            x: renderWidth + this._spacing
          }
        }
      });
    }

    _updateAnimation() {
      let label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.tag('Label');

      if (this._scrollAnimation) {
        this._scrollAnimation.stopNow();
      }

      if (label.renderWidth > this.w) {
        if (!this._animationSettings.duration) {
          this._animationSettings.duration = label.renderWidth / 50;
        }

        this._scrollAnimation = this.animation({ ...this._animationSettings,
          actions: [{
            t: 'LabelWrapper',
            p: 'x',
            v: {
              sm: 0,
              0: 0,
              1.0: -(label.renderWidth + this._spacing)
            }
          }, {
            t: 'LabelClipper',
            p: 'shader.left',
            v: {
              0: 0,
              0.2: this._fade,
              0.8: this._fade,
              1.0: 0
            }
          }]
        });
      }
    }

    start() {
      if (this._scrollAnimation) {
        this._scrollAnimation.stopNow();

        this.tag('LabelCopy').patch({
          text: this._label
        });

        this._scrollAnimation.start();
      }
    }

    stop() {
      if (this._scrollAnimation) {
        this._scrollAnimation.stopNow();

        this.tag('LabelCopy').text = '';
      }
    }

    set label(obj) {
      if (typeof obj === 'string') {
        obj = {
          text: obj
        };
      }

      this._label = { ...this._label,
        ...obj
      };
      this.tag('Label').patch({
        text: obj
      });
    }

    get label() {
      return this.tag('Label');
    }

    set align(pos) {
      this._align = pos;
    }

    get align() {
      return this._align;
    }

    set autoStart(bool) {
      this._autoStart = bool;
    }

    get autoStart() {
      return this._autoStart;
    }

    set repeat(num) {
      this.animationSettings = {
        repeat: num
      };
    }

    get repeat() {
      return this._animationSettings.repeat;
    }

    set delay(num) {
      this.animationSettings = {
        delay: num
      };
    }

    get delay() {
      return this._animationSettings.delay;
    }

    set duration(num) {
      this.animationSettings = {
        duration: num
      };
    }

    get duration() {
      return this._animationSettings.duration;
    }

    set animationSettings(obj) {
      this._animationSettings = { ...this._animationSettings,
        ...obj
      };

      if (this._scrollAnimation) {
        this._updateAnimation();
      }
    }

    get animationSettings() {
      return this._animationSettings;
    }

  }
  ScrollingLabel.ALIGN = {
    left: 0,
    center: 0.5,
    right: 1
  };

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

  /**
   * Class which contains data for metro app listings.
   */
  var metroAppsInfoOffline = [{
    displayName: "CNN",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.CNN",
    url: "/images/metroApps/Test-01.jpg"
  }, {
    displayName: "VimeoRelease",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.VimeoRelease",
    url: "/images/metroApps/Test-02.jpg"
  }, {
    displayName: "WeatherNetwork",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.WeatherNetwork",
    url: "/images/metroApps/Test-03.jpg"
  }, {
    displayName: "EuroNews",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.Euronews",
    url: "/images/metroApps/Test-04.jpg"
  }, {
    displayName: "AccuWeather",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.AccuWeather",
    url: "/images/metroApps/Test-05.jpg"
  }, {
    displayName: "BaebleMusic",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.BaebleMusic",
    url: "/images/metroApps/Test-06.jpg"
  }, {
    displayName: "Aljazeera",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.Aljazeera",
    url: "/images/metroApps/Test-07.jpg"
  }, {
    displayName: "GuessThatCity",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.GuessThatCity",
    url: "/images/metroApps/Test-08.jpg"
  }, {
    displayName: "Radioline",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.Radioline",
    url: "/images/metroApps/Test-09.jpg"
  }, {
    displayName: "WallStreetJournal",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.WallStreetJournal",
    url: "/images/metroApps/Test-10.jpg"
  }, {
    displayName: "FRacer",
    applicationType: "LightningApp",
    uri: "https://lightningjs.io/fracer/#main",
    url: "/images/metroApps/fracer-steerling.png"
  }, {
    displayName: "Aquarium",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.Aquarium",
    url: "/images/metroApps/Aquarium.png"
  }, {
    displayName: "Fireplace",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.Fireplace",
    url: "/images/metroApps/Fireplace.png"
  }, {
    displayName: "Deutsche Welle",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.DW",
    url: "/images/metroApps/DWelle.png"
  }, {
    displayName: "MyTuner Radio",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.appgeneration.mytuner",
    url: "/images/metroApps/Radio.png"
  }, {
    displayName: "Sudoku",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.Sudoku",
    url: "/images/metroApps/Sudoku.png"
  }, {
    displayName: "Tastemade",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.Tastemade",
    url: "/images/metroApps/Tastemade.png"
  }, {
    displayName: "Bloomberg",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.bloomberg.metrological.x1",
    url: "/images/metroApps/Bloomberg.png"
  }, {
    displayName: "Playworks",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.playworks.pwkids",
    url: "/images/metroApps/Playworks.png"
  }, {
    displayName: "Sunrise",
    applicationType: "LightningApp",
    uri: "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.Sunrise",
    url: "/images/metroApps/Sunrise.png"
  }];

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

  /**
   * Class which contains data for tv shows listings.
   */
  var tvShowsInfo = [{
    displayName: 'Fantasy-Island',
    url: '/images/tvShows/fantasy-island.jpg'
  }, {
    displayName: 'Onward',
    url: '/images/tvShows/onward.jpg'
  }, {
    displayName: 'Let it Snow',
    url: '/images/tvShows/let-it-snow.jpg'
  }, {
    displayName: 'Do Little',
    url: '/images/tvShows/do-little.jpg'
  }, {
    displayName: 'Summerland',
    url: '/images/tvShows/summerland.jpg'
  }];

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

  /**
   * Class which contains data for listings in side panel.
   */
  var sidePanelInfo = [{
    title: 'Apps',
    url: '/images/sidePanel/menu.png'
  }, {
    title: 'Metro Apps',
    url: '/images/sidePanel/metro.png'
  }, {
    title: 'TV Shows',
    url: '/images/sidePanel/video.png'
  }, {
    title: 'Settings',
    url: '/images/sidePanel/settings.png'
  }];

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
  var showCaseApps = [{
    displayName: "Strike Benchmark",
    applicationType: "Lightning",
    uri: "https://strike.lightningjs.io/es6/#home",
    url: "/images/lightningApps/strike_app.png"
  }, {
    displayName: "TMBD App",
    applicationType: "Lightning",
    uri: "https://lightningjs.io/tmdb/#splash",
    url: "/images/lightningApps/tmbd.png"
  }];

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

  /**
   * Class which contains data for app listings.
   */
  var appListInfoOffline = [{
    displayName: 'USB',
    applicationType: '',
    uri: 'USB',
    url: '/images/usb/USB_Featured_Item.jpg'
  }, //the first item should be usb
  {
    displayName: 'Amazon Prime video',
    applicationType: 'Amazon',
    uri: '',
    url: '/images/apps/App_Amazon_Prime_454x255.png'
  }, {
    displayName: 'Youtube',
    applicationType: 'Cobalt',
    uri: 'https://www.youtube.com/tv',
    url: '/images/apps/App_YouTube_454x255.png'
  }, {
    displayName: 'Xumo',
    applicationType: 'HtmlApp',
    uri: 'https://x1box-app.xumo.com/index.html',
    url: '/images/apps/App_Xumo_454x255.png'
  }, {
    displayName: 'Netflix',
    applicationType: 'Netflix',
    uri: '',
    url: '/images/apps/App_Netflix_454x255.png'
  }];

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
  class HomeApi {
    getOfflineMetroApps() {
      return metroAppsInfoOffline;
    }

    getTVShowsInfo() {
      return tvShowsInfo;
    }

    getSidePanelInfo() {
      return sidePanelInfo;
    }

    getAppListInfo() {
      let appsMetaData;

      {
        appsMetaData = appListInfoOffline;
      }

      return appsMetaData;
    }

    getMetroInfo() {
      let metroAppsMetaData;

      {
        metroAppsMetaData = metroAppsInfoOffline;
      }

      return metroAppsMetaData;
    }

    getShowCaseApps() {
      return showCaseApps;
    }

    getAllApps() {
      return [...this.getAppListInfo(), ...this.getMetroInfo(), ...this.getShowCaseApps()];
    }

  }

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
  /**
   * Class to render items in main view.
   */

  class ListItem extends lng$1.Component {
    /**
     * Function to render various elements in the main view item.
     */
    static _template() {
      return {
        Item: {
          Shadow: {
            alpha: 0
          },
          y: 20,
          Image: {},
          Info: {}
        }
      };
    }

    _init() {
      this.tag('Shadow').patch({
        color: CONFIG.theme.hex,
        rect: true,
        h: this.h + this.bar * 2,
        w: this.w,
        x: this.x,
        y: this.y - this.bar
      });

      if (this.data.url.startsWith('/images')) {
        this.tag('Image').patch({
          rtt: true,
          x: this.x,
          y: this.y,
          w: this.w,
          h: this.h,
          src: Utils.asset(this.data.url),
          scale: this.unfocus
        });
      } else {
        this.tag('Image').patch({
          rtt: true,
          x: this.x,
          y: this.y,
          w: this.w,
          h: this.h,
          src: this.data.url
        });
      }
      /* Used static data for develpment purpose ,
      it wil replaced with Dynamic data once implimetation is completed.*/


      this.tag('Info').patch({
        x: this.x - 20,
        y: this.y + this.h + 10,
        w: this.w,
        h: 140,
        alpha: 0,
        PlayIcon: {
          Label: {
            x: this.idx === 0 ? this.x + 20 : this.x,
            y: this.y + 10,
            text: {
              fontFace: CONFIG.language.font,
              text: this.data.displayName,
              fontSize: 35,
              maxLines: 1,
              wordWrapWidth: this.w
            }
          }
        }
      });
    }
    /**
     * Function to change properties of item during focus.
     */


    _focus() {
      this.tag('Image').patch({
        x: this.x,
        y: this.y,
        w: this.w,
        h: this.h,
        zIndex: 1,
        scale: this.focus
      });
      this.tag('Info').alpha = 1;
      this.tag('Item').patch({
        zIndex: 2
      });
      this.tag('Shadow').patch({
        smooth: {
          scale: [this.focus, {
            timingFunction: 'ease',
            duration: 0.7
          }],
          alpha: 1
        }
      });
    }
    /**
     * Function to change properties of item during unfocus.
     */


    _unfocus() {
      this.tag('Image').patch({
        w: this.w,
        h: this.h,
        scale: this.unfocus,
        zIndex: 0
      });
      this.tag('Item').patch({
        zIndex: 0
      });
      this.tag('Info').alpha = 0;
      this.tag('Shadow').patch({
        smooth: {
          alpha: 0,
          scale: [this.unfocus, {
            timingFunction: 'ease',
            duration: 0.7
          }]
        }
      });
    }

  }

  /**
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  let ws = null;

  if (typeof WebSocket !== 'undefined') {
    ws = WebSocket;
  }

  var ws_1 = ws;
  const requestsQueue = {};
  const listeners = {};

  var requestQueueResolver = data => {
    if (typeof data === 'string') {
      let regex1 = /\\\\x([0-9A-Fa-f]{2})/g;
      let regex2 = /\\x([0-9A-Fa-f]{2})/g;
      data = data.normalize().replace(regex1, '');
      data = data.normalize().replace(regex2, '');
      data = JSON.parse(data);
    }

    if (data.id) {
      const request = requestsQueue[data.id];

      if (request) {
        if ('result' in data) request.resolve(data.result);else request.reject(data.error);
        delete requestsQueue[data.id];
      } else {
        console.log('no pending request found with id ' + data.id);
      }
    }
  };

  var notificationListener = data => {
    if (typeof data === 'string') {
      let regex1 = /\\\\x([0-9A-Fa-f]{2})/g;
      let regex2 = /\\x([0-9A-Fa-f]{2})/g;
      data = data.normalize().replace(regex1, '');
      data = data.normalize().replace(regex2, '');
      data = JSON.parse(data);
    }

    if (!data.id && data.method) {
      const callbacks = listeners[data.method];

      if (callbacks && Array.isArray(callbacks) && callbacks.length) {
        callbacks.forEach(callback => {
          callback(data.params);
        });
      }
    }
  };

  const protocol = 'ws://';
  const host = 'localhost';
  const endpoint = '/jsonrpc';
  const port = 80;

  var makeWebsocketAddress = options => {
    return [options && options.protocol || protocol, options && options.host || host, ':' + (options && options.port || port), options && options.endpoint || endpoint, options && options.token ? '?token=' + options.token : null].join('');
  };

  const sockets = {};

  var connect = options => {
    return new Promise((resolve, reject) => {
      const socketAddress = makeWebsocketAddress(options);
      let socket = sockets[socketAddress];
      if (socket && socket.readyState === 1) return resolve(socket);

      if (socket && socket.readyState === 0) {
        const waitForOpen = () => {
          socket.removeEventListener('open', waitForOpen);
          resolve(socket);
        };

        return socket.addEventListener('open', waitForOpen);
      }

      if (socket == null) {
        if (options.debug) {
          console.log('Opening socket to ' + socketAddress);
        }

        socket = new ws_1(socketAddress, options && options.subprotocols || 'notification');
        sockets[socketAddress] = socket;
        socket.addEventListener('message', message => {
          if (options.debug) {
            console.log(' ');
            console.log('API REPONSE:');
            console.log(JSON.stringify(message.data, null, 2));
            console.log(' ');
          }

          requestQueueResolver(message.data);
        });
        socket.addEventListener('message', message => {
          notificationListener(message.data);
        });
        socket.addEventListener('error', () => {
          notificationListener({
            method: 'client.ThunderJS.events.error'
          });
          sockets[socketAddress] = null;
        });

        const handleConnectClosure = event => {
          sockets[socketAddress] = null;
          reject(event);
        };

        socket.addEventListener('close', handleConnectClosure);
        socket.addEventListener('open', () => {
          notificationListener({
            method: 'client.ThunderJS.events.connect'
          });
          socket.removeEventListener('close', handleConnectClosure);
          socket.addEventListener('close', () => {
            notificationListener({
              method: 'client.ThunderJS.events.disconnect'
            });
            sockets[socketAddress] = null;
          });
          resolve(socket);
        });
      } else {
        sockets[socketAddress] = null;
        reject('Socket error');
      }
    });
  };

  var makeBody = (requestId, plugin, method, params, version) => {
    if (params) {
      delete params.version;

      if (params.versionAsParameter) {
        params.version = params.versionAsParameter;
        delete params.versionAsParameter;
      }
    }

    const body = {
      jsonrpc: '2.0',
      id: requestId,
      method: [plugin, version, method].join('.')
    };
    params || params === false ? typeof params === 'object' && Object.keys(params).length === 0 ? null : body.params = params : null;
    return body;
  };

  var getVersion = (versionsConfig, plugin, params) => {
    const defaultVersion = 1;
    let version;

    if (version = params && params.version) {
      return version;
    }

    return versionsConfig ? versionsConfig[plugin] || versionsConfig.default || defaultVersion : defaultVersion;
  };

  let id = 0;

  var makeId = () => {
    id = id + 1;
    return id;
  };

  var execRequest = (options, body) => {
    return connect(options).then(connection => {
      connection.send(JSON.stringify(body));
    });
  };

  var API = options => {
    return {
      request(plugin, method, params) {
        return new Promise((resolve, reject) => {
          const requestId = makeId();
          const version = getVersion(options.versions, plugin, params);
          const body = makeBody(requestId, plugin, method, params, version);

          if (options.debug) {
            console.log(' ');
            console.log('API REQUEST:');
            console.log(JSON.stringify(body, null, 2));
            console.log(' ');
          }

          requestsQueue[requestId] = {
            body,
            resolve,
            reject
          };
          execRequest(options, body).catch(e => {
            reject(e);
          });
        });
      }

    };
  };

  var DeviceInfo = {
    freeRam(params) {
      return this.call('systeminfo', params).then(res => {
        return res.freeram;
      });
    },

    version(params) {
      return this.call('systeminfo', params).then(res => {
        return res.version;
      });
    }

  };
  var plugins = {
    DeviceInfo
  };

  function listener(plugin, event, callback, errorCallback) {
    const thunder = this;
    const index = register.call(this, plugin, event, callback, errorCallback);
    return {
      dispose() {
        const listener_id = makeListenerId(plugin, event);
        if (listeners[listener_id] === undefined) return;
        listeners[listener_id].splice(index, 1);

        if (listeners[listener_id].length === 0) {
          unregister.call(thunder, plugin, event, errorCallback);
        }
      }

    };
  }

  const makeListenerId = (plugin, event) => {
    return ['client', plugin, 'events', event].join('.');
  };

  const register = function (plugin, event, callback, errorCallback) {
    const listener_id = makeListenerId(plugin, event);

    if (!listeners[listener_id]) {
      listeners[listener_id] = [];

      if (plugin !== 'ThunderJS') {
        const method = 'register';
        const request_id = listener_id.split('.').slice(0, -1).join('.');
        const params = {
          event,
          id: request_id
        };
        this.api.request(plugin, method, params).catch(e => {
          if (typeof errorCallback === 'function') errorCallback(e.message);
        });
      }
    }

    listeners[listener_id].push(callback);
    return listeners[listener_id].length - 1;
  };

  const unregister = function (plugin, event, errorCallback) {
    const listener_id = makeListenerId(plugin, event);
    delete listeners[listener_id];

    if (plugin !== 'ThunderJS') {
      const method = 'unregister';
      const request_id = listener_id.split('.').slice(0, -1).join('.');
      const params = {
        event,
        id: request_id
      };
      this.api.request(plugin, method, params).catch(e => {
        if (typeof errorCallback === 'function') errorCallback(e.message);
      });
    }
  };

  var thunderJS = options => {
    if (options.token === undefined && typeof window !== 'undefined' && window.thunder && typeof window.thunder.token === 'function') {
      options.token = window.thunder.token();
    }

    return wrapper({ ...thunder$2(options),
      ...plugins
    });
  };

  const resolve = (result, args) => {
    if (typeof result !== 'object' || typeof result === 'object' && (!result.then || typeof result.then !== 'function')) {
      result = new Promise((resolve, reject) => {
        result instanceof Error === false ? resolve(result) : reject(result);
      });
    }

    const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;

    if (cb) {
      result.then(res => cb(null, res)).catch(err => cb(err));
    } else {
      return result;
    }
  };

  const thunder$2 = options => ({
    options,
    api: API(options),
    plugin: false,

    call() {
      const args = [...arguments];

      if (this.plugin) {
        if (args[0] !== this.plugin) {
          args.unshift(this.plugin);
        }
      }

      const plugin = args[0];
      const method = args[1];

      if (typeof this[plugin][method] == 'function') {
        return this[plugin][method](args[2]);
      }

      return this.api.request.apply(this, args);
    },

    registerPlugin(name, plugin) {
      this[name] = wrapper(Object.assign(Object.create(thunder$2), plugin, {
        plugin: name
      }));
    },

    subscribe() {},

    on() {
      const args = [...arguments];

      if (['connect', 'disconnect', 'error'].indexOf(args[0]) !== -1) {
        args.unshift('ThunderJS');
      } else {
        if (this.plugin) {
          if (args[0] !== this.plugin) {
            args.unshift(this.plugin);
          }
        }
      }

      return listener.apply(this, args);
    },

    once() {
      console.log('todo ...');
    }

  });

  const wrapper = obj => {
    return new Proxy(obj, {
      get(target, propKey) {
        const prop = target[propKey];

        if (propKey === 'api') {
          return target.api;
        }

        if (typeof prop !== 'undefined') {
          if (typeof prop === 'function') {
            if (['on', 'once', 'subscribe'].indexOf(propKey) > -1) {
              return function () {
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
                }

                return prop.apply(this, args);
              };
            }

            return function () {
              for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
              }

              return resolve(prop.apply(this, args), args);
            };
          }

          if (typeof prop === 'object') {
            return wrapper(Object.assign(Object.create(thunder$2(target.options)), prop, {
              plugin: propKey
            }));
          }

          return prop;
        } else {
          if (target.plugin === false) {
            return wrapper(Object.assign(Object.create(thunder$2(target.options)), {}, {
              plugin: propKey
            }));
          }

          return function () {
            for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              args[_key3] = arguments[_key3];
            }

            args.unshift(propKey);
            return target.call.apply(this, args);
          };
        }
      }

    });
  };

  const config$1 = {
    host: '127.0.0.1',
    port: 9998,
    default: 1,
    versions: {
      'org.rdk.System': 2
    }
  };
  const thunder$1 = thunderJS(config$1);

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
  /**
   * Class that contains functions which commuicates with thunder API's
   */

  class AppApi {
    constructor() {
      this.activatedForeground = false;
      this._events = new Map();
    }
    /**
     *
     * @param {string} eventId
     * @param {function} callback
     * Function to register the events for the Bluetooth plugin.
     */


    registerEvent(eventId, callback) {
      this._events.set(eventId, callback);
    }

    getPluginStatus(plugin) {
      return new Promise((resolve, reject) => {
        Log.info("g plugin status");
        thunder$1.call('Controller', "status@".concat(plugin)).then(result => {
          Log.info("result = ", result);
          resolve(result);
        }).catch(err => {
          Log.error(err);
          reject(err);
        });
      });
    }
    /**
     * Function to launch Netflix/Amazon Prime app.
     */


    async launchApp(childCallsign, url, preventInternetCheck) {
      if (!preventInternetCheck) {
        //preventInternetCheck is a boolean, 
        let internet = await this.isConnectedToInternet();

        if (!internet) {
          return new Promise.reject("No Internet Available, can't launch app.");
        }
      }

      let params = {};

      if (url !== undefined && childCallsign !== "Cobalt") {
        //for cobalt url is passed through deep link method instead of launch
        params = {
          "callsign": childCallsign,
          "type": childCallsign,
          "uri": url
        };
      } else {
        params = {
          "callsign": childCallsign,
          "type": childCallsign
        };
      }

      return new Promise((resolve, reject) => {
        thunder$1.call('org.rdk.RDKShell', 'launch', params).then(res => {
          Log.info(res); //redundant calls for moveToFront and setFocus, as some apps needs it when launched from suspended state

          if (res.success) {
            thunder$1.call("org.rdk.RDKShell", "setFocus", {
              "client": childCallsign,
              "callsign": childCallsign
            }).then(res => {
              if (res.success) {
                thunder$1.call('org.rdk.RDKShell', 'setVisibility', {
                  client: 'ResidentApp',
                  visible: false
                });
                thunder$1.call("org.rdk.RDKShell", "moveToFront", {
                  "client": childCallsign,
                  "callsign": childCallsign
                }).catch(err => {
                  console.error("failed to move moveToFront to: ", childCallsign, " ERROR: ", JSON.stringify(err));
                });
              }
            }).catch(err => {
              console.error("failed to move setFocus to: ", childCallsign, " ERROR: ", JSON.stringify(err));
            });

            if (childCallsign === "Cobalt" && url) {
              //passing url to cobalt once launched
              thunder$1.call(childCallsign, 'deeplink', url);
            }

            resolve(true); //launch success no need to worry about setFocus and moveToFront
          } else {
            console.error("failed to launch app: ", childCallsign, "(success false) ERROR: ", JSON.stringify(res));
            reject(false);
          }
        }).catch(err => {
          console.error("failed to launch app: ", childCallsign, " ERROR: ", JSON.stringify(err));
          reject(err);
        });
      });
    }

    suspendOrDestroyApp(childCallsign, mode) {
      return new Promise((resolve, reject) => {
        thunder$1.call('org.rdk.RDKShell', mode, {
          "callsign": childCallsign
        }).then(res => {
          Log.info(res); //redundant calls for moveToFront and setFocus, as some apps needs it when launched from suspended state

          if (res.success) {
            thunder$1.call("org.rdk.RDKShell", "setFocus", {
              "client": 'ResidentApp',
              "callsign": 'ResidentApp'
            }).then(res => {
              if (res.success) {
                thunder$1.call('org.rdk.RDKShell', 'setVisibility', {
                  client: 'ResidentApp',
                  visible: true
                });
                thunder$1.call("org.rdk.RDKShell", "moveToFront", {
                  "client": 'ResidentApp',
                  "callsign": 'ResidentApp'
                }).catch(err => {
                  console.error("failed to move moveToFront to: ", 'ResidentApp', " ERROR: ", JSON.stringify(err));
                });
              }
            }).catch(err => {
              console.error("failed to move setFocus to: ", 'ResidentApp', " ERROR: ", JSON.stringify(err));
            });
            resolve(true); //launch success no need to worry about setFocus and moveToFront
          } else {
            console.error("failed to exit app: ", childCallsign, "(success false) ERROR: ", JSON.stringify(res));
            reject(false);
          }
        }).catch(err => {
          console.error("failed to exit app: ", childCallsign, " ERROR: ", JSON.stringify(err));
          reject(err);
        });
      });
    }
    /**
     * Function to set visibility to client apps.
     * @param {client} clients client app.
     * @param {visible} visible value of visibility.
     */


    setVisibilityandFocus(client, visible) {
      return new Promise((resolve, reject) => {
        thunder$1.call('org.rdk.RDKShell', 'setVisibility', {
          client: client,
          visible: visible
        });
        thunder$1.call('org.rdk.RDKShell', 'setFocus', {
          client: client
        }).then(res => {
          resolve(true);
        }).catch(err => {
          Log.error('Set focus error', JSON.stringify(err));
          reject(false);
        });
      });
    }

    changeVisibility(client, visible) {
      return new Promise((resolve, reject) => {
        thunder$1.call('org.rdk.RDKShell', 'setVisibility', {
          client: client,
          visible: visible
        });
      });
    }

    moveToFront(cli) {
      thunder$1.call('org.rdk.RDKShell', 'moveToFront', {
        client: cli,
        callsign: cli
      });
    }

    setFocus(cli) {
      thunder$1.call('org.rdk.RDKShell', 'setFocus', {
        client: cli
      });
    }

    standby(value) {
      return new Promise((resolve, reject) => {
        thunder$1.call('org.rdk.System', 'setPowerState', {
          "powerState": value,
          "standbyReason": "Requested by user"
        }).then(result => {
          resolve(result);
        }).catch(err => {
          resolve(false);
        });
      });
    }

    getZone() {
      return new Promise((resolve, reject) => {
        const systemcCallsign = 'org.rdk.System';
        thunder$1.call(systemcCallsign, 'getTimeZoneDST').then(result => {
          resolve(result.timeZone);
        }).catch(err => {
          console.log('Failed to fetch Time Zone');
          resolve(undefined);
        });
      });
    }

    getPluginStatus(plugin) {
      return new Promise((resolve, reject) => {
        thunder$1.call('Controller', "status@".concat(plugin)).then(result => {
          resolve(result);
        }).catch(err => {
          reject(err);
        });
      });
    } //2. Get default interface


    getDefaultInterface() {
      return new Promise((resolve, reject) => {
        thunder$1.call('org.rdk.Network', 'getDefaultInterface').then(result => {
          resolve(result);
        }).catch(err => {
          console.log("error in getting default interface:", JSON.stringify(err, 3, null));
          resolve(false);
        });
      });
    } //1. Get IP Setting


    getIPSetting(defaultInterface) {
      return new Promise((resolve, reject) => {
        thunder$1.call('org.rdk.Network', 'getIPSettings', {
          "interface": defaultInterface
        }).then(result => {
          resolve(result);
        }).catch(err => {
          console.log("error in getting network info:", JSON.stringify(err, 3, null));
          resolve(false);
        });
      });
    } //5. getConnectedSSID


    getConnectedSSID() {
      return new Promise((resolve, reject) => {
        thunder$1.call('org.rdk.Wifi', 'getConnectedSSID').then(result => {
          resolve(result);
        }).catch(err => {
          console.log("error in getting connected SSID:", JSON.stringify(err, 3, null));
          resolve(false);
        });
      });
    } //4. Get interfaces


    getInterfaces() {
      return new Promise((resolve, reject) => {
        thunder$1.call('org.rdk.Network', 'getInterfaces').then(result => {
          resolve(result);
        }).catch(err => {
          console.log("error in getting interfaces:", JSON.stringify(err, 3, null));
          resolve(false);
        });
      });
    }

    isConnectedToInternet() {
      return new Promise((resolve, reject) => {
        let header = new Headers();
        header.append('pragma', 'no-cache');
        header.append('cache-control', 'no-cache');
        fetch("https://apps.rdkcentral.com/rdk-apps/accelerator-home-ui/index.html", {
          method: 'GET',
          headers: header
        }).then(res => {
          if (res.status >= 200 && res.status <= 300) {
            console.log("Connected to internet");
            resolve(true);
          } else {
            console.log("No Internet Available");
            resolve(false);
          }
        }).catch(err => {
          console.log("Internet Check failed: No Internet Available");
          resolve(false); //fail of fetch method needs to be considered as no internet
        });
      });
    }

  }

  class MainView extends lng$1.Component {
    static _template() {
      return {
        rect: true,
        color: CONFIG.theme.background,
        w: 1920,
        h: 1080,
        clipping: true,
        MainView: {
          w: 1720,
          h: 1200,
          zIndex: 2,
          y: 270,
          x: 200,
          clipping: false,
          Text1: {
            h: 30,
            text: {
              //   fontFace: CONFIG.language.font,
              fontSize: 25,
              text: 'Featured Content',
              fontStyle: 'normal',
              textColor: 0xFFFFFFFF
            },
            zIndex: 0
          },
          AppList: {
            y: 37,
            x: 0,
            type: List,
            h: 400,
            scroll: {
              after: 2
            },
            spacing: 20
          },
          Text2: {
            // x: 10 + 25,
            y: 395,
            h: 30,
            text: {
              //   fontFace: CONFIG.language.font,
              fontSize: 25,
              text: 'Lightning Apps',
              fontStyle: 'normal',
              textColor: 0xFFFFFFFF
            }
          },
          MetroApps: {
            x: -20,
            y: 435,
            type: List,
            flex: {
              direction: 'row',
              paddingLeft: 20,
              wrap: false
            },
            // w: 1745,
            h: 300,
            scroll: {
              after: 6
            },
            spacing: 20 // itemSize: 288,
            // roll: true,
            // rollMax: 1745,
            // horizontal: true,
            // itemScrollOffset: -4,
            // clipping: false,

          },
          Text3: {
            // x: 10 + 25,
            y: 695,
            h: 30,
            text: {
              //   fontFace: CONFIG.language.font,
              fontSize: 25,
              text: 'Featured Video on Demand',
              fontStyle: 'normal',
              textColor: 0xFFFFFFFF
            }
          },
          TVShows: {
            x: -20,
            y: 735,
            type: List,
            flex: {
              direction: 'row',
              paddingLeft: 20,
              wrap: false
            },
            h: 300,
            scroll: {
              after: 12
            },
            spacing: 20
          }
        }
      };
    }

    _firstActive() {
      this.flag = true;
      let self = this;
      var appItems;

      self.appApi = new AppApi();
      self.homeApi = new HomeApi(); // the above snippet takes about 1-1.5 milliseconds

      appItems = self.homeApi.getAppListInfo();
      self.metroApps = self.homeApi.getOfflineMetroApps(); // this snippet takes about 200-220 milliseconds

      self.tvShowItems = self.homeApi.getTVShowsInfo();
      appItems.shift();
      self.appItems = appItems;

      self._setState("AppList.0"); // the above snippet takes about 1-1.5 milliseconds
      // this snippet takes about 200-220 milliseconds
      // this snippet takes about 20 milli seconds
      // self.tvShowItems = self.homeApi.getTVShowsInfo();
      // });
      // the below timeout should run as the last timeout in this first active function


      setTimeout(function () {
        self.fireAncestors("$setEventListeners");
      }, 0);
    }

    set appItems(items) {
      this.currentItems = items;
      let appList = this.tag('AppList'); // appList.clear();

      let index = 0;
      let lastIndex = items.length;

      function addItem() {
        if (index < lastIndex) {
          appList.add({
            w: 454,
            h: 255,
            type: ListItem,
            data: items[index],
            focus: 1.11,
            unfocus: 1,
            idx: index,
            bar: 12
          });
          index++;
          requestAnimationFrame(addItem);
        } else {
          return;
        }
      }

      requestAnimationFrame(addItem);
    }

    set metroApps(items) {
      let metroApps = this.tag('MetroApps');
      let lastIndex = items.length;
      let index = 0;

      function addItem() {
        if (index < lastIndex) {
          metroApps.add({
            w: 268,
            h: 151,
            type: ListItem,
            data: items[index],
            focus: 1.15,
            unfocus: 1,
            idx: index,
            bar: 12
          });
          index++;
          requestAnimationFrame(addItem);
        } else {
          return;
        }
      }

      requestAnimationFrame(addItem);
    }

    set tvShowItems(items) {
      let tvShowList = this.tag('TVShows');
      let index = 0;
      let lastIndex = items.length;

      function addItem() {
        if (index < lastIndex) {
          tvShowList.add({
            w: 268,
            h: 151,
            type: ListItem,
            data: items[index],
            focus: 1.11,
            unfocus: 1,
            idx: index,
            bar: 12
          });
          index++;
          requestAnimationFrame(addItem);
        } else {
          return;
        }
      }

      requestAnimationFrame(addItem);
    }

    scroll(val) {
      this.tag("MainView").y = val;
    }

    static _states() {
      return [class AppList extends this {
        $enter() {
          this.indexVal = 0;
        }

        $exit() {
          this.tag('Text1').text.fontStyle = 'normal';
        }

        _getFocused() {
          this.tag('Text1').text.fontStyle = 'bold';

          if (this.tag('AppList').length) {
            return this.tag('AppList');
          }
        }

        _handleDown() {
          this._setState('MetroApps');
        }

        _handleUp() {
          this.widgets.menu.notify('TopPanel');
        }

        _handleLeft() {
          this.tag('Text1').text.fontStyle = 'normal';
          Router.focusWidget('Menu');
        }

        _handleEnter() {
          let applicationType = this.tag('AppList').items[this.tag('AppList').index].data.applicationType;
          this.uri = this.tag('AppList').items[this.tag('AppList').index].data.uri;
          Storage.set('applicationType', applicationType);
          this.appApi.launchApp(applicationType, this.uri);
        }

      }, class MetroApps extends this {
        $enter() {
          this.indexVal = 1;
        }

        $exit() {
          this.tag('Text2').text.fontStyle = 'normal';
        }

        _getFocused() {
          this.tag('Text2').text.fontStyle = 'bold';

          if (this.tag('MetroApps').length) {
            return this.tag('MetroApps');
          }
        }

        _handleUp() {
          this._setState('AppList');
        }

        _handleDown() {
          this._setState('TVShows');
        }

        _handleRight() {
          if (this.tag('MetroApps').length - 1 != this.tag('MetroApps').index) {
            this.tag('MetroApps').setNext();
            return this.tag('MetroApps').element;
          }
        }

        _handleLeft() {
          this.tag('Text2').text.fontStyle = 'normal';

          if (0 != this.tag('MetroApps').index) {
            this.tag('MetroApps').setPrevious();
            return this.tag('MetroApps').element;
          } // } else {
          //   Router.focusWidget('Menu')
          // }

        }

        _handleEnter() {
          let applicationType = this.tag('MetroApps').items[this.tag('MetroApps').index].data.applicationType;
          this.uri = this.tag('MetroApps').items[this.tag('MetroApps').index].data.uri;
          applicationType = this.tag('MetroApps').items[this.tag('MetroApps').index].data.applicationType;
          Storage.set('applicationType', applicationType);
          this.uri = this.tag('MetroApps').items[this.tag('MetroApps').index].data.uri;
          this.appApi.launchApp(applicationType, this.uri);
          /* else if (Storage.get('applicationType') == 'Native' && Storage.get('ipAddress')) {
                   this.appApi.launchNative(this.uri);
                   this.appApi.setVisibility('ResidentApp', false);
                 } */
        }

      }, class TVShows extends this {
        $enter() {
          this.indexVal = 2;
          this.scroll(-70);
        }

        _handleUp() {
          this.scroll(270);

          this._setState('MetroApps');
        }

        _getFocused() {
          this.tag('Text3').text.fontStyle = 'bold';
          return this.tag('TVShows');
        }

        _handleRight() {
          if (this.tag('TVShows').length - 1 != this.tag('TVShows').index) {
            this.tag('TVShows').setNext();
            return this.tag('TVShows').element;
          }
        }

        _handleLeft() {
          this.tag('Text3').text.fontStyle = 'normal';

          if (0 != this.tag('TVShows').index) {
            this.tag('TVShows').setPrevious();
            return this.tag('TVShows').element;
          } //  else {a
          //   Router.focusWidget('Menu')
          // }

        }

        async _handleEnter() {
          let internet = await this.appApi.isConnectedToInternet();

          if (internet) {
            Router.navigate('player');
          }
        }

        $exit() {
          this.tag('Text3').text.fontStyle = 'normal';
        }

      }];
    }

  }

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
  /**
   * Variable to store the timer
   */

  var timeout;
  /**
   * Class to render the UI controls for the video player.
   */

  class LightningPlayerControls extends lng$1.Component {
    /**
     * Function to create components for the player controls.
     */
    static _template() {
      return {
        TimeBar: {
          x: 90,
          y: 93.5,
          texture: lng$1.Tools.getRoundRect(1740, 20, 10, 0, 0, true, 0xffffffff)
        },
        ProgressWrapper: {
          x: 90,
          y: 93.5,
          w: 0,
          h: 35,
          clipping: true,
          ProgressBar: {
            texture: lng$1.Tools.getRoundRect(1740, 20, 10, 0, 0, true, CONFIG.theme.hex) // x: 90,
            // y: 93.5,

          }
        },
        Duration: {
          x: 1690,
          y: 125,
          text: {
            text: "00:00:00",
            fontFace: CONFIG.language.font,
            fontSize: 35,
            textColor: 0xffFFFFFF
          }
        },
        CurrentTime: {
          x: 140,
          // 140 = 90 + 50 | 50 is approzimately 1/2 of length(in px) of the text "00:00:00" and 90 is padding from left
          y: 60,
          mountX: 0.5,
          text: {
            text: "00:00:00",
            fontFace: CONFIG.language.font,
            fontSize: 25,
            textColor: 0xffFFFFFF
          }
        },
        Buttons: {
          x: 820,
          y: 125,
          children: [{
            src: Utils.asset('images/Media Player/Icon_Back_White_16k.png'),
            x: 17,
            y: 17
          }, {
            src: Utils.asset('images/Media Player/Icon_Pause_White_16k.png'),
            x: 17,
            y: 17
          }, {
            src: Utils.asset('images/Media Player/Icon_Next_White_16k.png'),
            x: 17,
            y: 17
          }].map((item, idx) => ({
            x: idx * 75,
            // texture: Lightning.Tools.getRoundRect(80, 80, 40, 0, 0, true, 0xff8e8e8e),
            ControlIcon: {
              x: item.x,
              y: item.y,
              texture: lng$1.Tools.getSvgTexture(item.src, 50, 50)
            }
          }))
        }
      };
    }

    _init() {
      /**
       * Variable to store the duration of the video content.
       */
      this.videoDuration = 0;
      this.tag('Buttons').children[0].patch({
        alpha: 1
      });
      this.tag('Buttons').children[2].patch({
        alpha: 1
      });
      this.toggle = false;
    }
    /**
     * Function to set focus to player controls when the player controls are shown.
     */


    _focus() {
      this._index = 1;

      this._setState('PlayPause');
    }
    /**
     * Function to handle the player controls when they are hidden.
     */


    _unfocus() {
      this._setState('Hidden');

      clearTimeout(timeout);
    }
    /**
     * Function to set the duration of the video.
     * @param {String} duration video duration to be set.
     */


    set duration(duration) {
      Log.info("duration was set = ".concat(duration));
      this.videoDuration = duration;
      this.tag('Duration').text.text = this.SecondsTohhmmss(duration);
    }
    /**
     * Function to set the current video time.
     * @param {String} currentTime current time to be set.
     */


    set currentTime(currentTime) {
      let value = 1740 * currentTime / this.videoDuration;
      this.tag('ProgressWrapper').patch({
        w: value
      });
      this.tag('CurrentTime').text.text = this.SecondsTohhmmss(currentTime);

      if (value >= 50 && value <= 1690) {
        // 1740 - 50 = 1690
        this.tag('CurrentTime').x = 90 + value; //90 is padding from left
      } else if (currentTime === 0) {
        this.tag('CurrentTime').x = 140; //initial position 140 = 90 + 50
      }
    }
    /**
     * Function to convert time in seconds to hh:mm:ss format.
     * @param {String} totalSeconds time in seconds.
     */


    SecondsTohhmmss(totalSeconds) {
      this.hours = Math.floor(totalSeconds / 3600);
      this.minutes = Math.floor((totalSeconds - this.hours * 3600) / 60);
      this.seconds = totalSeconds - this.hours * 3600 - this.minutes * 60;
      this.seconds = Math.round(totalSeconds) - this.hours * 3600 - this.minutes * 60;
      this.result = this.hours < 10 ? '0' + this.hours : this.hours;
      this.result += ':' + (this.minutes < 10 ? '0' + this.minutes : this.minutes);
      this.result += ':' + (this.seconds < 10 ? '0' + this.seconds : this.seconds);
      return this.result;
    }
    /**
     * Function to hide player controls.
     */


    hideLightningPlayerControls() {
      this.signal('hide');
    }

    hideNextPrevious() {
      this.isChannel = true;
      this.tag('Buttons').children[0].visible = false;
      this.tag('Buttons').children[2].visible = false;
    }

    showNextPrevious() {
      this.isChannel = false;
      this.tag('Buttons').children[0].visible = true;
      this.tag('Buttons').children[2].visible = true;
    }
    /**
     * Timer function to track the inactivity of the player controls.
     */


    timer() {
      clearTimeout(timeout);
      timeout = setTimeout(this.hideLightningPlayerControls.bind(this), 5000);
    }
    /**
     * Function that defines the different states of the player controls.
     */


    static _states() {
      return [class PlayPause extends this {
        $enter() {
          this.focus = this.toggle ? Utils.asset('images/Media Player/Icon_Play_Orange_16k.png') : Utils.asset('images/Media Player/Icon_Pause_Orange_16k.png');
          this.timer();
          this.tag('Buttons').children[1].tag('ControlIcon').patch({
            texture: lng$1.Tools.getSvgTexture(this.focus, 50, 50)
          });
        }

        $exit() {
          this.unfocus = this.toggle ? Utils.asset('images/Media Player/Icon_Play_White_16k.png') : Utils.asset('images/Media Player/Icon_Pause_White_16k.png');
          this.tag('Buttons').children[1].tag('ControlIcon').patch({
            texture: lng$1.Tools.getSvgTexture(this.unfocus, 50, 50)
          });
        }

        _handleEnter() {
          if (this.toggle) {
            //this.fireAncestors('$play');
            this.signal('play');
          } else {
            //this.fireAncestors('$pause');
            this.signal('pause');
          }

          this.toggle = !this.toggle;
          this.focus = this.toggle ? Utils.asset('images/Media Player/Icon_Play_Orange_16k.png') : Utils.asset('images/Media Player/Icon_Pause_Orange_16k.png');
          this.timer();
          this.tag('Buttons').children[1].tag('ControlIcon').patch({
            texture: lng$1.Tools.getSvgTexture(this.focus, 50, 50)
          });
        }

        _handleRight() {
          if (!this.isChannel) {
            this._setState('Forward');
          }
        }

        _handleLeft() {
          if (!this.isChannel) {
            this._setState('Rewind');
          }
        }

        _getFocused() {
          this.timer();
        }

      }, class Forward extends this {
        $enter() {
          this.timer();
          this.tag('Buttons').children[2].tag('ControlIcon').patch({
            texture: lng$1.Tools.getSvgTexture(Utils.asset('images/Media Player/Icon_Next_Orange_16k.png'), 50, 50)
          });
        }

        $exit() {
          this.tag('Buttons').children[2].tag('ControlIcon').patch({
            texture: lng$1.Tools.getSvgTexture(Utils.asset('images/Media Player/Icon_Next_White_16k.png'), 50, 50)
          });
        }

        _handleRight() {// this._setState('Extras')
        }

        _handleLeft() {
          this._setState('PlayPause');
        }

        _handleEnter() {
          this.toggle = false;
          this.signal('nextTrack');
        }

        _getFocused() {
          this.timer();
        }

      }, class Rewind extends this {
        $enter() {
          this.timer();
          this.tag('Buttons').children[0].tag('ControlIcon').patch({
            texture: lng$1.Tools.getSvgTexture(Utils.asset('images/Media Player/Icon_Back_Orange_16k.png'), 50, 50)
          });
        }

        $exit() {
          this.tag('Buttons').children[0].tag('ControlIcon').patch({
            texture: lng$1.Tools.getSvgTexture(Utils.asset('images/Media Player/Icon_Back_White_16k.png'), 50, 50)
          });
        }

        _handleLeft() {// this._setState('AudioOptions')
        }

        _handleRight() {
          this._setState('PlayPause');
        }

        _handleEnter() {
          this.toggle = false;
          this.signal('prevTrack');
        }

        _getFocused() {
          this.timer();
        }

      }, class Hidden extends this {
        _getFocused() {}

      }];
    }

  }

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

  /**
   * Class to render AAMP video player.
   */

  class AAMPVideoPlayer extends lng$1.Component {
    /**
     * Function to render player controls.
     */
    set params(args) {
      this.currentIndex = args.currentIndex;
      this.data = args.list;

      if (args.isUSB) {
        this.isUSB = args.isUSB;
      } else if (args.isChannel) {
        this.isChannel = args.isChannel;
        this.channelName = args.channelName;
        this.showName = args.showName;
        this.showDescription = args.description;
        this.channelIndex = args.channelIndex;
      }

      let url = args.url ? args.url : 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8';

      if (args.isAudio) {
        this.tag('Image').alpha = 1;
      }

      try {
        this.load({
          title: 'Parkour event',
          url: url,
          drmConfig: null
        });
        this.setVideoRect(0, 0, 1920, 1080);
      } catch (error) {
        Log.error('Playback Failed ' + error);
      }
    }

    static _template() {
      return {
        Image: {
          alpha: 0,
          x: 960,
          y: 560,
          mount: 0.5,
          texture: {
            type: lng$1.textures.ImageTexture,
            src: 'static/images/Media Player/Audio_Background_16k.jpg',
            resizeMode: {
              type: 'contain',
              w: 1920,
              h: 1080
            }
          }
        },
        InfoOverlay: {
          x: 90,
          y: 820,
          alpha: 0,
          zIndex: 3,
          ShowName: {
            text: {
              text: "Show Name",
              fontFace: CONFIG.language.font,
              fontSize: 48,
              fontStyle: 'bold',
              textColor: 0xffFFFFFF,
              wordWrap: true,
              wordWrapWidth: 1350,
              maxLines: 1
            }
          } //  ChannelName: {
          //    y: 50,
          //    visible: false,
          //    text: {
          //      text: "Channel Name",
          //      fontFace: CONFIG.language.font,
          //      fontSize: 35,
          //      textColor: 0xffFFFFFF,
          //      wordWrap: true, wordWrapWidth: 1350, maxLines: 1,
          //    }
          //  }

        },
        PlayerControlsWrapper: {
          alpha: 0,
          h: 330,
          w: 1920,
          y: 750,
          rect: true,
          colorBottom: 0xFF000000,
          colorTop: 0x00000000,
          PlayerControls: {
            y: 70,
            type: LightningPlayerControls,
            signals: {
              pause: 'pause',
              play: 'play',
              hide: 'hidePlayerControls',
              fastfwd: 'fastfwd',
              fastrwd: 'fastrwd',
              nextTrack: 'nextTrack',
              prevTrack: 'prevTrack'
            }
          }
        },
        ChannelWrapper: {
          h: 1080,
          w: 350,
          x: -360,
          rect: true,
          colorLeft: 0xFF000000,
          colorRight: 0x00000000 //  ChannelOverlay: {
          //    type: ChannelOverlay,
          //    x: 50,
          //    y: 92,
          //  }

        }
      };
    }

    _init() {
      this.x = 0;
      this.y = 0;
      this.w = 0;
      this.h = 0;
      this.videoEl = document.createElement('video');
      this.videoEl.setAttribute('id', 'video-player');
      this.videoEl.style.position = 'absolute';
      this.videoEl.style.zIndex = '1';
      this.videoEl.setAttribute('width', '100%');
      this.videoEl.setAttribute('height', '100%');
      this.videoEl.setAttribute('type', 'video/ave');
      document.body.appendChild(this.videoEl);
      this.playbackSpeeds = [-16, -8, -4, -2, 1, 2, 4, 8, 16];
      this.playerStatesEnum = {
        idle: 0,
        initializing: 1,
        playing: 8,
        paused: 6,
        seeking: 7
      };
      this.player = null;
      this.playbackRateIndex = this.playbackSpeeds.indexOf(1);
      this.defaultInitConfig = {
        initialBitrate: 2500000,
        offset: 0,
        networkTimeout: 10,
        preferredAudioLanguage: 'en',
        liveOffset: 15,
        drmConfig: null
      };
    }
    /**
     * Function to set video coordinates.
     * @param {int} x x position of video
     * @param {int} y y position of video
     * @param {int} w width of video
     * @param {int} h height of video
     */


    setVideoRect(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
    }
    /**
     * Event handler to store the current playback state.
     * @param  event playback state of the video.
     */


    _playbackStateChanged(event) {
      switch (event.state) {
        case this.player.playerStatesEnum.idle:
          this.playerState = this.player.playerStatesEnum.idle;
          break;

        case this.player.playerStatesEnum.initializing:
          this.playerState = this.player.playerStatesEnum.initializing;
          break;

        case this.player.playerStatesEnum.playing:
          this.playerState = this.player.playerStatesEnum.playing;
          break;

        case this.player.playerStatesEnum.paused:
          this.playerState = this.player.playerStatesEnum.paused;
          break;

        case this.player.playerStatesEnum.seeking:
          this.playerState = this.player.playerStatesEnum.seeking;
          break;
      }
    }
    /**
     * Event handler to handle the event of completion of a video playback.
     */


    _mediaEndReached() {
      this.load(this.videoInfo);
      this.setVideoRect(this.x, this.y, this.w, this.h);
    }
    /**
     * Event handler to handle the event of changing the playback speed.
     */


    _mediaSpeedChanged() {}
    /**
     * Event handler to handle the event of bit rate change.
     */


    _bitrateChanged() {}
    /**
     * Function to handle the event of playback failure.
     */


    _mediaPlaybackFailed() {
      this.load(this.videoInfo);
    }
    /**
     * Function to handle the event of playback progress.
     * @param event playback event.
     */


    _mediaProgressUpdate(event) {
      this.position = event.positionMiliseconds / 1000;
      this.tag('PlayerControls').currentTime = this.position;
    }
    /**
     * Function to handle the event of starting the playback.
     */


    _mediaPlaybackStarted() {
      this.tag('PlayerControls').reset();
      this.tag('PlayerControlsWrapper').setSmooth('alpha', 1);
      this.tag('PlayerControlsWrapper').setSmooth('y', 750, {
        duration: 1
      });

      if (this.isUSB) {
        this.tag("InfoOverlay").setSmooth('alpha', 1);
      }

      this.timeout = setTimeout(this.hidePlayerControls.bind(this), 5000);
    }
    /**
     * Function to handle the event of change in the duration of the playback content.
     */


    _mediaDurationChanged() {}
    /**
     * Function to create the video player instance for video playback and its initial settings.
     */


    createPlayer() {
      if (this.player !== null) {
        this.destroy();
        this.player = null;
      }

      try {
        this.player = new AAMPMediaPlayer();
        this.player.addEventListener('playbackStateChanged', this._playbackStateChanged);
        this.player.addEventListener('playbackCompleted', this._mediaEndReached.bind(this));
        this.player.addEventListener('playbackSpeedChanged', this._mediaSpeedChanged);
        this.player.addEventListener('bitrateChanged', this._bitrateChanged);
        this.player.addEventListener('playbackFailed', this._mediaPlaybackFailed.bind(this));
        this.player.addEventListener('playbackProgressUpdate', this._mediaProgressUpdate.bind(this));
        this.player.addEventListener('playbackStarted', this._mediaPlaybackStarted.bind(this));
        this.player.addEventListener('durationChanged', this._mediaDurationChanged);
        this.playerState = this.playerStatesEnum.idle;
      } catch (error) {
        Log.error('AAMPMediaPlayer is not defined');
      }
    }
    /**
     * Loads the player with video URL.
     * @param videoInfo the url and the info regarding the video like title.
     */


    load(videoInfo) {
      this.createPlayer();
      this.videoInfo = videoInfo;
      this.configObj = this.defaultInitConfig;
      this.configObj.drmConfig = this.videoInfo.drmConfig;
      this.player.initConfig(this.configObj);
      this.player.load(videoInfo.url);
      this.tag('PlayerControls').title = videoInfo.title;
      this.tag('PlayerControls').duration = this.player.getDurationSec();
      Log.info('Dureation of video', this.player.getDurationSec());
      this.tag('PlayerControls').currentTime = 0;
      this.play();
    }
    /**
     * Starts playback when enough data is buffered at play head.
     */


    play() {
      this.player.play();
      this.playbackRateIndex = this.playbackSpeeds.indexOf(1);
    }
    /**
     * Pauses playback.
     */


    pause() {
      this.player.pause();
    }
    /**
     * Stop playback and free resources.
     */


    stop() {
      this.player.stop();
      this.hidePlayerControls();
    }

    nextTrack() {
      if (this.data[this.currentIndex + 1]) {
        this.currentIndex += 1;
        this.stop();
        this.destroy();

        try {
          this.load({
            title: 'Parkour event',
            url: this.data[this.currentIndex].data.uri,
            drmConfig: null
          });
          this.updateInfo();
          this.setVideoRect(0, 0, 1920, 1080);
        } catch (error) {
          Log.error('Playback Failed ' + error);
        }
      }
    }

    prevTrack() {
      if (this.data[this.currentIndex - 1]) {
        this.currentIndex -= 1;
        this.stop();
        this.destroy();

        try {
          this.load({
            title: 'Parkour event',
            url: this.data[this.currentIndex].data.uri,
            drmConfig: null
          });
          this.updateInfo();
          this.setVideoRect(0, 0, 1920, 1080);
        } catch (error) {
          Log.error('Playback Failed ' + error);
        }
      }
    }
    /**
     * Function to perform fast forward of the video content.
     */


    fastfwd() {
      if (this.playbackRateIndex < this.playbackSpeeds.length - 1) {
        this.playbackRateIndex++;
      }

      this.rate = this.playbackSpeeds[this.playbackRateIndex];
      this.player.setPlaybackRate(this.rate);
    }
    /**
     * Function to perform fast rewind of the video content.
     */


    fastrwd() {
      if (this.playbackRateIndex > 0) {
        this.playbackRateIndex--;
      }

      this.rate = this.playbackSpeeds[this.playbackRateIndex];
      this.player.setPlaybackRate(this.rate);
    }
    /**
     * Function that returns player instance.
     * @returns player instance.
     */


    getPlayer() {
      return this.player;
    }
    /**
     * Function to release the video player instance when not in use.
     */


    destroy() {
      if (this.player.getCurrentState() !== this.playerStatesEnum.idle) {
        this.player.stop();
      }

      this.player.removeEventListener('playbackStateChanged', this._playbackStateChanged);
      this.player.removeEventListener('playbackCompleted', this._mediaEndReached);
      this.player.removeEventListener('playbackSpeedChanged', this._mediaSpeedChanged);
      this.player.removeEventListener('bitrateChanged', this._bitrateChanged);
      this.player.removeEventListener('playbackFailed', this._mediaPlaybackFailed.bind(this));
      this.player.removeEventListener('playbackProgressUpdate', this._mediaProgressUpdate.bind(this));
      this.player.removeEventListener('playbackStarted', this._mediaPlaybackStarted.bind(this));
      this.player.removeEventListener('durationChanged', this._mediaDurationChanged);
      this.player.release();
      this.player = null;
      this.hidePlayerControls();
    }
    /**
     * Function to hide the player controls.
     */


    hidePlayerControls() {
      this.tag('PlayerControlsWrapper').setSmooth('y', 1080, {
        duration: 0.7
      });
      this.tag('PlayerControlsWrapper').setSmooth('alpha', 0, {
        duration: 0.7
      });

      this._setState('HideControls');

      this.hideInfo();
    }
    /**
     * Function to show the player controls.
     */


    showPlayerControls() {
      // this.tag('PlayerControls').reset()
      this.tag('PlayerControlsWrapper').setSmooth('alpha', 1);
      this.tag('PlayerControlsWrapper').setSmooth('y', 750, {
        duration: 0.7
      });

      this._setState('ShowControls');

      this.timeout = setTimeout(this.hidePlayerControls.bind(this), 5000);
    }

    showInfo() {
      if (this.isUSB || this.isChannel) {
        this.tag("InfoOverlay").setSmooth('alpha', 1, {
          duration: 0.3,
          delay: 0.7
        });
      }
    }

    hideInfo() {
      if (this.isUSB || this.isChannel) {
        this.tag("InfoOverlay").setSmooth('alpha', 0, {
          duration: 0.3
        });
      }
    }

    updateInfo() {
      if (this.isUSB) {
        this.tag('ShowName').text.text = this.data[this.currentIndex].data.displayName;
      } else if (this.isChannel) {
        this.tag('ShowName').text.text = this.showName; // this.tag('ChannelName').text.text = this.channelName
      }
    }
    /**
     * Function to display player controls on down key press.
     */

    /**
     *Function to hide player control on up key press.
     */


    _handleBack() {
      Router.back();
    }

    _inactive() {
      this.tag('Image').alpha = 0;
      this.tag('InfoOverlay').alpha = 0;
      this.isUSB = false;
      this.isChannel = false;
      this.stop();
      this.destroy();
    }

    _focus() {
      this._setState('HideControls');

      this.updateInfo();

      if (this.isChannel) {
        //this.tag('ChannelOverlay').$focusChannel(this.channelIndex)
        this.tag('InfoOverlay').y = 790;
        this.tag('ChannelName').visible = true;
        this.tag('PlayerControls').hideNextPrevious();
      } else {
        this.tag('InfoOverlay').y = 820;
        this.tag('ChannelName').visible = false;
        this.tag('PlayerControls').showNextPrevious();
      }
    }
    /**
     * Function to define the different states of the video player.
     */


    static _states() {
      return [class ShowControls extends this {
        _getFocused() {
          return this.tag('PlayerControls');
        }

        _handleDown() {
          this.hidePlayerControls();

          this._setState('HideControls');
        }

        _handleUp() {
          if (this.isChannel) {
            this.hidePlayerControls(); //this._setState('ChannelOverlay')
          }
        }

      }, class HideControls extends this {
        // _handleBack(){
        //   Log.info('go back from hidecontrol')
        // }
        _handleUp() {
          // this.tag('PlayerControlsWrapper').setSmooth('alpha', 1, { duration: 1 })
          // this.tag('PlayerControlsWrapper').setSmooth('y', 820, { duration: 1 })
          this.showPlayerControls();

          this._setState('ShowControls');

          this.showInfo();
          clearTimeout(this.timeout);
        } //  _handleLeft() {
        //    if (this.isChannel) {
        //      this._setState('ChannelOverlay')
        //    }
        //  }


      } //    class ChannelOverlay extends this {
      //      $enter() {
      //        this.tag('ChannelWrapper').setSmooth('x', 0, { duration: 1 })
      //      }
      //      $exit() {
      //        this.tag('ChannelWrapper').setSmooth('x', -360, { duration: 1 })
      //      }
      //      _handleLeft() {
      //        this.hidePlayerControls()
      //        this._setState('HideControls')
      //      }
      //      _handleRight() {
      //        this.hidePlayerControls()
      //        this._setState('HideControls')
      //      }
      //      _getFocused() {
      //        return this.tag('ChannelOverlay')
      //      }
      //    },
      ];
    }

  }

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */

  /**
   * Grid
   *
   * Contains global grid style information to easily maintain consistency throughout components.
   */

  /**
   * Sets up spacing configurations to correctly position Items and Rows.
   */
  const GRID = {
    gutters: {
      horizontal: 80,
      // space between rows
      vertical: 40 // space between columns (items)

    },
    margin: {
      x: 80,
      y: 112
    },
    spacingIncrement: 8,
    // the grid is built on an 8-point system
    columnWidth: 110
  };
  /**
   * Establishes the screen size to be 1080p resolution (1920x1080).
   */

  const SCREEN = {
    w: 1920,
    h: 1080
  };
  /**
   * Determines the width and height of an item based off the data passed into the item
   * (either all necessary parameters to calculate the dimensions dynamically,
   * OR all the necessary parameters to hard set the dimensions).
   *
   * @param { object } obj
   * @param { object } fallback
   *
   * @return { { number, number } }
   */

  function getDimensions() {
    let obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    let fallback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let {
      w,
      h,
      ratioX,
      ratioY,
      upCount
    } = obj;
    let fallbackW = fallback.w || 0;
    let fallbackH = fallback.h || 0;
    let dimensions = {}; // hard set width and height values were passed in and should override other params

    if (w && h) {
      dimensions = {
        w,
        h: h
      };
    } // hard set height and ratio values were passed in, meaning the row has items with mixed ratios,
    // so the width needs to be calculated
    else if (h && ratioX && ratioY) {
      dimensions = {
        w: Math.round(h * ratioX / ratioY),
        h: h
      };
    } // calculate dynamic width and height based off item ratios
    else if (ratioX && ratioY && upCount) {
      dimensions = getItemRatioDimensions(ratioX, ratioY, upCount);
    } // calculate dynamic width based off a row upcount and a given height
    else if (h && upCount) {
      dimensions = {
        w: Math.round(calculateColumnWidth(upCount)),
        h: h
      };
    } else if (h) {
      dimensions = {
        w: fallbackW,
        h: h
      };
    } else if (w) {
      dimensions = {
        w: w,
        h: fallbackH
      };
    } // not enough information was provided to properly size the component
    else {
      dimensions = {
        w: fallbackW,
        h: fallbackH
      };
    }

    dimensions = { ...dimensions,
      ratioX,
      ratioY,
      upCount
    };
    return dimensions;
  }
  /**
   * Calculates the width and height of an item based off the given ratios
   * and number of columns across the screen that should be visible before peaking
   *
   * @param { number } ratioX
   * @param { number } ratioY
   * @param { number } upCount
   *
   * @return { { number, number } }
   */

  function getItemRatioDimensions(ratioX, ratioY, upCount) {
    let w, h;

    if (ratioX && ratioY && upCount) {
      w = Math.round(calculateColumnWidth(upCount));
      h = Math.round(w / ratioX * ratioY);
    } else {
      w = 0;
      h = 0;
    }

    return {
      w,
      h
    };
  }
  /**
   * Calculates the width of an item given how many columns are requested
   *
   * @param { number } upCount
   *
   * @return { number }
   */

  function calculateColumnWidth(upCount) {
    // the screen width, minus the margin x on each side
    let rowWidth = SCREEN.w - GRID.margin.x * 2;

    if (upCount) {
      // the total space of column gaps in between items
      let columnGapTotal = (upCount - 1) * GRID.gutters.vertical; // the remaining amount of space left for all items

      let totalColumnsWidth = rowWidth - columnGapTotal; // the width of each item in that remaining width

      let itemWidth = totalColumnsWidth / upCount;
      return itemWidth;
    }

    return rowWidth;
  }

  /**
   * Copyright 2021 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */

  /**
   * Colors
   *
   * Contains global color style information to easily maintain consistency throughout components.
   */

  /**
   * Combines rgb hex string and alpha into argb hexadecimal number
   * @param {string} hex - 6 alphanumeric characters between 0-f
   * @param {number} [alpha] - number between 0-100 (0 is invisible, 100 is opaque)
   */
  function getHexColor$1(hex) {
    let alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

    if (!hex) {
      return 0x00;
    }

    let hexAlpha = Math.round(alpha / 100 * 255).toString(16);
    let str = "0x".concat(hexAlpha).concat(hex);
    return parseInt(Number(str), 10);
  }
  /**
   * Returns valid string of HEX color
   *
   * @param {string} color
   * @param {boolean} fill
   */

  function getValidColor(color) {
    if (/^0x[0-9a-fA-F]{8}/g.test(color)) {
      // User enters a valid 0x00000000 hex code
      return Number(color);
    } else if (/^#[0-9a-fA-F]{6}/g.test(color)) {
      // User enters valid #000000 hex code
      return getHexColor$1(color.substr(1, 6));
    } else if (typeof color === 'string' && /^[0-9]{8,10}/g.test(color)) {
      return parseInt(color);
    } else if (typeof color === 'number' && /^[0-9]{8,10}/g.test(color.toString())) {
      return color;
    } else if (typeof color === 'string' && color.indexOf('rgba') > -1) {
      return rgba2argb(color);
    } else if (typeof color === 'string' && color.indexOf('rgb') > -1) {
      let rgba = [...color.replace(/rgb\(|\)/g, '').split(','), '255'];
      return lng.StageUtils.getArgbNumber(rgba);
    }

    return null;
  }

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */

  /**
   * Returns a styles object for use by components
   * @param {Object|function} styles - Object or callback that takes theme as an argument, ultimately the returned value
   * @param {Object} theme - theme to be provided to styles
   */
  var createStyles$1 = ((styles, theme) => {
    return typeof styles === 'function' ? styles(theme) : styles;
  });

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  /**
   * Merges two objects together and returns the duplicate.
   *
   * @param {Object} target - object to be cloned
   * @param {Object} [object] - secondary object to merge into clone
   */

  function clone$1(target, object) {
    const _clone = { ...target
    };
    if (!object || target === object) return _clone;

    for (const key in object) {
      const value = object[key];

      if (Object.prototype.hasOwnProperty.call(target, key)) {
        _clone[key] = getMergeValue$1(key, target, object);
      } else {
        _clone[key] = value;
      }
    }

    return _clone;
  }

  function getMergeValue$1(key, target, object) {
    const targetVal = target[key];
    const objectVal = object[key];
    const targetValType = typeof targetVal;
    const objectValType = typeof objectVal;

    if (targetValType !== objectValType || objectValType === 'function' || Array.isArray(objectVal)) {
      return objectVal;
    }

    if (objectVal && objectValType === 'object') {
      return clone$1(targetVal, objectVal);
    }

    return objectVal;
  }
  /**
   * Naively looks for dimensional prop (i.e. w, h, x, y, etc.), first searching for
   * a transition target value then defaulting to the current set value
   * @param {string} prop - property key
   * @param {lng.Component} component - Lightning component to operate against
   */

  function getDimension$1(prop, component) {
    if (!component) return 0;
    const transition = component.transition(prop);
    if (transition.isRunning()) return transition.targetValue;
    return component[prop];
  }
  getDimension$1.bind(null, 'x');
  getDimension$1.bind(null, 'y');
  /**
   * Deep equality check two values
   *
   * @param {any} valA - value to be compared against valB
   * @param {any} valB - value to be compared against valA
   *
   * @return {boolean} - returns true if values are equal
   */

  function stringifyCompare(valA, valB) {
    return JSON.stringify(valA) === JSON.stringify(valB);
  }

  /**
   * Copyright 2021 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  function withStyles$1(Base, styles, theme) {
    const _theme = theme || Base.theme;

    const _styles = Base.styles ? clone$1(Base.styles, createStyles$1(styles, _theme)) : createStyles$1(styles, _theme);

    return class extends Base {
      static get name() {
        return Base.name;
      }

      static get styles() {
        return _styles;
      }

      get styles() {
        return _styles;
      }

    };
  }

  /**
   * Copyright 2021 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  function getPropertyDescriptor$1(path) {
    return {
      get() {
        return this.tag(path);
      },

      configurable: true,
      enumerable: true
    };
  }

  function withTags(Base) {
    return class extends Base {
      static get name() {
        return Base.name;
      }

      _construct() {
        const tags = this.constructor.tags || [];
        let name, path;
        tags.forEach(tag => {
          if (typeof tag === 'object') {
            ({
              name,
              path
            } = tag);
          } else {
            name = tag;
            path = tag;
          }

          const key = '_' + name;
          const descriptor = getPropertyDescriptor$1(path);
          Object.defineProperty(Object.getPrototypeOf(this), key, descriptor);
        });
        super._construct && super._construct();
      }

    };
  }

  /**
   * Returns a function, that, as long as it continues to be invoked, will not
   * be triggered. The function will be called after it stops being called for
   * N milliseconds. If `immediate` is passed, trigger the function on the
   * leading edge, instead of the trailing. The function also has a property 'clear' 
   * that is a function which will clear the timer to prevent previously scheduled executions. 
   *
   * @source underscore.js
   * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
   * @param {Function} function to wrap
   * @param {Number} timeout in ms (`100`)
   * @param {Boolean} whether to execute at the beginning (`false`)
   * @api public
   */

  function debounce(func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    if (null == wait) wait = 100;

    function later() {
      var last = Date.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;

        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    }

    var debounced = function () {
      context = this;
      args = arguments;
      timestamp = Date.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);

      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };

    debounced.clear = function () {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    };

    debounced.flush = function () {
      if (timeout) {
        result = func.apply(context, args);
        context = args = null;
        clearTimeout(timeout);
        timeout = null;
      }
    };

    return debounced;
  }

  debounce.debounce = debounce;
  var debounce_1 = debounce;

  /**
   * Copyright 2021 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */

  function capital(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function getPropertyDescriptor(name, key) {
    return {
      get() {
        const customGetter = this["_get".concat(capital(name))];

        if (customGetter && typeof customGetter === 'function') {
          const value = customGetter.call(this, this[key]);
          this[key] = value;
        }

        return this[key];
      },

      set(value) {
        const oldValue = this[key];

        if (value !== oldValue) {
          const changeHandler = this["_set".concat(capital(name))];

          if (changeHandler && typeof changeHandler === 'function') {
            value = changeHandler.call(this, value);
          }

          this[key] = value;

          this._requestUpdateDebounce();
        }
      },

      configurable: true,
      enumerable: true
    };
  }

  function withUpdates(Base) {
    return class extends Base {
      static get name() {
        return Base.name;
      }

      _construct() {
        let props = this.constructor.properties || [];
        props.forEach(name => {
          const key = '_' + name;
          const descriptor = getPropertyDescriptor(name, key);

          if (descriptor !== undefined) {
            Object.defineProperty(Object.getPrototypeOf(this), name, descriptor);
          }
        });
        this._whenEnabled = new Promise(resolve => {
          this._whenEnabledResolver = resolve;
        });
        this._requestUpdateDebounce = debounce_1.debounce(this._requestUpdate.bind(this), 0);
        super._construct && super._construct();
      }

      _firstEnable() {
        this._readyForUpdates = true;

        this._whenEnabledResolver();

        this._update();

        super._firstEnable && super._firstEnable();
      }

      _detach() {
        super._detach();

        this._requestUpdateDebounce.clear();
      }

      _requestUpdate() {
        if (this._readyForUpdates) {
          this._update();
        }
      }

    };
  }

  /**
   * Copyright 2021 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  function withHandleKey(Base) {
    return class extends Base {
      static get name() {
        return Base.name;
      }

      _handleKey(keyEvent) {
        return this._processEvent(keyEvent);
      }

      _handleKeyRelease(keyEvent) {
        return this._processEvent(keyEvent, 'Release');
      }

      _processEvent(keyEvent) {
        let suffix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        let {
          key
        } = keyEvent;

        if (!key) {
          const keyMap = this.stage.application.__keymap || {};
          key = keyMap[keyEvent.keyCode];
        }

        if (key && typeof this["on".concat(key).concat(suffix)] === 'function') {
          return this["on".concat(key).concat(suffix)].call(this, this, keyEvent) || false;
        }

        this.fireAncestors("$on".concat(key).concat(suffix), this, keyEvent);
        return false;
      }

    };
  }

  /**
   * Copyright 2021 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  function withLayout(Base) {
    return class extends Base {
      get itemLayout() {
        return this._itemLayout;
      }

      set itemLayout(itemLayout) {
        if (!stringifyCompare(this._itemLayout, itemLayout)) {
          this._itemLayout = itemLayout;
          const {
            w,
            h
          } = getDimensions(itemLayout); // If there is not enough information passed in args to calculate item size
          // Do not try to set h/w this will cause issues sizing the focus ring

          if (h || w) {
            const {
              w: width,
              h: height
            } = SCREEN;
            this.h = h || w * (height / width);
            this.w = w || h * (width / height);
            super._update && super._update();
          }
        }
      }

    };
  }

  /**
   * Copyright 2021 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */

  const baseStyles = () => ({
    getUnfocusScale: () => 1 // getFocusScale: theme.getFocusScale

  });

  class Base extends lng$1.Component {
    _construct() {
      this._whenEnabled = new Promise(resolve => this._whenEnabledResolver = resolve);

      this._getFocusScale = this.styles.getFocusScale || function () {};

      this._getUnfocusScale = this.styles.getUnfocusScale || function () {};
    }

    _firstEnable() {
      this._whenEnabledResolver();
    }

    _init() {
      this._update();
    }

    _update() {}

    _focus() {
      if (this._smooth === undefined) this._smooth = true;

      this._update();
    }

    _unfocus() {
      this._update();
    }

  }

  function withMixins(baseComponent) {
    return withLayout(withUpdates(withTags(withHandleKey(baseComponent))));
  }

  var Base$1 = withMixins(withStyles$1(Base, baseStyles));

  /**
   * Copyright 2021 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  var styles$1 = {
    h: 8,
    w: 410,
    radius: 4,
    barColor: 0xffceceda,
    progressColor: 4127195135
  };

  /**
   * Copyright 2021 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  class ProgressBar extends withStyles$1(Base$1, styles$1) {
    static _template() {
      return {
        Bar: {
          zIndex: 1
        },
        Progress: {
          alpha: 0,
          zIndex: 2
        }
      };
    }

    static get properties() {
      return ['animationDuration', 'barColor', 'progress', 'progressColor', 'radius'];
    }

    static get tags() {
      return ['Bar', 'Progress'];
    }

    _construct() {
      super._construct();

      this._w = this.styles.w;
      this.h = this.styles.h;
      this._progress = 0;
      this._radius = this.styles.radius;
      this._progressColor = this.styles.progressColor;
      this._barColor = this.styles.barColor;
      this._animationDuration = 0;
    }

    _init() {
      this._update();
    }

    set w(w) {
      if (this._w !== w) {
        this._w = w;

        this._update();
      }
    }

    get w() {
      return this._w;
    }

    _update() {
      const p = this.w * this.progress;
      const w = p <= 0 ? 0 : Math.min(p, this._w);
      this._Bar.texture = lng$1.Tools.getRoundRect( // getRoundRect adds 2 to the width
      this.w - 2, this.h, this.radius, 0, 0, true, this.barColor);
      this._Progress.texture = lng$1.Tools.getRoundRect(w + 1, this.h, this.radius, 0, 0, true, this.progressColor);
      this._Progress.smooth = {
        w: [w, {
          duration: this._animationDuration
        }],
        alpha: Number(w > 0)
      };
    }

    _setBarColor(barColor) {
      return getValidColor(barColor);
    }

    _setProgressColor(progressColor) {
      return getValidColor(progressColor);
    }

  }

  class AppStoreItem extends lng$1.Component {
    static _template() {
      return {
        Shadow: {
          y: -10,
          alpha: 0,
          rect: true,
          color: CONFIG.theme.hex,
          h: this.height + 20,
          w: this.width
        },
        Image: {
          h: this.height,
          w: this.width
        },
        Overlay: {
          alpha: 0,
          rect: true,
          color: 0xAA000000,
          h: this.height,
          w: this.width,
          OverlayText: {
            alpha: 0,
            mount: 0.5,
            x: this.width / 2,
            y: this.height / 2,
            text: {
              text: Language.translate('Installing'),
              fontFace: CONFIG.language.font,
              fontSize: 20
            },
            ProgressBar: {
              y: 30,
              x: -50,
              type: ProgressBar,
              w: 200,
              progress: 1,
              barColor: 4284637804,
              progressColor: 4127195135,
              animationDuration: 5
            }
          }
        },
        Text: {
          alpha: 0,
          y: this.height + 10,
          text: {
            text: '',
            fontFace: CONFIG.language.font,
            fontSize: 25
          }
        }
      };
    }

    set info(data) {
      this.data = data;

      if (data.url.startsWith('/images')) {
        this.tag('Image').patch({
          src: Utils.asset(data.url)
        });
      } else {
        this.tag('Image').patch({
          src: data.url
        });
      }

      this.tag('Text').text.text = data.displayName; // this.tag('Shadow').y = this.tag('Shadow').y - 10
    }

    static get width() {
      return 300;
    }

    static get height() {
      return 168;
    }

    _focus() {
      this.scale = 1.15;
      this.zIndex = 2;
      this.tag("Shadow").alpha = 1;
      this.tag("Text").alpha = 1;
    }

    _unfocus() {
      this.scale = 1;
      this.zIndex = 1;
      this.tag("Shadow").alpha = 0;
      this.tag("Text").alpha = 0;
    }

  }

  class OptionsItem extends lng$1.Component {
    static _template() {
      return {
        Wrapper: {
          Text: {
            text: {
              text: '',
              fontFace: CONFIG.language.font,
              fontSize: 35,
              wordWrap: false,
              wordWrapWidth: 230,
              fontStyle: "normal",
              textOverflow: "ellipsis"
            }
          },
          Bar: {
            y: 50,
            texture: lng$1.Tools.getRoundRect(0, 5, 0, 0, CONFIG.theme.hex, true, CONFIG.theme.hex)
          }
        }
      };
    }

    _focus() {
      this.tag('Bar').texture = lng$1.Tools.getRoundRect(this.tag('Text').finalW, 5, 0, 0, CONFIG.theme.hex, true, CONFIG.theme.hex);
      this.tag('Text').text.fontStyle = 'bold';
    }

    _unfocus() {
      this.tag('Bar').texture = lng$1.Tools.getRoundRect(0, 5, 0, 0, CONFIG.theme.hex, true, CONFIG.theme.hex);
      this.tag('Text').text.fontStyle = '';
    }

    static get width() {
      return 250;
    }

    _handleEnter() {
      this.fireAncestors('$selectOption', this.idx, this);

      this._focus();
    }

    _handleDown() {
      this._handleEnter();
    }

    set element(item) {
      this.tag('Text').text.text = Language.translate(item);

      if (this.tag('Text').text.text.length > 11) {
        this.tag('Text').text.fontSize = 25;
      }
    }

  }

  const homeApi = new HomeApi();
  class AppStore extends lng$1.Component {
    _onChanged() {
      this.widgets.menu.updateTopPanelText(Language.translate('Apps'));
    }

    static _template() {
      return {
        rect: true,
        h: 1080,
        w: 1920,
        color: CONFIG.theme.background,
        Container: {
          x: 200,
          y: 270,
          Options: {
            // x: 10,
            type: List,
            direction: 'row',
            spacing: 30
          },
          Apps: {
            x: 20,
            y: 120,
            type: Grid,
            columns: 5,
            itemType: AppStoreItem,
            w: 1920,
            h: (AppStore.height + 90) * 2 + 2 * 20 - 10,
            scroll: {
              after: 2
            },
            spacing: 20
          }
        }
      };
    }

    _firstEnable() {
      let apps = homeApi.getAllApps();
      apps.shift();
      const options = ['My Apps', 'App Catalog', 'Manage Apps'];
      this.tag('Apps').add(apps.map(element => {
        return {
          h: AppStoreItem.height + 90,
          w: AppStoreItem.width,
          info: element
        };
      }));
      this.tag('Options').add(options.map((element, idx) => {
        return {
          type: OptionsItem,
          element: element,
          w: OptionsItem.width,
          idx
        };
      }));
      this.options = {
        0: () => {
          this.tag('Apps').add(apps.map(element => {
            return {
              h: AppStoreItem.height + 90,
              w: AppStoreItem.width,
              info: element
            };
          }));
        },
        1: () => {
          this.tag('Apps').clear();
        },
        2: () => {
          this.tag('Apps').clear();
        }
      };
    }

    $selectOption(option, obj) {
      this.tag('Apps').clear();

      obj._focus();

      this.options[option]();

      if (this.tag('Apps').length) {
        this._setState('Apps');
      }
    }

    _handleLeft() {
      Router.focusWidget('Menu');
    }

    pageTransition() {
      return 'up';
    }

    _handleUp() {
      this.widgets.menu.notify('TopPanel');
    }

    _focus() {
      this._setState('Options');
    }

    static _states() {
      return [class Options extends this {
        _getFocused() {
          return this.tag('Options');
        }

        _handleDown() {
          this._setState('Apps');
        }

      }, class Apps extends this {
        _getFocused() {
          return this.tag('Apps');
        }

        _handleUp() {
          this._setState('Options');
        }

        _handleEnter() {
          let appApi = new AppApi();
          let applicationType = this.tag('Apps').currentItem.data.applicationType;
          this.uri = this.tag('Apps').currentItem.data.uri;
          applicationType = this.tag('Apps').currentItem.data.applicationType;
          Storage.set('applicationType', applicationType);
          console.log(this.uri, applicationType);

          if (Storage.get('applicationType') == 'Cobalt') {
            appApi.getPluginStatus('Cobalt').then(() => {
              appApi.launchApp(this.uri).catch(err => {});
              appApi.setVisibilityandFocus('ResidentApp', false);
            }).catch(err => {
              console.log('Cobalt plugin error', err);
              Storage.set('applicationType', '');
            });
          } else if (Storage.get('applicationType') == 'WebApp' && Storage.get('ipAddress')) {
            appApi.launchApp(this.uri).then(() => {
              appApi.setVisibilityandFocus('ResidentApp', false);
              let path = location.pathname.split('index.html')[0];
              path.slice(-1) === '/' ? "static/overlayText/index.html" : "/static/overlayText/index.html";

              Registry.setTimeout(() => {
                appApi.suspendOrDestroyApp('TextOverlay');
                appApi.moveToFront('HtmlApp');
                appApi.setVisibilityandFocus('HtmlApp', true);
              }, 9000);
            }).catch(() => {});
          } else if (Storage.get('applicationType') == 'Lightning' && Storage.get('ipAddress')) {
            appApi.launchApp(this.uri).catch(() => {});
            appApi.setVisibilityandFocus('ResidentApp', false);
          } else if (Storage.get('applicationType') == 'Native' && Storage.get('ipAddress')) {
            appApi.launchApp(this.uri).catch(() => {});
            appApi.setVisibilityandFocus('ResidentApp', false);
          } else if (Storage.get('applicationType') == 'Amazon') {
            console.log('Launching app');
            appApi.getPluginStatus('Amazon').then(result => {
              appApi.launchApp('Amazon').catch(() => {});
              appApi.setVisibilityandFocus('ResidentApp', false);
            }).catch(err => {
              console.log('Amazon plugin error', err);
              Storage.set('applicationType', '');
            });
          } else if (Storage.get('applicationType') == 'Netflix') {
            console.log('Launching app');
            this.fireAncestors("$initLaunchPad").then(() => {}).catch(() => {});
          }
        }

      }];
    }

  }

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

  /**Color constants */
  var COLORS = {
    textColor: 0xffffffff,
    titleColor: 0xffffffff,
    hightlightColor: 0xffc0c0c0,
    headingColor: 0xffffffff
  };

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
  /**
   * Class for rendering items in Settings screen.
   */

  class SettingsItem extends lng$1.Component {
    _construct() {
      this.Tick = Utils.asset('/images/settings/Tick.png');
    }

    static _template() {
      return {
        zIndex: 1,
        TopLine: {
          y: 0,
          mountY: 0.5,
          w: 1600,
          h: 3,
          rect: true,
          color: 0xFFFFFFFF
        },
        Item: {
          w: 1600,
          h: 90
        },
        BottomLine: {
          y: 90,
          mountY: 0.5,
          w: 1600,
          h: 3,
          rect: true,
          color: 0xFFFFFFFF
        }
      };
    }
    /**
     * Function to set contents for an item in settings screen.
     */


    set item(item) {
      this._item = item;
      this.tag('Item').patch({
        Tick: {
          y: 45,
          mountY: 0.5,
          texture: lng$1.Tools.getSvgTexture(this.Tick, 32.5, 32.5),
          color: 0xffffffff,
          visible: false
        },
        Left: {
          x: 40,
          y: 45,
          mountY: 0.5,
          text: {
            text: item,
            fontSize: 25,
            textColor: COLORS.textColor,
            fontFace: CONFIG.language.font
          }
        }
      });
    }

    _focus() {
      this.tag('TopLine').color = CONFIG.theme.hex;
      this.tag('BottomLine').color = CONFIG.theme.hex;
      this.patch({
        zIndex: 2
      });
      this.tag('TopLine').h = 6;
      this.tag('BottomLine').h = 6;
    }

    _unfocus() {
      this.tag('TopLine').color = 0xFFFFFFFF;
      this.tag('BottomLine').color = 0xFFFFFFFF;
      this.patch({
        zIndex: 1
      });
      this.tag('TopLine').h = 3;
      this.tag('BottomLine').h = 3;
    }

  }

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
  class SettingsMainItem extends SettingsItem {
    static _template() {
      return {
        zIndex: 1,
        TopLine: {
          y: 0,
          mountY: 0.5,
          w: 1600,
          h: 3,
          rect: true,
          color: 0xFFFFFFFF
        },
        Item: {
          w: 1920 - 300,
          h: 90,
          rect: true,
          color: 0x00000000
        },
        BottomLine: {
          y: 0 + 90,
          mountY: 0.5,
          w: 1600,
          h: 3,
          rect: true,
          color: 0xFFFFFFFF
        }
      };
    }

    _init() {}

    _focus() {
      this.tag('TopLine').color = CONFIG.theme.hex;
      this.tag('BottomLine').color = CONFIG.theme.hex;
      this.patch({
        zIndex: 2
      });
      this.tag('TopLine').h = 6;
      this.tag('BottomLine').h = 6;
    }

    _unfocus() {
      this.tag('TopLine').color = 0xFFFFFFFF;
      this.tag('BottomLine').color = 0xFFFFFFFF;
      this.patch({
        zIndex: 1
      });
      this.tag('TopLine').h = 3;
      this.tag('BottomLine').h = 3;
    }

  }

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
  /**
   * Class for settings screen.
   */

  class SettingsScreen extends lng$1.Component {
    _onChanged() {
      this.widgets.menu.updateTopPanelText(Language.translate('Settings'));
    }

    pageTransition() {
      return 'left';
    }

    static _template() {
      return {
        rect: true,
        color: 0xff000000,
        w: 1920,
        h: 1080,
        SettingsScreenContents: {
          x: 200,
          y: 275,
          NetworkConfiguration: {
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('Network Configuration'),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Button: {
              h: 45,
              w: 45,
              x: 1600,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset('images/settings/Arrow.png')
            }
          },
          Bluetooth: {
            y: 90,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('Pair Remote Control'),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Button: {
              h: 45,
              w: 45,
              x: 1600,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset('images/settings/Arrow.png')
            }
          }
        }
      };
    }

    _init() {
      this._setState('NetworkConfiguration');
    }

    _focus() {
      this._setState(this.state);
    }

    _handleBack() {
      Router.navigate('menu');
    }

    static _states() {
      return [class NetworkConfiguration extends this {
        $enter() {
          this.tag('NetworkConfiguration')._focus();
        }

        $exit() {
          this.tag('NetworkConfiguration')._unfocus();
        }

        _handleDown() {
          this._setState('Bluetooth');
        }

        _handleEnter() {
          Router.navigate('settings/network');
        }

      }, class Bluetooth extends this {
        $enter() {
          this.tag('Bluetooth')._focus();
        }

        $exit() {
          this.tag('Bluetooth')._unfocus();
        }

        _handleUp() {
          this._setState('NetworkConfiguration');
        }

        _handleDown() {
          this._setState('Video');
        }

        _handleLeft() {}

        _handleEnter() {
          Router.navigate('settings/bluetooth');
        }

      }];
    }

  }

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

  let _item;
  /**
   * Class for pairing screen for the Bluetooth.
   */


  class BluetoothPairingScreen extends lng$1.Component {
    set params(args) {
      if (args.bluetoothItem) {
        this.item(args.bluetoothItem);
      } else {
        Router.navigate('settings/bluetooth');
      }
    }

    static _template() {
      return {
        w: 1920,
        h: 2000,
        rect: true,
        color: 0xff000000,
        BluetoothPair: {
          x: 960,
          y: 300,
          Title: {
            mountX: 0.5,
            text: {
              text: "",
              fontFace: CONFIG.language.font,
              fontSize: 40,
              textColor: CONFIG.theme.hex
            }
          },
          BorderTop: {
            x: 0,
            y: 75,
            w: 1558,
            h: 3,
            rect: true,
            mountX: 0.5
          },
          Pairing: {
            x: 0,
            y: 125,
            mountX: 0.5,
            text: {
              text: "",
              fontFace: CONFIG.language.font,
              fontSize: 25
            }
          },
          Buttons: {
            x: 0,
            y: 200,
            w: 440,
            mountX: 0.5,
            h: 50,
            ConnectDisconnect: {
              x: 0,
              w: 200,
              mountX: 0.5,
              h: 50,
              rect: true,
              color: 0xFFFFFFFF,
              Title: {
                x: 100,
                y: 25,
                mount: 0.5,
                text: {
                  text: "",
                  fontFace: CONFIG.language.font,
                  fontSize: 22,
                  textColor: 0xFF000000
                }
              }
            },
            Unpair: {
              x: 0 + 220,
              w: 200,
              mountX: 0.5,
              h: 50,
              rect: true,
              color: 0xFFFFFFFF,
              Title: {
                x: 100,
                y: 25,
                mount: 0.5,
                text: {
                  text: Language.translate("Unpair"),
                  fontFace: CONFIG.language.font,
                  fontSize: 22,
                  textColor: 0xFF000000
                }
              }
            },
            Cancel: {
              x: 0 + 220 + 220,
              w: 200,
              mountX: 0.5,
              h: 50,
              rect: true,
              color: 0xFF7D7D7D,
              Title: {
                x: 100,
                y: 25,
                mount: 0.5,
                text: {
                  text: Language.translate("Cancel"),
                  fontFace: CONFIG.language.font,
                  fontSize: 22,
                  textColor: 0xFF000000
                }
              }
            }
          },
          BorderBottom: {
            x: 0,
            y: 300,
            w: 1558,
            h: 3,
            rect: true,
            mountX: 0.5
          }
        }
      };
    }

    item(item) {
      _item = item;

      this._setState('ConnectDisconnect');

      this.tag('Title').text = item.name;

      if (item.connected) {
        this.tag('BluetoothPair.Buttons.ConnectDisconnect.Title').text = 'Disconnect';
      } else {
        this.tag('BluetoothPair.Buttons.ConnectDisconnect.Title').text = 'Connect';
      }
    }

    _init() {
      this._setState('ConnectDisconnect');
    }

    static _states() {
      return [class ConnectDisconnect extends this {
        $enter() {
          this._focus();
        }

        _handleEnter() {
          // this.tag('Pairing').text = "Someting is wrong " + _item.name
          if (_item.connected) {
            // this.tag('Pairing').text = "Connecting to " + _item.name
            //this.fireAncestors('$pressEnter', 'Disconnect')
            Router.navigate('settings/bluetooth', {
              action: 'Disconnect'
            });
          } else {
            // this.tag('Pairing').text = "Disconnecting from " + _item.name
            // this.fireAncestors('$pressEnter', 'Connect')
            Router.navigate('settings/bluetooth', {
              action: 'Connect'
            });
          }
        }

        _handleRight() {
          this._setState('Unpair');
        }

        _focus() {
          this.tag('BluetoothPair.Buttons.ConnectDisconnect').patch({
            color: CONFIG.theme.hex
          });
          this.tag('BluetoothPair.Buttons.ConnectDisconnect.Title').patch({
            text: {
              textColor: 0xFFFFFFFF
            }
          });
        }

        _unfocus() {
          this.tag('BluetoothPair.Buttons.ConnectDisconnect').patch({
            color: 0xFFFFFFFF
          });
          this.tag('BluetoothPair.Buttons.ConnectDisconnect.Title').patch({
            text: {
              textColor: 0xFF000000
            }
          });
        }

        $exit() {
          this._unfocus();
        }

      }, class Unpair extends this {
        $enter() {
          this._focus();
        }

        _handleEnter() {
          //this.fireAncestors('$pressEnter', 'Unpair')
          Router.navigate('settings/bluetooth', {
            action: 'Unpair'
          });
        }

        _handleRight() {
          this._setState('Cancel');
        }

        _handleLeft() {
          this._setState('ConnectDisconnect');
        }

        _focus() {
          this.tag('Unpair').patch({
            color: CONFIG.theme.hex
          });
          this.tag('Unpair.Title').patch({
            text: {
              textColor: 0xFFFFFFFF
            }
          });
        }

        _unfocus() {
          this.tag('Unpair').patch({
            color: 0xFFFFFFFF
          });
          this.tag('Unpair.Title').patch({
            text: {
              textColor: 0xFF000000
            }
          });
        }

        $exit() {
          this._unfocus();
        }

      }, class Cancel extends this {
        $enter() {
          this._focus();
        }

        _handleEnter() {
          //this.fireAncestors('$pressEnter', 'Cancel')
          Router.navigate('settings/bluetooth', {
            action: 'Cancel'
          });
        }

        _handleLeft() {
          this._setState('Unpair');
        }

        _focus() {
          this.tag('Cancel').patch({
            color: CONFIG.theme.hex
          });
          this.tag('Cancel.Title').patch({
            text: {
              textColor: 0xFFFFFFFF
            }
          });
        }

        _unfocus() {
          this.tag('Cancel').patch({
            color: 0xFF7D7D7D
          });
          this.tag('Cancel.Title').patch({
            text: {
              textColor: 0xFF000000
            }
          });
        }

        $exit() {
          this._unfocus();
        }

      }];
    }

  }

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
  /**
   * Class for the item in the Bluetooth screen.
   */

  class BluetoothItem extends SettingsItem {
    static _template() {
      return {
        TopLine: {
          y: 0,
          mountY: 0.5,
          w: 1600,
          h: 3,
          rect: true,
          color: 0xFFFFFFFF
        },
        Item: {
          w: 1920 - 300,
          h: 90
        },
        BottomLine: {
          y: 90,
          mountY: 0.5,
          w: 1600,
          h: 3,
          rect: true,
          color: 0xFFFFFFFF
        }
      };
    }
    /**
     * Function to set contents of an item in the Bluetooth screen.
     */


    set item(item) {
      this._item = item;
      this.connected = item.connected ? 'Connected' : 'Not Connected';
      this.status = item.paired ? this.connected : 'Not Paired';
      this.tag('Item').patch({
        Left: {
          x: 10,
          y: 45,
          mountY: 0.5,
          text: {
            text: item.name,
            fontSize: 25,
            textColor: COLORS.textColor,
            fontFace: CONFIG.language.font
          }
        },
        Right: {
          x: 1600 - 200,
          y: 30,
          mountY: 0.5,
          mountX: 1,
          Text: {
            text: {
              text: this.status,
              fontSize: 25,
              fontFace: CONFIG.language.font,
              verticalAlign: "middle"
            }
          }
        } //  Debug:{
        //    x: 300,
        //    y:5,
        //    mountY: 0.5,
        //    mountX:1,
        //    Text: { text: { text: `item: ${JSON.stringify(item)}`, fontSize: 15,fontFace:CONFIG.language.font,verticalAlign:"middle" } },
        //  }

      });
    }

    _focus() {
      this.tag('TopLine').color = CONFIG.theme.hex;
      this.tag('BottomLine').color = CONFIG.theme.hex;
      this.patch({
        zIndex: 10
      });
      this.tag('TopLine').h = 6;
      this.tag('BottomLine').h = 6;
    }

    _unfocus() {
      this.tag('TopLine').color = 0xFFFFFFFF;
      this.tag('BottomLine').color = 0xFFFFFFFF;
      this.patch({
        zIndex: 1
      });
      this.tag('TopLine').h = 3;
      this.tag('BottomLine').h = 3;
    } // _handleEnter() {
    //   // this.tag("Item").patch(
    //   //   {
    //   //     text: {
    //   //       text: "this works",
    //   //     }
    //   //   }
    //   // )
    //   this.fireAncestors('$connectBluetooth', this.tag('List').element.ref)
    // }


  }

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
  /**
   * Class for Bluetooth thunder plugin apis.
   */

  class BluetoothApi {
    constructor() {
      this._events = new Map();
      this._devices = [];
      this._pairedDevices = [];
      this._connectedDevices = [];
      this.btStatus = false;
      const config = {
        host: '127.0.0.1',
        port: 9998,
        default: 1
      };
      this._thunder = thunderJS(config);
    }
    /**
     * Function to activate the Bluetooth plugin
     */


    activate() {
      return new Promise((resolve, reject) => {
        this.callsign = 'org.rdk.Bluetooth';

        this._thunder.call('Controller', 'activate', {
          callsign: this.callsign
        }).then(result => {
          this.btStatus = true;

          this._thunder.on(this.callsign, 'onDiscoveredDevice', notification => {
            // this.getDiscoveredDevices().then(() => {
            this._events.get('onDiscoveredDevice')(notification); // })

          });

          this._thunder.on(this.callsign, 'onStatusChanged', notification => {
            if (notification.newStatus === 'PAIRING_CHANGE') {
              this.getPairedDevices();
            } else if (notification.newStatus === 'CONNECTION_CHANGE') {
              this.getConnectedDevices().then(() => {
                this._events.get('onConnectionChange')(notification);
              });
            } else if (notification.newStatus === 'DISCOVERY_STARTED') {
              this.getConnectedDevices().then(() => {
                this._events.get('onDiscoveryStarted')();
              });
            } else if (notification.newStatus === 'DISCOVERY_COMPLETED') {
              this.getConnectedDevices().then(() => {
                this._events.get('onDiscoveryCompleted')();
              });
            }
          });

          this._thunder.on(this.callsign, 'onPairingRequest', notification => {
            this._events.get('onPairingRequest')(notification);
          });

          this._thunder.on(this.callsign, 'onRequestFailed', notification => {
            this._events.get('onRequestFailed')(notification);
          });

          this._thunder.on(this.callsign, 'onConnectionRequest', notification => {
            this._events.get('onConnectionRequest')(notification);
          });

          resolve('Blutooth activated');
        }).catch(err => {
          console.error('Activation failure', err);
          reject('Bluetooth activation failed', err);
        });
      });
    }
    /**
     *
     * @param {string} eventId
     * @param {function} callback
     * Function to register the events for the Bluetooth plugin.
     */


    registerEvent(eventId, callback) {
      this._events.set(eventId, callback);
    }
    /**
     * Function to deactivate the Bluetooth plugin.
     */


    deactivate() {
      this._events = new Map();
    }
    /**
     * Function to disable the Bluetooth stack.
     */


    disable() {
      return new Promise((resolve, reject) => {
        this._thunder.call('org.rdk.Bluetooth', 'disable').then(result => {
          this.btStatus = false;
          resolve(result);
        }).catch(err => {
          console.error("Can't disable : ".concat(JSON.stringify(err)));
        });
      });
    }
    /**
     * Function to enable the Bluetooth stack.
     */


    enable() {
      return new Promise((resolve, reject) => {
        this._thunder.call('org.rdk.Bluetooth', 'enable').then(result => {
          resolve(result);
          this.btStatus = true;
        }).catch(err => {
          console.error("Can't enable : ".concat(JSON.stringify(err)));
          reject();
        });
      });
    }
    /**
     * Function to start scanning for the Bluetooth devices.
     */


    startScan() {
      return new Promise((resolve, reject) => {
        this._thunder.call('org.rdk.Bluetooth', 'startScan', {
          timeout: '10',
          profile: "KEYBOARD,\n                    MOUSE,\n                    JOYSTICK,\n                    HUMAN INTERFACE DEVICE"
        }).then(result => {
          if (result.success) resolve();else reject();
        }).catch(err => {
          console.error('Error', err);
          reject();
        });
      });
    }
    /**
     * Function to stop scanning for the Bluetooth devices.
     */


    stopScan() {
      return new Promise((resolve, reject) => {
        this._thunder.call('org.rdk.Bluetooth', 'stopScan', {}).then(result => {
          if (result.success) resolve();else reject();
        }).catch(err => {
          console.error('Error', err);
          reject();
        });
      });
    }
    /**
     * Function returns the discovered Bluetooth devices.
     */


    getDiscoveredDevices() {
      return new Promise((resolve, reject) => {
        this._thunder.call('org.rdk.Bluetooth', 'getDiscoveredDevices').then(result => {
          this._devices = result.discoveredDevices;
          resolve(result.discoveredDevices);
        }).catch(err => {
          console.error("Can't get discovered devices : ".concat(JSON.stringify(err)));
        });
      });
    }

    get discoveredDevices() {
      return this._devices;
    }
    /**
     * Function returns the paired Bluetooth devices.
     */


    getPairedDevices() {
      return new Promise((resolve, reject) => {
        this._thunder.call('org.rdk.Bluetooth', 'getPairedDevices').then(result => {
          this._pairedDevices = result.pairedDevices;
          resolve(result.pairedDevices);
        }).catch(err => {
          console.error("Can't get paired devices : ".concat(err));
          reject(false);
        });
      });
    }

    get pairedDevices() {
      return this._pairedDevices;
    }
    /**
     * Function returns the connected Bluetooth devices.
     */


    getConnectedDevices() {
      return new Promise((resolve, reject) => {
        this._thunder.call('org.rdk.Bluetooth', 'getConnectedDevices').then(result => {
          this._connectedDevices = result.connectedDevices;
          resolve(result.connectedDevices);
        }).catch(err => {
          console.error("Can't get connected devices : ".concat(err));
          reject();
        });
      });
    }

    get connectedDevices() {
      return this._connectedDevices;
    }
    /**
     *
     * Function to connect a Bluetooth device.
     * @param {number} deviceID Device ID of the Bluetoth client.
     * @param {string} deviceType Device type of the Bluetooth client.
     */


    connect(deviceID, deviceType) {
      return new Promise((resolve, reject) => {
        this._thunder.call('org.rdk.Bluetooth', 'connect', {
          deviceID: deviceID,
          deviceType: deviceType,
          connectedProfile: deviceType
        }).then(result => {
          resolve(result.success);
        }).catch(err => {
          console.error('Connection failed', err);
          reject();
        });
      });
    }
    /**
     * Function to disconnect a Bluetooth device.
     *@param {number} deviceID Device ID of the Bluetoth client.
     *@param {string} deviceType Device type of the Bluetooth client.
     */


    disconnect(deviceID, deviceType) {
      return new Promise((resolve, reject) => {
        this._thunder.call('org.rdk.Bluetooth', 'disconnect', {
          deviceID: deviceID,
          deviceType: deviceType
        }).then(result => {
          if (result.success) resolve(true);else reject();
        }).catch(err => {
          console.error('disconnect failed', err);
          reject();
        });
      });
    }
    /**
     * Function to unpair a Bluetooth device.
     * @param {number} deviceId
     */


    unpair(deviceId) {
      return new Promise((resolve, reject) => {
        this._thunder.call('org.rdk.Bluetooth', 'unpair', {
          deviceID: deviceId
        }).then(result => {
          if (result.success) resolve(result.success);else resolve(false);
        }).catch(err => {
          console.error('unpair failed', err);
          resolve(false);
        });
      });
    }
    /**
     * Function to pair a Bluetooth device.
     * @param {number} deviceId
     */


    pair(deviceId) {
      return new Promise((resolve, reject) => {
        this._thunder.call('org.rdk.Bluetooth', 'pair', {
          deviceID: deviceId
        }).then(result => {
          if (result.success) resolve(result);else reject(result);
        }).catch(err => {
          console.error('Error on pairing', err);
          reject();
        });
      });
    }
    /**
     * Function to respond to client the Bluetooth event.
     * @param {number} deviceID Device ID of the Bluetooth client.
     * @param {string} eventType Name of the event.
     * @param {string} responseValue Response sent to the Bluetooth client.
     */


    respondToEvent(deviceID, eventType, responseValue) {
      return new Promise((resolve, reject) => {
        this._thunder.call('org.rdk.Bluetooth', 'respondToEvent', {
          deviceID: deviceID,
          eventType: eventType,
          responseValue: responseValue
        }).then(result => {
          if (result.success) resolve();else reject();
        }).catch(err => {
          console.error('Error on respondToEvent', err);
          reject();
        });
      });
    }
    /**
     * Function to get the discoverable name of the Bluetooth plugin.
     */


    getName() {
      return new Promise((resolve, reject) => {
        this._thunder.call('org.rdk.Bluetooth', 'getName').then(result => {
          resolve(result.name);
        });
      });
    }

    setAudioStream(deviceID) {
      return new Promise((resolve, reject) => {
        this._thunder.call('org.rdk.Bluetooth', 'setAudioStream', {
          "deviceID": deviceID,
          "audioStreamName": "AUXILIARY"
        }).then(result => {
          // console.log(JSON.stringify(result))
          this._connectedDevices = result.connectedDevices;
          resolve(result.connectedDevices);
        }).catch(err => {
          console.error("Can't get connected devices : ".concat(err));
          reject();
        });
      });
    }

  }

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
  /**
   * Class for pairing screen for the Bluetooth.
   */


  class BluetoothConfirmation extends lng$1.Component {
    static _template() {
      return {
        w: 1920,
        h: 1080,
        rect: true,
        color: 0xff000000,
        Title: {
          mountX: 0.5,
          text: {
            text: "",
            fontFace: CONFIG.language.font,
            fontSize: 40,
            textColor: CONFIG.theme.hex
          }
        },
        BorderTop: {
          x: 0,
          y: 75,
          w: 1558,
          h: 3,
          rect: true,
          mountX: 0.5
        },
        Pairing: {
          x: 0,
          y: 125,
          mountX: 0.5,
          text: {
            text: "",
            fontFace: CONFIG.language.font,
            fontSize: 25
          }
        },
        RectangleDefault: {
          x: 0,
          y: 200,
          w: 200,
          mountX: 0.5,
          h: 50,
          rect: true,
          color: CONFIG.theme.hex,
          Ok: {
            x: 100,
            y: 25,
            mount: 0.5,
            text: {
              text: "OK",
              fontFace: CONFIG.language.font,
              fontSize: 22
            }
          }
        },
        BorderBottom: {
          x: 0,
          y: 300,
          w: 1558,
          h: 3,
          rect: true,
          mountX: 0.5
        }
      };
    }

    set item(item) {
      this.tag('Title').text = item.name;
    }

    _handleEnter() {
      this.fireAncestors('$pressOK');
    }

    _handleBack() {
      this.fireAncestors('$pressOK');
    }

  }

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
  /**
   * Class for Bluetooth screen.
   */

  class BluetoothScreen extends lng$1.Component {
    _onChanged() {
      this.widgets.menu.updateTopPanelText(Language.translate('Settings  Bluetooth On/Off'));
    }

    static _template() {
      return {
        rect: true,
        color: 0xff000000,
        w: 1920,
        h: 1080,
        Bluetooth: {
          y: 275,
          x: 200,
          Confirmation: {
            x: 780,
            y: 100,
            type: BluetoothConfirmation,
            visible: false
          },
          PairingScreen: {
            x: 780,
            y: 100,
            type: BluetoothPairingScreen,
            zIndex: 100,
            visible: false
          },
          Switch: {
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('Bluetooth On/Off'),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Button: {
              h: 45,
              w: 67,
              x: 1600,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset('images/settings/ToggleOffWhite.png')
            }
          },
          Searching: {
            visible: false,
            h: 90,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('Searching for Devices'),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Loader: {
              h: 45,
              w: 45,
              // x: 1600,
              x: 320,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset('images/settings/Loading.gif')
            }
          },
          Networks: {
            PairedNetworks: {
              y: 180,
              List: {
                type: lng$1.components.ListComponent,
                w: 1920 - 300,
                itemSize: 90,
                horizontal: false,
                invertDirection: true,
                roll: true,
                rollMax: 900,
                itemScrollOffset: -6
              }
            },
            AvailableNetworks: {
              y: 90,
              visible: false,
              List: {
                w: 1920 - 300,
                type: lng$1.components.ListComponent,
                itemSize: 90,
                horizontal: false,
                invertDirection: true,
                roll: true,
                rollMax: 900,
                itemScrollOffset: -6
              }
            },
            visible: false
          },
          AddADevice: {
            y: 90,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('Add A Device'),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            visible: false
          }
        }
      };
    }
    /**
     * @param {{ action: String; }} args
     */


    set params(args) {
      if (args.action) {
        this.pressEnter(args.action);
      }
    }

    _unfocus() {
      this._disable();
    }

    pageTransition() {
      return 'left';
    }

    _firstEnable() {
      this._bt = new BluetoothApi();
      this._bluetooth = false;

      this._activateBluetooth();

      this._setState('Switch'); //this.switch()
      //this._bluetooth = false


      this._pairedNetworks = this.tag('Networks.PairedNetworks');
      this._availableNetworks = this.tag('Networks.AvailableNetworks');
      this.renderDeviceList();
      this.loadingAnimation = this.tag('Searching.Loader').animation({
        duration: 3,
        repeat: -1,
        stopMethod: 'immediate',
        stopDelay: 0.2,
        actions: [{
          p: 'rotation',
          v: {
            sm: 0,
            0: 0,
            1: 2 * Math.PI
          }
        }]
      });
    }

    _focus() {
      this._setState('AddADevice');

      this._enable();

      if (this._bluetooth) {
        this.tag('Networks').visible = true;
        this.tag('AddADevice').visible = true;
        this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOnOrange.png');
        this.renderDeviceList(); //this._bt.startScan()
      }
    }

    _handleBack() {
      Router.navigate('settings');
    }
    /**
     * Function to be excuted when the Bluetooth screen is enabled.
     */


    _enable() {
      if (this._bluetooth) {
        this._bt.startScan();
      }

      this.scanTimer = Registry.setInterval(() => {
        if (this._bluetooth) {
          this._bt.startScan();
        }
      }, 5000);
    }
    /**
     * Function to be executed when the Bluetooth screen is disabled from the screen.
     */


    _disable() {
      Registry.clearInterval(this.scanTimer);

      this._bt.stopScan();
    }
    /**
     * Function to be executed when add a device is pressed
     */


    showAvailableDevices() {
      this.tag('Switch').patch({
        alpha: 0
      });
      this.tag('PairedNetworks').patch({
        alpha: 0
      });
      this.tag('AddADevice').patch({
        alpha: 0
      });
      this.tag('Searching').patch({
        visible: true
      });
      this.tag('AvailableNetworks').patch({
        visible: true
      }); //  this.loadingAnimation.stop()
      // this.tag('TopPanel').patch({ alpha: 0 });
      // this.tag('SidePanel').patch({ alpha: 0 });
    }

    hideAvailableDevices() {
      this.tag('Switch').patch({
        alpha: 1
      });
      this.tag('PairedNetworks').patch({
        alpha: 1
      });
      this.tag('AddADevice').patch({
        alpha: 1
      });
      this.tag('Searching').patch({
        visible: false
      });
      this.tag('AvailableNetworks').patch({
        visible: false
      });
      this.tag('Confirmation').patch({
        visible: false
      }); //  this.loadingAnimation.start()
      // this.tag('TopPanel').patch({ alpha: 0 });
      // this.tag('SidePanel').patch({ alpha: 0 });
    }

    showPairingScreen() {
      this.tag('Switch').patch({
        alpha: 0
      });
      this.tag('PairedNetworks').patch({
        alpha: 0
      });
      this.tag('AddADevice').patch({
        alpha: 0
      });
      this.tag('Searching').patch({
        visible: false
      });
      this.tag('AvailableNetworks').patch({
        visible: false
      });
      this.tag('Confirmation').patch({
        visible: false
      });
      this.tag('PairingScreen').patch({
        visible: true
      });
      this.fireAncestors('$hideTopPanel'); // this.tag('TopPanel').patch({ alpha: 0 });
      // this.tag('SidePanel').patch({ alpha: 0 });
    }

    hidePairingScreen() {
      this.tag('Switch').patch({
        alpha: 1
      });
      this.tag('PairedNetworks').patch({
        alpha: 1
      });
      this.tag('AddADevice').patch({
        alpha: 1
      });
      this.tag('Searching').patch({
        visible: false
      });
      this.tag('AvailableNetworks').patch({
        visible: false
      });
      this.tag('Confirmation').patch({
        visible: false
      });
      this.tag('PairingScreen').patch({
        visible: false
      });
      this.fireAncestors('$showTopPanel'); // this.tag('TopPanel').patch({ alpha: 0 });
      // this.tag('SidePanel').patch({ alpha: 0 });
    }

    showConfirmation() {
      this.tag('Switch').patch({
        alpha: 0
      });
      this.tag('PairedNetworks').patch({
        alpha: 0
      });
      this.tag('AddADevice').patch({
        alpha: 0
      });
      this.tag('Searching').patch({
        visible: false
      });
      this.tag('AvailableNetworks').patch({
        visible: false
      });
      this.tag('PairingScreen').patch({
        visible: false
      });
      this.tag('Confirmation').patch({
        visible: true
      });
      this.fireAncestors('$hideTopPanel'); // this.tag('TopPanel').patch({ alpha: 0 });
      // this.tag('SidePanel').patch({ alpha: 0 });
    }

    hideConfirmation() {
      this.tag('Switch').patch({
        alpha: 1
      });
      this.tag('PairedNetworks').patch({
        alpha: 1
      });
      this.tag('AddADevice').patch({
        alpha: 1
      });
      this.tag('Searching').patch({
        visible: false
      });
      this.tag('AvailableNetworks').patch({
        visible: false
      });
      this.tag('PairingScreen').patch({
        visible: false
      });
      this.tag('Confirmation').patch({
        visible: false
      });
      this.fireAncestors('$showTopPanel'); // this.tag('TopPanel').patch({ alpha: 0 });
      // this.tag('SidePanel').patch({ alpha: 0 });
    }
    /**
     * Function to render list of Bluetooth devices
     */


    renderDeviceList() {
      this._bt.getPairedDevices().then(result => {
        this._pairedList = result;
        this._pairedNetworks.h = this._pairedList.length * 90;
        this._pairedNetworks.tag('List').h = this._pairedList.length * 90;
        this._pairedNetworks.tag('List').items = this._pairedList.map((item, index) => {
          item.paired = true;
          return {
            ref: 'Paired' + index,
            w: 1920 - 300,
            h: 90,
            type: BluetoothItem,
            item: item
          };
        });
      });

      this._bt.getDiscoveredDevices().then(result => {
        this._discoveredList = result;
        this._otherList = this._discoveredList.filter(device => {
          if (!device.paired) {
            result = this._pairedList.map(a => a.deviceID);

            if (result.includes(device.deviceID)) {
              return false;
            } else return device;
          }
        });
        this._availableNetworks.h = this._otherList.length * 90;
        this._availableNetworks.tag('List').h = this._otherList.length * 90;
        this._availableNetworks.tag('List').items = this._otherList.map((item, index) => {
          return {
            ref: 'Other' + index,
            w: 1920 - 300,
            h: 90,
            type: BluetoothItem,
            item: item
          };
        });
      });
    }

    pressEnter(option) {
      if (option === 'Cancel') {
        this._setState('Switch');
      } else if (option === 'Pair') {
        this._bt.pair(this._availableNetworks.tag('List').element._item.deviceID).then(result => {
          let btName = this._availableNetworks.tag('List').element._item.name;

          if (result.success) {
            this.widgets.fail.notify({
              title: btName,
              msg: 'Pairing Succesful'
            });
            Router.focusWidget('Fail');
          } else {
            this.widgets.fail.notify({
              title: btName,
              msg: 'Pairing Failed'
            });
            Router.focusWidget('Fail');
          }

          this.hideAvailableDevices();
        });
      } else if (option === 'Connect') {
        this._bt.connect(this._pairedNetworks.tag('List').element._item.deviceID, this._pairedNetworks.tag('List').element._item.deviceType).then(result => {
          let btName = this._pairedNetworks.tag('List').element._item.name;

          if (!result) {
            this.widgets.fail.notify({
              title: btName,
              msg: 'Connection Failed'
            });
            Router.focusWidget('Fail');
          } else {
            this._bt.setAudioStream(this._pairedNetworks.tag('List').element._item.deviceID);

            this.widgets.fail.notify({
              title: btName,
              msg: 'Connection Successful'
            });
            Router.focusWidget('Fail');
          }
        });
      } else if (option === 'Disconnect') {
        this._bt.disconnect(this._pairedNetworks.tag('List').element._item.deviceID, this._pairedNetworks.tag('List').element._item.deviceType).then(result => {
          let btName = this._pairedNetworks.tag('List').element._item.name;

          if (!result) {
            this.widgets.fail.notify({
              title: btName,
              msg: 'Failed to Disconnect'
            });
            Router.focusWidget('Fail');
          } else {
            this.widgets.fail.notify({
              title: btName,
              msg: 'Disconnected'
            });
            Router.focusWidget('Fail');
          }
        });
      } else if (option === 'Unpair') {
        this._bt.unpair(this._pairedNetworks.tag('List').element._item.deviceID).then(result => {
          let btName = this._pairedNetworks.tag('List').element._item.name;

          if (result) {
            this.widgets.fail.notify({
              title: btName,
              msg: 'Unpaired'
            });
            Router.focusWidget('Fail');
          } else {
            this.widgets.fail.notify({
              title: btName,
              msg: 'Unpairing Failed'
            });
            Router.focusWidget('Fail');
          }
        });
      }
    }

    static _states() {
      return [class Switch extends this {
        $enter() {
          this.hideAvailableDevices();
          this.hidePairingScreen();

          this.tag('Switch')._focus();
        }

        $exit() {
          this.tag('Switch')._unfocus();
        }

        _handleDown() {
          this._setState('AddADevice');
        }

        _handleEnter() {
          this.switch();
        }

      }, class Confirmation extends this {
        $enter() {
          this.showConfirmation();
        }

        _getFocused() {
          return this.tag('Confirmation');
        }

        $pressOK() {
          this._setState('Switch');

          this.hideConfirmation();
        }

      }, class PairedDevices extends this {
        $enter() {
          this.hideAvailableDevices();
        }

        _getFocused() {
          return this._pairedNetworks.tag('List').element;
        }

        _handleDown() {
          this._navigate('MyDevices', 'down');
        }

        _handleUp() {
          this._navigate('MyDevices', 'up');
        }

        _handleEnter() {
          //this.showPairingScreen()
          //this.tag('PairingScreen').item = this._pairedNetworks.tag('List').element._item
          Router.navigate('settings/bluetooth/pairing', {
            bluetoothItem: this._pairedNetworks.tag('List').element._item
          }); //this._setState('PairingScreen')
        }

      }, class AvailableDevices extends this {
        _getFocused() {
          return this._availableNetworks.tag('List').element;
        }

        _handleDown() {
          this._navigate('AvailableDevices', 'down');
        }

        _handleUp() {
          this._navigate('AvailableDevices', 'up');
        }

        _handleEnter() {
          this.pressEnter('Pair'); //this.tag('Confirmation').item = this._availableNetworks.tag('List').element._item
        }

        _handleBack() {
          this.hideAvailableDevices();

          this._setState('Switch');
        }

      }, class AddADevice extends this {
        $enter() {
          this.tag('AddADevice')._focus();

          this.hideAvailableDevices();
        }

        _handleUp() {
          this._setState('Switch');
        }

        _handleDown() {
          if (this._bluetooth) {
            if (this._pairedNetworks.tag('List').length > 0) {
              this._setState('PairedDevices');
            } else if (this._availableNetworks.tag('List').length > 0) {
              this._setState('AvailableDevices');
            }
          }
        }

        $exit() {
          this.tag('AddADevice')._unfocus();
        }

        _handleEnter() {
          if (this._bluetooth) {
            this.showAvailableDevices();

            this._setState('AvailableDevices');
          }
        }

      }, class PairingScreen extends this {
        $enter() {
          this._disable();

          this._bt.stopScan();

          return this.tag('PairingScreen');
        }

        _getFocused() {
          return this.tag('PairingScreen');
        }

        $exit() {
          this.tag('PairingScreen').visible = false;

          this._enable();
        }

      }];
    }
    /**
     * Function to navigate through the lists in the screen.
     * @param {string} listname
     * @param {string} dir
     */


    _navigate(listname, dir) {
      let list;
      if (listname === 'MyDevices') list = this._pairedNetworks.tag('List');else if (listname === 'AvailableDevices') list = this._availableNetworks.tag('List');

      if (dir === 'down') {
        if (list.index < list.length - 1) list.setNext();else if (list.index == list.length - 1) {
          if (listname === 'MyDevices' && this._availableNetworks.tag('List').length > 0) ;
        }
      } else if (dir === 'up') {
        if (list.index > 0) list.setPrevious();else if (list.index == 0) {
          if (listname === 'AvailableDevices' && this._pairedNetworks.tag('List').length > 0) ; else if (listname === 'MyDevices') {
            this._setState('AddADevice');
          }
        }
      }
    }
    /**
     * Function to turn on and off Bluetooth.
     */


    switch() {
      if (this._bluetooth) {
        this._bt.disable().then(result => {
          if (result.success) {
            this._bluetooth = false;
            this.tag('Networks').visible = false;
            this.tag('AddADevice').visible = false;
            this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOffWhite.png');
          }
        }).catch(() => {
          console.log('Cannot turn off Bluetooth');
        });
      } else {
        this._bt.enable().then(result => {
          if (result.success) {
            this._bluetooth = true;
            this.tag('Networks').visible = true;
            this.tag('AddADevice').visible = true;
            this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOnOrange.png');
            this.renderDeviceList();

            this._bt.startScan();
          }
        }).catch(() => {
          console.log('Cannot turn on Bluetooth');
        });
      }
    }
    /**
     * Function to activate Bluetooth plugin.
     */


    _activateBluetooth() {
      this._bt.activate().then(res => {
        console.log(res);
        this._bluetooth = true;

        this._bt.registerEvent('onDiscoveredDevice', () => {
          this.renderDeviceList();
        });

        this._bt.registerEvent('onPairingRequest', notification => {
          this.respondToPairingRequest(notification.deviceID, 'ACCEPTED');
        });

        this._bt.registerEvent('onConnectionChange', notification => {
          this._bt.startScan();

          this.renderDeviceList();
          let btName = notification.name;

          if (notification.connected) {
            if (this.widgets.fail) {
              this.widgets.fail.notify({
                title: btName,
                msg: 'CONNECTION SUCCESS'
              });
              Router.focusWidget('Fail');
            }
          } else {
            if (this.widgets.fail) {
              this.widgets.fail.notify({
                title: btName,
                msg: 'CONNECTION FAILED'
              });
              Router.focusWidget('Fail');
            }
          }
        });

        this._bt.registerEvent('onDiscoveryCompleted', () => {
          this.tag('Searching.Loader').visible = false;
          this.loadingAnimation.stop();
          this.renderDeviceList();
        });

        this._bt.registerEvent('onDiscoveryStarted', () => {
          this.loadingAnimation.start();
          this.tag('Searching.Loader').visible = true;
        });

        this._bt.registerEvent('onRequestFailed', notification => {
          this._bt.startScan();

          this.renderDeviceList();

          if (this.widgets.fail) {
            this.widgets.fail.notify({
              title: notification.name,
              msg: notification.newStatus
            });
            Router.focusWidget('Fail');
          }
        });
      }).catch(err => {
        console.log(err);
      });
    }
    /**
     * Function to respond to Bluetooth client.
     * @param {number} deviceID
     * @param {string} responseValue
     */


    respondToPairingRequest(deviceID, responseValue) {
      this._bt.respondToEvent(deviceID, 'onPairingRequest', responseValue);
    }

  }

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */

  /**
   * Colors
   *
   * Contains global color style information to easily maintain consistency throughout components.
   */

  /**
   * Combines rgb hex string and alpha into argb hexadecimal number
   * @param {string} hex - 6 alphanumeric characters between 0-f
   * @param {number} [alpha] - number between 0-100 (0 is invisible, 100 is opaque)
   */
  function getHexColor(hex) {
    let alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

    if (!hex) {
      return 0x00;
    }

    let hexAlpha = Math.round(alpha / 100 * 255).toString(16);
    let str = "0x".concat(hexAlpha).concat(hex);
    return parseInt(Number(str), 10);
  }
  /**
   * Pair color values with color names in the "Neutral" palette
   */

  const COLORS_NEUTRAL = {
    dark1: '000000',
    dark2: '080808',
    dark3: '101010',
    light1: 'FFFFFF',
    light2: 'F5F5F5',
    light3: 'E8E8E8'
  };

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */

  /**
   * Returns a styles object for use by components
   * @param {Object|function} styles - Object or callback that takes theme as an argument, ultimately the returned value
   * @param {Object} theme - theme to be provided to styles
   */
  var createStyles = ((styles, theme) => {
    return typeof styles === 'function' ? styles(theme) : styles;
  });

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  /**
   * Helpers for lng.Tools.getRoundRect
   */

  const RoundRect = {
    /**
     * Returns a value that will render as the given width (w)
     * when passed to lng.Tools.getRoundRect
     * @param {number} w - px value for expected width
     * @param {*} options
     * @param {number} options.padding - px value for both left and right padding
     * @param {number} options.paddingLeft - px value for left padding, overrides options.padding
     * @param {number} options.paddingRight - px value for right padding, overrides options.padding
     * @param {number} options.strokeWidth - px value for stroke width
     */
    getWidth(w) {
      let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      const {
        padding,
        paddingLeft,
        paddingRight,
        strokeWidth
      } = {
        padding: 0,
        paddingLeft: 0,
        paddingRight: 0,
        strokeWidth: 0,
        ...options
      };
      if (!w) return 0;
      return w - (paddingLeft || padding) - (paddingRight || padding) - strokeWidth;
    },

    /**
     * Returns a value that will render as the given height (h)
     * when passed to lng.Tools.getRoundRect
     * @param {number} h - px value for expected width
     * @param {*} options
     * @param {number} options.padding - px value for both bottom and top padding
     * @param {number} options.paddingBottom - px value for bottom padding, overrides options.padding
     * @param {number} options.paddingTop - px value for top padding, overrides options.padding
     * @param {number} options.strokeWidth - px value for stroke width
     */
    getHeight(h) {
      let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      const {
        padding,
        paddingBottom,
        paddingTop,
        strokeWidth
      } = {
        padding: 0,
        paddingBottom: 0,
        paddingTop: 0,
        strokeWidth: 0,
        ...options
      };
      if (!h) return 0;
      return h - (paddingBottom || padding) - (paddingTop || padding) - strokeWidth;
    }

  };
  /**
   * Merges two objects together and returns the duplicate.
   *
   * @param {Object} target - object to be cloned
   * @param {Object} [object] - secondary object to merge into clone
   */

  function clone(target, object) {
    const _clone = { ...target
    };
    if (!object || target === object) return _clone;

    for (let key in object) {
      const value = object[key];

      if (target.hasOwnProperty(key)) {
        _clone[key] = getMergeValue(key, target, object);
      } else {
        _clone[key] = value;
      }
    }

    return _clone;
  }

  function getMergeValue(key, target, object) {
    const targetVal = target[key];
    const objectVal = object[key];
    const targetValType = typeof targetVal;
    const objectValType = typeof objectVal;

    if (targetValType !== objectValType || objectValType === 'function' || Array.isArray(objectVal)) {
      return objectVal;
    }

    if (objectVal && objectValType === 'object') {
      return clone(targetVal, objectVal);
    }

    return objectVal;
  }
  /**
   * Returns the rendered width of a given text texture
   * @param {Object} text - text texture properties
   * @param {string} text.text - text value
   * @param {string} text.fontStyle - css font-style property
   * @param {(string|number)} text.fontWeight - css font-weight property
   * @param {string} [fontSize=0] - css font-size property (in px)
   * @param {string} [text.fontFamily=sans-serif] - css font-weight property
   * @param {string} text.fontFace - alias for fontFamily
   *
   * @returns {number} text width
   * */


  function measureTextWidth() {
    let text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const {
      fontStyle,
      fontWeight,
      fontSize,
      fontFamily = text.fontFace || 'sans-serif'
    } = text;
    const fontCss = [fontStyle, fontWeight, fontSize ? "".concat(fontSize, "px") : '0', "'".concat(fontFamily, "'")].filter(Boolean).join(' ');
    ctx.font = fontCss;
    const textMetrics = ctx.measureText(text.text || '');
    return Math.round(textMetrics.width);
  }
  /**
   * Returns first argument that is a number. Useful for finding ARGB numbers. Does not convert strings to numbers
   * @param {...*} number - maybe a number
   **/

  function getFirstNumber() {
    for (var _len = arguments.length, numbers = new Array(_len), _key = 0; _key < _len; _key++) {
      numbers[_key] = arguments[_key];
    }

    return numbers.find(Number.isFinite);
  }
  /**
   * Naively looks for dimensional prop (i.e. w, h, x, y, etc.), first searching for
   * a transition target value then defaulting to the current set value
   * @param {string} prop - property key
   * @param {lng.Component} component - Lightning component to operate against
   */

  function getDimension(prop, component) {
    if (!component) return 0;
    const transition = component.transition(prop);
    if (transition.isRunning()) return transition.targetValue;
    return component[prop];
  }
  const getX = getDimension.bind(null, 'x');
  const getY = getDimension.bind(null, 'y');
  const getW = component => getDimension('w', component) || component.renderWidth;
  const getH = component => getDimension('h', component) || component.renderHeight;

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */

  const gradientColor = COLORS_NEUTRAL.light2;
  ({
    duration: 0.6,
    actions: [{
      p: 'colorUl',
      v: {
        0: getHexColor(gradientColor, 72),
        1: getHexColor(gradientColor, 56)
      }
    }, {
      p: 'colorUr',
      v: {
        0: getHexColor(gradientColor, 24),
        1: getHexColor(gradientColor, 16)
      }
    }, {
      p: 'colorBr',
      v: {
        0: 0x00,
        1: getHexColor(gradientColor, 0)
      }
    }, {
      p: 'colorBl',
      v: {
        0: getHexColor(gradientColor, 24),
        1: getHexColor(gradientColor, 16)
      }
    }]
  });

  /**
  * Copyright 2020 Comcast Cable Communications Management, LLC
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
  *
  * SPDX-License-Identifier: Apache-2.0
  */
  function withStyles(Base, styles, theme) {
    const _theme = theme || Base.theme;

    const _styles = Base.styles ? clone(Base.styles, createStyles(styles, _theme)) : createStyles(styles, _theme);

    return class extends Base {
      static get name() {
        return Base.name;
      }

      static get styles() {
        return _styles;
      }

      get styles() {
        return _styles;
      }

    };
  }

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  class Icon extends lng$1.Component {
    static _template() {
      return {
        color: 0xffffffff,
        w: 0,
        h: 0
      };
    }

    get icon() {
      return this._icon;
    }

    set icon(icon) {
      this._icon = icon;

      this._update();
    }

    _init() {
      this._update();
    }

    _update() {
      const {
        icon,
        w,
        h
      } = this;
      const template = getIconTemplate(icon, w, h);
      this.patch(template);
    }

  }
  const [isSvgTag, isSvgURI, isImageURI] = [/^<svg.*<\/svg\>$/, /\.svg$/, /\.(a?png|bmp|gif|ico|cur|jpe?g|pjp(eg)?|jfif|tiff?|webp)$/].map(regex => RegExp.prototype.test.bind(regex));

  function getIconTemplate(icon, w, h) {
    const template = {
      w,
      h
    };

    switch (true) {
      case isSvgTag(icon):
        template.texture = lng$1.Tools.getSvgTexture("data:image/svg+xml,".concat(encodeURIComponent(icon)), w, h);
        break;

      case isSvgURI(icon):
        template.texture = lng$1.Tools.getSvgTexture(icon, w, h);
        break;

      case isImageURI(icon):
        template.src = icon;
        break;
    }

    return template;
  }

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  const styles = {
    w: 113,
    //150
    h: 90,
    //40
    radius: 0,
    background: {
      color: 0xffffffff
    },
    // 0xff1f1f1f
    icon: {
      color: 0xffffffff
    },
    text: {
      fontSize: 30,
      fontFace: CONFIG.language.font,
      color: 0xff000000
    },
    padding: 50,
    stroke: {
      color: 0x00,
      weight: 2
    },
    focused: {
      background: {
        color: CONFIG.theme.hex
      },
      text: {
        color: 0xff1f1f1f
      },
      icon: {
        color: 0xff1f1f1f
      }
    }
  };

  class Button extends lng$1.Component {
    static _template() {
      return {
        w: this.styles.w,
        h: this.styles.h,
        radius: this.styles.radius,
        strokeColor: this.styles.stroke.color,
        strokeWeight: this.styles.stroke.weight,
        Content: {
          mount: 0.5,
          x: w => w / 2,
          y: h => h / 2,
          flex: {
            direction: 'row',
            alignContent: 'center',
            alignItems: 'center'
          },
          Icon: {
            type: Icon
          },
          Title: {
            y: 2
          }
        },
        Stroke: {
          zIndex: -1,
          mount: 0.5,
          x: w => w / 2,
          y: h => h / 2
        }
      };
    }

    _construct() {
      this._focused = false;
      this._whenEnabled = new Promise(resolve => this._enable = resolve, console.error);
      this._strokeWeight = 2;
      this._strokeColor = 0x00;
    }

    _init() {
      this._update();
    }

    _focus() {
      if (this._smooth === undefined) this._smooth = true;
      this._focused = true;

      this._update();
    }

    _unfocus() {
      this._focused = false;

      this._update();
    }

    _updateColor() {
      const color = this._focused ? getFirstNumber(this.focusedBackground, this.styles.focused.background.color) : getFirstNumber(this.background, this.styles.background.color);

      if (this._smooth) {
        this.smooth = {
          color
        };
      } else {
        this.color = color;
      }
    }

    _updateTitle() {
      if (this.title) {
        this._Title.text = { ...this.styles.text,
          fontColor: this.styles.text.color,
          fontSize: this.fontSize || this.styles.text.fontSize,
          fontFamily: this.styles.text.fontFace || this.styles.text.fontFamily || this.stage._options.defaultFontFace,
          text: this.title
        };
        const color = this._focused ? getFirstNumber(this.focusedTextColor, this.styles.focused.text.color) : getFirstNumber(this.textColor, this.styles.text.color);

        if (this._smooth) {
          this._Title.smooth = {
            color
          };
        } else {
          this._Title.color = color;
        }
      } else {
        this._Title.texture = false;
      }
    }

    _updateIcon() {
      if (this.icon) {
        const {
          color,
          size,
          spacing,
          src
        } = this.icon;

        this._Icon.patch({
          w: size,
          h: size,
          icon: src,
          flexItem: {
            marginRight: this.title ? spacing : 0
          }
        });

        const iconColor = this._focused ? getFirstNumber(this.focusedIconColor, this.styles.focused.icon.color) : getFirstNumber(color, this.styles.icon.color);

        if (this._smooth) {
          this._Icon.smooth = {
            color: iconColor
          };
        } else {
          this._Icon.color = iconColor;
        }
      } else {
        this._Icon.patch({
          w: 0,
          h: 0,
          texture: false,
          flexItem: false
        });
      }
    }

    _updateStroke() {
      if (this.stroke && !this._focused) {
        const radius = this.radius || this.styles.radius;
        this.texture = lng$1.Tools.getRoundRect(RoundRect.getWidth(this.w), RoundRect.getHeight(this.h), radius, 0x00, true, 0xffffffff);
        this._Stroke.color = this.strokeColor;
        this._Stroke.texture = lng$1.Tools.getRoundRect(RoundRect.getWidth(this.w), RoundRect.getHeight(this.h), radius, this.strokeWeight, 0xffffffff, true, this.background);
      } else {
        const radius = this.radius || this.styles.radius;
        this.texture = lng$1.Tools.getRoundRect(RoundRect.getWidth(this.w), RoundRect.getHeight(this.h), radius);
        this._Stroke.texture = false;
      }
    }

    _updateWidth() {
      if (!this.fixed) {
        const iconSize = this._icon ? this._icon.size + this._icon.spacing : 0;
        const padding = getFirstNumber(this.padding, this.styles.padding, 10);
        const w = measureTextWidth(this._Title.text || {}) + padding * 2 + iconSize;

        if (w && w !== this.w) {
          this.w = w > this.styles.w ? w : this.styles.w;
          this.fireAncestors('$itemChanged');
          this.signal('buttonWidthChanged', {
            w: this.w
          });
        }
      }
    }

    _update() {
      this._whenEnabled.then(() => {
        this._updateColor();

        this._updateTitle();

        this._updateIcon();

        this._updateStroke();

        this._updateWidth();
      });
    }

    _handleEnter() {
      if (typeof this.onEnter === 'function') {
        this.onEnter(this);
      }
    }

    get radius() {
      return this._radius;
    }

    set radius(radius) {
      if (this._radius !== radius) {
        this._radius = radius;

        this._update();
      }
    }

    get title() {
      return this._title;
    }

    set title(title) {
      if (this._title !== title) {
        this._title = title;

        this._update();
      }
    }

    get icon() {
      return this._icon;
    }

    set icon(_ref) {
      let {
        src,
        size = 20,
        spacing = 5,
        color = 0xffffffff
      } = _ref;

      if (src) {
        this._icon = {
          src,
          size,
          spacing,
          color
        };
      } else {
        this._icon = null;
      }

      this._update();
    }

    get strokeWeight() {
      return this._strokeWeight;
    }

    set strokeWeight(strokeWeight) {
      if (this._strokeWeight !== strokeWeight) {
        this._strokeWeight = strokeWeight;

        this._update();
      }
    }

    get strokeColor() {
      return this._strokeColor;
    }

    set strokeColor(strokeColor) {
      if (this._strokeColor !== strokeColor) {
        this._strokeColor = strokeColor;

        this._update();
      }
    }

    get stroke() {
      return this._stroke;
    }

    set stroke(stroke) {
      if (this._stroke !== stroke) {
        this._stroke = stroke;

        this._update();
      }
    }

    get w() {
      return this._w;
    }

    set w(w) {
      if (this._w !== w) {
        this._w = w;

        this._update();
      }
    }

    set label(label) {
      this._label = label;
    }

    get label() {
      return this._label || this._title;
    }

    get announce() {
      // TODO - Localization?
      // Do we need a locale file with
      // component translations?
      return this.label + ', Button';
    }

    get _Content() {
      return this.tag('Content');
    }

    get _Title() {
      return this.tag('Content.Title');
    }

    get _Icon() {
      return this.tag('Content.Icon');
    }

    get _Stroke() {
      return this.tag('Stroke');
    }

  }

  var Button$1 = withStyles(Button, styles);

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  class FocusManager extends lng$1.Component {
    constructor(stage) {
      super(stage);
      this.patch({
        Items: {}
      });
      this._direction = this.direction || 'row';
    }

    _construct() {
      this._selectedIndex = 0;
    }

    get direction() {
      return this._direction;
    }

    set direction(direction) {
      this._direction = direction;
      let state = {
        none: 'None',
        column: 'Column',
        row: 'Row'
      }[direction];

      if (state) {
        this._setState(state);
      }
    }

    get Items() {
      return this.tag('Items');
    }

    get items() {
      return this.Items.children;
    }

    set items(items) {
      this.Items.childList.clear();
      this._selectedIndex = 0;
      this.appendItems(items);
    }

    appendItems() {
      let items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      this.Items.childList.a(items);

      this._refocus();
    }

    get selected() {
      return this.Items.children[this.selectedIndex];
    }

    get selectedIndex() {
      return this._selectedIndex;
    }

    set selectedIndex(index) {
      const prevSelected = this.selected;

      if (index !== this._selectedIndex) {
        this._selectedIndex = index;
      } // Have items update (change height or width) before we render


      this._refocus();

      if (this.selected) {
        this.render(this.selected, prevSelected);
        this.signal('selectedChange', this.selected, prevSelected);
      }
    } // Override


    render() {}

    selectPrevious() {
      if (this.selectedIndex > 0) {
        let prevIndex = this.selectedIndex - 1;
        let previous = this.items[prevIndex];

        while (prevIndex && previous.skipFocus) {
          this._selectedIndex = prevIndex;
          this.render(previous, this.items[prevIndex + 1]);
          prevIndex -= 1;
          previous = this.items[prevIndex];
        }

        this.selectedIndex = prevIndex;
        return true;
      } else if (this.wrapSelected) {
        this.selectedIndex = this.Items.children.length - 1;
        return true;
      }

      return false;
    }

    selectNext() {
      if (this.selectedIndex < this.Items.children.length - 1) {
        let nextIndex = this.selectedIndex + 1;
        let next = this.items[nextIndex];

        while (nextIndex < this.items.length - 1 && next.skipFocus) {
          this._selectedIndex = nextIndex;
          this.render(next, this.items[nextIndex - 1]);
          nextIndex += 1;
          next = this.items[nextIndex];
        }

        this.selectedIndex = nextIndex;
        return true;
      } else if (this.wrapSelected) {
        this.selectedIndex = 0;
        return true;
      }

      return false;
    }

    _getFocused() {
      let {
        selected
      } = this; // Make sure we're focused on a component

      if (selected) {
        if (selected.focusRef) {
          return selected.tag(selected.focusRef);
        } else if (selected.cparent) {
          return selected;
        }
      }

      return this;
    }

    static _states() {
      return [class None extends this {}, class Row extends this {
        _handleLeft() {
          return this.selectPrevious();
        }

        _handleRight() {
          return this.selectNext();
        }

      }, class Column extends this {
        _handleUp() {
          return this.selectPrevious();
        }

        _handleDown() {
          return this.selectNext();
        }

      }];
    }

  }

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  class Column extends FocusManager {
    static _template() {
      return {
        direction: 'column'
      };
    }

    _construct() {
      super._construct();

      this._smooth = false;
      this._itemSpacing = 0;
      this._scrollIndex = 0;
      this._whenEnabled = new Promise(resolve => this._firstEnable = resolve);
      this._h = this.stage.h;
      this.debounceDelay = Number.isInteger(this.debounceDelay) ? this.debounceDelay : 30;
      this._update = debounce_1.debounce(this._updateLayout, this.debounceDelay);
      this._updateImmediate = debounce_1.debounce(this._updateLayout, this.debounceDelay, true);
    }

    get _itemTransition() {
      return this.itemTransition || {
        duration: 0.4,
        timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'
      };
    }

    _focus() {
      this.items.forEach(item => item.parentFocus = true);
    }

    _unfocus() {
      this.items.forEach(item => item.parentFocus = false);
    }

    selectNext() {
      this._smooth = true;
      return super.selectNext();
    }

    selectPrevious() {
      this._smooth = true;
      return super.selectPrevious();
    } // TODO: can be documented in API when lastScrollIndex is made public


    shouldScrollUp() {
      let shouldScroll = false;

      if (this._lastScrollIndex) {
        shouldScroll = this.selectedIndex < this._lastScrollIndex;

        if (this._prevLastScrollIndex !== undefined && this._prevLastScrollIndex !== this._lastScrollIndex) {
          shouldScroll = true;
        }
      } else {
        shouldScroll = this.selectedIndex >= this._scrollIndex;
      }

      return this._itemsY < 0 && shouldScroll;
    } // TODO: can be documented in API when lastScrollIndex is made public


    shouldScrollDown() {
      const lastChild = this.Items.childList.last;
      return this.selectedIndex > this._scrollIndex && // end of Items container < end of last item
      Math.abs(this._itemsY - this.h) < lastChild.y + this.Items.childList.last.h;
    }

    render(next, prev) {
      this._prevLastScrollIndex = this._lastScrollIndex;

      if (this.plinko && prev && (prev.currentItem || prev.selected)) {
        next.selectedIndex = this._getIndexOfItemNear(next, prev);
      } // Rows are changing height, so we'll render via updateLayout


      if (this.itemsChangeable) {
        return;
      }

      this._performRender();
    }

    _performRender() {
      this._whenEnabled.then(() => {
        const scrollOffset = (this.Items.children[this._scrollIndex] || {
          y: 0
        }).y;
        const firstChild = this.Items.childList.first;
        const lastChild = this.Items.childList.last;
        const shouldScroll = this.alwaysScroll || lastChild && (this.shouldScrollUp() || this.shouldScrollDown());

        if (shouldScroll) {
          const scrollItem = this.selectedIndex > this._lastScrollIndex ? this.Items.children[this._lastScrollIndex - this._scrollIndex] : this.selected;

          if (this._smooth) {
            this.Items.smooth = {
              y: [-(scrollItem || firstChild).transition('y').targetValue + (scrollItem === this.selected ? scrollOffset : 0), this._itemTransition]
            };
          } else {
            this.Items.patch({
              y: -scrollItem.y + (scrollItem === this.selected ? scrollOffset : 0)
            });
          }
        }

        this.onScreenEffect(this.onScreenItems);
      });
    }

    get onScreenItems() {
      return this.Items.children.filter(child => this._isOnScreen(child));
    }

    _isOnScreen(child) {
      const y = getY(child);
      const {
        h
      } = child;
      const withinLowerBounds = y + h + this._itemsY > 0;
      const withinUpperBounds = y + this._itemsY < this.h;
      return withinLowerBounds && withinUpperBounds;
    }

    _updateLayout() {
      this._whenEnabled.then(() => {
        let nextY = 0;
        let nextW = 0; // layout items in row

        for (let i = 0; i < this.Items.children.length; i++) {
          const child = this.Items.children[i];
          nextW = Math.max(nextW, getW(child));

          if (this._smooth) {
            child.smooth = {
              y: [nextY, this._itemTransition]
            };
          } else {
            child.patch({
              y: nextY
            });
          }

          nextY += child.h;

          if (i < this.Items.children.length - 1) {
            nextY += this.itemSpacing;
          }

          if (child.centerInParent) {
            // if the child is another focus manager, check the width of the item container
            const childWidth = child.Items && child.Items.w || child.w; // only center the child if it is within the bounds of this focus manager

            if (childWidth < this.w) {
              child.x = (this.w - childWidth) / 2;
            }
          }
        }

        this.Items.patch({
          w: nextW,
          h: nextY
        });
        const lastChild = this.Items.childList.last;
        const endOfLastChild = lastChild ? getY(lastChild) + lastChild.h : 0;
        const scrollOffset = (this.Items.children[this._scrollIndex] || {
          y: 0
        }).y; // determine when to stop scrolling down

        if (this.alwaysScroll) {
          this._lastScrollIndex = this.Items.children.length - 1;
        } else if (endOfLastChild > this.h) {
          for (let i = this.Items.children.length - 1; i >= 0; i--) {
            const child = this.Items.children[i];
            const childY = getY(child);

            if (childY + this.h - scrollOffset > endOfLastChild) {
              this._lastScrollIndex = i;
            } else {
              break;
            }
          }
        } else if (this._lastScrollIndex > this.items.length) {
          this._lastScrollIndex = this.items.length - 1;
        }

        this._performRender();
      });
    } // finds the index of the item with the closest middle to the previously selected item


    _getIndexOfItemNear(selected, prev) {
      // edge case
      if (selected.items.length < 2) return 0;
      let prevItem = prev.selected || prev.currentItem;
      let prevOffset = prev.transition('x').targetValue || 0;
      let [itemX] = prevItem.core.getAbsoluteCoords(-prevOffset, 0);
      let prevMiddle = itemX + prevItem.w / 2; // set the first item to be closest

      let closest = selected.items[0];
      let closestMiddle = closest.core.getAbsoluteCoords(0, 0)[0] + closest.w / 2; // start at the 2nd item

      for (let i = 1; i < selected.items.length; i++) {
        // for some reason here !!/!.. evals returning number
        if (selected.items[i].skipFocus === true) {
          continue;
        }

        const item = selected.items[i];
        const middle = item.core.getAbsoluteCoords(0, 0)[0] + item.w / 2;

        if (Math.abs(middle - prevMiddle) < Math.abs(closestMiddle - prevMiddle)) {
          // current item is the closest
          closest = item;
          closestMiddle = middle;
        } else {
          if (!closest.skipFocus) {
            // weve already found closest return its index
            return selected.items.indexOf(closest);
          } else if (!selected.items[i - 1].skipFocus) {
            // previous item is focusable return it
            return i - 1;
          } else {
            // return closest left or right of index
            const prevIndex = prev.items.indexOf(prevItem);
            return this._getIndexofClosestFocusable(prevIndex, selected, prevMiddle);
          }
        }
      } // if last index is focusable return


      return selected.items.length - 1;
    }

    _getIndexofClosestFocusable(selectedIndex, selected, prevMiddle) {
      // dont want to mutate the original selected.items using spread for copy
      // get first focusable item before and after the current focused item's index
      const prevIndex = [...selected.items].slice(0, selectedIndex).map(item => !!item.skipFocus).lastIndexOf(false);
      const nextIndex = [...selected.items].slice(selectedIndex + 1).map(item => !!item.skipFocus).indexOf(false) + selectedIndex + 1;
      const prevItem = selected.items[prevIndex];
      const nextItem = selected.items[nextIndex]; // Check if the items exist if not return the other
      // covers case where at 0 idx, previous would not exist
      // and opposite for last index next would not exist

      if (prevIndex === -1 || !prevItem) {
        return nextIndex;
      }

      if (nextIndex === -1 || !nextItem) {
        return prevIndex;
      } // If both items compare coordinates to determine which direction of plinko


      const next = nextItem.core.getAbsoluteCoords(0, 0)[0] + nextItem.w / 2;
      const prev = prevItem.core.getAbsoluteCoords(0, 0)[0] + prevItem.w / 2;
      return Math.abs(prev - prevMiddle) < Math.abs(next - prevMiddle) ? prevIndex : nextIndex;
    }

    get itemSpacing() {
      return this._itemSpacing;
    }

    set itemSpacing(itemSpacing) {
      if (itemSpacing !== this._itemSpacing) {
        this._itemSpacing = itemSpacing;

        this._update();
      }
    }

    get scrollIndex() {
      return this._scrollIndex;
    }

    set scrollIndex(scrollIndex) {
      if (scrollIndex !== this._scrollIndex) {
        this._scrollIndex = scrollIndex;

        this._update();
      }
    }

    get _itemsY() {
      return getY(this.Items);
    }

    appendItems() {
      let items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      let itemWidth = this.renderWidth;
      items.forEach(item => {
        item.parentFocus = this.hasFocus();
        item = this.Items.childList.a(item);
        item.w = getW(item) || itemWidth;
      });
      this.stage.update();

      this._updateLayout();

      this._update.clear();

      this._refocus();
    }

    scrollTo(index) {
      let duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._itemTransition.duration * 100;
      if (duration === 0) this.selectedIndex = index;

      for (let i = 0; i !== Math.abs(this.selectedIndex - index); i++) {
        setTimeout(() => {
          this.selectedIndex > index ? this.selectPrevious() : this.selectNext();
        }, duration * i);
      }

      this.Items.transition('y').on('finish', () => this._smooth = false);
    }

    $itemChanged() {
      this.itemsChangeable = true;

      this._updateImmediate();
    }

    $removeItem(item) {
      if (item) {
        let wasSelected = item === this.selected;
        this.Items.childList.remove(item);

        this._updateImmediate();

        if (wasSelected || this.selectedIndex >= this.items.length) {
          // eslint-disable-next-line no-self-assign
          this.selectedIndex = this._selectedIndex;
        }

        if (!this.items.length) {
          this.fireAncestors('$columnEmpty');
        }
      }
    }

    $columnChanged() {
      this._updateImmediate();
    } // can be overridden


    onScreenEffect() {}

  }

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  class FadeShader extends lng$1.shaders.WebGLDefaultShader {
    constructor(context) {
      super(context);
      this._margin = {
        left: 0,
        right: 0
      };
    }

    set positionLeft(v) {
      this._positionLeft = v;
    }

    set positionRight(v) {
      this._positionRight = v;
    }

    setupUniforms(operation) {
      super.setupUniforms(operation);
      const owner = operation.shaderOwner;

      if (this._positionLeft === 0) {
        this._positionLeft = 0.001;
      }

      if (this._positionRight === 0) {
        this._positionRight = 0.001;
      }

      const renderPrecision = this.ctx.stage.getRenderPrecision();

      this._setUniform('margin', [this._positionLeft * renderPrecision, this._positionRight * renderPrecision], this.gl.uniform1fv);

      this._setUniform('resolution', new Float32Array([owner._w * renderPrecision, owner._h * renderPrecision]), this.gl.uniform2fv);
    }

  }
  FadeShader.fragmentShaderSource = "\n  #ifdef GL_ES\n  precision lowp float;\n  #endif\n\n  #define PI 3.14159265359\n\n  varying vec2 vTextureCoord;\n  varying vec4 vColor;\n\n  uniform sampler2D uSampler;\n  uniform vec2 resolution;\n  uniform float margin[2];\n\n  void main() {\n      vec4 color = texture2D(uSampler, vTextureCoord) * vColor;\n      vec2 halfRes = 0.5 * resolution.xy;\n      vec2 point = vTextureCoord.xy * resolution;\n\n\n      vec2 pos1 = vec2(point.x, point.y);\n      vec2 pos2 = pos1;\n      pos2.x += margin[0];\n\n      vec2 d = pos2 - pos1;\n      float t = dot(pos1, d) / dot(d, d);\n      t = smoothstep(0.0, 1.0, clamp(t, 0.0, 1.0));\n\n      vec2 pos3 = vec2(vTextureCoord.x * resolution.x, vTextureCoord.y);\n      pos3.x -= resolution.x - margin[1];\n      vec2 pos4 = vec2(vTextureCoord.x + margin[1], vTextureCoord.y);\n\n      vec2 d2 = pos4 - pos3;\n      float t2 = dot(pos3, d2) / dot(d2, d2);\n      t2 = smoothstep(0.0, 1.0, clamp(t2, 0.0, 1.0));\n\n      color = mix(vec4(0.0), color, t);\n      color = mix(color, vec4(0.0), t2);\n\n      gl_FragColor = color;\n  }\n";

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  class MarqueeText extends lng$1.Component {
    static _template() {
      return {
        TextClipper: {
          boundsMargin: [],
          // overwrite boundsMargin so text won't de-render if moved offscreen
          TextBox: {
            Text: {},
            TextLoopTexture: {}
          }
        }
      };
    }

    get title() {
      return (this._Text && this._Text.text || {}).text;
    }

    set title(text) {
      this.patch({
        TextClipper: {
          w: this.finalW + 14,
          h: text.lineHeight + 10,
          TextBox: {
            Text: {
              rtt: true,
              text: { ...text
              }
            },
            TextLoopTexture: {}
          }
        }
      });

      this._Text.on('txLoaded', () => {
        if (this.autoStart) {
          this.startScrolling();
        }
      });

      this._Text.loadTexture();

      this._updateShader(this.finalW);

      this._scrolling && this.startScrolling();
    }

    set color(color) {
      this.tag('TextBox.Text').smooth = {
        color
      };
    }

    startScrolling() {
      let finalW = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.finalW;

      if (this._textRenderedW === 0) {
        this._Text.on('txLoaded', () => {
          this.startScrolling();
        });
      }

      if (this._textRenderedW > finalW - this._fadeW) {
        this._scrolling = true;
        this._TextLoopTexture.x = this._textRenderedW + this._offset;
        this._TextLoopTexture.texture = this._Text.getTexture();

        this._updateShader(finalW);

        this._updateAnimation();

        this._scrollAnimation.start();
      } else {
        // in case the metadata width gets larger on focus and the text goes from being clipped to not
        this._TextClipper.shader = null;

        if (this._Text.text && this._Text.text.textAlign === 'center') {
          this._centerText(finalW);
        }

        this._scrolling = false;
      }
    }

    stopScrolling() {
      let finalW = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.finalW;
      this._scrolling = false;

      if (this._scrollAnimation) {
        this._scrollAnimation.stopNow();

        this._TextLoopTexture.texture = null;
      }

      this._updateShader(finalW);
    }

    _updateShader(finalW) {
      this.stage.update();

      this._Text.loadTexture();

      this._TextClipper.patch({
        w: finalW > 0 ? finalW + this._fadeW / 2 : 0,
        shader: {
          type: FadeShader,
          positionLeft: 0,
          positionRight: this._fadeW
        },
        rtt: true
      });
    }

    _updateAnimation() {
      this._scrollAnimation && this._scrollAnimation.stopNow();
      this._scrollAnimation = this.animation({
        duration: this._textRenderedW / 50,
        delay: isNaN(this.delay) ? 1.5 : this.delay,
        repeat: isNaN(this.repeat) ? -1 : this.repeat,
        actions: [{
          t: 'TextBox',
          p: 'x',
          v: {
            sm: 0,
            0: {
              v: 0
            },
            0.5: {
              v: -(this._textRenderedW + this._offset)
            }
          }
        }, {
          t: 'TextClipper',
          p: 'shader.positionLeft',
          v: {
            sm: 0,
            0: {
              v: 0
            },
            0.1: {
              v: this._fadeW
            },
            0.4: {
              v: this._fadeW
            },
            0.5: {
              v: 0
            }
          }
        }]
      });
    }

    _centerText(finalW) {
      this._TextBox.x = ((finalW || this.finalW) - this._textRenderedW) / 2;
    }

    get _TextClipper() {
      return this.tag('TextClipper');
    }

    get _TextBox() {
      return this.tag('TextBox');
    }

    get _Text() {
      return this.tag('Text');
    }

    get _TextLoopTexture() {
      return this.tag('TextLoopTexture');
    }

    get _offset() {
      return 32;
    }

    get _fadeW() {
      return 30;
    }

    get _textRenderedW() {
      return this._Text.renderWidth;
    }

  }

  /**
   * Copyright 2020 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  class Row extends FocusManager {
    static _template() {
      return {
        direction: 'row'
      };
    }

    _construct() {
      super._construct();

      this._smooth = false;
      this._itemSpacing = 0;
      this._scrollIndex = 0;
      this._whenEnabled = new Promise(resolve => this._firstEnable = resolve);
      this._w = this.stage.w;
      this.debounceDelay = Number.isInteger(this.debounceDelay) ? this.debounceDelay : 1;
      this._update = debounce_1.debounce(this._updateLayout, this.debounceDelay);
    }

    get _itemTransition() {
      return this.itemTransition || {
        duration: 0.4,
        timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'
      };
    }

    _focus() {
      this.items.forEach(item => item.parentFocus = true);
    }

    _unfocus() {
      this.items.forEach(item => item.parentFocus = false);
    }

    selectNext() {
      this._smooth = true;
      return super.selectNext();
    }

    selectPrevious() {
      this._smooth = true;
      return super.selectPrevious();
    } // TODO: can be documented in API when lastScrollIndex is made public


    shouldScrollLeft() {
      let shouldScroll = false;

      if (this._lastScrollIndex) {
        shouldScroll = this.selectedIndex < this._lastScrollIndex;

        if (this._prevLastScrollIndex !== undefined && this._prevLastScrollIndex !== this._lastScrollIndex) {
          shouldScroll = true;
        }
      } else {
        shouldScroll = this.selectedIndex >= this._scrollIndex;
      }

      return this._itemsX < 0 && shouldScroll;
    } // TODO: can be documented in API when lastScrollIndex is made public


    shouldScrollRight() {
      const lastChild = this.Items.childList.last;
      return this.selectedIndex > this._scrollIndex && // end of Items container < end of last item
      Math.abs(this._itemsX - this.w) < lastChild.x + this.Items.childList.last.w;
    }

    get onScreenItems() {
      return this.Items.children.filter(child => this._isOnScreen(child));
    }

    _isOnScreen(child) {
      const x = getX(child);
      const {
        w
      } = child;
      const withinLowerBounds = x + w + this._itemsX > 0;
      const withinUpperBounds = x + this._itemsX < this.w;
      return withinLowerBounds && withinUpperBounds;
    }

    _isOnScreenCompletely(child) {
      let itemX = child.core.renderContext.px;
      let rowX = this.core.renderContext.px;
      return itemX >= rowX && itemX + child.w <= rowX + this.w;
    }

    _shouldScroll() {
      const lastChild = this.Items.childList.last;
      let shouldScroll = this.alwaysScroll;

      if (!shouldScroll) {
        if (this.lazyScroll) {
          shouldScroll = !this._isOnScreenCompletely(this.selected);
        } else {
          shouldScroll = lastChild && (this.shouldScrollLeft() || this.shouldScrollRight() || !this._isOnScreenCompletely(this.selected));
        }
      }

      return shouldScroll;
    }

    _getLazyScrollX(prev) {
      let itemsContainerX;
      const prevIndex = this.Items.childList.getIndex(prev);

      if (prevIndex > this.selectedIndex) {
        itemsContainerX = -this.selected.x;
      } else if (prevIndex < this.selectedIndex) {
        itemsContainerX = this.w - this.selected.x - this.selected.w;
      }

      return itemsContainerX;
    }

    _getScrollX() {
      let itemsContainerX;
      let itemIndex = this.selectedIndex - this.scrollIndex;
      itemIndex = itemIndex < 0 ? 0 : itemIndex;

      if (this.Items.children[itemIndex]) {
        itemsContainerX = this.Items.children[itemIndex].transition('x') ? -this.Items.children[itemIndex].transition('x').targetValue : -this.Items.children[itemIndex].x;
      }

      return itemsContainerX;
    }

    render(next, prev) {
      this._whenEnabled.then(() => {
        this._prevLastScrollIndex = this._lastScrollIndex;

        if (this._shouldScroll()) {
          const itemsContainerX = this.lazyScroll && prev ? this._getLazyScrollX(prev) : this._getScrollX();

          if (itemsContainerX !== undefined) {
            if (this._smooth) {
              this.Items.smooth = {
                x: [itemsContainerX, this._itemTransition]
              };
            } else {
              this.Items.x = itemsContainerX;
            }
          }
        }

        this.onScreenEffect(this.onScreenItems);
      });
    }

    _updateLayout() {
      let nextX = 0;
      let nextH = 0; // layout items in row

      for (let i = 0; i < this.Items.children.length; i++) {
        const child = this.Items.children[i];
        nextH = Math.max(nextH, getH(child));

        if (this._smooth) {
          child.smooth = {
            x: [nextX, this._itemTransition]
          };
        } else {
          child.patch({
            x: nextX
          });
        }

        nextX += child.w;

        if (i < this.Items.children.length - 1) {
          nextX += this.itemSpacing;
        }

        if (child.centerInParent) {
          // if the child is another focus manager, check the height of the item container
          const childHeight = child.Items && child.Items.h || child.h; // only center the child if it is within the bounds of this focus manager

          if (childHeight < this.h) {
            child.y = (this.h - childHeight) / 2;
          }
        }
      }

      this.Items.patch({
        h: nextH,
        w: nextX
      });
      const lastChild = this.Items.childList.last;
      const endOfLastChild = lastChild ? getX(lastChild) + lastChild.w : 0;
      const scrollOffset = (this.Items.children[this._scrollIndex] || {
        x: 0
      }).x; // determine when to stop scrolling right

      if (this.alwaysScroll) {
        this._lastScrollIndex = this.Items.children.length - 1;
      } else if (endOfLastChild > this.w) {
        for (let i = this.Items.children.length - 1; i >= 0; i--) {
          const child = this.Items.children[i];
          const childX = getX(child);

          if (childX + this.w - scrollOffset > endOfLastChild) {
            this._lastScrollIndex = i;
          } else {
            break;
          }
        }
      }

      this.fireAncestors('$itemChanged');
      this.render(this.selected, null);
    }

    get itemSpacing() {
      return this._itemSpacing;
    }

    set itemSpacing(itemSpacing) {
      if (itemSpacing !== this._itemSpacing) {
        this._itemSpacing = itemSpacing;

        this._update();
      }
    }

    get scrollIndex() {
      return this._scrollIndex;
    }

    set scrollIndex(scrollIndex) {
      if (scrollIndex !== this._scrollIndex) {
        this._scrollIndex = scrollIndex;

        this._update();
      }
    }

    get _itemsX() {
      return getX(this.Items);
    }

    appendItems() {
      let items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      let itemHeight = this.renderHeight;
      items.forEach(item => {
        item.parentFocus = this.hasFocus();
        item = this.Items.childList.a(item);
        item.h = item.h || itemHeight;
      });
      this.stage.update();

      this._updateLayout();

      this._update.clear();

      this._refocus();
    }

    $itemChanged() {
      this._update();
    } // can be overridden


    onScreenEffect() {}

  }

  /**
   * Copyright 2021 Comcast Cable Communications Management, LLC
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
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  const KEY_DIMENSIONS = {
    h: 90,
    w: 109,
    padding: 0,
    fixed: true
  }; // actualize key values : 60 ,60  ; 90,100

  const isUpperCase = string => /^[A-Z]$/.test(string);

  class Key extends Button$1 {
    static _template() {
      return { ...super._template(),
        ...KEY_DIMENSIONS
      };
    }

    set config(config) {
      if (config) {
        this.sizes = config.sizes;
      }
    }

    set icon(src) {
      if (src) {
        this._Icon.patch({
          color: 0xffffffff,
          size: 32,
          spacing: 16,
          src
        });
      }
    }

    set size(size) {
      this.w = this._sizes[size] || this.h;
    }

    set char(char) {
      this.title = char;
    }

    set announce(value) {
      this._announce = value;
    }

    get announce() {
      if (this._announce) {
        return this._announce;
      }

      if (isUpperCase(this.title)) {
        return "Capital ".concat(this.title, ", button");
      }

      return this.title + ', button';
    }

    set label(label) {
      this.title = label;
    }

    get _sizes() {
      return this.styles.sizes ? { ...this.styles.sizes,
        ...this.sizes
      } : {
        small: 50,
        medium: 110,
        large: 273,
        xlarge: 718,
        ...this.sizes
      }; // actualize values 50,110,212,350 ; 50,110,212,750
    }

    _handleEnter() {
      if (this.toggle) {
        this.fireAncestors('$toggleKeyboard', this.toggle);
      }

      this.fireAncestors('$onSoftKey', {
        key: this.title
      });
    }

  }

  /*
  * If not stated otherwise in this file or this component's LICENSE file the
  * following copyright and licenses apply:
  *
  * Copyright 2021 RDK Management
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
  *
  * Copyright 2021 Comcast Cable Communications Management, LLC
  * Licensed under the Apache License, Version 2.0
  */
  class Keyboard extends lng$1.Component {
    _construct() {
      this._whenEnabled = new Promise(resolve => this._firstEnable = resolve);
    }

    get announce() {
      return 'Keyboard' + (this.title ? ", ".concat(this.title) : '');
    }

    get announceContext() {
      return ['PAUSE-2', 'Use arrow keys to choose characters, press center to select'];
    }

    set formats(formats) {
      if (formats === void 0) {
        formats = {};
      }

      this._formats = formats;
      this._currentFormat = this._defaultFormat; // Ensure formats prop is set last

      this._whenEnabled.then(() => {
        Object.entries(formats).forEach(_ref => {
          let [key, value] = _ref;

          let keyboardData = this._formatKeyboardData(value);

          this._createKeyboard(key, this._createRows(keyboardData));
        });
        this.tag(this._currentFormat).alpha = 1;

        this._refocus();
      });
    }

    _createKeyboard(key) {
      let rows = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      key = key.charAt(0).toUpperCase() + key.slice(1);

      if (rows.length === 1) {
        this.patch({
          [key]: { ...rows[0],
            alpha: 0
          }
        });
      } else {
        this.patch({
          [key]: {
            type: Column,
            alpha: 0,
            plinko: true,
            itemSpacing: this._spacing,
            items: rows
          }
        });
      }
    }

    _createRows() {
      let rows = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      return rows.map(keys => {
        let h = this.keysConfig && this.keysConfig.h || KEY_DIMENSIONS.h;
        return {
          type: Row,
          h,
          wrapSelected: this.rowWrap === undefined ? true : this.rowWrap,
          itemSpacing: this._spacing,
          items: this._createKeys(keys)
        };
      });
    }

    _createKeys() {
      let keys = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      return keys.map(keyProps => {
        const key = {
          type: this.keyComponent || Key,
          config: this.keysConfig
        };

        if (!keyProps) {
          return { ...KEY_DIMENSIONS,
            skipFocus: true
          };
        } else if (typeof keyProps === 'object') {
          return { ...key,
            ...keyProps
          };
        }

        return { ...key,
          label: keyProps
        };
      });
    }

    _formatKeyboardData() {
      let data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (Array.isArray(data) && data.length) {
        if (!Array.isArray(data[0]) && !this.inline) {
          let keyRows = [],
              idx,
              counter;

          for (idx = 0, counter = -1; idx < data.length; idx++) {
            if (idx % this.columnCount === 0) {
              counter++;
              keyRows[counter] = [];
            }

            keyRows[counter].push(data[idx]);
          }

          return keyRows;
        } else if (this.inline) {
          return [data];
        }

        return data;
      }
    }

    $toggleKeyboard(keyboardFormat) {
      keyboardFormat = keyboardFormat.charAt(0).toUpperCase() + keyboardFormat.slice(1);

      if (keyboardFormat !== this._currentFormat) {
        this.selectKeyOn(this.tag(keyboardFormat));
        this.tag(this._currentFormat).alpha = 0;
        this.tag(keyboardFormat).alpha = 1;
        this._currentFormat = keyboardFormat;
      }
    }

    selectKeyOn(keyboard) {
      let {
        row,
        column
      } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getSelectedKey();
      let type = keyboard.constructor.name;

      if (type === 'Row') {
        keyboard.selectedIndex = column;
      } else {
        keyboard.selectedIndex = row;
        keyboard.Items.children[row].selectedIndex = column;
      }
    }

    getSelectedKey() {
      let row, column;
      let keyboard = this.tag(this._currentFormat);
      let type = keyboard.constructor.name;

      if (type === 'Row') {
        row = 0;
        column = keyboard.selectedIndex;
      } else {
        row = keyboard.selectedIndex;
        column = keyboard.Items.children[row].selectedIndex;
      }

      return {
        row,
        column
      };
    }

    _getFocused() {
      return this.tag(this._currentFormat) || this;
    }

    _focus() {
      this.fireAncestors('$keyboardFocused', true);
    }

    _unfocus() {
      this.tag(this._currentFormat).alpha = 0;
      this._currentFormat = this._defaultFormat;
      this.tag(this._currentFormat).alpha = 1;

      this._refocus();

      this.fireAncestors('$keyboardFocused', false);
    }

    set columnCount(columnCount) {
      this._columnCount = columnCount;
    }

    set rowCount(rowCount) {
      this._rowCount = rowCount;
    }

    get columnCount() {
      if (this._columnCount) return this._columnCount;
      if (this._rowCount) return this._formats[this._defaultFormat.toLowerCase()].length / this._rowCount;
      if (this.inline) return this._formats[this._defaultFormat.toLowerCase()].length;else return 11;
    }

    get _spacing() {
      return this.spacing || 8;
    }

    get _defaultFormat() {
      let defaultFormat = this.defaultFormat || Object.keys(this._formats)[0];
      return defaultFormat.charAt(0).toUpperCase() + defaultFormat.slice(1);
    }

  }
  const KEYBOARD_FORMATS = {
    fullscreen: {
      letters: [['', '', '', '', '', '', '', '', '', {
        label: '#@!',
        size: 'large',
        toggle: 'symbols',
        announce: 'symbol mode, button'
      }, {
        label: 'Space',
        size: 'large'
      }, {
        label: 'Delete',
        size: 'large'
      }, '', '', '', '', '', '', '', '', ''], ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']],
      symbols: [['', '', '', '', '', '', '', '', '', {
        label: 'ABC',
        size: 'large',
        toggle: 'letters',
        announce: 'caps on, button'
      }, {
        label: 'Space',
        size: 'large'
      }, {
        label: 'Delete',
        size: 'large'
      }, '', '', '', '', '', '', '', '', ''], ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', {
        label: '!',
        announce: 'exclamation, button'
      }, '@', '#', '$', '%', {
        label: '^',
        announce: 'caret circumflex, button'
      }, '&', '*', {
        label: '(',
        announce: 'open parenthesis, button'
      }, {
        label: ')',
        announce: 'close parenthesis, button'
      }, {
        label: '`',
        announce: 'grave accent, button'
      }, '~', '_', '.', '-', '+']]
    },
    qwerty: {
      uppercase: [['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', {
        label: 'Clear',
        size: 'medium'
      }], ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', {
        label: '#@!',
        size: 'medium',
        toggle: 'symbols',
        announce: 'symbol mode, button'
      }], ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '@', {
        label: 'áöû',
        size: 'medium',
        toggle: 'accents',
        announce: 'accents, button'
      }], ['Z', 'X', 'C', 'V', 'B', 'N', 'M', {
        label: '_',
        announce: 'underscore, button'
      }, {
        label: '.',
        announce: 'period, button'
      }, {
        label: '-',
        announce: 'dash, button'
      }, {
        label: 'shift',
        size: 'medium',
        toggle: 'lowercase',
        announce: 'shift off, button'
      }], [{
        label: 'Delete',
        size: 'large'
      }, {
        label: 'Space',
        size: 'xlarge'
      }, {
        label: 'Done',
        size: 'large'
      }]],
      lowercase: [['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', {
        label: 'Clear',
        size: 'medium'
      }], ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', {
        label: '#@!',
        size: 'medium',
        toggle: 'symbols',
        announce: 'symbol mode, button'
      }], ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '@', {
        label: 'áöû',
        size: 'medium',
        toggle: 'accents',
        announce: 'accents, button'
      }], ['z', 'x', 'c', 'v', 'b', 'n', 'm', {
        label: '_',
        announce: 'underscore, button'
      }, {
        label: '.',
        announce: 'period, button'
      }, {
        label: '-',
        announce: 'dash, button'
      }, {
        label: 'shift',
        size: 'medium',
        toggle: 'uppercase',
        announce: 'shift on, button'
      }], [{
        label: 'Delete',
        size: 'large'
      }, {
        label: 'Space',
        size: 'xlarge'
      }, {
        label: 'Done',
        size: 'large'
      }]],
      accents: [['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', {
        label: 'Clear',
        size: 'medium'
      }], ['ä', 'ë', 'ï', 'ö', 'ü', 'ÿ', 'à', 'è', 'ì', 'ò', {
        label: '#@!',
        size: 'medium',
        toggle: 'symbols',
        announce: 'symbol mode, button'
      }], ['ù', 'á', 'é', 'í', 'ó', 'ú', 'ý', 'â', 'ê', 'î', {
        label: 'abc',
        size: 'medium',
        toggle: 'lowercase',
        announce: 'alpha mode, button'
      }], ['', '', '', 'ô', 'û', 'ã', 'ñ', '', '', '', {
        label: 'shift',
        size: 'medium',
        toggle: 'accentsUpper',
        announce: 'shift off, button'
      }], [{
        label: 'Delete',
        size: 'large'
      }, {
        label: 'Space',
        size: 'xlarge'
      }, {
        label: 'Done',
        size: 'large'
      }]],
      accentsUpper: [['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', {
        label: 'Clear',
        size: 'medium'
      }], ['Ä', 'Ë', 'Ï', 'Ö', 'Ü', 'Ÿ', 'À', 'È', 'Ì', 'Ò', {
        label: '#@!',
        size: 'medium',
        toggle: 'symbols',
        announce: 'symbol mode, button'
      }], ['Ù', 'Á', 'É', 'Í', 'Ó', 'Ú', 'Ý', 'Â', 'Ê', 'Î', {
        label: 'abc',
        size: 'medium',
        toggle: 'lowercase',
        announce: 'alpha mode, button'
      }], ['', '', '', 'Ô', 'Û', 'Ã', 'Ñ', '', '', '', {
        label: 'shift',
        size: 'medium',
        toggle: 'accents',
        announce: 'shift off, button'
      }], [{
        label: 'Delete',
        size: 'large'
      }, {
        label: 'Space',
        size: 'xlarge'
      }, {
        label: 'Done',
        size: 'large'
      }]],
      symbols: [['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', {
        label: 'Clear',
        size: 'medium'
      }], [{
        label: '!',
        announce: 'exclamation, button'
      }, '@', '#', '$', '%', {
        label: '^',
        announce: 'caret circumflex, button'
      }, '&', '*', {
        label: '(',
        announce: 'open parenthesis, button'
      }, {
        label: ')',
        announce: 'close parenthesis, button'
      }, {
        label: 'abc',
        size: 'medium',
        toggle: 'lowercase',
        announce: 'alpha mode, button'
      }], [{
        label: '{',
        announce: 'open brace, button'
      }, {
        label: '}',
        announce: 'close brace, button'
      }, {
        label: '[',
        announce: 'open bracket, button'
      }, {
        label: ']',
        announce: 'close bracket, button'
      }, {
        label: ';',
        announce: 'semicolon, button'
      }, {
        label: '"',
        announce: 'doublequote, button'
      }, {
        label: "'",
        announce: 'singlequote, button'
      }, {
        label: '|',
        announce: 'vertical bar, button'
      }, {
        label: '\\',
        announce: 'backslash, button'
      }, {
        label: '/',
        announce: 'forwardslash, button'
      }, {
        label: 'áöû',
        size: 'medium',
        toggle: 'accents',
        announce: 'accents, button'
      }], [{
        label: '<',
        announce: 'less than, button'
      }, {
        label: '>',
        announce: 'greater than, button'
      }, {
        label: '?',
        announce: 'question mark, button'
      }, {
        label: '=',
        announce: 'equals, button'
      }, {
        label: '`',
        announce: 'grave accent, button'
      }, {
        label: '~',
        announce: 'tilde, button'
      }, {
        label: '_',
        announce: 'underscore, button'
      }, {
        label: '.',
        announce: 'period, button'
      }, {
        label: '-',
        announce: 'dash, button'
      }, {
        label: '+',
        announce: 'plus sign, button'
      }], [{
        label: 'Delete',
        size: 'large'
      }, {
        label: 'Space',
        size: 'xlarge'
      }, {
        label: 'Done',
        size: 'large'
      }]]
    },
    numbers: {
      // numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      // dialpad: [
      //   ['1', '2', '3'],
      //   ['4', '5', '6'],
      //   ['7', '8', '9'],
      //   ['', '0', '']
      // ],
      dialpadExtended: [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['Delete', '0', 'Clear'], [{
        label: 'Done',
        size: 'large'
      }]]
    }
  };

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
  const WiFiState = {
    UNINSTALLED: 0,
    DISABLED: 1,
    DISCONNECTED: 2,
    PAIRING: 3,
    CONNECTING: 4,
    CONNECTED: 5,
    FAILED: 6
  };
  class Wifi {
    constructor() {
      this._events = new Map();
      const config = {
        host: '127.0.0.1',
        port: 9998
      };
      this._thunder = thunderJS(config);
      this.callsign = 'org.rdk.Wifi';
    }
    /**
     * Function to activate the wifi plugin.
     */


    activate() {
      return new Promise((resolve, reject) => {
        this._thunder.call('Controller', 'activate', {
          callsign: this.callsign
        }).then(result => {
          this.getCurrentState().then(state => {
            if (state === WiFiState.DISABLED) {
              this.setEnabled(true);
            }

            if (state === WiFiState.CONNECTED) {
              this.setInterface('WIFI', true).then(res => {
                if (res.success) {
                  this.setDefaultInterface('WIFI', true);
                }
              });
            }
          });

          this._thunder.on(this.callsign, 'onWIFIStateChanged', notification => {
            if (this._events.has('onWIFIStateChanged')) {
              this._events.get('onWIFIStateChanged')(notification);
            }
          });

          this._thunder.on(this.callsign, 'onError', notification => {
            if (this._events.has('onError')) {
              this._events.get('onError')(notification);
            }
          });

          this._thunder.on(this.callsign, 'onAvailableSSIDs', notification => {
            if (notification.moreData === false) {
              this.stopScan();
              notification.ssids = notification.ssids.filter((item, pos) => notification.ssids.findIndex(e => e.ssid === item.ssid) === pos);

              if (this._events.has('onAvailableSSIDs')) {
                this._events.get('onAvailableSSIDs')(notification);
              }
            }
          });

          resolve(result);
        }).catch(err => {
          console.error("Wifi activation failed: ".concat(err));
          reject(err);
        });
      });
    }
    /**
     *Register events and event listeners.
     * @param {string} eventId
     * @param {function} callback
     *
     */


    registerEvent(eventId, callback) {
      this._events.set(eventId, callback);
    }
    /**
     * Deactivates wifi plugin.
     */


    deactivate() {
      this._events = new Map();
    }
    /**
     * Returns connected SSIDs
     */


    getConnectedSSID() {
      return new Promise((resolve, reject) => {
        this._thunder.call(this.callsign, 'getConnectedSSID').then(result => {
          resolve(result);
        }).catch(err => {
          console.error("getConnectedSSID fail: ".concat(err));
          reject(err);
        });
      });
    }
    /**
     * Start scanning for available wifi.
     */


    discoverSSIDs() {
      return new Promise((resolve, reject) => {
        this._thunder.call(this.callsign, 'startScan', {
          incremental: false,
          ssid: '',
          frequency: ''
        }).then(result => {
          //console.log('startScan success')
          resolve(result);
        }).catch(err => {
          console.error("startScan fail: ".concat(err));
          reject(err);
        });
      });
    }
    /**
     * Stops scanning for networks.
     */


    stopScan() {
      return new Promise((resolve, reject) => {
        this._thunder.call(this.callsign, 'stopScan').then(result => {
          //console.log('stopScan success')
          resolve(result);
        }).catch(err => {
          console.error("stopScan fail: ".concat(err));
          reject(err);
        });
      });
    }
    /**
     * Function to connect to an SSID
     * @param {object} device
     * @param {string} passphrase
     */


    connect(device, passphrase) {
      return new Promise((resolve, reject) => {
        this.disconnect().then(() => {
          console.log("connect SSID ".concat(device.ssid));

          this._thunder.call(this.callsign, 'connect', {
            ssid: device.ssid,
            passphrase: passphrase,
            securityMode: device.security
          }).then(result => {
            console.log("connected SSID ".concat(device.ssid));
            this.setInterface('WIFI', true).then(res => {
              if (res.success) {
                this.setDefaultInterface('WIFI', true);
              }
            });
            resolve(result);
          }).catch(err => {
            console.error("Connection failed: ".concat(err));
            reject(err);
          });
        });
      });
    }
    /**
     * Function to disconnect from the SSID.
     */


    disconnect() {
      return new Promise((resolve, reject) => {
        this._thunder.call(this.callsign, 'disconnect').then(result => {
          console.log('WiFi disconnected: ' + JSON.stringify(result));
          this.setInterface('ETHERNET', true).then(res => {
            if (res.success) {
              this.setDefaultInterface('ETHERNET', true);
            }
          });
          resolve(result);
        }).catch(err => {
          console.error("Can't disconnect WiFi: ".concat(err));
          reject(false);
        });
      });
    }
    /**
     * Returns current state of the Wi-Fi plugin.
     */


    getCurrentState() {
      return new Promise((resolve, reject) => {
        this._thunder.call(this.callsign, 'getCurrentState').then(result => {
          console.log("WiFi state: ".concat(result.state));
          resolve(result.state);
        }).catch(err => {
          console.error("Can't get WiFi state: ".concat(err));
          reject(err);
        });
      });
    }
    /**
     * Enables/Disables the Wi-Fi.
     * @param {bool} bool
     */


    setEnabled(bool) {
      return new Promise((resolve, reject) => {
        this._thunder.call(this.callsign, 'setEnabled', {
          enable: bool
        }).then(result => {
          resolve(result);
        }).catch(err => {
          reject(err);
        });
      });
    }
    /**
     * Function to get paired SSID.
     */


    getPaired() {
      return new Promise((resolve, reject) => {
        this._thunder.call(this.callsign, 'getPairedSSID', {}).then(result => {
          resolve(result);
        }).catch(err => {
          console.error("Can't get paired: ".concat(err));
          reject(err);
        });
      });
    }

    getDefaultInterface() {
      return new Promise((resolve, reject) => {
        this._thunder.call('org.rdk.Network', 'getDefaultInterface', {}).then(result => {
          resolve(result);
        }).catch(err => {
          reject(err);
        });
      });
    }

    getInterfaces() {
      return new Promise((resolve, reject) => {
        this._thunder.call('org.rdk.Network', 'getInterfaces').then(result => {
          resolve(result);
        }).catch(err => {
          console.log('Failed to get Interfaces');
        });
      });
    }

    setInterface(inter, bool) {
      return new Promise((resolve, reject) => {
        this._thunder.call('org.rdk.Network', 'setInterfaceEnabled', {
          interface: inter,
          persist: true,
          enabled: bool
        }).then(result => {
          resolve(result);
        }).catch(err => {
          console.error('SetInterface Error', JSON.stringify(err));
        });
      });
    }

    setDefaultInterface(interfaceName, bool) {
      return new Promise((resolve, reject) => {
        this._thunder.call('org.rdk.Network', 'setDefaultInterface', {
          interface: interfaceName,
          persist: bool
        }).then(result => {
          resolve(result);
        }).catch(err => {
          console.error('SetDefaultInterface Error', JSON.stringify(err));
        });
      });
    }

    saveSSID(ssid, password, securityMode) {
      console.log("SAVESSID");
      return new Promise((resolve, reject) => {
        this._thunder.call(this.callsign, 'saveSSID', {
          ssid: ssid,
          passphrase: password,
          securityMode: securityMode
        }).then(result => {
          resolve(result);
        }).catch(err => {
          console.error('SaveSSID Error', JSON.stringify(err));
        });
      });
    }

    clearSSID() {
      console.log("CLEARSSID");
      return new Promise((resolve, reject) => {
        this._thunder.call(this.callsign, 'clearSSID').then(result => {
          resolve(result);
        }).catch(err => {
          console.log('Error in clear ssid');
        });
      });
    }

  }

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
  const wifi$1 = new Wifi();
  class JoinAnotherNetworkComponent extends lng$1.Component {
    pageTransition() {
      return 'left';
    }

    handleDone() {
      var securityCode = this.securityCodes[this.securityCodeIndex].value;

      if (!this.textCollection['EnterSSID']) {
        this._setState("EnterSSID");
      } else if (securityCode < 0 || securityCode > 14) {
        this._setState("EnterSecurity");
      } else if (securityCode !== 0 && !this.textCollection['EnterPassword']) {
        this._setState("EnterPassword");
      } else {
        if (this.textCollection['EnterSecurity'] === "0") {
          this.textCollection['EnterPassword'] = "";
          this.tag("Pwd").text.text = "";
        }

        var self = this;
        this.startConnectForAnotherNetwork({
          ssid: self.textCollection['EnterSSID'],
          security: securityCode
        }, self.textCollection['EnterPassword']);
      }
    } // startConnectForAnotherNetwork(device, passphrase) {
    //   wifi.connect({ ssid: device.ssid, security: device.security }, passphrase)
    //   Router.back()
    // }


    startConnectForAnotherNetwork(device, passphrase) {
      wifi$1.connect({
        ssid: device.ssid,
        security: device.security
      }, passphrase).then(() => {
        wifi$1.saveSSID(device.ssid, passphrase, device.security).then(response => {
          if (response.result === 0) ; else if (response.result !== 0) {
            wifi$1.clearSSID().then(response => {// console.log(response)
              // Router.back()
            });
          }
        });
      });
      Router.back();
    }

    static _template() {
      return {
        Background: {
          w: 1920,
          h: 1080,
          rect: true,
          color: 0xff000000
        },
        Text: {
          x: 758,
          y: 70,
          text: {
            text: "Find and join a WiFi network",
            fontFace: CONFIG.language.font,
            fontSize: 35,
            textColor: CONFIG.theme.hex
          }
        },
        BorderTop: {
          x: 190,
          y: 130,
          w: 1488,
          h: 2,
          rect: true
        },
        Network: {
          x: 190,
          y: 176,
          text: {
            text: "Network Name: ",
            fontFace: CONFIG.language.font,
            fontSize: 25
          }
        },
        NetworkBox: {
          x: 400,
          y: 160,
          texture: lng$1.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false)
        },
        NetworkText: {
          x: 420,
          y: 170,
          zIndex: 2,
          text: {
            text: '',
            fontSize: 25,
            fontFace: CONFIG.language.font,
            textColor: 0xffffffff,
            wordWrapWidth: 1300,
            wordWrap: false,
            textOverflow: 'ellipsis'
          }
        },
        NetworkType: {
          x: 190,
          y: 246,
          text: {
            text: "Security: ",
            fontFace: CONFIG.language.font,
            fontSize: 25
          }
        },
        TypeBox: {
          x: 400,
          y: 230,
          texture: lng$1.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false),
          ArrowForward: {
            h: 30,
            w: 45,
            y: 15,
            x: 1220,
            src: Utils.asset('images/settings/Arrow.png')
          },
          ArrowBackward: {
            h: 30,
            w: 45,
            x: 10,
            scaleX: -1,
            y: 15,
            src: Utils.asset('images/settings/Arrow.png')
          }
        },
        TypeText: {
          x: 470,
          y: 263,
          mountY: 0.5,
          zIndex: 2,
          text: {
            text: '',
            fontSize: 25,
            fontFace: CONFIG.language.font,
            textColor: 0xffffffff,
            wordWrapWidth: 1300,
            wordWrap: false,
            textOverflow: 'ellipsis'
          }
        },
        Password: {
          x: 190,
          y: 316,
          text: {
            text: "Password:",
            fontFace: CONFIG.language.font,
            fontSize: 25
          }
        },
        PasswordBox: {
          x: 400,
          y: 300,
          texture: lng$1.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false)
        },
        Pwd: {
          x: 420,
          y: 310,
          zIndex: 2,
          text: {
            text: '',
            fontSize: 25,
            fontFace: CONFIG.language.font,
            textColor: 0xffffffff,
            wordWrapWidth: 1300,
            wordWrap: false,
            textOverflow: 'ellipsis'
          }
        },
        BorderBottom: {
          x: 190,
          y: 396,
          w: 1488,
          h: 2,
          rect: true
        },
        Keyboard: {
          y: 437,
          x: 400,
          type: Keyboard,
          visible: true,
          zIndex: 2,
          formats: KEYBOARD_FORMATS.qwerty
        }
      };
    }

    _focus() {
      this._setState('EnterSSID');

      this.textCollection = {
        'EnterSSID': '',
        'EnterPassword': '',
        'EnterSecurity': ''
      };
      this.tag('Pwd').text.text = "";
      this.tag("NetworkText").text.text = "";
      this.tag("TypeText").text.text = this.securityCodes[this.securityCodeIndex].name;

      if (this.securityCodes[this.securityCodeIndex].value === 0) {
        this.pwdUnReachable = true;
        this.tag("PasswordBox").alpha = 0.5;
        this.tag("Password").alpha = 0.5;
      } else {
        this.pwdUnReachable = false;
        this.tag("PasswordBox").alpha = 1;
        this.tag("Password").alpha = 1;
      }
    }

    _handleBack() {
      Router.back();
    }

    static _states() {
      return [class EnterSSID extends this {
        $enter() {
          this.tag('NetworkBox').texture = lng$1.Tools.getRoundRect(1273, 58, 0, 3, CONFIG.theme.hex, false);
        }

        _handleDown() {
          this._setState("EnterSecurity");
        }

        _handleEnter() {
          this._setState('Keyboard');
        }

        $exit() {
          this.tag('NetworkBox').texture = lng$1.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false);
        }

      }, class EnterSecurity extends this {
        $enter() {
          this.tag("TypeBox").texture = lng$1.Tools.getRoundRect(1273, 58, 0, 3, CONFIG.theme.hex, false);
        }

        _handleUp() {
          this._setState("EnterSSID");
        }

        isPasswordUnReachable(secCode) {
          if (secCode === 0) {
            this.tag("PasswordBox").alpha = 0.5;
            this.tag("Password").alpha = 0.5;
            return true;
          } else {
            this.tag("PasswordBox").alpha = 1;
            this.tag("Password").alpha = 1;
            return false;
          }
        }

        _handleLeft() {
          this.securityCodeIndex = (15 + --this.securityCodeIndex) % 15;
          this.pwdUnReachable = this.isPasswordUnReachable(this.securityCodeIndex);
          this.tag("TypeText").text.text = this.securityCodes[this.securityCodeIndex].name;
        }

        _handleEnter() {
          this.handleDone();
        }

        _handleRight() {
          this.securityCodeIndex = (15 + ++this.securityCodeIndex) % 15;
          this.pwdUnReachable = this.isPasswordUnReachable(this.securityCodeIndex);
          this.tag("TypeText").text.text = this.securityCodes[this.securityCodeIndex].name;
        }

        _handleDown() {
          if (!this.pwdUnReachable) {
            this._setState("EnterPassword");
          }
        }

        $exit() {
          this.tag("TypeBox").texture = lng$1.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false);
        }

      }, class EnterPassword extends this {
        $enter() {
          if (this.pwdUnReachable) {
            this._setState("EnterSecurity");
          }

          this.tag('PasswordBox').texture = lng$1.Tools.getRoundRect(1273, 58, 0, 3, CONFIG.theme.hex, false);
        }

        _handleUp() {
          this._setState("EnterSecurity");
        }

        _handleDown() {
          this._setState("EnterSSID");
        }

        _handleEnter() {
          this._setState('Keyboard');
        }

        $exit() {
          this.tag('PasswordBox').texture = lng$1.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false);
        }

      }, class Keyboard extends this {
        $enter(state) {
          this.prevState = state.prevState;

          if (this.prevState === 'EnterSSID') {
            this.element = 'NetworkText';
          }

          if (this.prevState === 'EnterPassword') {
            this.element = 'Pwd';
          }

          if (this.prevState === 'EnterSecurity') {
            this.element = 'TypeText';
          }
        }

        _getFocused() {
          return this.tag('Keyboard');
        }

        $onSoftKey(_ref) {
          let {
            key
          } = _ref;

          if (key === 'Done') {
            this.handleDone();
          } else if (key === 'Clear') {
            this.textCollection[this.prevState] = this.textCollection[this.prevState].substring(0, this.textCollection[this.prevState].length - 1);
            this.tag(this.element).text.text = this.textCollection[this.prevState];
          } else if (key === '#@!' || key === 'abc' || key === 'áöû' || key === 'shift') {
            console.log('no saving');
          } else if (key === 'Space') {
            this.textCollection[this.prevState] += ' ';
            this.tag(this.element).text.text = this.textCollection[this.prevState];
          } else if (key === 'Delete') {
            this.textCollection[this.prevState] = '';
            this.tag(this.element).text.text = this.textCollection[this.prevState];
          } else {
            this.textCollection[this.prevState] += key;
            this.tag(this.element).text.text = this.textCollection[this.prevState];
          }
        }

        _handleBack() {
          this._setState(this.prevState);
        }

      }];
    }

    _init() {
      this.securityCodeIndex = 0;
      this.pwdUnReachable = true;
      this.textCollection = {
        'EnterSSID': '',
        'EnterPassword': '',
        'EnterSecurity': '0'
      };
      this.securityCodes = [{
        name: "Open/None (Unsecure)",
        value: 0
      }, {
        name: "WEP - Deprecated, not needed",
        value: 1
      }, {
        name: "WEP",
        value: 2
      }, {
        name: "WPA Personal TKIP",
        value: 3
      }, {
        name: "WPA Personal AES",
        value: 4
      }, {
        name: "WPA2 Personal TKIP",
        value: 5
      }, {
        name: "WPA2 Personal AES",
        value: 6
      }, {
        name: "WPA Enterprise TKIP",
        value: 7
      }, {
        name: "WPA Enterprise AES",
        value: 8
      }, {
        name: "WPA2 Enterprise TKIP",
        value: 9
      }, {
        name: "WPA2 Enterprise AES",
        value: 10
      }, {
        name: "Mixed Personal",
        value: 11
      }, {
        name: "Mixed Enterprise",
        value: 12
      }, {
        name: "WPA3 Personal AES",
        value: 13
      }, {
        name: "WPA3 Personal SAE",
        value: 14
      }];
      this.tag("Pwd").text.text = this.textCollection['EnterPassword'];
      this.tag("NetworkText").text.text = this.textCollection['EnterSSID'];
    }

  }

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
  class Network {
    constructor() {
      this._events = new Map();
      const config = {
        host: '127.0.0.1',
        port: 9998,
        default: 1
      };
      this._thunder = thunderJS(config);
      this.callsign = 'org.rdk.Network';
    }
    /**
     * Function to activate network plugin
     */


    activate() {
      return new Promise((resolve, reject) => {
        this._thunder.call('Controller', 'activate', {
          callsign: this.callsign
        }).then(result => {
          this._thunder.on(this.callsign, 'onIPAddressStatusChanged', notification => {
            if (this._events.has('onIPAddressStatusChanged')) {
              this._events.get('onIPAddressStatusChanged')(notification);
            }
          });

          this._thunder.on(this.callsign, 'onDefaultInterfaceChanged', notification => {
            if (this._events.has('onDefaultInterfaceChanged')) {
              this._events.get('onDefaultInterfaceChanged')(notification);
            }
          });

          this._thunder.on(this.callsign, 'onConnectionStatusChanged', notification => {
            if (this._events.has('onConnectionStatusChanged')) {
              this._events.get('onConnectionStatusChanged')(notification);
            }
          });

          console.log('Activation success');
          resolve(true);
        });
      });
    }
    /**
     *Register events and event listeners.
     * @param {string} eventId
     * @param {function} callback
     *
     */


    registerEvent(eventId, callback) {
      this._events.set(eventId, callback);
    }
    /**
     * Function to return the IP of the default interface.
     */


    getIP() {
      return new Promise((resolve, reject) => {
        this._thunder.call(this.callsign, 'getStbIp').then(result => {
          if (result.success) {
            resolve(result.ip);
          }

          reject(false);
        }).catch(err => {
          reject(err);
        });
      });
    }
    /**
     * Function to return available interfaces.
     */


    getInterfaces() {
      return new Promise((resolve, reject) => {
        this._thunder.call(this.callsign, 'getInterfaces').then(result => {
          if (result.success) {
            resolve(result.interfaces);
          }
        }).catch(err => {
          console.error("getInterfaces fail: ".concat(err));
          reject(err);
        });
      });
    }
    /**
     * Function to return default interfaces.
     */


    getDefaultInterface() {
      return new Promise((resolve, reject) => {
        this._thunder.call(this.callsign, 'getDefaultInterface').then(result => {
          if (result.success) {
            resolve(result.interface);
          }
        }).catch(err => {
          console.error("getDefaultInterface fail: ".concat(err));
          reject(err);
        });
      });
    }

    setDefaultInterface(interfaceName) {
      return new Promise((resolve, reject) => {
        this._thunder.call(this.callsign, 'setDefaultInterface', {
          "interface": interfaceName,
          "persist": true
        }).then(result => {
          resolve(result);
        }).catch(err => {
          console.error("setDefaultInterface fail: ".concat(err));
          reject(err);
        });
      });
    }

    getSTBIPFamily() {
      return new Promise((resolve, reject) => {
        this._thunder.call(this.callsign, 'getSTBIPFamily').then(result => {//need to check
        });
      });
    }
    /**
     * Function to return IP Settings.
     */


    getIPSettings(currentInterface) {
      return new Promise((resolve, reject) => {
        this._thunder.call(this.callsign, 'getIPSettings', {
          "interface": currentInterface
        }).then(result => {
          resolve(result);
        }).catch(err => {
          console.error("getIPSettings fail: ".concat(err));
          reject(err);
        });
      });
    }
    /**
     * Function to set IP Settings.
     */


    setIPSettings(IPSettings) {
      return new Promise((resolve, reject) => {
        this._thunder.call(this.callsign, 'setIPSettings', IPSettings).then(result => {
          resolve(result);
        }).catch(err => {
          console.error("setIPSettings fail: ".concat(err));
          reject(err);
        });
      });
    }

    isConnectedToInternet() {
      return new Promise((resolve, reject) => {
        let header = new Headers();
        header.append('pragma', 'no-cache');
        header.append('cache-control', 'no-cache');
        fetch("https://apps.rdkcentral.com/rdk-apps/accelerator-home-ui/index.html", {
          method: 'GET',
          headers: header
        }).then(res => {
          if (res.status >= 200 && res.status <= 300) {
            console.log("Connected to internet");
            resolve(true);
          } else {
            console.log("No Internet Available");
            resolve(false);
          }
        }).catch(err => {
          console.log("Internet Check failed: No Internet Available");
          resolve(false); //fail of fetch method needs to be considered as no internet
        });
      });
    }

  }

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
  /**
    * Class for Other Network Config Screen.
    */

  class NetworkConfigurationScreen extends lng$1.Component {
    pageTransition() {
      return 'left';
    }

    static _template() {
      return {
        rect: true,
        color: 0xff000000,
        w: 1920,
        h: 1080,
        NetworkConfigurationScreenContents: {
          x: 200,
          y: 275,
          NetworkInfo: {
            y: 0,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('Network Info'),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Button: {
              h: 45,
              w: 45,
              x: 1600,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset('images/settings/Arrow.png')
            }
          },
          NetworkInterface: {
            //alpha: 0.3, // disabled
            y: 90,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('Network Interface: '),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Button: {
              h: 45,
              w: 45,
              x: 1600,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset('images/settings/Arrow.png')
            }
          },
          TestInternetAccess: {
            y: 180,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('Test Internet Access: '),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Loader: {
              h: 45,
              w: 45,
              x: 420,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset('images/settings/Loading.gif'),
              visible: false
            }
          },
          StaticMode: {
            alpha: 0,
            // disabled
            y: 270,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('Static Mode'),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Button: {
              h: 45,
              w: 45,
              x: 1600,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset('images/settings/Arrow.png')
            }
          }
        }
      };
    }

    _firstEnable() {
      this._setState('NetworkInfo');

      let _currentIPSettings = {};
      let _newIPSettings = {};
      this._network = new Network();

      this._network.getDefaultInterface().then(interfaceName => {
      });

      _newIPSettings = _currentIPSettings;
      _newIPSettings.ipversion = "IPV6"; // this fails, need to verify how to set proper ip settings
      // loader animation for testing internet

      this.loadingAnimation = this.tag('TestInternetAccess.Loader').animation({
        duration: 3,
        repeat: -1,
        stopMethod: 'immediate',
        stopDelay: 0.2,
        actions: [{
          p: 'rotation',
          v: {
            sm: 0,
            0: 0,
            1: 2 * Math.PI
          }
        }]
      });
    }

    _focus() {
      this._setState(this.state); //can be used on init as well


      this._network.getDefaultInterface().then(interfaceName => {
        this.$NetworkInterfaceText(interfaceName);
      });
    }

    _unfocus() {
      this.tag('TestInternetAccess.Title').text.text = Language.translate('Test Internet Access: ');
    }

    $NetworkInterfaceText(text) {
      this.tag('NetworkInterface.Title').text.text = Language.translate('Network Interface: ') + text;
    }

    _handleBack() {
      Router.navigate('settings');
    }

    _onChanged() {
      this.widgets.menu.updateTopPanelText(Language.translate('Settings  Network Configuration'));
    }

    static _states() {
      return [class NetworkInfo extends this {
        $enter() {
          this.tag('NetworkInfo')._focus();
        }

        $exit() {
          this.tag('NetworkInfo')._unfocus();
        }

        _handleDown() {
          this._setState('NetworkInterface');
        }

        _handleEnter() {
          Router.navigate('settings/network/info');
        }

      }, class NetworkInterface extends this {
        $enter() {
          this.tag('NetworkInterface')._focus();
        }

        $exit() {
          this.tag('NetworkInterface')._unfocus();
        }

        _handleUp() {
          this._setState('NetworkInfo');
        }

        _handleDown() {
          this._setState('TestInternetAccess');
        }

        _handleEnter() {
          if (!Router.isNavigating()) {
            Router.navigate('settings/network/interface');
          }
        }

      }, class TestInternetAccess extends this {
        $enter() {
          this.tag('TestInternetAccess')._focus();
        }

        $exit() {
          this.tag('TestInternetAccess')._unfocus();
        }

        _handleUp() {
          this._setState('NetworkInterface');
        }

        _handleDown() {
          this._setState('NetworkInfo');
        }

        _handleEnter() {
          this.loadingAnimation.start();
          this.tag('TestInternetAccess.Loader').visible = true;

          this._network.isConnectedToInternet().then(result => {
            var connectionStatus = Language.translate("Internet Access: ");

            if (result) {
              connectionStatus += Language.translate("Connected");
            } else {
              connectionStatus += Language.translate("Not Connected");
            }

            setTimeout(() => {
              this.tag('TestInternetAccess.Loader').visible = false;
              this.tag('TestInternetAccess.Title').text.text = connectionStatus;
              this.loadingAnimation.stop();
            }, 2000);
          });
        }

      }, class StaticMode extends this {
        $enter() {
          this.tag('StaticMode')._focus();
        }

        $exit() {
          this.tag('StaticMode')._unfocus();
        }

        _handleUp() {
          this._setState('TestInternetAccess');
        }

        _handleDown() {
          this._setState('NetworkInfo');
        }

        _handleEnter() {}

      }];
    }

  }

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
  /**
    * Class for Other Settings Screen.
    */

  var appApi$1 = new AppApi();
  var defaultInterface = "";
  var currentInterface = [];
  class NetworkInfo extends lng$1.Component {
    pageTransition() {
      return 'left';
    }

    _handleBack() {
      Router.navigate('settings/network');
    }

    _onChanged() {
      this.widgets.menu.updateTopPanelText(Language.translate('Settings  Network Configuration  Network Info'));
    }

    static _template() {
      return {
        rect: true,
        color: 0xff000000,
        w: 1920,
        h: 1080,
        NetworkInfoScreenContents: {
          x: 200,
          y: 275,
          Status: {
            y: 0,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('Status: '),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Value: {
              x: 500,
              y: 45,
              mountY: 0.5,
              text: {
                text: '',
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            }
          },
          ConnectionType: {
            //alpha: 0.3, // disabled
            y: 90,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('Connection Type: '),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Value: {
              x: 500,
              y: 45,
              mountY: 0.5,
              text: {
                text: '',
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            }
          },
          IPAddress: {
            //alpha: 0.3, // disabled
            y: 180,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('IP Address: '),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Value: {
              x: 500,
              y: 45,
              mountY: 0.5,
              text: {
                text: '',
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            }
          },
          Gateway: {
            y: 270,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('Gateway: '),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Value: {
              x: 500,
              y: 45,
              mountY: 0.5,
              text: {
                text: '',
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            }
          },
          MACAddress: {
            //alpha: 0.3, // disabled
            y: 360,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('MAC Address: '),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Value: {
              x: 500,
              y: 45,
              mountY: 0.5,
              text: {
                text: '',
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            }
          },
          InternetProtocol: {
            //alpha: 0.3, // disabled
            y: 450,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('Internet Protocol: '),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Value: {
              x: 500,
              y: 45,
              mountY: 0.5,
              text: {
                text: '',
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            }
          },
          SSID: {
            //alpha: 0.3, // disabled
            y: 540,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('SSID: '),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Value: {
              x: 500,
              y: 45,
              mountY: 0.5,
              text: {
                text: '',
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            }
          },
          SignalStrength: {
            //alpha: 0.3, // disabled
            y: 630,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('Signal Strength: '),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Value: {
              x: 500,
              y: 45,
              mountY: 0.5,
              text: {
                text: '',
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            }
          }
        }
      };
    }

    getIPSetting(interfaceName) {
      appApi$1.getIPSetting(interfaceName).then(result => {
        this.tag('InternetProtocol.Value').text.text = result.ipversion;
      }).catch(err => console.log(err));
    }

    _focus() {
      //Getting the default interface
      appApi$1.getDefaultInterface().then(result => {
        defaultInterface = result.interface;
        this.getIPSetting(defaultInterface);

        if (defaultInterface === "WIFI") {
          this.tag("ConnectionType.Value").text.text = "Wireless";
          this.tag("SSID").alpha = 1;
          this.tag("SignalStrength").alpha = 1;
        } else if (defaultInterface === "ETHERNET") {
          this.tag("ConnectionType.Value").text.text = "Ethernet";
          this.tag("SSID").alpha = 0;
          this.tag("SignalStrength").alpha = 0;
        } else {
          this.tag("ConnectionType.Value").text.text = "NA";
          this.tag("Status.Value").text.text = "Disconnected";
          this.tag("IPAddress.Value").text.text = "NA";
          this.tag("Gateway.Value").text.text = "NA";
          this.tag("MACAddress.Value").text.text = "NA";
        } //Filtering the current interface


        appApi$1.getInterfaces().then(result => {
          currentInterface = result.interfaces.filter(data => data.interface === defaultInterface); //console.log(currentInterface);

          if (currentInterface[0].connected) {
            this.tag("Status.Value").text.text = "Connected";
            appApi$1.getConnectedSSID().then(result => {
              if (parseInt(result.signalStrength) >= -50) {
                this.tag("SignalStrength.Value").text.text = "Excellent";
              } else if (parseInt(result.signalStrength) >= -60) {
                this.tag("SignalStrength.Value").text.text = "Good";
              } else if (parseInt(result.signalStrength) >= -67) {
                this.tag("SignalStrength.Value").text.text = "Fair";
              } else {
                this.tag("SignalStrength.Value").text.text = "Poor";
              }

              this.tag("SSID.Value").text.text = "".concat(result.ssid);
            }).catch(error => console.log(error));
            appApi$1.getIPSetting(defaultInterface).then(result => {
              this.tag('IPAddress.Value').text.text = "".concat(result.ipaddr);
              this.tag("Gateway.Value").text.text = "".concat(result.gateway);
            }).catch(error => console.log(error));
          } else {
            this.tag('Status.Value').text.text = "Disconnected";
          }

          this.tag('MACAddress.Value').text.text = "".concat(currentInterface[0].macAddress);
        }).catch(error => console.log(error));
      }).catch(error => console.log(error));
    }

    _unfocus() {
      this.tag('SSID.Value').text.text = 'NA';
      this.tag('SignalStrength.Value').text.text = 'NA';
      this.tag('MACAddress.Value').text.text = 'NA';
      this.tag('Gateway.Value').text.text = 'NA';
      this.tag('IPAddress.Value').text.text = 'NA';
      this.tag('ConnectionType.Value').text.text = 'NA';
      this.tag('InternetProtocol.Value').text.text = 'NA';
    }

  }

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
  const wifi = new Wifi();
  class NetworkInterfaceScreen extends lng$1.Component {
    _construct() {
      this.LoadingIcon = Utils.asset('images/settings/Loading.gif');
    }

    static _template() {
      return {
        rect: true,
        color: 0xff000000,
        w: 1920,
        h: 1080,
        NetworkInterfaceScreenContents: {
          x: 200,
          y: 275,
          WiFi: {
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('WiFi'),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Button: {
              h: 45,
              w: 45,
              x: 1600,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset('images/settings/Arrow.png')
            }
          },
          Ethernet: {
            y: 90,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('Ethernet'),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Loader: {
              h: 45,
              w: 45,
              x: 175,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset('images/settings/Loading.gif'),
              visible: false
            }
          }
        }
      };
    }

    _focus() {
      this._setState('WiFi');
    }

    _init() {
      const config = {
        host: '127.0.0.1',
        port: 9998,
        default: 1
      };
      this._thunder = thunderJS(config);
      const systemcCallsign = 'org.rdk.Network';
      const eventName = 'onDefaultInterfaceChanged';

      this._thunder.on(systemcCallsign, eventName, notification => {
        console.log('onDefaultInterfaceChanged notification from networkInterfaceScreen: ', notification);

        if (notification.newInterfaceName === "ETHERNET") {
          this.loadingAnimation.stop();
          this.tag('Ethernet.Loader').visible = false;
          this.tag('Ethernet.Title').text.text = 'Ethernet: Connected';
        } else if (notification.newInterfaceName === "" && notification.oldInterfaceName === "WIFI") {
          this.loadingAnimation.stop();
          this.tag('Ethernet.Loader').visible = false;
          this.tag('Ethernet.Title').text.text = 'Ethernet: Error, Retry!';
        } else if (notification.newInterfaceName === "WIFI") {
          this.loadingAnimation.stop();
          this.tag('Ethernet.Loader').visible = false;
          this.tag('Ethernet.Title').text.text = 'Ethernet';
        }
      });

      this.loadingAnimation = this.tag('Ethernet.Loader').animation({
        duration: 3,
        repeat: -1,
        stopMethod: 'immediate',
        stopDelay: 0.2,
        actions: [{
          p: 'rotation',
          v: {
            sm: 0,
            0: 0,
            1: 2 * Math.PI
          }
        }]
      });
      this.tag('Ethernet.Loader').src = this.LoadingIcon;
    }

    _firstActive() {
      this.tag('Ethernet.Loader').on('txError', () => {
        const url = 'http://127.0.0.1:50050/lxresui/static/images/settings/Loading.gif';
        this.tag('Ethernet.Loader').src = url;
      });
    }

    hide() {
      this.tag('NetworkInterfaceScreenContents').visible = false;
    }

    show() {
      this.tag('NetworkInterfaceScreenContents').visible = true;
    }

    setEthernetInterface() {
      wifi.getInterfaces().then(res => {
        res.interfaces.forEach(element => {
          if (element.interface === "ETHERNET" && element.connected) {
            wifi.setInterface('ETHERNET', true).then(result => {
              if (result.success) {
                wifi.setDefaultInterface('ETHERNET', true);
                this.tag('Ethernet.Title').text.text = 'Ethernet';
                this.tag('Ethernet.Loader').visible = true;
                this.loadingAnimation.start();
              }
            });
          }
        });
      });
    }

    _handleBack() {
      Router.navigate('settings/network');
    }

    pageTransition() {
      return 'left';
    }

    _onChanged() {
      this.widgets.menu.updateTopPanelText(Language.translate('Settings  Network Configuration  Network Interface'));
    }

    static _states() {
      return [class WiFi extends this {
        $enter() {
          this.tag('WiFi')._focus();
        }

        $exit() {
          this.tag('WiFi')._unfocus();
        }

        _handleDown() {
          this._setState('Ethernet');
        }

        _handleEnter() {
          if (!Router.isNavigating()) {
            Router.navigate('settings/network/interface/wifi');
          }
        }

      }, class Ethernet extends this {
        $enter() {
          this.tag('Ethernet')._focus();
        }

        $exit() {
          this.tag('Ethernet')._unfocus();
        }

        _handleEnter() {
          wifi.getDefaultInterface().then(res => {
            if (res.success) {
              if (res.interface !== "ETHERNET") {
                this.setEthernetInterface();
              }
            }
          });
        }

        _handleDown() {
          this._setState('WiFi');
        }

        _handleUp() {
          this._setState('WiFi');
        }

      }];
    }

  }

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
  /**
   * Class for rendering items in Settings screen.
   */

  class ConfirmAndCancel extends lng$1.Component {
    static _template() {
      return {
        Item: {
          w: 325,
          // previous value : ((1920 / 2) - 350) / 2
          h: 85,
          // previous value: 65
          rect: true,
          color: 0xffffffff,
          shader: {
            type: lng$1.shaders.RoundedRectangle,
            radius: 0
          }
        }
      };
    }
    /**
     * Function to set contents for an item in settings screen.
     */


    set item(item) {
      this._item = item;
      this.tag('Item').patch({
        Left: {
          x: this.tag("Item").w / 2,
          // orginal = 10
          y: this.tag('Item').h / 2,
          mountX: 0.5,
          mountY: 0.5,
          text: {
            text: item,
            fontSize: 25,
            textColor: 0xff000000,
            fontFace: CONFIG.language.font
          }
        }
      });
    }
    /**
     * Set width of the item.
     */


    set width(width) {
      this.tag('Item').w = width;
    }
    /**
     * Set height of the item.
     */


    set height(height) {
      this.tag('Item').h = height;
    }

    _focus() {
      this.tag('Item').color = CONFIG.theme.hex;
    }

    _unfocus() {
      this.tag('Item').color = 0xffffffff;
    }

  }

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
  class PasswordSwitch extends lng$1.Component {
    static _template() {
      return {
        src: Utils.asset('images/settings/ToggleOffWhite.png')
      };
    }

    _handleEnter() {
      if (this.isOn) {
        this.patch({
          src: Utils.asset("images/settings/ToggleOffWhite.png")
        });
      } else {
        this.patch({
          src: Utils.asset("images/settings/ToggleOnOrange.png")
        });
      }

      this.isOn = !this.isOn;
      this.fireAncestors('$handleEnter', this.isOn);
    }

    _init() {
      this.isOn = false;
    }

    _disable() {
      if (this.isOn) {
        this.isOn = false;
        this.patch({
          src: Utils.asset("images/settings/ToggleOffWhite.png")
        });
        this.fireAncestors('$handleEnter', this.isOn);
      }
    }

  }

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
  class WifiPairingScreen extends lng$1.Component {
    pageTransition() {
      return 'left';
    }

    static _template() {
      return {
        w: 1920,
        h: 1080,
        rect: true,
        color: 0xff000000,
        PairingScreen: {
          Title: {
            x: 960,
            y: 95,
            mountX: 0.5,
            zIndex: 2,
            text: {
              text: '',
              fontSize: 40,
              textColor: CONFIG.theme.hex
            }
          },
          RectangleWithColor: {
            x: 180,
            y: 164,
            w: 1515,
            h: 2,
            rect: true,
            color: 0xFFFFFFFF,
            zIndex: 2
          },
          PasswordLabel: {
            x: 180,
            y: 240,
            w: 300,
            h: 75,
            zIndex: 2,
            text: {
              text: 'Password: ',
              fontSize: 25,
              fontFace: CONFIG.language.font,
              textColor: 0xffffffff,
              textAlign: 'left'
            }
          },
          Pwd: {
            x: 437,
            y: 240,
            zIndex: 2,
            text: {
              text: '',
              fontSize: 25,
              fontFace: CONFIG.language.font,
              textColor: 0xffffffff,
              wordWrapWidth: 1000,
              wordWrap: false,
              textOverflow: 'ellipsis'
            }
          },
          PasswordBox: {
            x: 417,
            y: 208,
            zIndex: 2,
            texture: lng$1.Tools.getRoundRect(1279, 88, 0, 3, 0xffffffff, false)
          },
          PasswrdSwitch: {
            h: 45,
            w: 66.9,
            x: 1656,
            y: 255,
            zIndex: 2,
            type: PasswordSwitch,
            mount: 0.5
          },
          ShowPassword: {
            x: 1398,
            y: 240,
            w: 300,
            h: 75,
            zIndex: 2,
            text: {
              text: 'Show Password',
              fontSize: 25,
              fontFace: CONFIG.language.font,
              textColor: 0xffffffff,
              textAlign: 'left'
            }
          },
          List: {
            x: 417,
            y: 331,
            type: lng$1.components.ListComponent,
            w: 1080,
            h: 400,
            itemSize: 28,
            horizontal: true,
            invertDirection: false,
            roll: true,
            zIndex: 2
          },
          RectangleWithColor2: {
            x: 180,
            y: 451,
            w: 1515,
            h: 2,
            rect: true,
            color: 0xFFFFFFFF,
            zIndex: 2
          },
          KeyBoard: {
            y: 501,
            x: 420,
            type: Keyboard,
            visible: true,
            zIndex: 2,
            formats: KEYBOARD_FORMATS.qwerty
          }
        }
      };
    }

    _updateText(txt) {
      this.tag("Pwd").text.text = txt;
    }

    _handleBack() {
      Router.back();
    }
    /**
     * @param {{ item: Wifi Response Object; }} args
     */


    set params(args) {
      if (args.wifiItem) {
        this.item(args.wifiItem);
      } else {
        Router.navigate('settings/network/interface/wifi');
      }
    }

    item(item) {
      this.star = "";
      this.passwd = "";
      this.tag("Pwd").text.text = "";
      this.tag('Title').text = item.ssid;
      var options = [];
      this._item = item;

      if (item.connected) {
        options = ['Disconnect', 'Cancel'];
      } else {
        options = ['Connect', 'Cancel'];
      }

      this.tag('List').items = options.map((item, index) => {
        return {
          ref: item,
          x: index === 0 ? 0 : 325 * index,
          w: 325,
          h: 85,
          type: ConfirmAndCancel,
          item: item
        };
      });

      this._setState('Pair');
    }

    _focus() {
      this.hidePasswd = true;

      this._setState('Pair');
    }

    _unfocus() {}

    _init() {
      this.star = "";
      this.passwd = "";
      this.isOn = false;
      this._wifi = new Wifi();
    }

    pressEnter(option) {
      if (option === 'Cancel') {
        Router.back();
      } else if (option === 'Connect') {
        if (this._item) {
          console.log('trying to connect wifi');

          this._wifi.connect(this._item, '').then(() => {}).catch(err => {
            console.log('Not able to connect to wifi', JSON.stringify(err));
          });
        }

        Router.back();
      } else if (option === 'Disconnect') {
        this._wifi.disconnect().then(() => {
          Router.back();
        });
      }
    } // startConnect(password) {
    //   this._wifi.connect(this._item, password).then(() => {
    //     Router.back()
    //   })
    // }


    startConnect(password) {
      this._wifi.connect(this._item, password).then(() => {
        this._wifi.saveSSID(this._item.ssid, password, this._item.security).then(response => {
          if (response.result === 0) ; else if (response.result !== 0) {
            this._wifi.clearSSID().then(response => {// console.log(response)
              // Router.back()
            });
          }
        });

        Router.back();
      });
    }

    static _states() {
      return [class Password extends this {
        $enter() {
          this.shifter = false;
          this.capsLock = false;
        }

        _getFocused() {
          return this.tag("KeyBoard");
        }

        $onSoftKey(_ref) {
          let {
            key
          } = _ref;

          if (key === 'Done') {
            this.startConnect(this.passwd);
          } else if (key === 'Clear') {
            this.passwd = this.passwd.substring(0, this.passwd.length - 1);
            this.star = this.star.substring(0, this.star.length - 1);

            this._updateText(this.hidePasswd ? this.star : this.passwd);
          } else if (key === '#@!' || key === 'abc' || key === 'áöû' || key === 'shift') {
            console.log('no saving');
          } else if (key === 'Space') {
            this.star += '\u25CF';
            this.passwd += ' ';

            this._updateText(this.hidePasswd ? this.star : this.passwd);
          } else if (key === 'Delete') {
            this.star = '';
            this.passwd = '';

            this._updateText(this.hidePasswd ? this.star : this.passwd);
          } else {
            this.star += '\u25CF';
            this.passwd += key;

            this._updateText(this.hidePasswd ? this.star : this.passwd);
          }
        }

        _handleUp() {
          this._setState("Pair");
        }

      }, class Pair extends this {
        $enter() {}

        _getFocused() {
          return this.tag('List').element;
        }

        _handleRight() {
          this.tag('List').setNext();
        }

        _handleLeft() {
          this.tag('List').setPrevious();
        }

        _handleUp() {
          this._setState("PasswordSwitchState");
        }

        _handleDown() {
          this._setState("Password");
        }

        _handleEnter() {
          if (this.tag('List').element.ref == 'Connect' && this._item.security != 0) {
            if (this.star === '') {
              this._setState('Password');
            } else {
              this.startConnect(this.passwd);
            }
          } else {
            this.pressEnter(this.tag('List').element.ref);
          }
        }

      }, class PasswordSwitchState extends this {
        $enter() {
          this.tag("PasswordBox").texture = lng$1.Tools.getRoundRect(1279, 88, 0, 3, CONFIG.theme.hex, false);
        }

        _handleDown() {
          this._setState("Pair");
        }

        _getFocused() {
          return this.tag('PasswrdSwitch');
        }

        $handleEnter(bool) {
          if (bool) {
            this._updateText(this.passwd);

            this.hidePasswd = false;
          } else {
            this._updateText(this.star);

            this.hidePasswd = true;
          }

          this.isOn = bool;
        }

        $exit() {
          this.tag("PasswordBox").texture = lng$1.Tools.getRoundRect(1279, 88, 0, 3, 0xffffffff, false);
        }

      }];
    }

  }

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
  class WiFiItem extends lng$1.Component {
    _construct() {
      this.Lock = Utils.asset('/images/settings/Lock.png');
      this.WiFi1 = Utils.asset('/images/settings/WiFi1.png');
      this.WiFi2 = Utils.asset('/images/settings/WiFi2.png');
      this.WiFi3 = Utils.asset('/images/settings/WiFi3.png');
      this.WiFi4 = Utils.asset('/images/settings/WiFi4.png');
      this.Tick = Utils.asset('/images/settings/Tick.png');
    }

    _init() {
      this.tag('Item.Tick').on('txError', () => {
        const url = 'http://127.0.0.1:50050/lxresui/static/images/settings/Tick.png';
        this.tag('Item.Tick').src = url;
      });
    }

    static _template() {
      return {
        TopLine: {
          y: 0,
          mountY: 0.5,
          w: 1600,
          h: 3,
          rect: true,
          color: 0xFFFFFFFF
        },
        Item: {
          w: 1600,
          h: 90
        },
        BottomLine: {
          y: 90,
          mountY: 0.5,
          w: 1600,
          h: 3,
          rect: true,
          color: 0xFFFFFFFF
        }
      };
    }
    /**
     * Function to set contents of an item in the Bluetooth screen.
     */


    set item(item) {
      this._item = item;
      this.status = item.connected ? 'Connected' : 'Not Connected';
      var wifiicon = "";

      if (item.signalStrength >= -50) {
        wifiicon = this.WiFi4;
      } else if (item.signalStrength >= -60) {
        wifiicon = this.WiFi3;
      } else if (item.signalStrength >= -67) {
        wifiicon = this.WiFi2;
      } else {
        wifiicon = this.WiFi1;
      }

      this.tag('Item').patch({
        Tick: {
          x: 10,
          y: 45,
          mountY: 0.5,
          h: 32.5,
          w: 32.5,
          src: this.Tick,
          //texture: Lightning.Tools.getSvgTexture(this.Tick, 32.5, 32.5),
          color: 0xffffffff,
          visible: item.connected ? true : false
        },
        Left: {
          x: 40,
          y: 45,
          mountY: 0.5,
          text: {
            text: item.ssid,
            fontSize: 25,
            textColor: COLORS.textColor,
            fontFace: CONFIG.language.font
          }
        },
        Right: {
          x: 1560,
          mountX: 1,
          y: 45,
          mountY: 0.5,
          flex: {
            direction: 'row'
          },
          Lock: {
            color: 0xffffffff,
            texture: lng$1.Tools.getSvgTexture(this.Lock, 32.5, 32.5),
            alpha: 1
          },
          Icon: {
            color: 0xffffffff,
            flexItem: {
              marginLeft: 15
            },
            texture: lng$1.Tools.getSvgTexture(wifiicon, 32.5, 32.5)
          }
        }
      });

      if (item.security == '0' || item.security == '15') {
        this.tag('Item.Right.Lock').visible = false;
      } else {
        this.tag('Item.Right.Lock').visible = true;
      }
    }

    _focus() {
      this.tag("Item").color = COLORS.hightlightColor;
      this.tag('TopLine').color = CONFIG.theme.hex;
      this.tag('BottomLine').color = CONFIG.theme.hex;
      this.patch({
        zIndex: 2
      });
      this.tag('TopLine').h = 6;
      this.tag('BottomLine').h = 6;
    }

    _unfocus() {
      this.tag('TopLine').color = 0xFFFFFFFF;
      this.tag('BottomLine').color = 0xFFFFFFFF;
      this.patch({
        zIndex: 1
      });
      this.tag('TopLine').h = 3;
      this.tag('BottomLine').h = 3;
    }

  }

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
  /**
  * Class for WiFi screen.
  */

  class WiFiScreen extends lng$1.Component {
    pageTransition() {
      return 'left';
    }

    static _template() {
      return {
        rect: true,
        color: 0xff000000,
        w: 1920,
        h: 1080,
        WifiContents: {
          x: 200,
          y: 275,
          Switch: {
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('WiFi On/Off'),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            Loader: {
              visible: false,
              h: 45,
              w: 45,
              x: 1500,
              // x: 320,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset('images/settings/Loading.gif')
            },
            Button: {
              h: 45,
              w: 67,
              x: 1600,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset('images/settings/ToggleOffWhite.png')
            }
          },
          Networks: {
            y: 180,
            flex: {
              direction: 'column'
            },
            PairedNetworks: {
              flexItem: {
                margin: 0
              },
              List: {
                type: lng$1.components.ListComponent,
                w: 1920 - 300,
                itemSize: 90,
                horizontal: false,
                invertDirection: true,
                roll: true,
                rollMax: 900,
                itemScrollOffset: -4
              }
            },
            AvailableNetworks: {
              flexItem: {
                margin: 0
              },
              List: {
                w: 1920 - 300,
                type: lng$1.components.ListComponent,
                itemSize: 90,
                horizontal: false,
                invertDirection: true,
                roll: true,
                rollMax: 900,
                itemScrollOffset: -4
              }
            },
            visible: false
          },
          JoinAnotherNetwork: {
            y: 90,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('Join Another Network'),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25
              }
            },
            visible: false
          }
        }
      };
    }

    _active() {
      this._setState('Switch');
    }

    _focus() {
      this._setState('Switch');

      this._enable();
    }

    _firstEnable() {
      this.wifiLoading = this.tag('Switch.Loader').animation({
        duration: 3,
        repeat: -1,
        stopMethod: 'immediate',
        stopDelay: 0.2,
        actions: [{
          p: 'rotation',
          v: {
            sm: 0,
            0: 0,
            1: Math.PI * 2
          }
        }]
      });
      this.onError = {
        0: 'SSID_CHANGED - The SSID of the network changed',
        1: 'CONNECTION_LOST - The connection to the network was lost',
        2: 'CONNECTION_FAILED - The connection failed for an unknown reason',
        3: 'CONNECTION_INTERRUPTED - The connection was interrupted',
        4: 'INVALID_CREDENTIALS - The connection failed due to invalid credentials',
        5: 'NO_SSID - The SSID does not exist',
        6: 'UNKNOWN - Any other error.'
      };
      this._wifi = new Wifi();
      this._network = new Network();
      this.wifiStatus = false;
      this._wifiIcon = true;

      this._activateWiFi();

      this._setState('Switch');

      if (this.wiFiStatus) {
        this.tag('Networks').visible = true;
        this.tag('JoinAnotherNetwork').visible = true;
      }

      this._pairedNetworks = this.tag('Networks.PairedNetworks');
      this._availableNetworks = this.tag('Networks.AvailableNetworks');

      this._network.activate().then(result => {
        if (result) {
          this.wifiStatus = true;

          this._network.registerEvent('onIPAddressStatusChanged', notification => {
            console.log(JSON.stringify(notification));

            if (notification.status == 'LOST') {
              if (notification.interface === 'WIFI') {
                this._wifi.setInterface('ETHERNET', true).then(res => {
                  if (res.success) {
                    this._wifi.setDefaultInterface('ETHERNET', true);
                  }
                });
              }
            }
          });

          this._network.registerEvent('onDefaultInterfaceChanged', notification => {
            if (notification.newInterfaceName === 'ETHERNET') {
              this._wifi.setInterface('ETHERNET', true).then(result => {
                if (result.success) {
                  this._wifi.setDefaultInterface('ETHERNET', true);
                }
              });
            }

            if (notification.newInterfaceName == 'ETHERNET' || notification.oldInterfaceName == 'WIFI') {
              this._wifi.disconnect();

              this.wifiStatus = false;
              this.tag('Networks').visible = false;
              this.tag('JoinAnotherNetwork').visible = false;
              this.tag('Switch.Loader').visible = false;
              this.wifiLoading.stop();
              this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOffWhite.png');

              this._setState('Switch');

              this._wifi.setInterface('ETHERNET', true).then(result => {
                if (result.success) {
                  this._wifi.setDefaultInterface('ETHERNET', true).then(result1 => {
                    if (result1.success) {
                      console.log('set default success', result1);
                    }
                  });
                }
              });
            }

            if (notification.newInterfaceName == '' && notification.oldInterfaceName == 'WIFI') {
              this._wifi.setInterface('ETHERNET', true).then(result => {
                if (result.success) {
                  this._wifi.setDefaultInterface('ETHERNET', true).then(result1 => {
                    if (result1.success) {
                      console.log('set default success', result1);
                    }
                  });
                }
              });
            }
          });

          this._network.registerEvent('onConnectionStatusChanged', notification => {
            if (notification.interface === 'ETHERNET' && notification.status === 'CONNECTED') {
              this._wifi.setInterface('ETHERNET', true).then(res => {
                if (res.success) {
                  this._wifi.setDefaultInterface('ETHERNET', true);
                }
              });
            }
          });
        }
      });
    }
    /**
     * Function to be executed when the Wi-Fi screen is enabled.
     */


    _enable() {
      if (this.wifiStatus) {
        this._wifi.discoverSSIDs();
      }
    }
    /**
     * Function to be executed when the Wi-Fi screen is disabled.
     */


    _disable() {
      this._wifi.stopScan();
    }
    /**
     * Function to render list of Wi-Fi networks.
     */


    renderDeviceList(ssids) {
      this._wifi.getConnectedSSID().then(result => {
        if (result.ssid != '') {
          this._pairedList = [result];
        } else {
          this._pairedList = [];
        }

        this._pairedNetworks.h = this._pairedList.length * 90;
        this._pairedNetworks.tag('List').h = this._pairedList.length * 90;
        this._pairedNetworks.tag('List').items = this._pairedList.map((item, index) => {
          item.connected = true;
          return {
            ref: 'Paired' + index,
            w: 1920 - 300,
            h: 90,
            type: WiFiItem,
            item: item
          };
        });
        this._otherList = ssids.filter(device => {
          result = this._pairedList.map(a => a.ssid);

          if (result.includes(device.ssid)) {
            return false;
          } else return device;
        });
        this._availableNetworks.h = this._otherList.length * 90;
        this._availableNetworks.tag('List').h = this._otherList.length * 90;
        this._availableNetworks.tag('List').items = this._otherList.map((item, index) => {
          item.connected = false;
          return {
            ref: 'Other' + index,
            w: 1620,
            h: 90,
            type: WiFiItem,
            item: item
          };
        });
      });
    }

    _handleBack() {
      Router.navigate('settings/network/interface');
    }

    _onChanged() {
      this.widgets.menu.updateTopPanelText(Language.translate('Settings  Network Configuration  Network Interface  WiFi'));
    }

    static _states() {
      return [class Switch extends this {
        $enter() {
          if (this.wifiStatus === true) {
            this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOnOrange.png');
            this.tag('Switch.Button').scaleX = 1;
          }

          this.tag('Switch')._focus();
        }

        $exit() {
          this.tag('Switch')._unfocus();
        }

        _handleDown() {
          if (this.wifiStatus === true) {
            this._setState('JoinAnotherNetwork');
          }
        }

        _handleEnter() {
          this.switch();
        }

      }, class PairedDevices extends this {
        $enter() {
          if (this.wifiStatus === true) {
            this.tag('Switch.Loader').visible = false;
            this.wifiLoading.stop();
            this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOffWhite.png');
            this.tag('Switch.Button').scaleX = -1;
          }
        }

        _getFocused() {
          return this._pairedNetworks.tag('List').element;
        }

        _handleDown() {
          this._navigate('MyDevices', 'down');
        }

        _handleUp() {
          this._navigate('MyDevices', 'up');
        }

        _handleEnter() {
          Router.navigate('settings/network/interface/wifi/connect', {
            wifiItem: this._pairedNetworks.tag('List').element._item
          });
        }

      }, class AvailableDevices extends this {
        $enter() {
          if (this.wifiStatus === true) {
            this.tag('Switch.Loader').visible = false;
            this.wifiLoading.stop();
            this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOffWhite.png');
            this.tag('Switch.Button').scaleX = -1;
          }
        }

        _getFocused() {
          return this._availableNetworks.tag('List').element;
        }

        _handleDown() {
          this._navigate('AvailableDevices', 'down');
        }

        _handleUp() {
          this._navigate('AvailableDevices', 'up');
        }

        _handleEnter() {
          Router.navigate('settings/network/interface/wifi/connect', {
            wifiItem: this._availableNetworks.tag('List').element._item
          });
        }

      }, class JoinAnotherNetwork extends this {
        $enter() {
          this.tag('JoinAnotherNetwork')._focus();
        }

        _handleUp() {
          this._setState('Switch');
        }

        _handleEnter() {
          if (this.wifiStatus) {
            Router.navigate('settings/network/interface/wifi/another');
          }
        }

        _handleDown() {
          if (this.wifiStatus) {
            if (this._pairedNetworks.tag('List').length > 0) {
              this._setState('PairedDevices');
            } else if (this._availableNetworks.tag('List').length > 0) {
              this._setState('AvailableDevices');
            }
          }
        }

        $exit() {
          this.tag('JoinAnotherNetwork')._unfocus();
        }

      }];
    }
    /**
     * Function to navigate through the lists in the screen.
     * @param {string} listname
     * @param {string} dir
     */


    _navigate(listname, dir) {
      let list;
      if (listname === 'MyDevices') list = this._pairedNetworks.tag('List');else if (listname === 'AvailableDevices') list = this._availableNetworks.tag('List');

      if (dir === 'down') {
        if (list.index < list.length - 1) list.setNext();else if (list.index == list.length - 1) {
          this._wifi.discoverSSIDs();

          this._setState('JoinAnotherNetwork');

          if (listname === 'MyDevices' && this._availableNetworks.tag('List').length > 0) {
            this._setState('AvailableDevices');
          }
        }
      } else if (dir === 'up') {
        if (list.index > 0) list.setPrevious();else if (list.index == 0) {
          if (listname === 'AvailableDevices' && this._pairedNetworks.tag('List').length > 0) {
            this._setState('PairedDevices');
          } else {
            this._setState('JoinAnotherNetwork');
          }
        }
      }
    }
    /**
     * Function to turn on and off Wi-Fi.
     */


    switch() {
      if (this.wifiStatus) {
        this._wifi.disconnect();

        console.log('turning off wifi');

        this._wifi.setInterface('ETHERNET', true).then(result => {
          if (result.success) {
            this._wifi.setDefaultInterface('ETHERNET', true).then(result => {
              if (result.success) {
                this._wifi.disconnect();

                this.wifiStatus = false;
                this.tag('Networks').visible = false;
                this.tag('JoinAnotherNetwork').visible = false;
                this.tag('Switch.Loader').visible = false;
                this.wifiLoading.stop();
                this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOffWhite.png');
              }
            });
          }
        });
      } else {
        console.log('turning on wifi');
        this.wifiStatus = true;
        this.tag('Networks').visible = true;
        this.tag('JoinAnotherNetwork').visible = true;
        this.wifiLoading.play();
        this.tag('Switch.Loader').visible = true;
        this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOnOrange.png');

        this._wifi.discoverSSIDs();
      }
    }
    /**
     * Function to activate Wi-Fi plugin.
     */


    _activateWiFi() {
      this._wifi.activate().then(() => {
        this.switch();
      });

      this._wifi.registerEvent('onWIFIStateChanged', notification => {
        console.log(JSON.stringify(notification));

        if (notification.state === 2 || notification.state === 5) {
          this._wifi.discoverSSIDs();
        }
      });

      this._wifi.registerEvent('onError', notification => {
        console.log('on errro');

        this._wifi.discoverSSIDs();

        this._wifi.setInterface('ETHERNET', true).then(res => {
          if (res.success) {
            this._wifi.setDefaultInterface('ETHERNET', true);
          }
        });

        if (this.widgets) {
          this.widgets.fail.notify({
            title: 'WiFi Error',
            msg: this.onError[notification.code]
          });
          Router.focusWidget('Fail');
        }
      });

      this._wifi.registerEvent('onAvailableSSIDs', notification => {
        this.renderDeviceList(notification.ssids);

        if (!notification.moreData) {
          setTimeout(() => {
            this.tag('Switch.Loader').visible = false;
            this.wifiLoading.stop();
          }, 1000);
        }
      });
    }

  }

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
  const networkRoutes = [{
    path: 'settings/network',
    component: NetworkConfigurationScreen,
    widgets: ['Menu']
  }, {
    path: 'settings/network/info',
    component: NetworkInfo,
    widgets: ['Menu']
  }, {
    path: 'settings/network/interface',
    component: NetworkInterfaceScreen,
    widgets: ['Menu']
  }, {
    path: 'settings/network/interface/wifi',
    component: WiFiScreen,
    widgets: ['Menu']
  }, {
    path: 'settings/network/interface/wifi/connect',
    component: WifiPairingScreen
  }, {
    path: 'settings/network/interface/wifi/another',
    component: JoinAnotherNetworkComponent
  }, {
    path: 'settings/bluetooth',
    component: BluetoothScreen,
    widgets: ['Menu']
  }, {
    path: 'settings/bluetooth/pairing',
    component: BluetoothPairingScreen
  }];
  var route$1 = {
    network: networkRoutes
  };

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
  class ChannelItem extends lng$1.Component {
    static _template() {
      return {
        w: 236,
        Title: {
          x: 10,
          y: 45,
          mountY: 0.5,
          zIndex: 2,
          text: {
            text: 'xxxxxx',
            fontFace: CONFIG.language.font,
            fontStyle: 'normal',
            fontSize: 21,
            textColor: 0xffffffff,
            maxLines: 1,
            maxLinexSuffix: '...',
            wordWrapWidth: 232
          }
        },
        Item: {
          w: 236 - 3,
          h: 78,
          color: 0xff272727,
          rect: true // texture: Lightning.Tools.getRoundRect(236, 81, 0, 1, 0xff000000, true, 0xff1d1c1c),

        }
      };
    }

    setBoldText() {
      let title = this.tag("Title");
      if (title) title.text.fontStyle = "bold";
    }

    unsetBoldText() {
      let title = this.tag("Title");
      if (title) title.text.fontStyle = "normal";
    }

    set fontStyle(v) {
      this.tag('Title').text.fontStyle = v;
    }

    set title(val) {
      this.tag('Title').text = val;
    }

    get title() {
      return this.tag("Title").text;
    }

  }

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
  class Shows extends lng$1.Component {
    static _template() {
      return {
        y: 200
      };
      /* this is just an empty component. used like a parent container for Cell containers */
    }

  }

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
  class Cell extends lng$1.Component {
    static _template() {
      return {
        zIndex: 2
      };
    }

    set txt(ins) {
      /* the text on the Cell */
      this.patch({
        AiringOverlay: {
          zIndex: 4,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: ins ? ins : "No Shows are being aired at the moment",
              fontFace: CONFIG.language.font,
              fontStyle: 'normal',
              fontSize: 21,
              textColor: 0xffffffff,
              maxLines: 1,
              maxLinexSuffix: '...'
            }
          }
        }
      });
      this.insText = ins ? ins : "No Shows are being aired at the moment";
    }

    get txt() {
      return this.insText;
    }

    set color(val) {
      let title = this.tag("Title");
      if (title) title.text.textColor = val;
    }

    setBoldText() {
      let title = this.tag("Title");
      if (title) title.text.fontStyle = "bold";
    }

    unsetBoldText() {
      let title = this.tag("Title");
      if (title) title.text.fontStyle = "normal";
    }

    set width(w) {
      /* the horizontal width of the Cell */
      this.patch({
        Item: {
          // clipping: true,
          w: w - 3,
          h: 78,
          color: 0xff272727,
          rect: true // texture: Lightning.Tools.getRoundRect(w, 81, 0, 1, 0xff000000, true, 0xff272727),

        }
      });
      this.tag('Title').text.wordWrapWidth = w - 20;
    }

    getwidth() {
      return this.width;
    }

    _init() {
      this.tag('AiringOverlay').w = this.tag('Item').w;
    }

  }

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
  class CellCursor extends lng$1.Component {
    static _template() {
      return {
        zIndex: 5,
        UpperLine: {
          x: 0,
          y: 0,
          rect: true,
          w: 236,
          h: 2,
          color: CONFIG.theme.hex
        },
        LowerLine: {
          x: 0,
          y: 79,
          rect: true,
          w: 236,
          h: 2,
          color: CONFIG.theme.hex
        } // texture:Lightning.Tools.getRoundRect(236 ,81,0,1,0xffFFFFFF,true,0x0000ffff) // if you change this then you may wanna change the part where it patches itself too.

      };
    }

    patchCursor(x, y, w) {
      this.tag("UpperLine").patch({
        smooth: {
          x: x,
          y: y,
          w: w - 3
        }
      });
      this.tag("LowerLine").patch({
        smooth: {
          x: x,
          y: y + 79,
          w: w - 3
        }
      });
    }

  }

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
  let k = 5;
  class Epg extends lng$1.Component {
    static _template() {
      return {
        Background: {
          color: 0xff000000,
          w: 1920,
          h: 1080,
          rect: true
        },
        Loader: {
          x: 960,
          y: 540,
          mount: 0.5,
          w: 100,
          h: 100,
          src: Utils.asset("images/settings/Loading.gif"),
          visible: true
        },
        Wrapper: {
          x: 200,
          y: 150,
          w: 1920,
          h: 1080,
          visible: false,
          DayLabel: {
            x: 0,
            y: 281,
            w: 236,
            h: 81,
            mountY: 0.5,
            text: {
              text: 'Today',
              fontFace: CONFIG.language.font,
              fontStyle: 'normal',
              fontSize: 21,
              textColor: 0xffffffff,
              maxLines: 1,
              maxLinexSuffix: '...',
              wordWrapWidth: 236
            }
          },
          ShowName: {
            x: 0,
            y: 195,
            w: 236,
            h: 81,
            mountY: 0.5,
            text: {
              text: 'SHOW',
              fontFace: CONFIG.language.font,
              fontStyle: 'bold',
              fontSize: 21,
              textColor: 0xffffffff,
              maxLines: 1,
              maxLinexSuffix: '...',
              wordWrapWidth: 236
            }
          },
          ShowTimings: {
            x: 236 * 5 + 59,
            y: 195,
            w: 236,
            h: 81,
            mountY: 0.5,
            text: {
              text: 'SHOW-TIMINGS',
              fontFace: CONFIG.language.font,
              fontStyle: 'normal',
              fontSize: 21,
              textColor: 0xffffffff,
              maxLines: 1,
              maxLinexSuffix: '...',
              wordWrapWidth: 236
            }
          },
          ChannelName: {
            x: 236 * 5 + 59,
            y: 225,
            w: 236,
            h: 81,
            mountY: 0.5,
            text: {
              text: 'CHANNEL-NAME',
              fontFace: CONFIG.language.font,
              fontStyle: 'normal',
              fontSize: 21,
              textColor: 0xffffffff,
              maxLines: 2,
              maxLinexSuffix: '...',
              wordWrapWidth: 236 * 5
            }
          },
          ShowDetails: {
            x: 0,
            y: 225,
            w: 236 * 5,
            h: 81,
            mountY: 0.5,
            text: {
              text: 'SHOW-DETAILS',
              fontFace: CONFIG.language.font,
              fontStyle: 'normal',
              fontSize: 21,
              textColor: 0xffffffff,
              maxLines: 2,
              maxLinexSuffix: '...',
              wordWrapWidth: 236 * 5
            }
          },
          Channels: {
            x: 0,
            y: 81 + 200,
            w: 236
          },
          TopBar: {
            y: 200,
            x: 236,
            TimeNotifiers: {
              x: -4,
              w: 236 * 6 + 2,
              h: 81,
              clipping: true,
              TimeBar: {
                // this is the gray bar
                x: k,
                y: 81 - 12,
                // this should be the ShowLists "y" value - 9, extra -3 to accomodate margin
                rect: true,
                h: 9,
                w: 0,
                color: 0xff404040
              },
              DownTriangle: {
                // this is the little triangle over the white bar.
                x: 4,
                y: 81 - 12,
                // this should be the same as TimeBar's "y" Value, extra -3 to accomodate margin
                mountX: 0.5,
                mountY: 0.5,
                color: 0xffffffff,
                text: {
                  text: "".concat(String.fromCodePoint(9662)),
                  fontSize: 25,
                  textColor: 0xffffffff
                }
              }
            },
            TimeLabels: {
              clipping: true,
              zIndex: 2,
              w: 236 * 6,
              h: 81,
              x: k,
              y: 0
            },
            Wrapper: {
              w: 236 * 6,
              h: 81 * 9,
              clipping: true,
              Shows: {
                y: 81,
                // x: 236,
                type: Shows
              },
              CellCursor: {
                y: 81,
                type: CellCursor
              }
            }
          }
        }
      };
    }

    setChannels(channels) {
      let c = channels.map((c, i) => {
        return {
          y: 81 * i,
          w: 236,
          type: ChannelItem,
          title: c.shortname
        };
      });
      this.tag('Channels').children = c;
      this.channelGridInstance = this.tag('Channels').children;
    }

    _firstEnable() {
      this.appApi = new AppApi();
    }

    launchApp(appName) {
      const apps = {
        //mapping from channel.shortname to application name
        "Youtube": "Cobalt",
        "Netflix": "Netflix",
        "Amazon Prime": "Amazon"
      };
      const app = apps[appName];
      this.appApi.getPluginStatus(app).then(() => {
        Storage.set("applicationType", app);

        if (app === "Cobalt") {
          this.appApi.launchApp(Storage.get("applicationType"), "https://www.youtube.com/tv").catch(err => {});
        } else {
          this.appApi.launchApp(app).catch(() => {});
        }

        this.appApi.setVisibilityandFocus("ResidentApp", false);
      }).catch(err => {
        console.log(appName, " NOT supported: ", JSON.stringify(err));
      });
    }

    _handleBack() {
      Router.navigate("menu");
    }

    _handleEnter() {
      let channel = this.getCurrentChannel();

      if (channel.dvburi === "OTT") {
        this.launchApp(channel.shortname); // check mapping in launchApp method
      }
    }

    getCurrentChannel() {
      let currentChannel = this.activeChannels[this.currentlyFocusedRow];
      return currentChannel;
    }

    setShows4Channels(channels) {
      let headStart = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      this.strtindexesofrows = [];
      var ltp = this.ltp;
      var rtp = new Date(this.ltp.getTime() + 3 * 60 * 60 * 1000);
      var cells = [];
      var self = this;

      function filterShowsBasedOnTimeWindow(shows, index) {
        let inc = headStart < 0 ? -1 : 1;
        let i = Math.abs(headStart);

        while (i >= 0) {
          // binary search can optimize this loop.
          shows[i].endtime = shows[i].duration + shows[i].starttime;

          if (i >= shows.length) {
            console.warn("Reached the end of data , can't traverse shows any further!");
            break;
          } else if (new Date(shows[i].starttime) <= ltp && new Date(shows[i].endtime) > ltp) {
            break;
          } else if (new Date(shows[i].starttime) > ltp) {
            console.warn("there's chance that an empty space appear in one of the rows");
            break;
          } else if (i === shows.length - 1) {
            console.warn('traversed all of the shows and none of them are airing at this time for this channel');
            return;
          }

          i += inc;
        }

        let x = 0;
        self.strtindexesofrows.push(cells.length);

        for (; i < shows.length; i++) {
          if (new Date(shows[i].starttime) >= rtp) {
            break;
          }

          let width = shows[i].duration / (1000 * 60) / 30 * 236;
          shows[i].endtime = shows[i].duration + shows[i].starttime; // the below code trim the left most and right most cells

          if (new Date(shows[i].starttime) < ltp) {
            width -= (ltp - new Date(shows[i].starttime)) / (1000 * 60) / 30 * 236;
          }

          if (new Date(shows[i].endtime) > rtp) {
            width -= (new Date(shows[i].endtime) - rtp) / (1000 * 60) / 30 * 236;
          } //------------ Trimming ends here-----------------


          cells.push({
            x: x,
            y: index * 81,
            w: width,
            type: Cell,
            txt: shows[i].name,
            description: shows[i].shortdescription,
            width: width,
            starttime: shows[i].starttime,
            showIndex: i,
            duration: shows[i].duration,
            endtime: shows[i].endtime
          });
          shows[i].duration + shows[i].starttime;
          x += width;
        } // the below code actually sets the shows


        if (index === channels.length - 1) {
          let shows = self.tag('Shows');
          shows.children = cells;
          self.strtindexesofrows.push(cells.length); // this is added just for calculation.

          self.gridInstance = shows.children; // self.updateCursor()

          self._setState('CellSelector');
        }
      }

      channels.map((channel, i) => {
        filterShowsBasedOnTimeWindow(channel.shows, i);
      });
    }

    setTimeLabelsBetween() {
      let startTime = this.ltp;
      let endTime = new Date(this.ltp.getTime() + 3 * 60 * 60 * 1000);
      let arr = [];
      let p = this.tag('TimeLabels');

      for (let t = startTime, i = 0; t <= endTime; t = new Date(t.getTime() + 30 * 60 * 1000), i++) {
        // the increment can probably be improvised
        let H = t.getHours();
        let M = t.getMinutes();
        M = M.toString().length < 2 ? '0' + M : M;
        arr.push({
          x: i * 236,
          y: 35,
          mountY: 0,
          text: {
            text: H >= 12 ? H === 12 ? "".concat(H, ":").concat(M, "PM") : "".concat(H - 12, ":").concat(M, "PM") : "".concat(H, ":").concat(M, "AM"),
            fontFace: CONFIG.language.font,
            fontStyle: 'normal',
            fontSize: 21,
            textColor: 0xffffffff,
            maxLines: 1,
            maxLinexSuffix: '...'
          }
        });
        p.children = arr;
      }
    }

    initialize() {
      this.ltp = new Date();
      let currentDateTime = this.ltp;
      let temp = currentDateTime.getMinutes();
      let closest30MinRoundOff; //the below round off system only works if the duration of the show is a multiple of 30.

      currentDateTime.setMilliseconds(0);
      currentDateTime.setSeconds(0);

      if (temp >= 30) {
        currentDateTime.setMinutes(30);
        closest30MinRoundOff = currentDateTime;
      } else {
        currentDateTime.setMinutes(0);
        closest30MinRoundOff = currentDateTime;
      }

      this.ltp = closest30MinRoundOff;
      this.closest30MinRoundOff = closest30MinRoundOff.getTime();
      this.setTimeLabelsBetween();
      let tBar = this.tag('TimeBar');
      let dTriangle = this.tag('DownTriangle');
      let self = this;
      this.interval = setInterval(() => {
        let now = new Date();

        if (now.getHours() === 0) ;

        let t = (now - self.ltp >= 0 ? now - self.ltp : 0) / (1000 * 60 * 30) * 236;
        tBar.w = t;
        dTriangle.x = t + k;
      }, 2000);
    }

    setBoldText() {
      let l = this.strtindexesofrows[this.currentlyFocusedRow];
      let r = this.strtindexesofrows[this.currentlyFocusedRow + 1] - 1;
      this.channelGridInstance[this.currentlyFocusedRow].setBoldText();

      for (var i = l; i <= r; i++) {
        this.gridInstance[i].setBoldText();
      }
    }

    unsetBoldText() {
      let l = this.strtindexesofrows[this.currentlyFocusedRow];
      let r = this.strtindexesofrows[this.currentlyFocusedRow + 1] - 1;
      this.channelGridInstance[this.currentlyFocusedRow].unsetBoldText();

      for (var i = l; i <= r; i++) {
        this.gridInstance[i].unsetBoldText();
      }
    }

    scrollVertically(n) {
      if (n < 0) {
        this.D--;
      } else {
        this.D++;
      }

      this.activeChannels = this.channels.slice(this.D - 8, this.D);
      this.setChannels(this.activeChannels);
      this.setShows4Channels(this.activeChannels);
    }

    onDataProvidedX() {
      this.initialize();
      this.scrollVertically();
      this.cellTimeTracker = this.gridInstance[this.currentCellIndex].starttime;
      this.setBoldText();
      this.paintCell();
      this.updateCursor();
      this.verticallyNonScrollableWindow = Math.min(this.channels.length - 1, 7);
    }

    paintCell() {
      this.gridInstance[this.currentCellIndex].color = CONFIG.theme.hex;
    }

    unpaintCell() {
      this.gridInstance[this.currentCellIndex].color = 0xffffffff;
    }

    _focus() {
      let wrapper = this.tag("Wrapper");
      let loader = this.tag("Loader");
      this.loadingAnimation.start();
      let self = this;

      function f(page) {
        let d = new Date();
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);
        d = d.getTime();
        let e = d + 7 * 24 * 60 * 60 * 1000;

        return new Promise((resolve, reject) => {
          self.serviceList().then(channels => {
            let traversedChannels = 0;
            channels.map((channel, i) => {
              if (channel.dvburi === "OTT") {
                traversedChannels++;
                channels[i].shows = [{
                  name: Language.translate("click to launch") + " ".concat(channel.shortname),
                  starttime: 0,
                  duration: e,
                  eventid: 0,
                  shortdescription: ''
                }];

                if (channels.length - 1 === traversedChannels) {
                  page.channels = channels;
                  resolve(true);
                }

                return 0;
              }
            });
          }).catch(err => {
            reject(err);
          });
        });
      }

      f(this).then(res => {
        self.loadingAnimation.stop();
        self.onDataProvidedX();
        loader.visible = false;
        wrapper.visible = true;
      }).catch(err => {
        console.log("error while fetching data from dtv", err);
        Router.navigate('menu');
      });
    }

    _init() {
      this.D = 7;
      this.currentCellIndex = 0;
      this.currentlyFocusedRow = 0;
      this.strtindexesofrows = [];
      this.cursorInstance = this.tag('CellCursor');
      this.loadingAnimation = this.tag("Loader").animation({
        duration: 3,
        repeat: -1,
        stopMethod: "immediate",
        actions: [{
          p: "rotation",
          v: {
            sm: 0,
            0: 0,
            1: 2 * Math.PI
          }
        }]
      });
    }

    _unfocus() {
      this.tag("Wrapper").visible = false;
      this.tag("Loader").visible = true; //resetting all variables

      this.D = 7;
      this.currentCellIndex = 0;
      this.currentlyFocusedRow = 0;
      this.strtindexesofrows = [];
    }

    serviceList() {
      let arr = [{
        shortname: 'Amazon Prime',
        dvburi: 'OTT',
        lcn: 0
      }, {
        shortname: 'Netflix',
        dvburi: 'OTT',
        lcn: 0
      }, {
        shortname: 'Youtube',
        dvburi: 'OTT',
        lcn: 0
      }];
      return new Promise((resolve, reject) => {
        return resolve(arr);
      });
    } // scheduleEvents(dvburi) {
    //   let method = 'scheduleEvents@' + dvburi
    //   return new Promise((resolve, reject) => {
    //       ((result) => {
    //         console.log("scheduleEventsResult: ", JSON.stringify(result));
    //         for (let show of result) {
    //           show.starttime *= 1000;
    //           show.duration *= 1000;
    //         }
    //         console.log("result",result)
    //       return  resolve(result);
    //       })
    //   });
    // }


    scrollHorizontally(n) {
      if (n < 0) {
        let prevShow = this.channels[this.D - (8 - this.currentlyFocusedRow)].shows[this.gridInstance[this.currentCellIndex].showIndex - 1]; // this.ltp = new Date(Math.max(prevShow.starttime, this.closest30MinRoundOff))

        this.ltp = new Date(Math.max(prevShow.starttime));
        this.setShows4Channels(this.activeChannels);
        this.currentCellIndex = this.strtindexesofrows[this.currentlyFocusedRow];
        this.cellTimeTracker = this.gridInstance[this.currentCellIndex].starttime;
        this.updateCursor();
      } else {
        let nextShow = this.channels[this.D - (8 - this.currentlyFocusedRow)].shows[this.gridInstance[this.currentCellIndex].showIndex + 1];

        if (nextShow.duration > 3 * 60 * 60 * 1000) {
          this.ltp = new Date(nextShow.starttime);
        } else {
          let l = nextShow.starttime + nextShow.duration - 3 * 60 * 60 * 1000;
          this.ltp = new Date(l);
        }

        this.setShows4Channels(this.activeChannels);
        this.currentCellIndex = this.strtindexesofrows[this.currentlyFocusedRow + 1] - 1;
        this.cellTimeTracker = this.gridInstance[this.currentCellIndex].starttime;
        this.updateCursor();
      }

      this.setTimeLabelsBetween();
      this.setBoldText();
    }

    _onChanged() {
      this.widgets.menu.updateTopPanelText(Language.translate('Guide'));
    }

    pageTransition() {
      return 'up';
    }

    _handleLeft() {
      Router.focusWidget('Menu');
    }

    _handleUp() {
      this.widgets.menu.notify('TopPanel');
    }

    static _states() {
      return [class CellSelector extends this {
        $enter() {}

        _handleLeft() {
          this.unpaintCell();

          if (this.currentCellIndex > this.strtindexesofrows[this.currentlyFocusedRow]) {
            this.currentCellIndex--;
            this.cellTimeTracker = this.gridInstance[this.currentCellIndex].starttime;
            this.updateCursor();
          } else if (this.gridInstance[this.currentCellIndex].showIndex > 0) {
            this.scrollHorizontally(-1);
          } else console.log("can't traverse any left");

          this.paintCell();
        }

        _handleRight() {
          this.unpaintCell();
          this.channels[this.D - (8 - this.currentlyFocusedRow)].shortname;

          if (this.currentCellIndex < this.strtindexesofrows[this.currentlyFocusedRow + 1] - 1) {
            this.currentCellIndex++;
            this.cellTimeTracker = this.gridInstance[this.currentCellIndex].starttime;
            this.updateCursor();
          } else if (this.gridInstance[this.currentCellIndex].showIndex < this.channels[this.D - (8 - this.currentlyFocusedRow)].shows.length - 1) {
            //current Cell index has to be updated at last
            this.scrollHorizontally(1);
          } else console.log("can't go further right");

          this.paintCell();
        }

        binarySearch(t, left, right) {
          const lim = left;
          t = new Date(t);
          let mid;

          while (left <= right) {
            mid = left + Math.floor((right - left) / 2);
            const sTime = new Date(this.gridInstance[mid].starttime);
            const eTime = new Date(this.gridInstance[mid].endtime);
            if (t >= sTime && t < eTime) return mid;else if (sTime > t) right = mid - 1;else left = mid + 1;
          }

          mid = Math.max(lim, left - 1);
          return mid;
        }

        _handleDown() {
          this.unpaintCell();
          this.unsetBoldText();

          if (this.currentlyFocusedRow < this.verticallyNonScrollableWindow) {
            let t = this.cellTimeTracker;
            this.currentlyFocusedRow++;
            let left = this.strtindexesofrows[this.currentlyFocusedRow];
            let right = this.strtindexesofrows[this.currentlyFocusedRow + 1] - 1;
            let idx = this.binarySearch(t, left, right);
            this.currentCellIndex = idx;
            this.updateCursor();
          } else if (this.D < this.channels.length) {
            let t = this.cellTimeTracker;
            this.scrollVertically(1); //---------------------------------

            let left = this.strtindexesofrows[this.currentlyFocusedRow];
            let right = this.strtindexesofrows[this.currentlyFocusedRow + 1] - 1;
            let idx = this.binarySearch(t, left, right); //---------------------------------

            this.currentCellIndex = idx;
            this.updateCursor();
          } else console.log("can't go any further ,it's the last row");

          this.setBoldText();
          this.paintCell();
        }

        _handleUp() {
          this.unpaintCell();
          this.unsetBoldText();

          if (this.currentlyFocusedRow > 0) {
            let t = this.cellTimeTracker;
            this.currentlyFocusedRow--;
            let left = this.strtindexesofrows[this.currentlyFocusedRow];
            let right = this.strtindexesofrows[this.currentlyFocusedRow + 1] - 1;
            let idx = this.binarySearch(t, left, right);
            this.currentCellIndex = idx;
            this.updateCursor();
          } else if (this.D > 8) {
            let t = this.cellTimeTracker;
            this.scrollVertically(-1); //---------------------------------

            let left = this.strtindexesofrows[this.currentlyFocusedRow];
            let right = this.strtindexesofrows[this.currentlyFocusedRow + 1] - 1;
            let idx = this.binarySearch(t, left, right); //---------------------------------

            this.currentCellIndex = idx;
            this.updateCursor();
          } else console.log("can't go any further , it's the first row");

          this.setBoldText();
          this.paintCell();
        }

        updateDayLabel(starttime) {
          let daylabel = this.tag('DayLabel');
          setTimeout(function () {
            let today = new Date();
            today.setHours(0);
            today.setMinutes(0);
            today.setSeconds(0);
            today.setMilliseconds(0);
            let t = today.getTime();
            t = starttime - t;
            let day = 24 * 60 * 60 * 1000;

            if (t < day) {
              daylabel.text = 'TODAY';
            } else if (t < 2 * day) {
              daylabel.text = 'TOMORROW';
            } else {
              let cellStartTime = new Date(starttime);
              daylabel.text = cellStartTime.getDate() + '-' + (cellStartTime.getMonth() + 1) + '-' + cellStartTime.getFullYear();
            }
          }, 0);
        }

        updateInfoLabels() {
          let currentCell = this.gridInstance[this.currentCellIndex];
          this.tag('ChannelName').text.text = this.channelGridInstance[this.currentlyFocusedRow].title.text;
          this.tag('ShowName').text.text = currentCell.txt;
          this.tag('ShowDetails').text.text = currentCell.description;
          let s = new Date(currentCell.starttime);
          let e = new Date(currentCell.endtime);
          let ehours = e.getHours();
          let eminutes = e.getMinutes();
          if (eminutes.toString().length < 2) eminutes = '0' + eminutes;

          if (ehours >= 12) {
            eminutes = eminutes + 'p';

            if (ehours > 12) {
              ehours -= 12;
            }
          }

          let shours = s.getHours();
          let sminutes = s.getMinutes();

          if (sminutes.toString().length < 2) {
            sminutes = '0' + sminutes;
          }

          if (shours > 12) {
            shours -= 12;
          }

          this.tag('ShowTimings').text.text = "".concat(shours, ":").concat(sminutes, " - ").concat(ehours, ":").concat(eminutes);
          this.updateDayLabel(currentCell.starttime);
        }

        updateCursor() {
          let x = this.gridInstance[this.currentCellIndex].x;
          let y = this.gridInstance[this.currentCellIndex].y;
          let w = this.gridInstance[this.currentCellIndex].w;
          let self = this;
          setTimeout(function () {
            self.updateInfoLabels();
          }, 0);
          this.cursorInstance.patchCursor(x, y, w);
        }

        $exit() {
          console.log('exiting from state - CellSelector');
        }

      }];
    }

  }

  var routes = {
    root: "menu",
    routes: [...route$1.network, {
      path: 'menu',
      component: MainView,
      widgets: ['Menu']
    }, {
      path: 'player',
      component: AAMPVideoPlayer
    }, {
      path: 'apps',
      component: AppStore,
      widgets: ['Menu']
    }, {
      path: 'settings',
      component: SettingsScreen,
      widgets: ['Menu']
    }, {
      path: 'epg',
      component: Epg,
      widgets: ['Menu', 'Volume']
    }]
  };

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
  const config = {
    host: '127.0.0.1',
    port: 9998,
    default: 1
  };
  const thunder = thunderJS(config);
  const appApi = new AppApi();
  function keyIntercept() {
    const rdkshellCallsign = 'org.rdk.RDKShell';
    thunder.Controller.activate({
      callsign: rdkshellCallsign
    }).then(result => {
      Log.info('Successfully activated RDK Shell');
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call('org.rdk.RDKShell', 'setFocus', {
        client: 'ResidentApp'
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'ResidentApp',
        keyCode: keyMap.AudioVolumeMute,
        modifiers: []
      }).then(result => {
        Log.info('addKeyIntercept success');
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.on(rdkshellCallsign, 'onSuspended', notification => {
        if (notification) {
          Log.info('onSuspended notification: ' + notification.client);

          if (Storage.get('applicationType') == notification.client) {
            Storage.set('applicationType', '');
            appApi.setVisibilityandFocus('ResidentApp', true);
            thunder.call('org.rdk.RDKShell', 'moveToFront', {
              client: 'ResidentApp'
            }).then(result => {
              Log.info('ResidentApp moveToFront Success');
            });
            thunder.call('org.rdk.RDKShell', 'setFocus', {
              client: 'ResidentApp'
            }).then(result => {
              Log.info('ResidentApp setFocus Success');
            });
          }
        }
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'ResidentApp',
        keyCode: keyMap.Escape,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'ResidentApp',
        keyCode: keyMap.F1,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'ResidentApp',
        keyCode: keyMap.Inputs_Shortcut,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'ResidentApp',
        keyCode: keyMap.Picture_Setting_Shortcut,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'ResidentApp',
        keyCode: keyMap.Power,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'ResidentApp',
        keyCode: keyMap.F7,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'ResidentApp',
        keyCode: keyMap.AudioVolumeUp,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'ResidentApp',
        keyCode: keyMap.AudioVolumeDown,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'foreground',
        keyCode: keyMap.AudioVolumeDown,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'foreground',
        keyCode: keyMap.AudioVolumeUp,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'foreground',
        keyCode: keyMap.AudioVolumeMute,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'ResidentApp',
        keyCode: keyMap.MediaFastForward,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'ResidentApp',
        keyCode: 142,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'ResidentApp',
        keyCode: keyMap.Home,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'ResidentApp',
        keyCode: keyMap.MediaRewind,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'ResidentApp',
        keyCode: keyMap.Pause,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'Cobalt',
        keyCode: keyMap.Escape,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'Amazon',
        keyCode: keyMap.Escape,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'Cobalt',
        keyCode: keyMap.Home,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'Amazon',
        keyCode: keyMap.Home,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'Cobalt',
        keyCode: keyMap.Backspace,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    }).then(result => {
      thunder.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'Amazon',
        keyCode: keyMap.Backspace,
        modifiers: []
      }).catch(err => {
        Log.info('Error', err);
      });
    }).catch(err => {
      Log.info('Error', err);
    });
  }

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
  /**
   * Class to render items in side panel.
   */

  class SidePanelItem extends lng$1.Component {
    /**
     * Function to render various elements in the side panel item.
     */
    static _template() {
      return {
        Item: {
          rect: true,
          Image: {
            w: 70,
            H: 70
          },
          Title: {
            text: {
              fontFace: CONFIG.language.font,
              fontSize: 40,
              textColor: 0xffffffff
            }
          }
        }
      };
    }

    _init() {
      this.tag('Image').patch({
        src: Utils.asset(this.data.url),
        w: this.w,
        h: this.h,
        scale: this.unfocus
      });
    }
    /**
     * Function to change properties of item during focus.
     */


    _focus() {
      this.tag('Image').patch({
        w: this.w,
        h: this.h,
        scale: this.focus,
        color: CONFIG.theme.hex
      });
    }
    /**
     * Function to change properties of item during unfocus.
     */


    _unfocus() {
      this.tag('Image').patch({
        w: this.w,
        h: this.h,
        scale: this.unfocus,
        color: 0xffffffff
      });
    }

    setColor() {
      this.tag('Image').patch({
        w: this.w,
        h: this.h,
        scale: this.focus,
        color: CONFIG.theme.hex
      });
    }

    clearColor() {
      this.tag('Image').patch({
        w: this.w,
        h: this.h,
        scale: this.unfocus,
        color: 0xffffffff
      });
    }

  }

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
  /** Class for side panel in home UI */

  class SidePanel extends lng$1.Component {
    static _template() {
      return {
        color: 0xff000000,
        rect: true,
        y: 270,
        w: 200,
        h: 810,
        SidePanel: {
          x: 0,
          y: 127,
          w: 240,
          h: 750,
          type: lng$1.components.ListComponent,
          roll: true,
          horizontal: false,
          invertDirection: true
        }
      };
    }

    _init() {
      this.homeApi = new HomeApi();
      this.tag('SidePanel').sidePanelItems = this.homeApi.getSidePanelInfo();
      this.sidePanelData = this.homeApi.getSidePanelInfo();

      this._setState('SidePanel');

      this.indexVal = 0;
      this.prevIndex = 0;
    }
    /**
     * Function to set items in side panel.
     */


    set sidePanelItems(items) {
      this.tag('SidePanel').patch({
        x: 105
      });
      this.tag('SidePanel').items = items.map((info, index) => {
        this.data = info;
        return {
          w: 50,
          h: 50,
          y: index == 0 ? 20 : (index + 1) * 20,
          type: SidePanelItem,
          data: info,
          focus: 1.1,
          unfocus: 1,
          x_text: 100,
          y_text: 160,
          text_focus: 1.1,
          text_unfocus: 0.9
        };
      });
      this.tag('SidePanel').start();
    }
    /**
     * Function to reset items in side panel.
     */


    set resetSidePanelItems(items) {
      this.tag('SidePanel').patch({
        x: 0
      });
      this.tag('SidePanel').items = items.map((info, index) => {
        return {
          w: 204,
          h: 184,
          y: index == 0 ? 25 : index == 1 ? 105 : index == 2 ? 260 : 470,
          type: SidePanelItem,
          data: info,
          focus: 0.7,
          unfocus: 0.4,
          x_text: 100,
          y_text: 160,
          text_focus: 1.1,
          text_unfocus: 0.9
        };
      });
      this.tag('SidePanel').start();
    }
    /**
     * Function to set scaling to side panel.
     */


    set scale(scale) {
      this.tag('SidePanel').patch({
        scale: scale
      });
    }
    /**
     * Function to set x coordinate of side panel.
     */


    set x(x) {
      this.tag('SidePanel').patch({
        x: x
      });
    }
    /**
     * Function to set index value of side panel.
     */


    set index(index) {
      this.tag('SidePanel').items[this.prevIndex].clearColor();
      this.indexVal = index;
    }

    set deFocus(val) {
      if (val) {
        this.tag('SidePanel').items[this.prevIndex].clearColor();
      } else {
        this.tag('SidePanel').items[this.prevIndex].setColor();
      }
    }

    set scrollableLastRow(bool) {
      this.isLastRowScrollable = bool;
    }

    static _states() {
      return [class SidePanel extends this {
        _getFocused() {
          if (this.tag('SidePanel').length) {
            return this.tag('SidePanel').items[this.indexVal];
          }
        }

        _handleKey(key) {
          if (key.keyCode == keyMap.ArrowRight || key.keyCode == keyMap.Enter) {
            if (this.prevIndex != this.indexVal) {
              this.tag('SidePanel').items[this.prevIndex].clearColor();
            }

            this.prevIndex = this.indexVal;
            this.fireAncestors('$goToMainView', this.tag('SidePanel').items[this.indexVal], this.indexVal);
          } else if (key.keyCode == keyMap.ArrowDown) {
            if (this.tag('SidePanel').length - 1 != this.indexVal) {
              this.indexVal = this.indexVal + 1;
            }

            return this.tag('SidePanel').items[this.indexVal];
          } else if (key.keyCode == keyMap.ArrowUp) {
            if (0 === this.indexVal) {
              this.fireAncestors('$goToTopPanel', 0);
            } else {
              this.indexVal = this.indexVal - 1;
              return this.tag('SidePanel').items[this.indexVal];
            }
          }
        }

      }];
    }

  }

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
  /** Class for top panel in home UI */

  class TopPanel extends lng$1.Component {
    static _template() {
      return {
        TopPanel: {
          color: 0xff000000,
          rect: true,
          w: 1920,
          h: 270,
          Mic: {
            x: 105,
            // zIndex: 2,
            y: 87,
            src: Utils.asset('/images/topPanel/microphone.png'),
            w: 50,
            h: 50
          },
          Logo: {
            x: 200,
            y: 90,
            src: Utils.asset('/images/' + CONFIG.theme.logo),
            w: 227,
            h: 43
          },
          Page: {
            x: 200,
            y: 184,
            // mountY: 0.5,
            text: {
              fontSize: 40,
              text: Language.translate('home'),
              textColor: CONFIG.theme.hex,
              fontStyle: 'bolder',
              fontFace: CONFIG.language.font,
              wordWrapWidth: 1720,
              maxLines: 1
            }
          },
          Settings: {
            x: 1825 - 105 - 160 - 37 + 30,
            y: 111,
            mountY: 0.5,
            src: Utils.asset('/images/topPanel/setting.png'),
            w: 37,
            h: 37
          },
          Time: {
            x: 1920 - 105 - 160,
            y: 111,
            mountY: 0.5,
            text: {
              text: '',
              fontSize: 35,
              fontFace: CONFIG.language.font
            },
            w: 160,
            h: 60
          }
        }
      };
    }

    changeTimeZone(time) {
      this.zone = time;
    }

    updateZone(res) {
      this.zone = res;
    }

    _construct() {
      this.indexVal = 1;
      this.audiointerval = null;
      this.zone = null; // declaring this variable to keep track of zone changes

      this.appApi = new AppApi();
      this.appApi.getZone().then(res => {
        this.updateZone(res);
      });
      this.zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    set index(index) {
      this.indexVal = index;
    }

    _focus() {
      this._setState('Setting');

      this.tag('Settings').color = CONFIG.theme.hex;
    }

    set changeText(text) {
      this.tag('Page').text.text = text;

      if (text === 'Home') {
        this.tag('Settings').color = 0xffffffff;
      }
    }
    /**
    *
    * @param {boolean} toggle
    * Function to change the mic icon.
    */


    set changeMic(toggle) {
      if (toggle) {
        this.tag('Mic').src = Utils.asset('/images/topPanel/microphone_mute.png');
      } else {
        this.tag('Mic').src = Utils.asset('/images/topPanel/microphone.png');
      }
    }

    _build() {
      Registry.setInterval(() => {
        let _date = this._updateTime(this.zone);

        if (this.zone) {
          this.tag('Time').patch({
            text: {
              text: _date.strTime
            }
          });
        }
      }, 1000);
    }

    updateIcon(tagname, url) {
      this.tag(tagname).patch({
        src: Utils.asset(url)
      });
    }
    /**
     * Function to update time in home UI.
     */


    _updateTime(zone) {
      if (zone != null) {
        let date = new Date();
        date = new Date(date.toLocaleString('en-US', {
          timeZone: zone
        })); // get day

        let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let strDay = days[date.getDay()]; // get month

        let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let strMonth = month[date.getMonth()];
        let strDate = date.toLocaleDateString('en-US', {
          day: '2-digit'
        }) + ' ' + strMonth + ' ' + date.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        let strTime = hours + ':' + minutes + ' ' + ampm;
        return {
          strTime,
          strDay,
          strDate
        };
      } else {
        return "";
      }
    }

    static _states() {
      return [class Mic extends this {
        $enter() {
          this.tag('Mic').color = CONFIG.theme.hex;
        }

        _getFocused() {
          this.tag('Mic').color = CONFIG.theme.hex;
        }

        $exit() {
          this.tag('Mic').color = 0xffffffff;
        }

        _handleKey(key) {
          if (key.keyCode == keyMap.ArrowRight) {
            this._setState('Setting');
          } else if (key.keyCode == keyMap.ArrowDown) {
            this.tag('Mic').color = 0xffffffff;
            this.fireAncestors('$goToSidePanel', 0);
          }
        }

      }, class Setting extends this {
        $enter() {
          this.tag('Settings').color = CONFIG.theme.hex;
        }

        _handleKey(key) {
          if (key.keyCode === keyMap.ArrowDown) {
            Router.focusPage();
            this.tag('Settings').color = 0xffffffff;
          } else if (key.keyCode === keyMap.ArrowLeft) ; else if (key.keyCode === keyMap.Enter) {
            //this.tag('Page').text.text = Language.translate('settings')
            Router.navigate('settings');
            Router.focusPage();
            this.tag('Settings').color = 0xffffffff;
          }
        }

        $exit() {
          this.tag('Settings').color = 0xffffffff;
        }

      }];
    }

  }

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
  var route = {
    1: () => {
      Router.navigate('epg');
      Router.focusPage();
    },
    3: () => {
      Router.navigate('apps');
      Router.focusPage();
    },
    'default': () => {
      Router.navigate('menu');
      Router.focusPage();
    }
  };
  class Menu extends lng$1.Component {
    static _template() {
      return {
        TopPanel: {
          type: TopPanel
        },
        SidePanel: {
          type: SidePanel
        }
      };
    }

    pageTransition() {
      return 'down';
    }

    _init() {
      this.homeApi = new HomeApi();
      this.tag('SidePanel').sidePanelItems = this.homeApi.getSidePanelInfo();
    }

    _focus() {
      if (!this.mainView) {
        this.mainView = Router.activePage();
      }

      this._setState('SidePanel');
    }

    _handleRight() {
      Router.focusPage();
    }

    $goToTopPanel() {
      this._setState('TopPanel');

      Router.focusWidget('Menu');
    }

    $goToSidePanel() {
      this._setState('SidePanel');
    }

    $goToMainView(sidePanelInstance, index) {
      if (route[index]) {
        route[index]();
      } else {
        route['default']();
      }

      sidePanelInstance.setColor();
      return;
    }

    refreshMainView() {
      if (this.mainView) {
        this.mainView.refreshFirstRow();
      }
    }

    setIndex(index) {
      this.tag('SidePanel').index = index;
    }

    notify(val) {
      if (val === 'TopPanel') {
        Router.focusWidget('Menu');

        this._setState('TopPanel');
      }
    }

    $scroll(val) {
      if (this.mainView) {
        this.mainView.scroll(val);
      }
    }

    updateTimeZone(timezone) {
      this.tag('TopPanel').changeTimeZone(timezone);
    }

    updateTopPanelText(text) {
      this.tag('TopPanel').changeText = text;
    }

    static _states() {
      return [class SidePanel extends this {
        _getFocused() {
          return this.tag('SidePanel');
        }

      }, class TopPanel extends this {
        _getFocused() {
          return this.tag('TopPanel');
        }

      }];
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
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
   */
  var powerState = 'ON';
  class App extends Router.App {
    static getFonts() {
      return [{
        family: CONFIG.language.font,
        url: Utils.asset('fonts/' + CONFIG.language.fontSrc)
      }];
    }

    _setup() {
      Router.startRouter(routes, this);

      document.onkeydown = e => {
        if (e.keyCode == keyMap.Backspace) {
          e.preventDefault();
        }
      };
    }

    static _template() {
      return {
        Pages: {
          // this hosts all the pages
          forceZIndexContext: true
        },
        Widgets: {
          Menu: {
            type: Menu
          }
        }
      };
    }

    static language() {
      return {
        file: Utils.asset('language/language-file.json'),
        language: CONFIG.language.id
      };
    }

    _init() {
      keyIntercept();
      thunder$1.on('Controller.1', 'all', noti => {
        if (noti.data.url && noti.data.url.slice(-5) === "#boot") {
          // to exit metro apps by pressing back key
          this.appApi.suspendOrDestroyApp(Storage.get('applicationType'), 'destroy');
        }
      });
    }

    powerStandby(value) {
      Log.info("standby");

      if (value == 'Back') ; else {
        if (powerState == 'ON') {
          Log.info("Power state was on trying to set it to standby");
          this.appApi.standby(value).then(res => {
            if (res.success) {
              Log.info("successfully set to standby");
              powerState = 'STANDBY';

              if (Storage.get('applicationType') !== '' && Storage.get('ipAddress')) {
                let callSign = Storage.get('applicationType'); // this.appApi.deactivateWeb();

                Settings.get("platform", "disableSuspendedApps") ? this.appApi.suspendOrDestroyApp(callSign, 'suspend') : this.appApi.suspendOrDestroyApp(callSign, 'destroy');
                Storage.set('applicationType', '');
              } else {
                if (!Router.isNavigating() && Router.getActiveHash() === 'player') {
                  Router.navigate('menu');
                }
              }

              thunder$1.call('org.rdk.RDKShell', 'moveToFront', {
                client: 'ResidentApp'
              }).then(result => {
                Log.info('ResidentApp moveToFront Success' + JSON.stringify(result));
              }).catch(err => {
                Log.error("error while moving the resident app to front = ".concat(err));
              });
              thunder$1.call('org.rdk.RDKShell', 'setFocus', {
                client: 'ResidentApp'
              }).then(result => {
                Log.info('ResidentApp setFocus Success' + JSON.stringify(result));
              }).catch(err => {
                Log.error('Error', err);
              });
            }
          });
          return true;
        }
      }
    }

    _captureKey(key) {
      Log.info("capture key", key, key.keyCode);

      if (key.keyCode == keyMap.Home || key.keyCode === keyMap.m || key.keyCode === keyMap.Escape) {
        if (Storage.get('applicationType') != '') {
          Log.info("home key resident focus");
          Settings.get("platform", "disableSuspendedApps") ? this.appApi.suspendOrDestroyApp(Storage.get('applicationType'), 'suspend').then(res => {
            if (res) {
              if (Router.getActiveHash().startsWith("tv-overlay")) {
                Router.navigate('menu');
              }
            }
          }) : this.appApi.suspendOrDestroyApp(Storage.get('applicationType'), 'destroy').then(res => {
            if (res) {
              if (Router.getActiveHash().startsWith("tv-overlay")) {
                Router.navigate('menu');
              }
            }
          });
          Storage.set('applicationType', '');
        } else {
          Log.info("home key regular");

          if (!Router.isNavigating()) {
            Router.navigate('menu');
          }
        }

        return true;
      }

      if (key.keyCode == keyMap.Amazon) {
        Storage.set('applicationType', 'Amazon');
        this.launchApp('Amazon');
        return true;
      }

      if (key.keyCode == keyMap.Youtube) {
        Storage.set('applicationType', 'Cobalt');
        this.appApi.launchApp('Cobalt');
        return true;
      }

      if (key.keyCode == keyMap.Netflix) {
        Storage.set('applicationType', 'Netflix');
        this.launchApp('Netflix');
        return true;
      }

      if (key.keyCode == keyMap.Power) {
        // Remote power key and keyboard F1 key used for STANDBY and POWER_ON
        if (powerState == 'ON') {
          this.powerStandby('STANDBY');
          return true;
        } else if (powerState == 'STANDBY') {
          this.appApi.standby("ON").then(res => {
            powerState = 'ON';
          });
          return true;
        }
      } else if (key.keyCode == 228) {
        Log.info("___________DEEP_SLEEP_______________________F12");
        this.appApi.standby("DEEP_SLEEP").then(res => {
          powerState = 'DEEP_SLEEP';
        });
        return true;
      }

      return false;
    }

    addKeyIntercepts() {
      var rdkshellCallsign = "org.rdk.RDKShell";
      thunder$1.call(rdkshellCallsign, 'addKeyIntercept', {
        client: 'ResidentApp',
        keyCode: keyMap.Home,
        modifiers: []
      }).catch(err => {
        Log.error('Error', err);
      });
    }

    $setEventListeners() {
      var self = this;
      setTimeout(function () {
        Log.info("creating app api instance for appjs");
        self.appApi = new AppApi();
      }, 0);
      setTimeout(function () {
        Log.info("registering for the event statechange");
        thunder$1.on('Controller', 'statechange', notification => {
          Log.info("state change", JSON.stringify(notification));

          if (notification && (notification.callsign === 'Cobalt' || notification.callsign === 'Amazon' || notification.callsign === 'Lightning' || notification.callsign === 'Netflix') && notification.state == 'Deactivation') {
            Storage.set('applicationType', '');
            self.appApi.setVisibilityandFocus('ResidentApp', true);
            thunder$1.call('org.rdk.RDKShell', 'moveToFront', {
              client: 'ResidentApp'
            }).then(result => {
              Log.info('ResidentApp moveToFront Success' + JSON.stringify(result));
            }).catch(err => {
              Log.error('Error', err);
            });
          }

          if (notification && (notification.callsign === 'Cobalt' || notification.callsign === 'Amazon' || notification.callsign === 'Lightning' || notification.callsign === 'Netflix') && notification.state == 'Activated') {
            Storage.set('applicationType', notification.callsign);
            self.appApi.setFocus(notification.callsign);
          }
        });
      }, 0);
      Log.info("registering for event controller.all");
      thunder$1.on('Controller.1', 'all', noti => {
        if (noti.data.url && noti.data.url.slice(-5) === "#boot") {
          // to exit metro apps by pressing back key
          Settings.get("platform", "disableSuspendedApps") ? this.appApi.suspendOrDestroyApp(Storage.get('applicationType'), 'suspend') : this.appApi.suspendOrDestroyApp(Storage.get('applicationType'), 'destroy');
        }
      });
      Log.info("adding key intercepts");
      self.addKeyIntercepts();
    }

  }

  function index () {
    return Launch(App, ...arguments);
  }

  return index;

})();
