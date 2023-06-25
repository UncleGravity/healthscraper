import HealthKit, {
    HKUnit,
    HKQuantityTypeIdentifier,
    HKCategoryTypeIdentifier,
    HKUnits,
    HKStatisticsOptions,
    GenericQueryOptions,
    UnitOfTime,
    HKUpdateFrequency,
    UnitOfEnergy
} from '@kingstinct/react-native-healthkit';

import BackgroundFetch from 'react-native-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { pingStatusServer, KUMA_ENDPOINTS } from './kuma';
import React, { useEffect, useState } from 'react';

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

let isBackgroundObserversSetup = false;
const configureHealthKitBackgroundDelivery = async () => {

    if (isBackgroundObserversSetup) {
        return;
    }
    
    isBackgroundObserversSetup = true;

    // HealthKit.disableAllBackgroundDelivery().then((result) => {
    //     console.log(`disableAllBackgroundDelivery: ${result}`);
    // });

    const result = await HealthKit.enableBackgroundDelivery(HKQuantityTypeIdentifier.activeEnergyBurned, HKUpdateFrequency.immediate);

    if (result) {
        console.log(`Background delivery ENABLED for ${HKQuantityTypeIdentifier.activeEnergyBurned}`);
    } else {
        console.error(`Background delivery FAILED for ${HKQuantityTypeIdentifier.activeEnergyBurned}`);
    }

    // ALL_METRIC_TYPES.forEach(hktype => {
    //     HealthKit.enableBackgroundDelivery(hktype, HKUpdateFrequency.hourly).then(() => {
    //         console.log(`Background delivery ENABLED for ${hktype}`);
    //     }).catch((err) => {
    //         console.error(`Background delivery FAILED for ${hktype}`, err);
    //     });
    // });

    // ALL_CATEGORY_TYPES.forEach(hktype => {
    //     HealthKit.enableBackgroundDelivery(hktype, HKUpdateFrequency.hourly).then(() => {
    //         console.log(`Background delivery ENABLED for ${hktype}`);
    //     }).catch((err) => {
    //         console.error(`Background delivery FAILED for ${hktype}`, err);
    //     });
    // });

    // https://github.com/Kingstinct/react-native-healthkit/pull/55
    // HealthKit.queryQuantitySamplesWithAnchor(HKQuantityTypeIdentifier.heartRate, { from: new Date(Date.now() - 24 * 60 * 60 * 1000), to: new Date(Date.now()) }).then((result) => {
    //     console.log(`queryQuantitySamplesWithAnchor: ${result}`);
    // }).catch((err) => {
    //     console.error(`queryQuantitySamplesWithAnchor FAILED`, err);
    // });

};

const healthKitSubscribeToChanges = async () => {

    HealthKit.useSubscribeToChanges(HKQuantityTypeIdentifier.activeEnergyBurned, async () => {
    
        console.log('HealthKit.useSubscribeToChanges: activeEnergyBurned');
        const data = await HealthKit.getMostRecentQuantitySample(HKQuantityTypeIdentifier.activeEnergyBurned, UnitOfEnergy.Kilocalories);

        if (!data) {
            console.log('HealthKit.getMostRecentQuantitySample: activeEnergyBurned: no data');
            return;
        }

        pingStatusServer(KUMA_ENDPOINTS.healthkit);

        axios.get('https://dentalunrealistickeyboard.angelviera.repl.co/ping')
        .then(({ data }) => console.log("Ping to Replit success: " + data))
        .catch(error => console.error('Ping to Replit error:', error.message));

    });
}

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

                // pingStatusServer(KUMA_ENDPOINTS.healthkit);
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

const formatDate = (date: Date) => {
    const pad = (n: number) => {
        return n < 10 ? '0' + n : n;
    };

    return (
        date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
    );
};

const addDays = (date: Date, days: number) => {
    const _date = new Date(date.getTime());
    _date.setDate(_date.getDate() + days);
    return _date;
};

const getRecursiveData = async ({ limit = 10, anchor }: { limit?: number, anchor?: string }): Promise<{} | undefined> => {
    if (!anchor) {
        anchor = (await AsyncStorage.getItem('anchor')) ?? undefined;
    }

    const to = new Date(formatDate(addDays(new Date(), 1)));
    const from = addDays(to, -365);

    const { deletedSamples, samples, newAnchor } = await HealthKit.queryQuantitySamplesWithAnchor(
        HKQuantityTypeIdentifier.stepCount,
        {
            limit,
            from,
            to,
            anchor
        }
    );

    if (samples.length > 0) {
        // persist create
        console.log(`samples: ${JSON.stringify(samples)}`);
    }

    // if (deletedSamples.length > 0) {
    //   // persist delete
    // }

    const hasNext = samples.length + deletedSamples.length >= limit;

    if (!hasNext) {
        if (newAnchor && newAnchor !== anchor) {
            await AsyncStorage.setItem('anchor', newAnchor);
        }
        return;
    }

    return getRecursiveData({ anchor: newAnchor, limit });
};

const HealthKitWrapper = ({ children }: { children: React.ReactNode }) => {

    console.log('THREE');

    HealthKit.useSubscribeToChanges(
        HKQuantityTypeIdentifier.activeEnergyBurned,
        async () => {
          console.log('HealthKit.useSubscribeToChanges: activeEnergyBurned');
          const data = await HealthKit.getMostRecentQuantitySample(
            HKQuantityTypeIdentifier.activeEnergyBurned,
            UnitOfEnergy.Kilocalories
          );

          if (!data) {
            console.log('HealthKit.getMostRecentQuantitySample: activeEnergyBurned: no data');
            return;
          }

          pingStatusServer(KUMA_ENDPOINTS.healthkit);

          axios
            .get('https://dentalunrealistickeyboard.angelviera.repl.co/ping')
            .then(({ data }) =>
              console.log('Ping to Replit success: ' + data)
            )
            .catch((error) =>
              console.error('Ping to Replit error:', error.message)
            );
        }
      );

    return <>{children}</>;
  };

const HealthKitProvider = ({ children }: { children: React.ReactNode }) => {
    const [configDone, setConfigDone] = useState(false);
  
    useEffect(() => {
      const configureHealthKit = async () => {
        await requestHealthKitAuthorization();
        console.log('ONE');
        await configureHealthKitBackgroundDelivery();
        console.log('TWO');
        setConfigDone(true);
      };
  
      configureHealthKit();
    }, []);
  
    return (
        <>
          {configDone ? (
            <HealthKitWrapper>{children}</HealthKitWrapper>
          ) : (
            <>{children}</>
          )}
        </>
      );
  };

export {
    ALL_METRIC_TYPES,
    ALL_CATEGORY_TYPES,
    requestHealthKitAuthorization,
    exportHistoricalHealthData,
    configureHealthKitBackgroundFetch,
    healthKitSubscribeToChanges,
    configureHealthKitBackgroundDelivery,
    HealthKitProvider,
};