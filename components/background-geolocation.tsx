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

import AsyncStorage from '@react-native-async-storage/async-storage';


// FUNCTIONS

const configureBackgroundGeolocation = async () => {

  let token = await BackgroundGeolocation.findOrCreateTransistorAuthorizationToken("vieratech", "unclegravity");
  let storedGeoApiEndpoint = await AsyncStorage.getItem('GEO_API_ENDPOINT') || '';

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
    url: storedGeoApiEndpoint,
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
    // setBgGeoEnabled(state.enabled)
    console.log("- BackgroundGeolocation is configured and ready: ", state.enabled);
  });
};

const loadGeoEnabledState = async (): Promise<boolean> => {
  try {
    const savedEnabledState = await AsyncStorage.getItem('BG_GEO_ENABLED');
    if (savedEnabledState !== null) {
      // setBgGeoEnabled(savedEnabledState === 'true');
      console.log("FIRST: Loaded geo plugin state: " + savedEnabledState);
      return savedEnabledState === 'true';
    } 
    
    else { return false; }

  } catch (error) {
      return false;
      // Error handling; display an error message or handle it as necessary
  }
};

const saveGeoEnabledState = async (value: boolean) => {
  try {
    await AsyncStorage.setItem('BG_GEO_ENABLED', value.toString());
    console.log("Saved geo plugin state: " + value.toString());
    return value;
  } catch (error) {
    // Error handling; display an error message or handle it as necessary
    return false;
  }
};

export {
  configureBackgroundGeolocation,
  loadGeoEnabledState,
  saveGeoEnabledState,
};