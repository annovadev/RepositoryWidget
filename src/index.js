import React from "react";
import { fetch_getList,fetch_getRepositories,fetch_getFile } from "./fetch.js";

import { CardExpandable } from "./CardExpandable.js";
import { render } from "react-dom";
import _ from "lodash";
import { AppContainer } from 'react-hot-loader'



import {
	Grid,
	Rail,
	Image,
	Accordion,
	Tab,
	Menu,
	Icon,
	Card,
	Button,
	Divider,
	Label,
	Header,
	Input,
	Container,
	Dropdown,
	Popup,
	Segment,
	Search,
	List,
	Form,
	Modal,
	Item,
	Dimmer,
	Message,
	Loader,
	TextArea,
	Checkbox,
	Sidebar,
	Breadcrumb,
	Feed,
	Comment,
	Responsive
} from "semantic-ui-react/dist/commonjs";
import { isNull } from "util";



var currentSearchPath	="";
var repIx = 0;
var nodeId = "";
var selectedFile = "";
let folderID = null;

class WidgetWithCards extends React.Component {
	constructor(props) {
		super(props);
		this.handleFilterChange = this.handleFilterChange.bind(this);
		this.handleRefresh = this.handleRefresh.bind(this);
		this.handleStartSearch = this.handleStartSearch.bind(this);
		this.gotoParentFolder = this.gotoParentFolder.bind(this);
		this.handleApplyFilters = this.handleApplyFilters.bind(this);
		this.resetFilters = this.resetFilters.bind(this);
		this.handleKeepOpened = this.handleKeepOpened.bind(this);
		this.handleSearchSideBar = this.handleSearchSideBar.bind(this);
		this.handleKeyPress = this.handleKeyPress.bind(this);
		this.handleSetRepository = this.handleSetRepository.bind(this);
		this.onCardSelected = this.onCardSelected.bind(this);
		this.onCardSelected2 = this.onCardSelected2.bind(this);
		this.handleDownload = this.handleDownload.bind(this);
 
		this.state = {
			page_to_fetch: 0,
			loadingresults: false,
			searchSideBarVisible: false,
			keepOpened: false,
			filtersHaveChanged: false,
			filterButtonColor: null,
			downloadDisabled : true,
			keepOpened: false,
			query: "",
			resultCount: "No search started",
			resultJSON: null,
			articles: {
				status: "ok",
				source: "abc-news-au",
				sortBy: "top",
				articles: ""
			},
			repositories: 	[],
			currentFolder: null,
			parentFolder: null,
			filterOps : [],
			allCards: <div />,
			newCards: <div />
		};

	}
	onCardSelected(itemType, id) {
	

		if(itemType == "folder"){	
	
			this.setState(prevState => ({
				currentFolder: id,
				downloadDisabled: true
			}));
		this.handleRefresh(id) 
		}
		else { 
			this.setState(prevState => ({
				downloadDisabled: false
			}));
	//	this.handleDownload(id);
		}
	

	}
	onCardSelected2(itemType, id) {
        // parent class change handler is always called with field name and value
	//folderID = id;
		if(itemType == "folder"){	
			console.log("Folder selected: " + searchPath);
			this.setState(prevState => ({
				downloadDisabled: true
			}));


			switch(searchPath) {
				case "..": 
				currentSearchPath = currentSearchPath.substr(0, currentSearchPath.lastIndexOf("\/"));
				
				break;
				case "\\.": 
				var singleSlash = /\//;
				currentSearchPath = singleSlash;//currentSearchPath.substr(0, currentSearchPath.lastIndexOf("\/"));
		
				default: 
				currentSearchPath = currentSearchPath + "\/" + searchPath; 
				break;
		
			  
				
				
			}

			this.handleRefresh();		
		} else { 
			this.setState(prevState => ({
				downloadDisabled: false
			}));
			selectedFile = currentSearchPath + "/" + searchPath;
	//		console.log("File selected: " + currentSearchPath + "/" + searchPath);
		
			
		}
//		console.log("Current Searchpath: " + currentSearchPath);

	
	}

