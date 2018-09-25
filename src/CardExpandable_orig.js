import React from "react";
import { render } from "react-dom";
import { CardsContextMenu } from "./CardsContextMenu.js";
import { getFileStream } from "./fetch.js";
import {
	Dropdown,
	Icon,
	Card,
	Image,
	Modal,
	Button,
	Container
} from "semantic-ui-react";

export class CardExpandable extends React.Component {
	constructor(props) {
		super(props);
		this.handleExpand = this.handleExpand.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.handleDragStart = this.handleDragStart.bind(this);
		
		this.handleClick = this.handleClick.bind(this);
		this.state = {
			expanded: false,
			descriptionCursor: "zoom-in",
			descriptionWhiteSpace: "nowrap",
			descriptionOverflow: "hidden",
			descriptionTextOverflow: "ellipsis",
			isHovered: "none"
		};
	}
	handleClick(e) {
		
		this.props.callbackParent(this.props.itemType, this.props.basename);
	

	//	window.open(this.props.open_url);
		e.preventDefault();
	
	//	console.log(this.props.formattedItem.open_url);
	
	}

	handleExpand(e) {
		
		e.preventDefault();
		if (this.state.expanded == false) {
			this.setState({
				expanded: true,
				descriptionCursor: "zoom-out",
				descriptionWhiteSpace: "",
				descriptionOverflow: "",
				descriptionTextOverflow: ""
			});
		} else {
			this.setState({
				expanded: false,
				descriptionCursor: "zoom-in",
				descriptionWhiteSpace: "nowrap",
				descriptionOverflow: "hidden",
				descriptionTextOverflow: "ellipsis"
			});
		}
	}

	handleDragStart(e) {
		e.dataTransfer.setData("text/plain", this.props.dragAndDropString);
	}

	handleMouseEnter(e) {
	
		this.setState({
			isHovered: ""
		});
	}
	handleMouseLeave(e) {
		this.setState({
			isHovered: "none"
		});
	}
	onDateChange(dateValue) {
        // for a date field, the value is passed into the change handler
		this.props.onCardSelected('dateCommenced', dateValue);
	
    }

	render() {
	
		let thumbnail = null;
		let mediaNode = null;
		let iconNode = null;
	
	
	
		let mediaType = String(this.props.mediaType);
		switch (true){
			case mediaType.startsWith('image'):
			thumbnail = (
				<Image
					style={{
						cursor: "zoom-in"
					}}
					floated="left"
					src={this.props.thumbnail}
					size="mini"
				/>
			);
			mediaNode = <Image centered src={this.props.highres} />;
			break;

			case mediaType.startsWith('video'): 
			
			thumbnail = <Icon link size="big" name="video" />;
	
				mediaNode = (
					<video width="100%" autoPlay controls>
						<source src={this.props.highres} type="video/mp4" />
						Your browser does not support HTML5 video.
					</video>
				);
			
			break;
			case mediaType.startsWith('audio'):
		
				//thumbnail = <Button floated="left" content="Play" icon="play" />;
				thumbnail = <Icon  size="big" name="volume up" />;
				mediaNode = (
					<audio style={{ width: "100%" }} autoPlay controls>
						<source src={this.props.highres} type="audio/mp3" />
						Your browser does not support HTML5 audio.
					</audio>
				)
				break;
			default:
			switch(this.props.itemType) {
				case "file":
				thumbnail = <Icon link size="big" name="file" />;
				mediaNode = (
					<iframe style={{ width: "100%" }} src={this.props.highres}/>
				)
					break;
				case "folder":
				thumbnail = <Icon link size="big" name="folder" color="yellow" />;
					break;
				default:
				thumbnail = <Icon link size="big" name="file" />;
			}
	
	
			}


		

	/*	if (mediaType.startsWith('image', 0)) {
			thumbnail = (
				<Image
					style={{
						cursor: "zoom-in"
					}}
					floated="left"
					src={this.props.thumbnail}
					size="tiny"
				/>
			);
			mediaNode = <Image centered src={this.props.highres} />;
		}

		if (mediaType.startsWith('video', 0)) {
			if (this.props.thumbnail == null) {
				thumbnail = <Icon
				style={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)"
				}}
				inverted
				size="big"
				color=""
				name="play circle"
			/>
			} else {
				thumbnail = (
					<Image floated="left" size="tiny" onClick={e => e.preventDefault()}>
						<Image src={this.props.thumbnail} />
						<Icon
							style={{
								position: "absolute",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)"
							}}
							inverted
							size="big"
							color=""
							name="play circle"
						/>
					</Image>
				);
			}

			mediaNode = (
				<video width="100%" autoPlay controls>
					<source src={this.props.highres} type="video/mp4" />
					Your browser does not support HTML5 video.
				</video>
			);
		}
		if (mediaType.startsWith('audio', 0)) {
			//thumbnail = <Button floated="left" content="Play" icon="play" />;
			thumbnail = <Icon link size="big" name="volume up" />;
			mediaNode = (
				<audio style={{ width: "100%" }} autoPlay controls>
					<source src={this.props.highres} type="audio/mp3" />
					Your browser does not support HTML5 audio.
				</audio>
			);
		}*/

		return (
			<Card
			onCardSelected={this.onDateChange.bind(this)}  
				link
				color=""
				centered
				draggable="true"
				onDragStart={this.handleDragStart}
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}
				onClick={this.handleClick}
				style={{ margin: "0px" }}
				{...this.props}>
				<Card.Content>
					<Modal closeIcon="close" trigger={thumbnail} size="small">
					<Modal.Header>{this.props.title}</Modal.Header>
					<Modal.Content>{mediaNode}</Modal.Content>
					</Modal>
					<CardsContextMenu
						formattedItem={this.props.formattedItem}
						rawItem={this.props.rawItem}
					
					/>

					<strong>{this.props.title}</strong>
					<Card.Meta dangerouslySetInnerHTML={{ __html: this.props.meta }} />
					<Card.Description
						onClick={this.handleClick}
						style={{
							cursor: this.state.descriptionCursor,
							whiteSpace: this.state.descriptionWhiteSpace,
							overflow: this.state.descriptionOverflow,
							textOverflow: this.state.descriptionTextOverflow,
							textAlign: "justify"
						}}>
						{this.props.description}
					</Card.Description>
				</Card.Content>
			</Card>
		);
	}
}


