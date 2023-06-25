// TODO: Export HK data in the background once per day.
// Goal is to do everything in the background, so that the user doesn't have to open the app.
// Maybe use uptimekuma to check if I haven't uploaded data in a while.


// TODO:
// - Export ALL doesn't work. It's too much data. Need to export in batches.
// - Location tragging toggle state isn't persisting.
// - Need to figure out how to export data in the background. Will probably need to use a native module using healthkit background delivery. 
//    - https://stackoverflow.com/questions/26375767/healthkit-background-delivery-when-app-is-not-running/30577456#30577456
// 

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

import styles from './components/styles';

import {
  exportHistoricalHealthData,
  HealthKitProvider,
} from './components/healthkit';

import {
  configureBackgroundGeolocation,
  saveGeoEnabledState,
} from './components/background-geolocation';

import { pingStatusServer, KUMA_ENDPOINTS } from './components/kuma';

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

  React.useEffect(() => {
    console.log("THIS SHOULD ONLY SHOW UP ONCE")
    loadAsyncStorageData();
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
        console.log("[loadAsyncStorageData] BG_GEO_ENABLED: " + JSON.parse(storedBgGeoEnabled))
        setBgGeoEnabled(JSON.parse(storedBgGeoEnabled));
      } else {
        console.log("[loadAsyncStorageData] BG_GEO_ENABLED is null")
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
  // HANDLE BUTTON AND TOGGLE SWITCH
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

  const handleLocationToggle = async (state: boolean) => {
    console.log("handleLocationToggle: " + state);
    saveGeoEnabledState(state);
    setBgGeoEnabled(state);
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
        // setLastGeoSyncDate(now);
        pingStatusServer(KUMA_ENDPOINTS.geo);
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
    // console.log("Saving GEO_ENABLED: " + bgGeoEnabled + " to AsyncStorage")
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
        <Switch value={bgGeoEnabled} onValueChange={handleLocationToggle} />
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
      <HealthKitProvider>
      </HealthKitProvider>

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

export default HealthRaiserApp;