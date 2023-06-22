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

import BackgroundFetch from 'react-native-background-fetch';

import {
  ALL_METRIC_TYPES,
  ALL_CATEGORY_TYPES,
  requestHealthKitAuthorization,
  exportHistoricalHealthData,
  configureHealthKitBackgroundFetch
} from './components/healthkit';

import {
  configureBackgroundGeolocation,
  loadGeoEnabledState,
  saveGeoEnabledState,
} from './components/background-geolocation';

import { pingStatusServer, KUMA_ENDPOINTS } from './components/kuma';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// APP
const HealthRaiserApp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [geoApiEndpoint, setGeoApiEndpoint] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [lastGeoSyncDate, setLastGeoSyncDate] = useState('');
  const [lastHkSyncDate, setLastHkSyncDate] = useState('');
  const [bgGeoEnabled, setBgGeoEnabled] = useState(false);
  const [hkSyncEnabled, setHkSyncEnabled] = useState(false);
  const [location, setLocation] = useState('');

  useEffect(() => {
    requestHealthKitAuthorization();
    configureHealthKitBackgroundFetch();
    loadAsyncStorageData();
  }, []);

  useEffect(() => {
    // Initial background fetch configuration
  }, []);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const loadAsyncStorageData = async () => {
    try {
      // Get data from AsyncStorage
      const storedApiEndpoint = await AsyncStorage.getItem('API_ENDPOINT');
      const storedGeoApiEndpoint = await AsyncStorage.getItem('GEO_API_ENDPOINT');
      const storedLastGeoSyncDate = await AsyncStorage.getItem('LAST_GEO_SYNC_DATE');
      const storedLastHkSyncDate = await AsyncStorage.getItem('LAST_HK_SYNC_DATE');
      const storedBgGeoEnabled = await AsyncStorage.getItem('BG_GEO_ENABLED');
      const storedHkSyncEnabled = await AsyncStorage.getItem('HK_SYNC_ENABLED');

      // Update state with retrieved values
      if (storedApiEndpoint !== null) {
        setApiEndpoint(storedApiEndpoint);
      }
      if (storedGeoApiEndpoint !== null) {
        setGeoApiEndpoint(storedGeoApiEndpoint);
      }
      if (storedLastGeoSyncDate !== null) {
        setLastGeoSyncDate(storedLastGeoSyncDate);
      }
      if (storedLastHkSyncDate !== null) {
        setLastHkSyncDate(storedLastHkSyncDate);
      }
      if (storedBgGeoEnabled !== null) {
        setBgGeoEnabled(JSON.parse(storedBgGeoEnabled));
      }
      if (storedHkSyncEnabled !== null) {
        setHkSyncEnabled(JSON.parse(storedHkSyncEnabled));
      }
    } catch (error) {
      // Handle error
      console.error('Error loading data from AsyncStorage:', error);
    }
  };

  const saveEndpoints = async (newApiEndpoint: string, newGeoApiEndpoint: string) => {
    try {
      setApiEndpoint(newApiEndpoint);
      setGeoApiEndpoint(newGeoApiEndpoint);

      console.log('Saving API_ENDPOINT: ' + newApiEndpoint)
      await AsyncStorage.setItem('API_ENDPOINT', newApiEndpoint);

      console.log('Saving GEO_API_ENDPOINT: ' + newGeoApiEndpoint)
      await AsyncStorage.setItem('GEO_API_ENDPOINT', newGeoApiEndpoint);  

      BackgroundGeolocation.setConfig({
        url: newGeoApiEndpoint
      });

      Keyboard.dismiss(); // Dismiss the keyboard
      toggleModal(); // Hide the modal

    } catch (error) {
      // Error handling; display an error message or handle it as necessary
      Toast.show({ text1: 'Error saving endpoints', type: 'error' });
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // FUNC: EXPORT DATA
  const handleHealthExportButtonPress = async () => {
    if (apiEndpoint === '') {
      Toast.show({ text1: 'Please enter an API endpoint', type: 'error' });
      return;
    }
    setIsLoading(true);
    const storedEndpoint = await AsyncStorage.getItem('API_ENDPOINT') || '';
    if (storedEndpoint) {

        const lastSyncDate = await AsyncStorage.getItem('LAST_HK_SYNC_DATE');
        let fromDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

        if (lastSyncDate !== null) {
            fromDate = new Date(lastSyncDate);
            console.log('Last sync date found: ' + fromDate.toISOString());
        } else {
          console.log('No last sync date found, using default value (2 days)');
        }

        const toDate = new Date(Date.now());
        await exportHistoricalHealthData(storedEndpoint, fromDate, toDate);
        await AsyncStorage.setItem('LAST_HK_SYNC_DATE', toDate.toISOString());
    } else {
        console.log('No API endpoint configured, skipping background fetch');
    }

    // await exportHistoricalHealthData(apiEndpoint);
    setIsLoading(false);
  };

  const handleLocationExportButtonPress = async () => {

    if (geoApiEndpoint === '') {
      Toast.show({ text1: 'Please enter the Maps API endpoint', type: 'error' });
      return;
    }

    if( !bgGeoEnabled ) {
      Toast.show({ text1: 'Location tracking is currently disabled', type: 'error' });
      return;
    }

    BackgroundGeolocation.sync().then((records) => {
      console.log("[sync] success: ", records);
      Toast.show({ text1: 'Success. Inserted ' + records.length + ' records', type: 'success' });
    }).catch((error) => {
      console.log("[sync] FAILURE: ", error);
      Toast.show({ text1: 'Sync failure', type: 'error' });
    });
  }

  const handleHealthExportAllButtonPress = async () => {
    if (!apiEndpoint) {
      Toast.show({ text1: 'Please enter an API endpoint', type: 'error' });
      return;
    }
    setIsLoading(true);
    const fromDate = new Date(2010, 1, 1);
    const toDate = new Date(Date.now());
    await exportHistoricalHealthData(apiEndpoint, fromDate, toDate);
    setIsLoading(false);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // GEO STUFF

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

    const onHttpChange:Subscription = BackgroundGeolocation.onHttp((response) => {
      let status = response.status;
      let success = response.success;
      let responseText = response.responseText;
      console.log("[onHttp] ", response);

      if (success) {
        // Toast.show({ text1: 'Data uploaded successfully', type: 'success' });
        console.log("Data uploaded successfully");
        const now = new Date().toISOString();
        AsyncStorage.setItem('LAST_GEO_SYNC_DATE', now);
        setLastGeoSyncDate(now);
      }
    });

    const onEnabledChange:Subscription = BackgroundGeolocation.onEnabledChange((enabled) => {
      console.log("[onEnabledChange] ", enabled);
    });

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
      onHttpChange.remove();
      onEnabledChange.remove();
    }
  }, []);

  /// 3. Keep track of the backgroundgeo toggle state.
  React.useEffect(() => {
    saveGeoEnabledState(bgGeoEnabled);
    // loadAsyncStorageData();
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

      {/* Background Geolocation Toggle */}
      <View style={{flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{color: "#FFF"}}>Enable Location Tracking  </Text>
        <Switch value={bgGeoEnabled} onValueChange={setBgGeoEnabled} />
      </View>

      {/* <View style={{flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{color: "#FFF"}}>Enable HealthKit Tracking  </Text>
        <Switch value={bgGeoEnabled} onValueChange={setBgGeoEnabled} />
      </View> */}

      {/* Endpoing Definition */}
      <Button onPress={toggleModal} title="Set Endpoints" />

      {/* <Button onPress={handlePressGetAuthStatus} title="Healthkit Auth Status" /> */}
      <Button onPress={handleHealthExportButtonPress} title="Force HealthKit Export" />
      <Button onPress={handleLocationExportButtonPress} title="Force Locations Export" />

      {isLoading && (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.loadingIndicator}
        />
      )}

      <Text style={{color: "#FFF", marginTop: 20}}>Last Map Sync: {lastGeoSyncDate}</Text>
      <Text style={{color: "#FFF"}}>Last HealthKit Sync: {lastHkSyncDate}</Text>

      {/* 
      
      MODAL
      
      */}

      <Modal
        animationType="slide"
        transparent={false}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>

        <Button onPress={handleHealthExportAllButtonPress} title="Export ALL HK data (SLOW)" />

        <Text style={{marginTop: 50}}>HealthKit Endpoint</Text> 
        <View style={styles.inputContainer}>
          <Input
            onChangeText={(text) => setApiEndpoint(text)}
            value={apiEndpoint}
            placeholder="Enter healthkit endpoing..."
          />
          </View>

          <Text style={{justifyContent: "flex-start", alignItems: 'flex-start',}}>Maps Endpoint</Text>
          <View style={styles.inputContainer}>
            <Input
              onChangeText={(text) => setGeoApiEndpoint(text)}
              value={geoApiEndpoint}
              placeholder="Enter Maps endpoint..."
            />
          </View>

          <View style={{alignItems: 'flex-end'}}>
            {/* <TouchableOpacity onPress={() => saveEndpoints(apiEndpoint, geoApiEndpoint)} style={styles.saveButton}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity> */}
            <Button onPress={() => saveEndpoints(apiEndpoint, geoApiEndpoint)} title="Save" />
            <Button onPress={toggleModal} title="Close" />
          </View>

        </View>
      </Modal>

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
    // alignItems: 'center',
    padding: 16,
  },
});

export default HealthRaiserApp;