	componentDidMount() {

		fetch_getRepositories().then(
				function(data) {
					this.setState(prevState => ({
						repositories: data
					}));
					nodeId = this.state.repositories[repIx].nodeId;
				
				}.bind(this));
			
// Start with default Repository set in api.config or Repository = 1 
		


			this.handleRefresh();
	}
	gotoParentFolder(){
		this.handleRefresh("\/");
		
	}
	handleSetRepository(event,data)	{
	//	currentSearchPath = "\/";
		
		repIx = data.value;
		console.log(repIx);
		nodeId = this.state.repositories[repIx].nodeId;
		console.log("Repository Index: " + repIx + " Node ID: "+ nodeId)
		folderID = "";
		this.handleRefresh();
		

	}

	handleDownload(event,data) {
		console.log("Selected file or folder: "+ event)
	//	fetch_api_download(event).then(
		fetch_getList(nodeId, currentSearchPath, this.state.query).then(
					function(data) {

					}.bind(this)
				);
		
	}
	handleStartSearch(e) {
		console.log("Selected file or folder: "+ e)
		
		if (typeof e == 'undefined'){
			folderID = '';
		}
			else{
				folderID = e;	
		}
			
		console.log("Query: "+e);	
	
		this.setState({ page_to_fetch: ++this.state.page_to_fetch });

		// console.log(this.state.allCards);

		this.setState({
			loadingresults: true,
			resultCount: "Searching..."
		});

		this.setState(prevState => ({
			allCards: (
				<div>
					{" "}
					<Loader active />
				</div>
			)
		}));
	
		fetch_getList(nodeId,folderID,query).then(
	//	fetch_getList(repProtocol, repositoryID, currentSearchPath, this.state.query).then(
			function(data) {
			
				this.setState({
					resultCount: data.resultCount + " result(s)",
					resultJSON:  data.items,
					parentFolder: data.parentFolderId
				});
				
				console.log(data.items);
				console.log("PARENT FOLDER:" +data.parentFolderId);
				var previousCard = this.state.allCards;
				
				var cardsHTML = (
					<Card.Group unstackable={true} divided={true}>
						{this.state.loadingresults ? (
							this.state.resultJSON.map(item => (
								<CardExpandable
								callbackParent={(itemType, key) => this.onCardSelected(itemType, key)}
								//	callbackParent={(itemType, searchPath) => this.onCardSelected2(itemType,searchPath)}
									fluid
									id={item.id}
									formattedItem={item}
									rawItem={item.rawItem}
									basename={item.basename}
									iconName={item.iconName}
									itemType={item.itemType}
									iconColor={item.iconColor}
									mediaType={item.mediaType}
									thumbnail={item.thumbnail}
									highres={item.highres}
									description={item.description}
									title={item.title}
									open_url={item.open_url}
									dragAndDropString={item.dragAndDropString}
									target={item.target}
									meta={item.meta}
								/>
							))
						) : (
							<Loader active />
						)}
					</Card.Group>
				);

				this.setState(prevState => ({
					allCards: <div>{cardsHTML}</div>
				}));
			}.bind(this)
		);

	}

