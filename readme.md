# Environment Setup

## Instructions
https://reactnative.dev/docs/environment-setup

## Install tools with Homebrew
brew install node
brew install watchman
brew install rbenv ruby-build

## Add this to .zshrc
```bash
export GEM_HOME=$HOME/.gem
export PATH=$GEM_HOME/bin:$PATH
eval "$(rbenv init - zsh)"
```

# Start from scratch
npx react-native@latest init hkx
yarn add react-native-health
cd ios && pod install

## Update the `ios/<Project Name>/info.plist` file in your project
```xml
<key>NSHealthShareUsageDescription</key>
<string>Read and understand health data.</string>
<key>NSHealthUpdateUsageDescription</key>
<string>Share workout data with other apps.</string>
<!-- Below is only required if requesting clinical health data -->
<key>NSHealthClinicalHealthRecordsShareUsageDescription</key>
<string>Read and understand clinical health data.</string>
```

To add Healthkit support to your application's Capabilities

- Open the ios/ folder of your project in Xcode
- Select the project name in the left sidebar
- In the main view select '+ Capability' and double click 'HealthKit'

To enable access to clinical data types, check the Clinical Health Records box.

## Bundle the app, and run it on device without metro or xcode
```bash
yarn deploy
```