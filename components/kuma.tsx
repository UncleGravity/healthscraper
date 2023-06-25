import axios from 'axios';

// server list
const KUMA_ENDPOINTS = {
    "healthkit": 'http://146.190.83.219:3001/api/push/QAYb2Y50KN?status=up&msg=OK&ping=',
    "geo": 'http://146.190.83.219:3001/api/push/e55qYU5bPT?status=up&msg=OK&ping='
}

async function pingStatusServer(url: string) {
    // Hardcoded URL
    // const url = 'http://146.190.83.219:3001/api/push/jlj0xuhVul?status=up&msg=OK&ping=';
    // const url = kumaEndpoints.healthkit;
  
    try {
      // Make the GET request
      const response = await axios.get(url);
  
      // Handle success
      console.log('[KUMA]:'+url, response.data);
    } catch (error) {
      // Handle error
      console.error('Request failed:', error);
    }
  }

  export { pingStatusServer, KUMA_ENDPOINTS };