import React from "react";
import { render } from "react-dom";
import { AppContainer } from 'react-hot-loader'
import _ from "lodash";
import {
	Image,
	Icon,
	Button,
	Divider,
	Label,
	Input,
	Dropdown,
    Popup,
    Menu,
Segment,
	List,
	Form,
	Modal,
	Item,
	Dimmer,
	Message,
	Loader,
	TextArea,
	Checkbox,
	Feed,
	Comment
} from "semantic-ui-react";
import { fetch_getRepositories } from "../fetch.js";



var repIx = 0;
var repositoryUrl = "";
var autoUpdateIntervall = 0; 
var currentFolder	= "";
var authentication = [];
var query = "BLA"; 
var pluginConfig = {
    repIx: null,
    query: ""
};


var WpLib;
var OMApi;
var builder;
var pluginResult;
var plugin;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.handleOnSetField = this.handleOnSetField.bind(this);
        this.handleSetRepository = this.handleSetRepository.bind(this);
        this.state = {
          param1: "XX",
          repositories: null,
          defaults: null, 
        };
        

}

componentDidMount(){

    try{

    
     WpLib = OMWebPluginLib;
     OMApi = OMWebPluginLib.OMApi;
     builder = WpLib.Plugin.SamePageBuilder.create();
     pluginResult = builder.createPluginSafe();
    if (pluginResult == null){
        console.log("Client-API could not be initialized!")
    }
        //return;
     plugin = pluginResult;

    }
    catch(ex) {

    }



    fetch_getRepositories().then(
        function(data) {
       
            this.setState(prevState => ({
                repositories: data.repositories,
                defaults : data.defaults
        
            }));	
            repositoryUrl 		= this.state.repositories[repIx].repositoryUrl;
            autoUpdateIntervall = this.state.repositories[repIx].autoupdate;
            authentication		= this.state.repositories[repIx].authentication;

            console.log("Update" + autoUpdateIntervall)


      

        }.bind(this));
}

handleSetRepository(event,data)	{
	//	currentSearchPath = "\/";
        

   

        repIx = data.value;
        pluginConfig.repIx = repIx;
        plugin.postNotify(WpLib.Notify.Board.Module, WpLib.Notify.Board.SetWidgetConfig,pluginConfig);
   

		repositoryUrl = this.state.repositories[repIx].repositoryUrl;
        console.log("Current Plugin-Config: " + JSON.stringify(pluginConfig));
	
		

    }
    

    handleOnSetField(){
  
     
             
        
                plugin.postNotify(WpLib.Notify.Board.Module, WpLib.Notify.Board.SetWidgetConfig, pluginConfig);
                console.log("Current Plugin-Config: " + JSON.stringify(pluginConfig));

     

    



        
     
       
     //   console.log(config);
    
    }	

render() {
		return (
            <Segment padded>

               <Dropdown placeholder="Select Repository..." fluid selection  search onChange={this.handleSetRepository}  direction='right' options={this.state.repositories}  />
               <Divider horizontal></Divider>
            <Input fluid icon='search' placeholder='Please enter search parameter...' 
            onChange={(e, data) => {
                pluginConfig.query = data.value                 
                this.handleOnSetField();
           
            }} 
            />
            </Segment>
      
		);
	}
}





render(<AppContainer><App /></AppContainer>, document.getElementById('root'));


 if (process.env.NODE_ENV !== 'production') {
	 console.log('Looks like we are in development mode!');
	
	 
	 
   }


var currentFile = require.resolve('./index.js');
if (module.hot) {
  module.hot.accept(currentFile, () => { 
  		const App = require(currentFile).default;
		render(<AppContainer> <App /></AppContainer>, document.getElementById('root'));
  })
}
