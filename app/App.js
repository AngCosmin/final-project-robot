/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React, { Component } from 'react';
import {
	Platform,
	StyleSheet,
	Button,
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
			this.ws.send('M-am conectat');
		};

		this.ws.onmessage = (e) => {
			console.log('SERVER' + e.data);
		};
		
		this.ws.onerror = (e) => {
			console.log(e);
		};
		
		this.ws.onclose = (e) => {
			console.log(e.code, e.reason);
		};
	}

	send() {
		this.ws.send('something');
	}

	render() {
		return (
			<View style={styles.container}>
				<Text style={styles.welcome}>
					Remote Control
				</Text>
				<Button onPress={() => this.send()} title='Send'/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F5FCFF',
	},
	welcome: {
		fontSize: 20,
		textAlign: 'center',
		margin: 10,
	},
	instructions: {
		textAlign: 'center',
		color: '#333333',
		marginBottom: 5,
	},
});
