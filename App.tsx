// ALT NAME: HEALTHRAISER
import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import HealthKit, {
  HKUnit,
  HKQuantityTypeIdentifier,
  HKCategoryTypeIdentifier,
  HKUnits,
  HKStatisticsOptions,
  GenericQueryOptions,
  UnitOfTime,
} from '@kingstinct/react-native-healthkit';
import Toast from 'react-native-toast-message';
import axios from 'axios';

type AppState = {
  isLoading: boolean,
};

type ButtonProps = {
  onPress: () => void;
  title: string;
};

class App extends Component<{}, AppState> {

  constructor(props: React.PropsWithoutRef<{}>) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  API_ENDPOINT = 'https://6cba-220-135-157-221.jp.ngrok.io/test';

  ALL_METRIC_TYPES = [
    HKQuantityTypeIdentifier.bodyMassIndex,
    HKQuantityTypeIdentifier.bodyFatPercentage,
    HKQuantityTypeIdentifier.height,
    HKQuantityTypeIdentifier.bodyMass,
    HKQuantityTypeIdentifier.leanBodyMass,
    HKQuantityTypeIdentifier.waistCircumference,
    HKQuantityTypeIdentifier.stepCount,
    HKQuantityTypeIdentifier.distanceWalkingRunning,
    HKQuantityTypeIdentifier.distanceCycling,
    HKQuantityTypeIdentifier.distanceWheelchair,
    HKQuantityTypeIdentifier.basalEnergyBurned,
    HKQuantityTypeIdentifier.activeEnergyBurned,
    HKQuantityTypeIdentifier.flightsClimbed,
    HKQuantityTypeIdentifier.nikeFuel,
    HKQuantityTypeIdentifier.appleExerciseTime,
    HKQuantityTypeIdentifier.pushCount,
    HKQuantityTypeIdentifier.distanceSwimming,
    HKQuantityTypeIdentifier.swimmingStrokeCount,
    HKQuantityTypeIdentifier.vo2Max,
    HKQuantityTypeIdentifier.distanceDownhillSnowSports,
    HKQuantityTypeIdentifier.appleStandTime,
    HKQuantityTypeIdentifier.heartRate,
    HKQuantityTypeIdentifier.bodyTemperature,
    HKQuantityTypeIdentifier.basalBodyTemperature,
    HKQuantityTypeIdentifier.bloodPressureSystolic,
    HKQuantityTypeIdentifier.bloodPressureDiastolic,
    HKQuantityTypeIdentifier.respiratoryRate,
    HKQuantityTypeIdentifier.restingHeartRate,
    HKQuantityTypeIdentifier.walkingHeartRateAverage,
    HKQuantityTypeIdentifier.heartRateVariabilitySDNN,
    HKQuantityTypeIdentifier.oxygenSaturation,
    HKQuantityTypeIdentifier.peripheralPerfusionIndex,
    HKQuantityTypeIdentifier.bloodGlucose,
    HKQuantityTypeIdentifier.numberOfTimesFallen,
    HKQuantityTypeIdentifier.electrodermalActivity,
    HKQuantityTypeIdentifier.inhalerUsage,
    HKQuantityTypeIdentifier.insulinDelivery,
    HKQuantityTypeIdentifier.bloodAlcoholContent,
    HKQuantityTypeIdentifier.forcedVitalCapacity,
    HKQuantityTypeIdentifier.forcedExpiratoryVolume1,
    HKQuantityTypeIdentifier.peakExpiratoryFlowRate,
    HKQuantityTypeIdentifier.environmentalAudioExposure,
    HKQuantityTypeIdentifier.headphoneAudioExposure,
    HKQuantityTypeIdentifier.dietaryFatTotal,
    HKQuantityTypeIdentifier.dietaryFatPolyunsaturated,
    HKQuantityTypeIdentifier.dietaryFatMonounsaturated,
    HKQuantityTypeIdentifier.dietaryFatSaturated,
    HKQuantityTypeIdentifier.dietaryCholesterol,
    HKQuantityTypeIdentifier.dietarySodium,
    HKQuantityTypeIdentifier.dietaryCarbohydrates,
    HKQuantityTypeIdentifier.dietaryFiber,
    HKQuantityTypeIdentifier.dietarySugar,
    HKQuantityTypeIdentifier.dietaryEnergyConsumed,
    HKQuantityTypeIdentifier.dietaryProtein,
    HKQuantityTypeIdentifier.dietaryVitaminA,
    HKQuantityTypeIdentifier.dietaryVitaminB6,
    HKQuantityTypeIdentifier.dietaryVitaminB12,
    HKQuantityTypeIdentifier.dietaryVitaminC,
    HKQuantityTypeIdentifier.dietaryVitaminD,
    HKQuantityTypeIdentifier.dietaryVitaminE,
    HKQuantityTypeIdentifier.dietaryVitaminK,
    HKQuantityTypeIdentifier.dietaryCalcium,
    HKQuantityTypeIdentifier.dietaryIron,
    HKQuantityTypeIdentifier.dietaryThiamin,
    HKQuantityTypeIdentifier.dietaryRiboflavin,
    HKQuantityTypeIdentifier.dietaryNiacin,
    HKQuantityTypeIdentifier.dietaryFolate,
    HKQuantityTypeIdentifier.dietaryBiotin,
    HKQuantityTypeIdentifier.dietaryPantothenicAcid,
    HKQuantityTypeIdentifier.dietaryPhosphorus,
    HKQuantityTypeIdentifier.dietaryIodine,
    HKQuantityTypeIdentifier.dietaryMagnesium,
    HKQuantityTypeIdentifier.dietaryZinc,
    HKQuantityTypeIdentifier.dietarySelenium,
    HKQuantityTypeIdentifier.dietaryCopper,
    HKQuantityTypeIdentifier.dietaryManganese,
    HKQuantityTypeIdentifier.dietaryChromium,
    HKQuantityTypeIdentifier.dietaryMolybdenum,
    HKQuantityTypeIdentifier.dietaryChloride,
    HKQuantityTypeIdentifier.dietaryPotassium,
    HKQuantityTypeIdentifier.dietaryCaffeine,
    HKQuantityTypeIdentifier.dietaryWater,
    HKQuantityTypeIdentifier.sixMinuteWalkTestDistance,
    HKQuantityTypeIdentifier.walkingSpeed,
    HKQuantityTypeIdentifier.walkingStepLength,
    HKQuantityTypeIdentifier.walkingAsymmetryPercentage,
    HKQuantityTypeIdentifier.walkingDoubleSupportPercentage,
    HKQuantityTypeIdentifier.stairAscentSpeed,
    HKQuantityTypeIdentifier.stairDescentSpeed,
    HKQuantityTypeIdentifier.uvExposure,
    HKQuantityTypeIdentifier.appleMoveTime,
    HKQuantityTypeIdentifier.appleWalkingSteadiness,
    HKQuantityTypeIdentifier.numberOfAlcoholicBeverages,
    HKQuantityTypeIdentifier.atrialFibrillationBurden,
    HKQuantityTypeIdentifier.underwaterDepth,
    HKQuantityTypeIdentifier.waterTemperature,
    HKQuantityTypeIdentifier.appleSleepingWristTemperature,
  ];

