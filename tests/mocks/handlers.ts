import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/chat/stream', () => {
    return HttpResponse.json({ mock: 'This is a mocked response from MSW' })
  }),
];
