// TODO: Export HK data in the background once per day.
// Goal is to do everything in the background, so that the user doesn't have to open the app.
// Maybe use uptimekuma to check if I haven't uploaded data in a while.

import React, { useState, useEffect } from 'react';
import {
  Switch,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Keyboard,
} from 'react-native';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import Button from './components/Button';
import Input from './components/Input';

import BackgroundGeolocation, {
  Subscription,
  State,
  Config,
  Location,
  LocationError,
  Geofence,
  GeofenceEvent,
  GeofencesChangeEvent,
  HeartbeatEvent,
  HttpEvent,
  MotionActivityEvent,
  MotionChangeEvent,
  ProviderChangeEvent,
  ConnectivityChangeEvent
} from "react-native-background-geolocation";

const API_ENDPOINT = 'https://b934-220-135-157-221.jp.ngrok.io/hkapi';
// const API_ENDPOINT = 'https://b934-220-135-157-221.jp.ngrok.io/test';

const ALL_CATEGORY_TYPES = [
  // Categories
  HKCategoryTypeIdentifier.sleepAnalysis,
  // HKCategoryTypeIdentifier.audioExposureEvent,
  // HKCategoryTypeIdentifier.environmentalAudioExposureEvent,
  // HKCategoryTypeIdentifier.headphoneAudioExposureEvent,
  // HKCategoryTypeIdentifier.highHeartRateEvent,
  // HKCategoryTypeIdentifier.lowHeartRateEvent,
  // HKCategoryTypeIdentifier.irregularHeartRhythmEvent,
  // HKCategoryTypeIdentifier.sleepChanges
];

