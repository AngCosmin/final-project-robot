import React, { Component } from 'react';
import {
	Platform,
	StyleSheet,
	Button,
	Slider,
	Text,
	TextInput,
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
				buttonText: 'Turn motors ON',
			},
			robotMode: 'Manual mode ON',
			joystick: { 
				x: 0, 
				y: 0,
				maxValue: 100,
			},
			serverIp: null,
			connection: {
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
		this.ws = new WebSocket('ws://' + this.state.serverIp + ':3000');

		this.ws.onopen = () => {
			this.setState({ 
				connection: {
					text: 'Connected',
					color: 'rgba(39, 174, 96, 0.5)',
				}
			});

			if (this.ws.readyState == 1) {			
				this.ws.send(JSON.stringify({ 'event': 'connection', 'client': 'Mobile application' }));			
			}
		};

		this.ws.onmessage = (e) => {
			let object = JSON.parse(e.data);
				
			if (object.event == 'ping' && this.ws.readyState === 1) {
				this.ws.send(JSON.stringify({
					'event': 'pong',
					'timestamp': Date.now()
				}));
			}
			// console.warn('SERVER' + e.data);
		};

		this.ws.onerror = (e) => {			
			this.setState({ 
				connection: {
					text: 'Connection error',
					color: 'rgba(231, 76, 60, 0.5)',
				}
			});
		};

		this.ws.onclose = (e) => {
			// If the connection dropped
			// Try to reconnect
			if (this.state.serverIp == null) {
				this.setState({ 
					connection: {
						text: 'Enter server ip...',
						color: 'rgba(231, 76, 60, 0.5)',
					}
				});	
			}
			else {
				this.setState({ 
					connection: {
						text: 'Trying to connect...',
						color: 'rgba(231, 76, 60, 0.5)',
					}
				});
			}

			setTimeout(() => {
				this.connectToServer();
			}, 1000);
		};
	}


	sendMoveEvent = () =>
	{
		if (this.ws.readyState === 1 && this.state.robotMode === 'Manual mode ON') {
			this.ws.send(JSON.stringify({ 
				'event': 'move', 
				'joystick_x': this.state.joystick.x, 
				'joystick_y': this.state.joystick.y 
			}));
		}
	}

	toggleMotorsStatus = () =>
	{
		if (this.ws.readyState === 1) {
			if (this.state.motors.theyAreOn === false) {
				// Turn motors on

				this.setState({
					motors: {
						theyAreOn: true,
						buttonText: 'Turn motors OFF',
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
						buttonText: 'Turn motors ON',
					}
				});
	
				this.ws.send(JSON.stringify({
					'event': 'turn_motors',
					'status': 'off',
				}));
			}
		}
	}

	toggleRobotMode = () =>
	{
		if (this.ws.readyState === 1) {
			if (this.state.robotMode === 'Manual mode ON') {
				this.setState({
					robotMode: 'Autonomous mode ON'
				});
	
				this.ws.send(JSON.stringify({
					'event': 'change_mode',
					'mode': 'autonomous',
				}));
			}
			else {
				this.setState({
					robotMode: 'Manual mode ON'
				});
	
				this.ws.send(JSON.stringify({
					'event': 'change_mode',
					'mode': 'manual',
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
						<View style={ styles.connectToIp }>
							<TextInput
								style={ styles.inputServerIp }
								onChangeText={ (ip) => this.setState({ serverIp: ip }) }
								placeholder='Server IP'
								value={this.state.text}
							/>

							<Button onPress = { this.connectToServer } 
									title = 'Connect' 
									color = { 'rgba(60, 60, 60, 0.5)' }>
							</Button>	
						</View>

						<Button onPress = { this.toggleMotorsStatus } 
								title = { this.state.motors.buttonText } 
								color = { 'rgba(60, 60, 60, 0.5)' }>
						</Button>	

						<Button onPress = { this.toggleRobotMode } 
								title = { this.state.robotMode } 
								color = { 'rgba(60, 60, 60, 0.5)' }>
						</Button>	
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
		justifyContent: 'center',
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
	inputServerIp: {
		width: 140,
		height: 30,
		marginRight: 15,
		borderColor: 'rgba(60, 60, 60, 0.2)',
		borderWidth: 0.5,
		borderRadius: 25,
		textAlign: 'center',
	},
	connectToIp: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	}
});