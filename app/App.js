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

		this.ws = new WebSocket('ws://192.168.0.173:3000');

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

	_clearPins = () => {
		this.ws.send(JSON.stringify({ 'event': 'clear_pins' }));
	}

	_sendSlidersValueToServer = (speedSliderValue, steeringSliderValue) => {
		this.ws.send(JSON.stringify({ 'event': 'move', 'speedSliderValue': speedSliderValue, 'steeringSliderValue': steeringSliderValue }));		
	}

	_speedSliderRelease = (event) => {
		// Set speed to zero
		this.state.speed = 0;

		// Send new slider values to server
		this._sendSlidersValueToServer(this.state.speed, this.state.steeringValue);

		// Set speed slider to value zero
		this._speedSlider.setNativeProps({ value: 0 });
	}

	_steeringSliderRelease = (event) => {
		// Set speed to zero
		this.state.steeringValue = 0;

		// Send new slider values to server
		this._sendSlidersValueToServer(this.state.speed, this.state.steeringValue);

		// Set speed slider to value zero
		this._steeringSlider.setNativeProps({ value: 0 });
	}

	move = (value) => {
		this.state.speed = value;
		
		// Send new slider values to server
		this._sendSlidersValueToServer(this.state.speed, this.state.steeringValue);
	}

	steering = (value) => {
		this.state.steeringValue = value;
		
		// Send new slider values to server
		this._sendSlidersValueToServer(this.state.speed, this.state.steeringValue);
	}

	render() {
		return (
			<View style={ styles.container }>
				<View style={ styles.speedContainer }>
					<Slider style={ styles.sliderSpeed }
						step={ 2 }
						minimumValue={ 20 }
						maximumValue={ 70 }
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
				
				<View style={ styles.steeringContainer }>
					<Slider style={ styles.sliderSteering }
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
		backgroundColor: '#FFF',
		flex: 1,
		flexDirection: 'row',
        justifyContent: 'center',
	},
	sliderSpeed: {
		width: 300,
		transform: [{ rotate: '-90deg' }, { scaleY: 3 }]
	},
	sliderSteering: {
		height: 200,
		width: '100%',
	},
	speedContainer: {
		flex: 0.3,
		flexDirection: 'row',
        justifyContent: 'center',
		backgroundColor: '#F2F2F2',
	},
	steeringContainer: {
		flex: 0.5,
		flexDirection: 'column',
        justifyContent: 'center',
		backgroundColor: '#F2F2F2',
	},
	camera: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