	handleRefresh(e) {
		console.log("Selected file or folder: "+ e)
		
		if (typeof e == 'undefined'){
			folderID = "";
		}
			else{
				folderID = e;	
		}
			
		let query = "";
		query = this.state.query;
		
		this.setState({ page_to_fetch: ++this.state.page_to_fetch });

		// console.log(this.state.allCards);

		this.setState({
			loadingresults: true,
			resultCount: "Searching..."
		});

		this.setState(prevState => ({
			allCards: (
				<div>
					{" "}
					<Loader active />
				</div>
			)
		}));
		

		fetch_getList(nodeId,folderID,query).then(
	//	fetch_getList(repProtocol, repositoryID, currentSearchPath, this.state.query).then(
			function(data) {
			
				this.setState({
					resultCount: data.resultCount + " result(s)",
					resultJSON:  data.items,
					parentFolder: data.parentFolderId
				});
				
				console.log(data.items);
				console.log("PARENT FOLDER:" +data.parentFolderId);
				var previousCard = this.state.allCards;
				
				var cardsHTML = (
					<Card.Group unstackable={true} divided={true}>
						{this.state.loadingresults ? (
							this.state.resultJSON.map(item => (
								<CardExpandable
								callbackParent={(itemType, key) => this.onCardSelected(itemType, key)}
								//	callbackParent={(itemType, searchPath) => this.onCardSelected2(itemType,searchPath)}
									fluid
									id={item.id}
									formattedItem={item}
									rawItem={item.rawItem}
									basename={item.basename}
									iconName={item.iconName}
									itemType={item.itemType}
									iconColor={item.iconColor}
									mediaType={item.mediaType}
									thumbnail={item.thumbnail}
									highres={item.highres}
									description={item.description}
									title={item.title}
									open_url={item.open_url}
									dragAndDropString={item.dragAndDropString}
									target={item.target}
									meta={item.meta}
								/>
							))
						) : (
							<Loader active />
						)}
					</Card.Group>
				);

				this.setState(prevState => ({
					allCards: <div>{cardsHTML}</div>
				}));
			}.bind(this)
		);
	}
	handleKeepOpened(e) {
		this.setState({
			keepOpened: !this.state.keepOpened
		});
	}
	handleSearchSideBar(e) {
		this.setState({
			searchSideBarVisible: !this.state.searchSideBarVisible
		});
	}

	handleFilterChange(e) {
		this.setState({
			filtersHaveChanged: true
		});
	}

	handleApplyFilters(e) {
		if (this.state.filtersHaveChanged) {
			this.setState({
				filterButtonColor: "orange"
			});
		}

		if (!this.state.keepOpened) {
			this.setState({
				searchSideBarVisible: false
			});
		}
	}

	resetFilters(e) {
		this.setState({
			filtersHaveChanged: false,
			filterButtonColor: null
		});
	}
	handleKeyPress(e) {

		if (e.data == null){
			this.setState((prevState, props) => ({
				query: ""
			  }));
		}
		else{
			this.setState((prevState, props) => ({
				query: e.data
			  }));
		}

	
	
		if (e.charCode == 13) {
		
			this.handleRefresh(this.state.query);
		}
	

	}

