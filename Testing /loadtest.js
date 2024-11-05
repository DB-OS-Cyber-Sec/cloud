import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 10 }, // Ramp up to 10 users
    { duration: '2m', target: 10 }, // Stay at 10 users
    { duration: '1m', target: 0 }, // Ramp down to 0 users
  ],
};

export default function () {
  http.get('http://localhost:3010/getWeather'); // Adjust the URL as necessary
  sleep(1);
}
