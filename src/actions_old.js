
import {
  Dropdown,
  Icon
} from "semantic-ui-react";


export class CardsCornerPopup extends React.Component {
    constructor(props) {
      super(props);
      this.handleSendToOpenMedia = this.handleSendToOpenMedia.bind(this);

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



      console.log(this.props.itemJSON);
    }

  handleDownload(e) {
    console.log(this.props.itemJSON);
  }


    render() {
      return (
       
          <Dropdown
            onClick={e => e.preventDefault()}

            className="icon"
            icon={<Icon link name="ellipsis vertical" size="large" color="grey" />}
            style={{float:"right"}}
          >
            <Dropdown.Menu style={{ left: "auto", right: 0 }}>
              <Dropdown.Item text="Link to..." icon="share" onClick={this.handleSendToOpenMedia}/>
              <Dropdown.Item text="Download" icon="download" as="a" href="https://demo.medox.scisys.de:8443/dira6/api/v10/images/5a2fcbd9fd863b1a64022751/files/5a3d0e83c64ec31b7c9bc97d.JPG" download />
              
        </Dropdown.Menu>
          </Dropdown>
        
              );
    }
  }