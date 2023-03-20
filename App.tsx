import React, {Component} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import HealthKit, { HKUnit, HKQuantityTypeIdentifier, HKCategoryTypeIdentifier, HKUnits } from '@kingstinct/react-native-healthkit';
import Toast from 'react-native-toast-message';

type AppState = {};

class App extends Component<{}, AppState> {

  componentDidMount() {
    this.requestHealthKitAuthorization();
  }

  async handlePressGetAuthStatus() {
    const isAvailable = await HealthKit.isHealthDataAvailable();
    /* Read latest sample of any data */
    const result = await HealthKit.authorizationStatusFor(HKQuantityTypeIdentifier.bodyFatPercentage);
    console.log(`HealthKit Auth Status: ${result}`)
    Toast.show({text1: `HealthKit Auth Status: ${result}`, type: 'success'});
  };

  async requestHealthKitAuthorization() {

    const isAvailable = await HealthKit.isHealthDataAvailable();

    if (!isAvailable) {;
      console.log('HealthKit is not available on this device!')
      Toast.show({text1: `HealthKit is not available on this device!`, type: 'error'});
      return;
    }

    await HealthKit.requestAuthorization([HKQuantityTypeIdentifier.bodyFatPercentage]); // request read permission for bodyFatPercentage
  }

  async exportHistoricalHealthData() {
    const result = await HealthKit.getMostRecentQuantitySample(HKQuantityTypeIdentifier.bodyFatPercentage, HKUnits.Percent); // read latest sample
    const json_result = JSON.stringify(result);
    console.log(result?.quantity);
    Toast.show({text1: `Last BF%: ${result?.quantity}`, type: 'info'});
  }

  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>HealthKit Step Data Exporter</Text>
        <TouchableOpacity
          onPress={this.handlePressGetAuthStatus.bind(this)}
          style={{
            backgroundColor: '#4CAF50',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 5,
            marginTop: 20,
          }}>
          <Text style={{color: 'white'}}>Healthkit Auth Status</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={this.exportHistoricalHealthData.bind(this)}
          style={{
            backgroundColor: '#4CAF50',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 5,
            marginTop: 20,
          }}>
          <Text style={{color: 'white'}}>Get Last Body Fat %</Text>
        </TouchableOpacity>
        <Toast />
      </View>
    );
  }
}

export default App;