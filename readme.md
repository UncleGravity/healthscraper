# Healthscraper App
Describe app here

# Environment Setup

### React Native Install Instructions
https://reactnative.dev/docs/environment-setup

### Install tools with Homebrew
```bash
brew install node # or whichever node manager you prefer (n, nvm, etc)
brew install watchman
brew install rbenv ruby-build
```

### Add this to .zshrc
```bash
export GEM_HOME=$HOME/.gem
export PATH=$GEM_HOME/bin:$PATH
eval "$(rbenv init - zsh)"
```

### Install Ruby and Node versions specified in .node-version and .ruby-version
```bash
rbenv install 2.7.6
n 18
```

# OPTION 1: Install from git
git clone <repo-name>
cd repo-name
yarn install
npx pods-install
yarn start

# OPTION 2: If stuff breaks (it will), install app from scratch like this:

### Init new react native project with latest defaults
npx react-native@latest init <project-name>
cd <project-name>

### If using node version manager (I use n)
Change the export line in ./ios/.xcode.env to reflect the actual node location. For example, if using n:
```node
export NODE_BINARY="$HOME/n/bin/node"
```

### Add project dependencies
yarn add @kingstinct/react-native-healthkit
yarn add @react-native-async-storage/async-storage
yarn add axios
yarn add react-native-toast-message

### Install dependencies
yarn install
npx pod-install

### Update the `ios/<Project Name>/info.plist` file in your project
```xml
<key>NSHealthShareUsageDescription</key>
<string>Read and understand health data.</string>
<key>NSHealthUpdateUsageDescription</key>
<string>Share workout data with other apps.</string>
<!-- Below is only required if requesting clinical health data -->
<key>NSHealthClinicalHealthRecordsShareUsageDescription</key>
<string>Read and understand clinical health data.</string>
```

### Add Healthkit to your application's Capabilities

- Open the ios/ folder of your project in Xcode
- Select the project name in the left sidebar
- In the main view select '+ Capability' and double click 'HealthKit'

To enable access to clinical data types, check the Clinical Health Records box.

# Extra

## Run the app with metro
```bash
yarn start # Then press 'i'
```

# If you see Watchman warning
```bash
watchman watch-del-all
watchman shutdown-server
```

## Bundle the app, and run it on device without metro or xcode
```bash
yarn deploy
```

# Complete pod cleanup
```bash
cd ios
pod cache clean --all
rm -rf ~/Library/Caches/CocoaPods
rm -rf Pods
rm -rf ~/Library/Developer/Xcode/DerivedData/*
pod deintegrate
pod setup
pod install
```