import React, { Component } from 'react';
import {
	Platform,
	StyleSheet,
	Button,
	Slider,
	Text,
	View
} from 'react-native';

const instructions = Platform.select({
	ios: 'Press Cmd+R to reload,\n' +
		'Cmd+D or shake for dev menu',
	android: 'Double tap R on your keyboard to reload,\n' +
		'Shake or press menu button for dev menu',
});

export default class App extends Component<{}> {	
	constructor(props) {
		super(props);
		
		// If you are using a real device, don't forget to use the IP from the laptop where the server is running
		this.ws = new WebSocket('ws://192.168.0.166:3000');

		this.ws.onopen = () => {
			this.ws.send(JSON.stringify({'event': 'connection', 'client': 'React Native'}));
		};

		this.ws.onmessage = (e) => {
			console.log('SERVER' + e.data);
		};
		
		this.ws.onerror = (e) => {
			console.log(e);
		};
		
		this.ws.onclose = (e) => {
			this.ws.send('close');
			console.log(e.code, e.reason);
		};
	}

	forward() {
		this.ws.send(JSON.stringify({'event': 'move', 'direction': 'forward'}));
	}

	move(value) {
		if (value >= 15) {
			this.ws.send(JSON.stringify({'event': 'move', 'direction': 'forward'}));		
		}
		else if (value <= -15) {
			this.ws.send(JSON.stringify({'event': 'move', 'direction': 'backward'}));					
		}
		else {
			this.ws.send(JSON.stringify({'event': 'stop'}));					
		}
	}

	render() {
		return (
			<View style={ styles.container }>
				<Slider style={{ width: '100%' }}
					step={1}
					minimumValue={-50}
					maximumValue={50}
					value={0}
					onValueChange={ value => this.move(value) } />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#F5FCFF',
	},
	welcome: {
		fontSize: 20,
		textAlign: 'center',
		margin: 10,
	},
});