const ALL_METRIC_TYPES = [
  // Metrics
  HKQuantityTypeIdentifier.bodyMassIndex,
  HKQuantityTypeIdentifier.bodyFatPercentage,
  // HKQuantityTypeIdentifier.height,
  HKQuantityTypeIdentifier.bodyMass,
  HKQuantityTypeIdentifier.leanBodyMass,
  // HKQuantityTypeIdentifier.waistCircumference,
  HKQuantityTypeIdentifier.stepCount,
  HKQuantityTypeIdentifier.distanceWalkingRunning,
  // HKQuantityTypeIdentifier.distanceCycling,
  // HKQuantityTypeIdentifier.distanceWheelchair,
  HKQuantityTypeIdentifier.basalEnergyBurned,
  HKQuantityTypeIdentifier.activeEnergyBurned,
  // HKQuantityTypeIdentifier.flightsClimbed,
  // HKQuantityTypeIdentifier.nikeFuel,
  // HKQuantityTypeIdentifier.appleExerciseTime,
  // HKQuantityTypeIdentifier.pushCount,
  // HKQuantityTypeIdentifier.distanceSwimming,
  // HKQuantityTypeIdentifier.swimmingStrokeCount,
  HKQuantityTypeIdentifier.vo2Max,
  // HKQuantityTypeIdentifier.distanceDownhillSnowSports,
  HKQuantityTypeIdentifier.appleStandTime,
  HKQuantityTypeIdentifier.heartRate,
  HKQuantityTypeIdentifier.bodyTemperature,
  // HKQuantityTypeIdentifier.basalBodyTemperature,
  HKQuantityTypeIdentifier.bloodPressureSystolic,
  HKQuantityTypeIdentifier.bloodPressureDiastolic,
  HKQuantityTypeIdentifier.respiratoryRate,
  HKQuantityTypeIdentifier.restingHeartRate,
  HKQuantityTypeIdentifier.walkingHeartRateAverage,
  HKQuantityTypeIdentifier.heartRateVariabilitySDNN,
  HKQuantityTypeIdentifier.oxygenSaturation,
  // HKQuantityTypeIdentifier.peripheralPerfusionIndex,
  HKQuantityTypeIdentifier.bloodGlucose,
  // HKQuantityTypeIdentifier.numberOfTimesFallen,
  // HKQuantityTypeIdentifier.electrodermalActivity,
  // HKQuantityTypeIdentifier.inhalerUsage,
  // HKQuantityTypeIdentifier.insulinDelivery,
  // HKQuantityTypeIdentifier.bloodAlcoholContent,
  // HKQuantityTypeIdentifier.forcedVitalCapacity,
  // HKQuantityTypeIdentifier.forcedExpiratoryVolume1,
  // HKQuantityTypeIdentifier.peakExpiratoryFlowRate,
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
  // HKQuantityTypeIdentifier.sixMinuteWalkTestDistance,
  // HKQuantityTypeIdentifier.walkingSpeed,
  // HKQuantityTypeIdentifier.walkingStepLength,
  // HKQuantityTypeIdentifier.walkingAsymmetryPercentage,
  // HKQuantityTypeIdentifier.walkingDoubleSupportPercentage, 
  // HKQuantityTypeIdentifier.stairAscentSpeed,
  // HKQuantityTypeIdentifier.stairDescentSpeed,
  // HKQuantityTypeIdentifier.uvExposure,
  HKQuantityTypeIdentifier.appleMoveTime,
  // HKQuantityTypeIdentifier.appleWalkingSteadiness,
  // HKQuantityTypeIdentifier.numberOfAlcoholicBeverages,
  // HKQuantityTypeIdentifier.atrialFibrillationBurden,
  // HKQuantityTypeIdentifier.underwaterDepth,
  // HKQuantityTypeIdentifier.waterTemperature,
  // HKQuantityTypeIdentifier.appleSleepingWristTemperature
];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EXPORT DATA
const requestHealthKitAuthorization = async () => {
  const isAvailable = await HealthKit.isHealthDataAvailable();

  if (!isAvailable) {
    console.log('HealthKit is not available on this device!');
    Toast.show({ text1: `HealthKit is not available on this device!`, type: 'error' });
    return;
  }

  await HealthKit.requestAuthorization(ALL_METRIC_TYPES); // request read permission
  await HealthKit.requestAuthorization(ALL_CATEGORY_TYPES); // request read permission

};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// APP
const HealthRaiserApp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    requestHealthKitAuthorization();
    loadApiEndpoint();
  }, []);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const loadApiEndpoint = async () => {
    try {
      const savedApiEndpoint = await AsyncStorage.getItem('API_ENDPOINT');
      if (savedApiEndpoint !== null) {
        setApiEndpoint(savedApiEndpoint);
      } else {
        // Set a default value if it's not saved before.
        setApiEndpoint('https://33ca-143-244-49-17.sa.ngrok.io/test');
      }
    } catch (error) {
      // Error handling; display an error message or handle it as necessary
    }
  };

  const saveApiEndpoint = async (newApiEndpoint: string) => {
    try {
      setApiEndpoint(newApiEndpoint);
      console.log('Saving API_ENDPOINT: ' + newApiEndpoint)
      await AsyncStorage.setItem('API_ENDPOINT', newApiEndpoint);
      Keyboard.dismiss(); // Dismiss the keyboard
      toggleModal(); // Hide the modal
    } catch (error) {
      // Error handling; display an error message or handle it as necessary
    }
  };  
  
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // FUNC: HANDLE GET AUTH STATUS
  const handlePressGetAuthStatus = async () => {
    const result = await HealthKit.authorizationStatusFor(HKQuantityTypeIdentifier.appleMoveTime);
    console.log(`HealthKit Auth Status: ${result}`);
    Toast.show({ text1: `HealthKit Auth Status: ${result}`, type: 'success' });
  };

  const testFunction = async () => {
    // const lastSleep = await HealthKit.getMostRecentCategorySample(HKCategoryTypeIdentifier.sleepAnalysis);
    // console.log("latest sleep: " + JSON.stringify(lastSleep));

    const sleep = await HealthKit.queryCategorySamples(HKCategoryTypeIdentifier.sleepAnalysis, { from: new Date(2023, 0, 1), to: new Date(2023, 2, 14) });
    console.log("sleep: " + JSON.stringify(sleep));
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // FUNC: EXPORT DATA
  const exportHistoricalHealthData = async () => {
    setIsLoading(true);
  
    const days = 30;
    const endDate = new Date(Date.now());
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000); // 30 days ago

    // random day in 2018
    // const startDate = new Date(2018, 6, 29);
    // const endDate = new Date(2018, 6, 30);
  
    const metrics = ALL_METRIC_TYPES.map((type) =>
      HealthKit.queryQuantitySamples(type, { from: startDate, to: endDate })
    );

    const categories = ALL_CATEGORY_TYPES.map((type) =>
      HealthKit.queryCategorySamples(type, { from: startDate, to: endDate })
    );
  
    try {
      const allData = await Promise.all([...metrics, ...categories]);
      // const combinedData = allData.flat().filter(data => data.quantityType === HKQuantityTypeIdentifier.heartRate);
      const combinedData = allData.flat();
      console.log(JSON.stringify(combinedData));
      console.log("combinedData.length: " + combinedData.length)
  
      // Send data to API endpoint
      const response = await axios.post(apiEndpoint, JSON.stringify(combinedData), {
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
      setIsLoading(false);
    }
  };

  const configureBackgroundGeolocation = async () => {

    let token = await BackgroundGeolocation.findOrCreateTransistorAuthorizationToken("vieratech", "unclegravity");

    BackgroundGeolocation.ready({
      // Geolocation Config
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_NAVIGATION, // iOS only, change to DESIRED_ACCURACY_HIGH for cross-platform support.
      distanceFilter: 10,
      // Activity Recognition
      stopTimeout: 5,
      // Application config
      debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false,   // <-- Allow the background-service to continue tracking when user closes the app.
      startOnBoot: true,        // <-- Auto start tracking when device is powered-up.
      // HTTP / SQLite config
      // url: 'https://livelygrandstruct.angelviera.repl.co/geo',
      url: 'https://edbd-220-135-157-221.ngrok-free.app/maps',
      // url: 'https://tracker.transistorsoft.com/unclegravity',
      batchSync: true,       // <-- [Default: false] If set to false, will cause error in my server, because my server expects a batch of locations (an array)
      autoSync: true,         // <-- [Default: true] Set true to sync each location to server as it arrives.
      maxBatchSize: 100,
      autoSyncThreshold: 10,
      headers: {              // <-- Optional HTTP headers
        "X-FOO": "bar"
      },
      // transistorAuthorizationToken: token
      // params: {               // <-- Optional HTTP params
      //   "auth_token": "maybe_your_server_authenticates_via_token_YES?"
      // }
    }).then((state) => {
      setBgGeoEnabled(state.enabled)
      console.log("- BackgroundGeolocation is configured and ready: ", state.enabled);
    });
  };

  const loadGeoEnabledState = async () => {
    try {
      const savedEnabledState = await AsyncStorage.getItem('BACKGROUND_GEOLOCATION_ENABLED');
      if (savedEnabledState !== null) {
        setBgGeoEnabled(savedEnabledState === 'true');
        console.log("Loaded geo plugin state: " + savedEnabledState);
      }
    } catch (error) {
      // Error handling; display an error message or handle it as necessary
    }
  };

  const setGeoEnabledState = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('BACKGROUND_GEOLOCATION_ENABLED', value.toString());
      setBgGeoEnabled(value);
      console.log("Saved geo plugin state: " + value);
    } catch (error) {
      // Error handling; display an error message or handle it as necessary
    }
  };

  const [bgGeoEnabled, setBgGeoEnabled] = React.useState(false);
  const [location, setLocation] = React.useState('');

  React.useEffect(() => {
    /// 1.  Subscribe to events.
    const onLocation:Subscription = BackgroundGeolocation.onLocation((location) => {
      console.log('[onLocation]', location);
      setLocation(JSON.stringify(location, null, 2));
    })

    const onMotionChange:Subscription = BackgroundGeolocation.onMotionChange((event) => {
      console.log('[onMotionChange]', event);
    });

    const onActivityChange:Subscription = BackgroundGeolocation.onActivityChange((event) => {
      console.log('[onActivityChange]', event);
    })

    const onProviderChange:Subscription = BackgroundGeolocation.onProviderChange((event) => {
      console.log('[onProviderChange]', event);
    })

    /// 2. ready the plugin.
    configureBackgroundGeolocation()

    return () => {
      // Remove BackgroundGeolocation event-subscribers when the View is removed or refreshed
      // during development live-reload.  Without this, event-listeners will accumulate with
      // each refresh during live-reload.
      onLocation.remove();
      onMotionChange.remove();
      onActivityChange.remove();
      onProviderChange.remove();
    }
  }, []);

  /// 3. start / stop BackgroundGeolocation
  React.useEffect(() => {
    loadGeoEnabledState();
    if (bgGeoEnabled) {
      BackgroundGeolocation.start();
    } else {
      BackgroundGeolocation.stop();
      setLocation('');
    }
  }, [bgGeoEnabled]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HealthKit Data Exporter</Text>

      <View style={{alignItems:'center'}}>
        <Text>Click to enable BackgroundGeolocation</Text>
        <Switch value={bgGeoEnabled} onValueChange={setGeoEnabledState} />
        {/* <Text style={{fontFamily:'Helvetica', fontSize:12, color:'#fff'}}>{location}</Text> */}
      </View>

      <Button onPress={toggleModal} title="Set API Endpoint" />

      <Modal
        animationType="slide"
        transparent={false}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.inputContainer}>
            <Input
              onChangeText={(text) => setApiEndpoint(text)}
              value={apiEndpoint}
              placeholder="Enter API_ENDPOINT..."
            />
            <TouchableOpacity onPress={() => saveApiEndpoint(apiEndpoint)} style={styles.saveButton}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
          <Button onPress={toggleModal} title="Close" />
        </View>
      </Modal>

      {/* <Button onPress={handlePressGetAuthStatus} title="Healthkit Auth Status" /> */}
      <Button onPress={exportHistoricalHealthData} title="Export Last 7 Days Data" />
      {/* <Button onPress={testFunction} title="Test" /> */}

      {isLoading && (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.loadingIndicator}
        />
      )}

      <Toast />
    </View>
  );
};

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
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  input: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
    paddingLeft: 8,
    backgroundColor: 'white',
    fontSize: 16,
    color: 'black',
    height: 40,
  },
  saveButton: {
    backgroundColor: 'purple',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default HealthRaiserApp;