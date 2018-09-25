
import {
  Dropdown,
  Icon,
  Button,
  Modal
} from "semantic-ui-react";


export class ModalViewButtons extends React.Component {
  constructor(props) {
    super(props);
    this.handleSendToOpenMedia = this.handleSendToOpenMedia.bind(this);
    this.handleDownload = this.handleDownload.bind(this);

    this.state = {
      
    };
  }
  
    handleSendToOpenMedia(e) {


      var WpLib = OMWebPluginLib;
      var OMApi = OMWebPluginLib.OMApi;
      var builder = WpLib.Plugin.SamePageBuilder.create().onNotify(onHostNotify);
      //const plugin = WpLib.Plugin.createPlugin(builder)
      var pluginResult = builder.createPluginSafe();
      if (pluginResult == null)
          return;
      var plugin = pluginResult;
      var config = builder.getPluginConfig();

      var api = plugin.getApi();
      api.getCurrentDocumentId()
          .then(function (documentId) {
          //api.ui.linkToNew(documentId)
          //api.ui.linkToNew(documentId, { lowId: 4137 })
          api.ui.linkToNew(documentId, { lowId: 413799 });
          //api.ui.linkToNew(documentId, { systemId: "xxx" })
      }, function () {
          //Hello LinkToNew Test
          var systemId = "", poolId = 2, lowId = 56937;
          api.ui.linkToNew({ lowId: lowId, poolId: poolId, systemId: systemId });
      });



    
    //  console.log(this.props["cardexp_itemJSON"]);
    }

    handleDownload(e) {
      DownloadItem(this.props["cardexp_itemJSON"]);
    }
      render() {
        return (
         
           <Modal.Actions>
          <Button primary content="Link to..." icon="share" onClick={this.handleSendToOpenMedia} />
          <Button secondary content="Download" icon="download" onClick={this.handleDownload}/>
          </Modal.Actions>
        
        );
      }
    }

export class CardsCornerPopup extends React.Component {
    constructor(props) {
      super(props);
      this.handleSendToOpenMedia = this.handleSendToOpenMedia.bind(this);
     
      this.state = {
        
      };
    }
    
    handleSendToOpenMedia(e) {
      SendToOpenMedia(this.props["cardexp_itemJSON"]);
    //  console.log(this.props["cardexp_itemJSON"]);
    }



    render() {
      return (
       
          <Dropdown
            onClick={e => e.preventDefault()}

            className="icon"
            icon={<Icon link name="ellipsis vertical" color="grey" />}
            style={{float:"right"}}
          >
            <Dropdown.Menu style={{ left: "auto", right: 0 }}>
              <Dropdown.Item text="Link to OpenMedia" icon="share" onClick={this.handleSendToOpenMedia}/>
        </Dropdown.Menu>
          </Dropdown>
        
              );
    }
  }

function SendToOpenMedia (cardexp_itemJSON) {
  //  alert(e.target.id);
   // alert("Function SendToOpenMedia triggered: " + JSON.stringify(cardexp_itemJSON));
  
  }
  
  function DownloadItem (cardexp_itemJSON) {
    //  alert(e.target.id);
    alert("Function DownloadItem triggered: " +  JSON.stringify(cardexp_itemJSON));
    
    }