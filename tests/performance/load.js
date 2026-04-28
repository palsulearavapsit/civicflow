import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // ramp up
    { duration: '1m', target: 50 },  // steady state
    { duration: '30s', target: 0 },  // ramp down
  ],
};

export default function () {
  const res = http.get('http://localhost:3000/');
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
