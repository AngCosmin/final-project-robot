import React, { Component } from 'react';
import {
	Platform,
	StyleSheet,
	Button,
	Slider,
	Text,
	View
} from 'react-native';

export default class App extends Component<{}> {	
	constructor(props) {
		super(props);
		
		this.state = {
			speed: 0,
			motorLeftSpeed: 0,
			motorRightSpeed: 0,
			steeringValue: 0,
		}

		this.ws = new WebSocket('ws://192.168.0.157:3000');

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

	_calculateMotorsSpeed = () => {
		if (this.state.speed > 0)
		{
			if (this.state.speed < 15) {
				this.state.speed = 15;
			}

			if (this.state.steeringValue > 0) {
				this.state.motorRightSpeed = this.state.speed + this.state.steeringValue;
			}
			else if (this.state.steeringValue == 0) {
				this.state.motorRightSpeed = this.state.speed;
				this.state.motorLeftSpeed = this.state.speed;
			}
			else {
				this.state.motorLeftSpeed = this.state.speed + (-this.state.steeringValue);
			}
		}
		else 
		{
			this.state.motorRightSpeed = 0;
			this.state.motorLeftSpeed = 0;
		}
		
		console.log('Motor left speed ' + this.state.motorLeftSpeed + ' Motor right speed ' + this.state.motorRightSpeed);		
	}

	_sendMotorSpeedToServer = () => {
		let motorLeftSpeed = this.state.motorLeftSpeed;
		let motorRightSpeed = this.state.motorRightSpeed;
		
		this.ws.send(JSON.stringify({ 'event': 'move', 'motorLeftSpeed': motorLeftSpeed, 'motorRightSpeed': motorRightSpeed }));
	}

	move = (value) => {
		this.state.speed = value;
		this._calculateMotorsSpeed();
		this._sendMotorSpeedToServer();
	}

	steering = (value) => {
		this.state.steeringValue = value;
		this._calculateMotorsSpeed();
		this._sendMotorSpeedToServer();
	}

	render() {
		return (
			<View style={ styles.container }>
				<Slider style={{ width: '100%' }}
					step={2}
					minimumValue={0}
					maximumValue={30}
					value={0}
					onValueChange={ this.move.bind(this) } />

				<Slider style={{ width: '100%' }}
					step={2}
					minimumValue={-30}
					maximumValue={30}
					value={0}
					onValueChange={ this.steering.bind(this) } />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#F5FCFF',
		flex: 1,
		flexDirection: 'column',
        justifyContent: 'space-between',
	},
	welcome: {
		fontSize: 20,
		textAlign: 'center',
		margin: 10,
	},
});