	render() {
	

		let panels = [
			{
				active: true,
				title: {
					key: "sort_key",
					children: (
						<List selection>
							{" "}
							<List.Item  onClick={() => this.setState({ sortKey: 'score' })} active >
								<List.Icon name="arrow down" />
								<List.Content>Name</List.Content>
							</List.Item>
							<List.Item  onClick={() => this.setState({ sortKey: 'title' })} active >
								<List.Icon />
								<List.Content>Type</List.Content>
							</List.Item>
							<List.Item  onClick={() => this.setState({ sortKey: 'creation' })} active >
								<List.Icon  name=""/>
								<List.Content>Size</List.Content>
							</List.Item>
						</List>
					)
				},
				content: {
					key: "fields_key",
					children: (
						<div>
							Fields
							<List selection>
								{" "}
								<List.Item>
									<List.Icon name="" />
									<List.Content>Description</List.Content>
								</List.Item>
								<List.Item active>
									<List.Icon name="check" />
									<List.Content>Metadata</List.Content>
								</List.Item>
							</List>
							Layout
							<List selection>
								{" "}
								<List.Item active>
									<List.Icon name="" />
									<List.Content>Card</List.Content>
								</List.Item>
								<List.Item>
									<List.Icon name="" />
									<List.Content>Grid</List.Content>
								</List.Item>
								<List.Item>
									<List.Icon name="check" />
									<List.Content>List</List.Content>
								</List.Item>
							</List>
							Image
							<List selection>
								{" "}
								<List.Item>
									<List.Icon name="" />
									<List.Content>None</List.Content>
								</List.Item>
								<List.Item active>
									<List.Icon name="check" />
									<List.Content>Small</List.Content>
								</List.Item>
								<List.Item>
									<List.Icon name="" />
									<List.Content>Large</List.Content>
								</List.Item>
								<List.Item>
									<List.Icon name="" />
									<List.Content>Very large</List.Content>
								</List.Item>
							</List>
						</div>
					)
				}
			},
			{
				active: true,
				title: {
					key: "data",
					children: (
						<Header as="h4" dividing>
							<Header.Content>
								<Icon name="sort content descending" />Sort
							</Header.Content>
						</Header>
					)
				},
				content: {
					key: "dataContent",
					children: (
						<List selection>
							{" "}
							<List.Item active>
								<List.Icon name="arrow down" />
								<List.Content>Creation Date</List.Content>
							</List.Item>
							<List.Item>
								<List.Icon name="" />
								<List.Content>Update time</List.Content>
							</List.Item>
						</List>
					)
				}
			},
			{
				title: {
					key: "filters",
					children: (
						<Header as="h4" dividing>
							<Header.Content>
								<Icon name="filter" />Filters
							</Header.Content>
						</Header>
					)
				},
				content: {
					key: "filtersContent",
					children: (
						<Form>
							<Form.Field>
								<label>placeholder</label>
								<Input />
							</Form.Field>
						</Form>
					)
				}
			}
		];
		return (
			<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
				<div style={{ margin: "5px", flex: "0" }}>



					<Input
				
					 labelPosition='left'
					 placeholder='Repository'

						onChange={(e, data) => {
							this.setState({ query: data.value });
						}}
						onKeyPress={this.handleKeyPress}
						action={
							<Button
							basic
								icon="options"
								onClick={this.handleSearchSideBar}
							/>
						}
						placeholder="Search"
						defaultValue=""
						fluid
					/>
				</div>

				<div style={{ margin: "5px", flex: "0" }}>
				<Menu>
    <Dropdown item simple text=' '  icon='folder open' label={{ color: 'blue', empty: true, circular: true }} onChange={this.handleSetRepository}  direction='right' options={this.state.repositories}  />
    
   
	<Button icon='home' onClick={() => this.onCardSelected("folder","")}/>
	<Button icon='arrow up' onClick={() => this.onCardSelected("folder",this.state.parentFolder)}/>
	<Button icon='refresh' onClick={() => this.handleRefresh(this.state.currentFolder)}/>
	<Button icon='download' disabled={this.state.downloadDisabled}  onClick={() => this.handleDownload('XERva3VcSm9ubnlcQWRtaW5pc3RyYXRpb25fT3Blbk1lZGlhLmRvY3g')}/>		
  
  </Menu>
				
			</div>



				<Divider horizontal fitted>
					<Label size="small" color="grey">
						{this.state.resultCount}
					</Label>

		
				</Divider>

				<Sidebar.Pushable style={{ height: "100%" }}>
					<Sidebar

						animation="overlay"
						direction="right"
						style={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
							overflowX: "hidden",
							maxHeight: "100%"
						}}
						visible={this.state.searchSideBarVisible}>
						<Segment
							attached
							className="fancy-scrollbar"
							style={{
								overflowX: "hidden",
								overflowY: "auto",
								height: "100%",
								flex: "1"
							}}>
							<Accordion panels={panels} defaultActiveIndex={0} />
						</Segment>

						<Segment attached style={{ flex: "0" }}>
							<Checkbox label="Keep opened" onClick={this.handleKeepOpened} />
							<p />
							<Button
								primary
								content="Apply"
								floated="left"
								onClick={this.handleApplyFilters}
							/>
							<Button.Group basic floated="right">
								<Button icon="eraser" onClick={this.resetFilters} />
								<Button icon="save" />
								<Button icon="bell" />
							</Button.Group>
						</Segment>
					</Sidebar>
					<Sidebar.Pusher
						className="fancy-scrollbar card-list"
						style={{
							overflowY: "auto",
							display: "flex",
							flex: "1",
							flexDirection: "column",
							height: "100%"
						}}>
						{this.state.allCards}

						{/*
						<Divider horizontal>
							<Button content="Load more" onClick={this.handleRefresh} />
						</Divider>
						*/}
					</Sidebar.Pusher>
				</Sidebar.Pushable>
			</div>
		);
	}
}



class App extends React.Component {
	render() {
		return (
			<div
				className="fullscreen"
				style={{
					display: "flex",
					flexDirection: "column",
					height: "100vh",
					justifyContent: "space-between"
				}}>
				<WidgetWithCards style={{ height: "100%" }} />
			</div>
		);
	}
}



// ----------------------------------------
// Render
// ----------------------------------------
//export default App;

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
