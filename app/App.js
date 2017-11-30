import React, { Component } from 'react';
import {
	Platform,
	StyleSheet,
	Button,
	Slider,
	Text,
	View,
	TouchableHighlight,
	Image,
	Animated,
	PanResponder,
} from 'react-native';

export default class App extends Component<{}> {
	constructor(props) {
		super(props);

		this.state = {
			speed: 0,
			motorLeftSpeed: 0,
			motorRightSpeed: 0,
			steeringValue: 0,
			pan: new Animated.ValueXY(),
			scale: new Animated.Value(0.5),
		}

		this.ws = new WebSocket('ws://192.168.100.2:3000');

		this.ws.onopen = () => {
			this.ws.send(JSON.stringify({ 'event': 'connection', 'client': 'React Native' }));
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

	componentWillMount() {
		this._panResponder = PanResponder.create({
			onMoveShouldSetResponderCapture: () => true,
			onMoveShouldSetPanResponderCapture: () => true,

			// Executed on start
			onPanResponderGrant: (e, gestureState) => {
				this.state.pan.setOffset({ x: this.state.pan.x._value, y: this.state.pan.y._value });
				this.state.pan.setValue({ x: 0, y: 0 });
			},

			// Executed on move
			onPanResponderMove: (e, gestureState) => {
				console.log(`x = ${this.state.pan.x._value} y = ${this.state.pan.y._value}`);

				// Animate the button move
				return Animated.event([
					null, { dx: this.state.pan.x, dy: this.state.pan.y },
				])(e, gestureState);
			},

			// Executed on release
			onPanResponderRelease: (e, { vx, vy }) => {
				this.state.pan.setValue({ x: 0, y: 0 });
				this.state.pan.flattenOffset();
				console.log(`x = ${this.state.pan.x._value} y = ${this.state.pan.y._value}`);				
			}
		});
	}

	_clearPins = () => {
		this.ws.send(JSON.stringify({ 'event': 'clear_pins' }));
	}

	_sendSlidersValueToServer = (speedSliderValue, steeringSliderValue) => {
		this.ws.send(JSON.stringify({ 'event': 'move', 'speedSliderValue': speedSliderValue, 'steeringSliderValue': steeringSliderValue }));
	}

	render() {
		let { pan, scale } = this.state;
		let [translateX, translateY] = [pan.x, pan.y];
		let imageStyle = { transform: [{ translateX }, { translateY }, { scale }] };

		return (
			<View style={styles.container}>
				<View style={ styles.joystickContainer }>
					<Animated.View style={ imageStyle } {...this._panResponder.panHandlers}>
						<Image source={ require('./src/assets/pan.png') } />
					</Animated.View>
				</View>

				<View style={styles.cameraContainer}>
					<Button
						onPress={this._clearPins}
						style={styles.button}
						title="Clear PINs"
						color="#841584" />
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
	joystickContainer: {
		flex: 0.5,
		justifyContent: 'center',
		backgroundColor: '#F2F2F2',
	},
	cameraContainer: {
		flex: 0.5,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
