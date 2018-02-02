import React from "react";
import { render } from "react-dom";
import { CardsCornerPopup, ModalViewButtons } from "./actions_new";

import {   Dropdown,  Icon,  Button,  Modal } from "semantic-ui-react";

"use strict";


	
	
   
//# sourceMappingURL=content.js.map


export class CardsContextMenu extends React.Component {
  constructor(props) {
    super(props);
    this.handleSendToOpenMedia = this.handleSendToOpenMedia.bind(this);

    this.state = {};
  }

  

  handleDownload(e) {
    alert("no function defined for Download...")
    console.log(this.props.rawItem);
  }

  handleSendToOpenMedia(e) {
    var WpLib = OMWebPluginLib;
    var builder = WpLib.OMPlugin.SamePageBuilder.create();
    var config = builder.getPluginConfig();
    var plugin = WpLib.OMPlugin.createPlugin(builder);
   

    var templateId = 4104;
    var folderLoId = 4096;
    var poolId = 3;
    var systemId = null;
    var fields = [
// Now time to set fields
    WpLib.OMApi.stringField(this.props.rawItem.mainTitle, 8),
    WpLib.OMApi.stringField(this.props.formattedItem.description, 14),
    WpLib.OMApi.stringField(null, 15),
          WpLib.OMApi.intField(1, 5068) //value, field id
      ];
      var api = plugin.getApi();
      api.createDocument(templateId, folderLoId, poolId, systemId)
          .then(function (docId) {
    alert("Document successfully created: " + docId.lowId);
          return api.setFields(docId, fields);
    
      })
          .catch(function (reason) {
          alert('Action failed');
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
            text="Send to OpenMedia"
            icon="plus"
            onClick={this.handleSendToOpenMedia}
          />
          <Dropdown.Item
            text="Link to..."
            icon="share"
            onClick={this.handleDownload}
          />
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
