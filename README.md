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
- **android sdk not found**
  - Go [here](https://developer.android.com/studio/index.html#downloads) and download sdk tools
  - Create a folder called *Android* somewhere on the disk and inside it create a folder *tools*
  - In this folder extract what you have downloaded. (Yes, there will be a tools folder inside a tools folder)
  - Go in your application folder and then in android folder and create a new file called `local.properties`
  - Paste this in file `sdk.dir = /home/cosmin/Android/tools/`
- **license agreement**
  - Go in *Android/tools/tools/bin* and run `./sdkmanager --licenses`
- **tools.jar not found**
    - Go [here](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) and download the JDK
    - Extract it somewhere on the disk
    - Go in your application folder and then in anroid folder and open `gradle.properties`
    - Add this line at the end `org.gradle.java.home=/home/......../jdk1.8.0_151/`
- **unable to load script from assets 'index.android.bundle'**
    - Run this: `mkdir android/app/src/main/assets` in your project folder
    - Then this: `react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res`
    - And finally this: `react-native run-android`
- **Failed at the app@0.0.1 start script.**
    -- Run this: `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`

### Notes
- to create a new react-native project use `react-native init myapp`
