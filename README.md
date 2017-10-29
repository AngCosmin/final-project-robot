# licenta-robot

Tested on:
- node: v8.5.0
- npm: 5.3.0
- python: 2.7.9

# For NodeJS:  
`npm install --save ws`

# For Python:  
`pip install websockets`

# For React-Native  
- `npm install -g react-native-cli`  
- `npm install -g yarn`  
- `sudo apt-get install android-tools-adb`  
- Go [here](https://facebook.github.io/react-native/docs/running-on-device.html) and do what they say
- `react-native start`. If you have a port error you can use `react-native start --port=8088`

Errors
- if you get an error with **gradle** which say it couldn't be found then go in android folder open build.gradle and instead of jcenter() use this: 
```
jcenter({
    url "http://jcenter.bintray.com/"
})
```
- if you get an error with android **sdk not found**
  - Go [here](https://developer.android.com/studio/index.html#downloads) and download sdk tools
  - Create a folder called *Android* somewhere on the disk and inside it create a folder *tools*
  - In this folder extract what you have downloaded. (Yes, there will be a tools folder inside a tools folder)
  - Go in your application folder and then in android folder and create a new file called `local.properties`
  - Paste this in file `sdk.dir = /home/cosmin/Android/tools/`
- if you get an error with **license agreement**
  - Go in *Android/tools/tools/bin* and run `./sdkmanager --licenses`

### Notes
- to create a new react-native project use `react-native init myapp`
