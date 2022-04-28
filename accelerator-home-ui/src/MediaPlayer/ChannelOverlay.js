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
 import { Lightning, Utils } from '@lightningjs/sdk'
 import { CONFIG } from '../Config/Config'
import ChannelItem from './ChannelItem'
let channelIndex = 0
let customChannels
let customChannelUrl = "http://127.0.0.1:50050/lxresui/static/moreChannels/ChannelData.json"
fetch(customChannelUrl)
        .then(res => res.json())
        .then((out) => {
          customChannels=out.data
        })
        .catch(err => { throw err });

 export default class ChannelOverlay extends Lightning.Component {
    /**
     * Function to create components for the player controls.
     */
    static _template() {
      return {
        Wrapper:{
          clipping: true,
          w:232,
          h:900,
          Channels:{
            y:5,
            w:232,
            h:891,
            type:Lightning.components.ListComponent,
            // clipping:true,
            itemSize:81,
            roll: true,
            horizontal: false,
            invertDirection: true,
            itemScrollOffset: -10,
          }
        }
      }
    }

    _init(){

    }
    _focus(){
      var options = []
      if(typeof customChannels == "object"){
        options=[...customChannels,...options]
      }
      // this.tag('Channels').items = options.map((item,index) => {
      //   return{
      //       type:ChannelItem,
      //       index:index,
      //       item:item,
      //   }
      // })
      this.$focusChannel(channelIndex)
    }

    $focusChannel(index){
      channelIndex=index
      this.tag('Channels').setIndex(index)
    }
    _getFocused(){
      return this.tag('Channels').element // add logic to focus on current channel
      
    }

    _handleDown(){
      this.tag('Channels').setNext()
    }

    _handleUp(){
      this.tag('Channels').setPrevious()
    }
}