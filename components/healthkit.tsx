import HealthKit, {
    HKUnit,
    HKQuantityTypeIdentifier,
    HKCategoryTypeIdentifier,
    HKUnits,
    HKStatisticsOptions,
    GenericQueryOptions,
    UnitOfTime,
} from '@kingstinct/react-native-healthkit';

import BackgroundFetch from 'react-native-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { pingStatusServer, KUMA_ENDPOINTS } from './kuma';
// const API_ENDPOINT = 'https://b934-220-135-157-221.jp.ngrok.io/hkapi';
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
  // HKQuantityTypeIdentifier.appleSleepingWristTemperature,
//   HKQuantityTypeIdentifier.timeInDaylight,
//   HKQuantityTypeIdentifier.physicalEffort,
//   HKQuantityTypeIdentifier.cyclingSpeed,
//   HKQuantityTypeIdentifier.cyclingPower,
//   HKQuantityTypeIdentifier.cyclingFunctionalThresholdPower,
//   HKQuantityTypeIdentifier.cyclingCadence
];

const requestHealthKitAuthorization = async () => {
    const isAvailable = await HealthKit.isHealthDataAvailable();

    if (!isAvailable) {
        console.log('HealthKit is not available on this device!');
        Toast.show({ text1: `HealthKit is not available on this device!`, type: 'error' });
        return;
    }

    await HealthKit.requestAuthorization(ALL_METRIC_TYPES); // request read permission
    await HealthKit.requestAuthorization(ALL_CATEGORY_TYPES); // request read permission

    // Disable auto syncing
    // TODO
    
};

const exportHistoricalHealthData = async (endpoint: string, fromDate?: Date, toDate?: Date) => {

    if (!fromDate) {
        const days = 30;
        fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000); // 30 days ago
    }

    if (!toDate) {
        toDate = new Date(Date.now());
    }

    // random day in 2018
    // const startDate = new Date(2018, 6, 29);
    // const endDate = new Date(2018, 6, 30);

    const metrics = ALL_METRIC_TYPES.map((type) =>
        HealthKit.queryQuantitySamples(type, { from: fromDate, to: toDate })
    );

    const categories = ALL_CATEGORY_TYPES.map((type) =>
        HealthKit.queryCategorySamples(type, { from: fromDate, to: toDate })
    );

    try {
        const allData = await Promise.all([...metrics, ...categories]);
        // const combinedData = allData.flat().filter(data => data.quantityType === HKQuantityTypeIdentifier.heartRate);
        const combinedData = allData.flat();
        console.log(JSON.stringify(combinedData));
        console.log("combinedData.length: " + combinedData.length)

        // Send data to API endpoint
        const response = await axios.post(endpoint, JSON.stringify(combinedData), {
        headers: {
            "Content-Type": "application/json",
        },
        });

        console.log("Saving LAST_HK_SYNC_DATE: " + toDate.toISOString())
        AsyncStorage.setItem('LAST_HK_SYNC_DATE', toDate.toISOString());
        console.log(`Response status: ${response.status}, message: ${response.data}`);
        Toast.show({ text1: `Response status: ${response.status}, message: ${response.data}`, type: 'success' });
    } catch (error) {
        console.error('Error sending data to API:', error);
        Toast.show({ text1: 'Error sending data to API', type: 'error' });
    }
};

const configureHealthKitBackgroundFetch = async () => {
    // Background fetch configuration options
    const fetchInterval = 60 * 12; // every 12 hours in minutes
    // const minimumFetchInterval = fetchInterval / 60; // in hours
  
    console.log('[BackgroundFetch] configureHealthKitBackgroundFetch');
    // Initialize background fetch
    await BackgroundFetch.configure(
      {
        // minimumFetchInterval: fetchInterval, // Leaving this set to default (15 mins), to see if background geo stuff wakes it up
        stopOnTerminate: false, // Probably only works on Android
        startOnBoot: true, // Probably only works on Android
      },
      async (taskId) => {
        console.log('[BackgroundFetch] taskId:', taskId);
  
        const storedEndpoint = await AsyncStorage.getItem('API_ENDPOINT') || '';
        if (storedEndpoint) {

            const lastSyncDate = await AsyncStorage.getItem('LAST_HK_SYNC_DATE');
            let fromDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

            if (lastSyncDate !== null) {
                fromDate = new Date(lastSyncDate);
            }

            const toDate = new Date(Date.now());
            await exportHistoricalHealthData(storedEndpoint, fromDate, toDate);
            await AsyncStorage.setItem('LAST_HK_SYNC_DATE', toDate.toISOString());

            pingStatusServer(KUMA_ENDPOINTS.healthkit);
        } else {
            console.log('No API endpoint configured, skipping background fetch');
        }
  
        console.log('[BackgroundFetch] Complete!');
        BackgroundFetch.finish(taskId);
      },
      (error) => {
        console.log('[BackgroundFetch] failed to start:', error);
      },
    );
  
    // Query the status of your background fetch
    const status = await BackgroundFetch.status();
    console.log('[BackgroundFetch] status:', status);
  };

export {
    ALL_METRIC_TYPES,
    ALL_CATEGORY_TYPES,
    requestHealthKitAuthorization,
    exportHistoricalHealthData,
    configureHealthKitBackgroundFetch
  };