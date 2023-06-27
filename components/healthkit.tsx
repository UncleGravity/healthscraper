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
import { displayNotification } from './notifications';

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
    // HKQuantityTypeIdentifier.timeInDaylight,
    // HKQuantityTypeIdentifier.physicalEffort,
    // HKQuantityTypeIdentifier.cyclingSpeed,
    // HKQuantityTypeIdentifier.cyclingPower,
    // HKQuantityTypeIdentifier.cyclingFunctionalThresholdPower,
    // HKQuantityTypeIdentifier.cyclingCadence
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
        // console.log(JSON.stringify(combinedData));
        console.log("combinedData.length: " + combinedData.length)

        // Send data to API endpoint
        if(combinedData.length === 0) {
            // Toast.show({ text1: `No data to send`, type: 'info' });
            return ["NO_DATA_TO_SEND", 0]
        }
        const response = await axios.post(endpoint, JSON.stringify(combinedData), {
            headers: {
                "Content-Type": "application/json",
            },
        });

        // console.log("Saving LAST_HK_SYNC_DATE: " + toDate.toISOString())
        // AsyncStorage.setItem('LAST_HK_SYNC_DATE', toDate.toISOString());
        console.log(`Response status: ${response.status}, message: ${response.data}`);
        // Toast.show({ text1: `Response status: ${response.status}, message: ${response.data}`, type: 'success' });

        return [response.data, combinedData.length];
    } catch (error) {
        console.error('Error sending data to API:', error);
        Toast.show({ text1: 'Error sending data to API', type: 'error' });
        return ["EXCEPTION_OCCURRED", 0]
    }
};

const configureHealthKitBackgroundDelivery = async () => {

    console.log("===========================================");
    console.log("Resetting background delivery");
    console.log("===========================================");
    try {
        await HealthKit.disableAllBackgroundDelivery();
        console.log('All background delivery disabled');
    } catch (err) {
        console.error('Error disabling background delivery', err);
    }

    console.log("===========================================");
    console.log("Enabling background delivery for metrics...");
    console.log("===========================================");
    ALL_METRIC_TYPES.forEach(async (hktype) => {
        try {
            await HealthKit.enableBackgroundDelivery(hktype, HKUpdateFrequency.hourly);
            console.log(`Background delivery ENABLED for ${hktype}`);
        } catch (err) {
            console.error(`Background delivery FAILED for ${hktype}`, err);
        }
    });

    console.log("===========================================");
    console.log("Enabling background delivery for categories...");
    console.log("===========================================");
    ALL_CATEGORY_TYPES.forEach(async (hktype) => {
        try{
            await HealthKit.enableBackgroundDelivery(hktype, HKUpdateFrequency.hourly);
            console.log(`Background delivery ENABLED for ${hktype}`);
        } catch (err) {
            console.error(`Background delivery FAILED for ${hktype}`, err);
        };
    });

    console.log("===========================================");
    console.log("Subscribing to changes");
    console.log("===========================================");
    ALL_METRIC_TYPES.forEach(async (hktype) => {
        HealthKit.subscribeToChanges(hktype, async () => {
            const storedEndpoint = await AsyncStorage.getItem('API_ENDPOINT') || undefined;
            const anchor = (await AsyncStorage.getItem(hktype.toString() + '_anchor')) ?? undefined;

            if(!storedEndpoint) {
                console.log('No API endpoint configured, skipping background fetch');
                return;
            }

            if (anchor === undefined) {
                console.log(`No anchor for ${hktype}`);
            }

            const fromDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
            const toDate = new Date(Date.now());
        
            const { deletedSamples, samples, newAnchor } = await HealthKit.queryQuantitySamplesWithAnchor(
                hktype,
                {
                    // limit: limit,
                    from: fromDate,
                    to: toDate,
                    anchor: anchor
                }
            );
        
            if (samples.length > 0) {
                // console.log(`${hktype} samples returned: ${JSON.stringify(samples)}`);
                // console.log(`${hktype} samples returned: ${samples.length}`);
                
            } else {
                console.log(`No samples returned for ${hktype}`);
                return;
            }

            const response = await axios.post(storedEndpoint, JSON.stringify(samples), {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 200) {
                // Only store new anchor if upload was successful
                await AsyncStorage.setItem(hktype.toString() + '_anchor', newAnchor);
                await AsyncStorage.setItem('LAST_HK_SYNC_DATE', toDate.toISOString());

                console.log(`HealthKit Background Observer: ${hktype} success. ${samples.length} records uploaded.`);
                // displayNotification("Healthscraper", "[Background Observer] " + hktype + " uploaded " + samples.length + " records.");
            } else {
                console.log(`HealthKit Background Observer: ${hktype} failed. ${samples.length} records not uploaded.`);
                displayNotification("Healthscraper", "[Background Observer] " + hktype + " failed. " + samples.length + " records not uploaded.");
            }
        
            // if (deletedSamples.length > 0) {
            //   // persist delete?
            // }

            // axios
            //     .get('https://dentalunrealistickeyboard.angelviera.repl.co/ping?str=' + hktype + ':' + data.length)
            //     .then(({ data }) =>
            //     console.log('Ping to Replit success: ' + data)
            //     )
            //     .catch((error) =>
            //     console.error('Ping to Replit error:', error.message)
            //     );

            // pingStatusServer(KUMA_ENDPOINTS.healthkit);

        });
    });
};

export {
    ALL_METRIC_TYPES,
    ALL_CATEGORY_TYPES,
    requestHealthKitAuthorization,
    exportHistoricalHealthData,
    configureHealthKitBackgroundDelivery,
};