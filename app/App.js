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

export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			motors: {
				theyAreOn: false,
				buttonText: 'TURN MOTORS ON',
				buttonColor: '#27AE60', // Green
			},
			joystick: { 
				x: 0, 
				y: 0,
				maxValue: 100,
			},
			connection: {
				isConnected: false,
				text: 'Waiting for connection...',
				color: 'rgba(60, 60, 60, 0.5)', // Gray
			},
			pan: new Animated.ValueXY(),
			scale: new Animated.Value(0.3),			
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
					x = x > 100 ? 100 : x;
					x = x < -100 ? -100 : x;
					this.state.joystick.x = x;

					hasModified = true;
				}

				// Verify if y coord modified with at least 2				
				if (Math.abs(this.state.joystick.y - y) >= 2) {
					y = y > 100 ? 100 : y;
					y = y < -100 ? -100 : y;					
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

	componentWillMount() {
		try {
			// Try to connect to NodeJS server
			this.connectToServer();
		}
		catch(e) {
			console.warn(e);
		}
	}

	connectToServer = () => {
		this.ws = new WebSocket('ws://192.168.0.157:3000');

		this.ws.onopen = () => {
			this.ws.send(JSON.stringify({ 'event': 'connection', 'client': 'Mobile application' }));
			this.setState({ 
				connection: {
					isConnected: true,
					text: 'Connected',
					color: 'rgba(39, 174, 96, 0.5)',
				}
			});
		};

		this.ws.onmessage = (e) => {
			let object = JSON.parse(e.data);
				
			if (object.event == 'ping') {
				this.ws.send(JSON.stringify({
					'event': 'pong',
					'timestamp': Date.now()
				}));
			}
			// console.warn('SERVER' + e.data);
		};

		this.ws.onerror = (e) => {
			this.ws.send('close');
			
			this.setState({ 
				connection: {
					isConnected: false,
					text: 'Connection error',
					color: 'rgba(231, 76, 60, 0.5)',
				}
			});
		};

		this.ws.onclose = (e) => {
			this.ws.send('close');

			// If the connection dropped
			// Try to reconnect
			this.setState({ 
				connection: {
					isConnected: false,
					text: 'Trying to connect...',
					color: 'rgba(231, 76, 60, 0.5)',
				}
			});

			setTimeout(() => {
				this.connectToServer();
			}, 1000);
		};
	}


	sendMoveEvent = () =>
	{
		if (this.state.connection.isConnected) {
			this.ws.send(JSON.stringify({ 
				'event': 'move', 
				'joystick_x': this.state.joystick.x, 
				'joystick_y': this.state.joystick.y 
			}));
		}
	}

	toggleMotorsStatus = () =>
	{
		if (this.state.connection.isConnected) {
			if (this.state.motors.theyAreOn === false) {
				// Turn motors on

				this.setState({
					motors: {
						theyAreOn: true,
						buttonText: 'TURN MOTORS OFF',
						buttonColor: '#E74C3C', // Red						
					}
				});
	
				this.ws.send(JSON.stringify({
					'event': 'turn_motors',
					'status': 'on',
				}));
			}
			else {
				// Turn motors off

				this.setState({
					motors: {
						theyAreOn: false,
						buttonText: 'TURN MOTORS ON',
						buttonColor: '#27AE60', // Green						
					}
				});
	
				this.ws.send(JSON.stringify({
					'event': 'turn_motors',
					'status': 'off',
				}));
			}
		}
	}

	render() 
	{
		let { pan, scale } = this.state;
		let [translateX, translateY] = [pan.x, pan.y];
		let imageStyle = { transform: [{ translateX }, { translateY }, { scale }] };

		return (
			<View style={ styles.container }>			
				<View style={ styles.topContainer }>
					<Text style = {{ color: this.state.connection.color }}>
						{ this.state.connection.text }
					</Text>
					
					<Button onPress = { this.toggleMotorsStatus } 
							title = { this.state.motors.buttonText } 
							color = { this.state.motors.buttonColor }>
					</Button>
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
		paddingTop: 10,
		flex: 0.15,
		flexDirection: 'row',
		alignItems: 'center',	
		justifyContent: 'space-around',
	},
	bottomContainer: {
		flex: 0.85,
		flexDirection: 'row',
	},
	joystickContainer: {
		flex: 0.45,
		paddingLeft: 15,
		justifyContent: 'center',
	},
	cameraContainer: {
		flex: 0.55,
	},
	circle: {
		alignItems: 'center',
		borderRadius: 300,
		borderWidth: 2,
		width: 270,
		height: 270,
		borderColor:'rgba(0,0,0,0.1)',
		backgroundColor: '#FFFFFF'
	},
	connectionText: {
		paddingTop: 5,
		color: 'rgba(60, 60, 60, 0.5)',
	},
});