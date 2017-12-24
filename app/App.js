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
			motorsStatus: 'off',
			joystick: { 
				x: 0, 
				y: 0,
				maxValue: 100,
			},
			pan: new Animated.ValueXY(),
			scale: new Animated.Value(0.3),			
		}
	}

	componentWillMount() {
		try {
			this.ws = new WebSocket('ws://192.168.0.87:3000');

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
		catch(e) {
			console.warn(e);
		}

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
				let x = gestureState.dx;
				let y = gestureState.dy;
				
				if (x * x + y * y > this.state.joystick.maxValue * this.state.joystick.maxValue) {
					let border_y = this.state.joystick.maxValue / Math.sqrt(x * x / (y * y) + 1);
					border_y = y < 0 ? -border_y : border_y; 
					
					let border_x = x * border_y / y;

					gestureState.dx = border_x;
					gestureState.dy = border_y;
				}

				let hasModified = false;

				// Verify if x coord modified with at least 2
				if (Math.abs(this.state.joystick.x - x) >= 2) {
					this.state.joystick.x = x;
					hasModified = true;
				}

				// Verify if y coord modified with at least 2				
				if (Math.abs(this.state.joystick.y - y) >= 2) {
					this.state.joystick.y = y;
					hasModified = true;
				}

				if (hasModified) {
					this.sendMoveEvent();
				}

				// Animate the button move
				return Animated.event([
					null, { dx: this.state.pan.x, dy: this.state.pan.y },
				])(e, gestureState);
			},

			// Executed on release
			onPanResponderRelease: () => {
				this.state.pan.setValue({ x: 0, y: 0 });
				this.state.pan.flattenOffset();

				this.state.joystick.x = 0;
				this.state.joystick.y = 0;

				this.sendMoveEvent();
			}
		});
	}
	
	sendMoveEvent()
	{
		this.ws.send(JSON.stringify({ 
			'event': 'move', 
			'joystick_max_value': this.state.joystick.maxValue,
			'joystick_x': this.state.joystick.x, 
			'joystick_y': this.state.joystick.y 
		}));
	}

	toggleMotorsStatus = () =>
	{
		// Toggle
		if (this.state.motorsStatus === 'off') {
			this.state.motorsStatus = 'on';
		}
		else {
			this.state.motorsStatus = 'off';
		}

		// Set button text
		this.setState({motorsStatus: this.state.motorsStatus});

		this.ws.send(JSON.stringify({
			'event': 'turn_motors',
			'status': this.state.motorsStatus
		}));
	}

	render() 
	{
		let { pan, scale } = this.state;
		let [translateX, translateY] = [pan.x, pan.y];
		let imageStyle = { transform: [{ translateX }, { translateY }, { scale }] };

		return (
			<View style={styles.container}>			
				<View style={styles.topContainer}>
					<View style={styles.section}>			
						<Text>Speed level</Text>
						<Button onPress={null} title="Slow" color="#373D3F"></Button>
						<Button onPress={null} title="Medium" color="#373D3F"></Button>
						<Button onPress={null} title="Fast" color="#373D3F"></Button>
					</View>
					<View style={styles.section}>			
						<Text>Motors</Text>
						<Button onPress={this.toggleMotorsStatus} title={this.state.motorsStatus} color="#373D3F"></Button>
					</View>
				</View>
				<View style={styles.bottomContainer}>				
					<View style={styles.joystickContainer}>
						<View style={styles.circle} scrollEnabled={false}>
							<Animated.View style={imageStyle} {...this._panResponder.panHandlers}>
								<Image source={require('./src/assets/pan.png')} />
							</Animated.View>
						</View>
					</View>

					<View style={styles.cameraContainer}>
					</View>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
	},
	topContainer: {
		flex: 0.1,
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',		
	},
	bottomContainer: {
		flex: 0.9,
		flexDirection: 'row',
	},
	joystickContainer: {
		flex: 0.45,
		justifyContent: 'center',
	},
	cameraContainer: {
		flex: 0.55,
	},
	section: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	circle: {
		alignItems: 'center',
		justifyContent: 'flex-end',		
		borderRadius: 300,
		borderWidth: 2,
		width: 270,
		height: 270,
		borderColor:'rgba(0,0,0,0.1)',
		backgroundColor: '#FFFFFF'
	},
});
