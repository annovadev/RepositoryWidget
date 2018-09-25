//import { CardsCornerPopup, ModalViewButtons } from "./actions";

import {   Dropdown,  Icon,  Button,  Modal } from "semantic-ui-react";
import download from "./download.js";
import React from "react";
import {fetch_getConfig} from "./fetch";


var omSettings = [];
//var omTemplateId  = null;
//var omDirectoryId = null;
//var omPoolId      = null;
//var omSystemId    = null;

   
//# sourceMappingURL=content.js.map


export class CardsContextMenu extends React.Component {
  constructor(props) {
    super(props);
    this.handleSendToOpenMedia = this.handleSendToOpenMedia.bind(this);

    this.state = {
      defaults : null,
    };
  }

  

  handleDownload(e) {

    
      let sUrl = e.highres;
      download(sUrl);
      
    }

  

   onStartedDownload(id) {
    console.log(`Started downloading: ${id}`);
  }
  
   onFailed(error) {
    console.log(`Download failed: ${error}`);
  }

  handleSendToOpenMedia(e) {

		fetch_getConfig().then(
      function(data) {
     console.log(data)
     omSettings.omTemplateId  = data.defaults.templateId;
     omSettings.omDirectoryId = data.defaults.directoryId;
     omSettings.omPoolId      = data.defaults.poolId;
     omSettings.omSystemId    = data.defaults.systemId;
         console.log(omSettings);
      });

     

        var WpLib = OMWebPluginLib;
        var OMApi = OMWebPluginLib.OMApi;
        var builder = WpLib.Plugin.SamePageBuilder.create();
        var pluginResult = builder.createPluginSafe();
        if (pluginResult == null)
            return;
        var plugin = pluginResult;
        var config = builder.getPluginConfig();

        var api = plugin.getApi();


        var fields = [
          OMApi.stringField(e.title, 8),                       // Beispiel, um ein Stirng-Feld zu setzen (hier Titel)
          OMApi.stringField(e.highres, 401),                     //Beispiel, um ein Stirng-Feld zu setzen (hier URL/http-Link)
      //    OMApi.intField(1, 1015),                                  //Beispiel, um ein Integer-Feld zu setzen (hier Status Feld)
      //    OMApi.dateTimeField("2018-07-25T10:36:06.0000000Z",5004), //Beispiel, um ein Date-Time zu setzen 
      //    OMApi.timeSpanField(90000, 1028)                          //Beispiel, um ein TimeSpan-Feld zu setzen (90000 ms => 1:30 min )
      ];

      console.log("create File");
    
      api.createDocumentEx(omSettings.omTemplateId, { lowId: omSettings.omDirectoryId, poolId: omSettings.omPoolId, systemId: omSettings.omSystemId }, fields)
          .then(function (fileDocument) {

                api.ui.linkToNew(fileDocument)
            
         })
          .catch(function (reason) {
          console.error(reason);
          WpLib.Message.isError(reason) && alert(reason.message);
     
    });

  }



  render() {
    return (

      

 

      <Dropdown
        onClick={e => e.preventDefault()}
        className="icon"
        icon={<Icon link name="ellipsis vertical" size="large" color="grey" />}
        style={{ float: "right" }}>
        <Dropdown.Menu style={{ left: "auto", right: 0 }}>
          <Dropdown.Item
            text="Link to..."
            icon="plus"
            onClick={() => this.handleSendToOpenMedia(this.props.rawItem)}
          />
          <Dropdown.Item
            text="Download"
            icon="share"
            download
            type="application/octet-stream"
          
        onClick={() => this.handleDownload(this.props.rawItem)}
    >
  
      </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

    );
  }
}
