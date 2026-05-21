import api from './api';

export function loginUser(payload) {
  return api.post('/auth/login', payload);
}

export function signupUser(payload) {
  return api.post('/auth/signup', payload);
}