  componentDidMount() {
    this.requestHealthKitAuthorization();
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // REQUEST AUTH
  async requestHealthKitAuthorization() {
    const isAvailable = await HealthKit.isHealthDataAvailable();

    if (!isAvailable) {
      console.log('HealthKit is not available on this device!');
      Toast.show({ text1: `HealthKit is not available on this device!`, type: 'error' });
      return;
    }

    await HealthKit.requestAuthorization(this.ALL_METRIC_TYPES); // request read permission
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // GET AUTH STATUS
  async handlePressGetAuthStatus() {
    const isAvailable = await HealthKit.isHealthDataAvailable();
    /* Read latest sample of any data */
    const result = await HealthKit.authorizationStatusFor(HKQuantityTypeIdentifier.appleMoveTime);
    console.log(`HealthKit Auth Status: ${result}`);
    Toast.show({ text1: `HealthKit Auth Status: ${result}`, type: 'success' });
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // EXPORT DATA
  async exportHistoricalHealthData() {
    this.setState({ isLoading: true });

    const days = 1;
    const endDate = new Date(Date.now());
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000); // 7 days ago

    const promises = this.ALL_METRIC_TYPES.map((type) =>
      HealthKit.queryQuantitySamples(type, { from: startDate, to: endDate })
    );

    try {
      const allData = await Promise.all(promises);
      const combinedData = allData.flat();
      console.log(JSON.stringify(combinedData));

      // Send data to API endpoint
      const response = await axios.post(this.API_ENDPOINT, JSON.stringify(combinedData), {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(`Response status: ${response.status}, message: ${response.data}`);
      Toast.show({ text1: `Response status: ${response.status}, message: ${response.data}`, type: 'success' });
    } catch (error) {
      console.error('Error sending data to API:', error);
      Toast.show({ text1: 'Error sending data to API', type: 'error' });
    } finally {
      this.setState({ isLoading: false });
    }
  }


  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Render
  render() {
    const { isLoading } = this.state;
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>HealthKit Data Exporter</Text>
        
        <Button onPress={this.handlePressGetAuthStatus.bind(this)} title="Healthkit Auth Status" />
        <Button onPress={this.exportHistoricalHealthData.bind(this)} title="Export Last 7 Days Data" />
        
        {isLoading && (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
        )}
        
        <Toast />
      </View>
    );
  }
}

const Button: React.FC<ButtonProps> = ({ onPress, title }) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.button}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default App;