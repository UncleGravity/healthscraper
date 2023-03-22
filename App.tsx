// ALT NAME: HEALTHRAISER
import React, {Component} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import HealthKit, { HKUnit, HKQuantityTypeIdentifier, HKCategoryTypeIdentifier, HKUnits, HKStatisticsOptions, GenericQueryOptions} from '@kingstinct/react-native-healthkit';
import Toast from 'react-native-toast-message';
import queryWorkouts from '@kingstinct/react-native-healthkit/lib/typescript/src/utils/queryWorkouts';

type AppState = {};

class App extends Component<{}, AppState> {

  componentDidMount() {
    this.requestHealthKitAuthorization();
  }
 
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // 
  async handlePressGetAuthStatus() {
    const isAvailable = await HealthKit.isHealthDataAvailable();
    /* Read latest sample of any data */
    const result = await HealthKit.authorizationStatusFor(HKQuantityTypeIdentifier.stepCount);
    console.log(`HealthKit Auth Status: ${result}`)
    Toast.show({text1: `HealthKit Auth Status: ${result}`, type: 'success'});
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // 
  async requestHealthKitAuthorization() {

    const isAvailable = await HealthKit.isHealthDataAvailable();

    if (!isAvailable) {;
      console.log('HealthKit is not available on this device!')
      Toast.show({text1: `HealthKit is not available on this device!`, type: 'error'});
      return;
    }

    await HealthKit.requestAuthorization([HKQuantityTypeIdentifier.stepCount]); // request read permission for bodyFatPercentage
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // 
  async exportHistoricalHealthData() {
    const endDate = new Date(Date.now());
    const startDate = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)); // 7 days ago
    // const from = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const result = await HealthKit.getMostRecentQuantitySample(HKQuantityTypeIdentifier.stepCount, HKUnits.Count); // read latest sample
    // const last_48_hours_bf = await HealthKit.queryStatisticsForQuantity(HKQuantityTypeIdentifier.stepCount, [HKStatisticsOptions.separateBySource], startDate);
    const last_7_days_steps = await HealthKit.queryQuantitySamples(HKQuantityTypeIdentifier.stepCount, {from: startDate, to: endDate});
    // const get_sources_list = await HealthKit.querySources(HKQuantityTypeIdentifier.bodyFatPercentage);
    // const json_result = JSON.stringify(result);
    console.log(result?.quantity);
    console.log(JSON.stringify(last_7_days_steps));
    Toast.show({text1: `Last Step Count: ${result?.quantity}`, type: 'info'});
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Render
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