import api from './api'

export const createCheckout = async (plan) => {
  const res = await api.post('/subscriptions/checkout', { plan })
  return res.data
}

export const getSubscription = async () => {
  const res = await api.get('/subscriptions')
  return res.data
}

export const cancelSubscription = async () => {
  const res = await api.post('/subscriptions/cancel')
  return res.data
}