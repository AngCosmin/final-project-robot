import React, { Component } from 'react';
import {
	Platform,
	StyleSheet,
	Button,
	Slider,
	Text,
	View,
	TouchableHighlight
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

		this.ws = new WebSocket('ws://192.168.43.139:3000');

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

	_clearPins = () => {
		this.ws.send(JSON.stringify({ 'event': 'clear_pins' }));
	}

	_speedSliderRelease = (event) => {
		console.log('Speed slider release');

		// Set speed to zero
		this.state.speed = 0;

		// Calculate the motors speed and then send the speed to server
		this._calculateMotorsSpeed();
		this._sendMotorSpeedToServer();

		// Set speed slider to value zero
		this._speedSlider.setNativeProps({ value: 0 });
	}

	_steeringSliderRelease = (event) => {
		console.log('Steering slider release');
		
		// Set speed to zero
		this.state.steeringValue = 0;

		// Calculate the motors speed and then send the speed to server
		this._calculateMotorsSpeed();
		this._sendMotorSpeedToServer();

		// Set speed slider to value zero
		this._steeringSlider.setNativeProps({ value: 0 });
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
				<View style={ styles.joystick }>
					<Slider style={ styles.slider }
						step={ 2 }
						minimumValue={ 0 }
						maximumValue={ 30 }
						ref={component => this._speedSlider = component}
						minimumTrackTintColor='#16a085'
						thumbTintColor='#16a085'
						value={ this.state.speed }
						onValueChange={ this.move.bind(this) }
						onSlidingComplete={ this._speedSliderRelease.bind(this) } />
				</View>

				<View style={ styles.camera }>
					<Button
						onPress= { this._clearPins }
						style={ styles.button }
						title="Clear PINs"
						color="#841584"/>
				</View>
				
				<View style={ styles.options }>
					<Slider style={ styles.slider }
						step={2}
						minimumValue={-30}
						maximumValue={30}
						ref={component => this._steeringSlider = component}
						minimumTrackTintColor='#16a085'
						thumbTintColor='#16a085'
						value={ 0 }
						onValueChange={ this.steering.bind(this) }
						onSlidingComplete={ this._steeringSliderRelease.bind(this) } />
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#F5FCFF',
		flex: 1,
		flexDirection: 'column',
        justifyContent: 'center',
	},
	slider: {
		height: 100,
	
	},
	joystick: {
		flex: 0.3,
		backgroundColor: '#bdc3c7',
	},
	camera: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	options: {
		flex: 0.3,
		backgroundColor: '#bdc3c7',
	}
});
