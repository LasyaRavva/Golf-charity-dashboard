import api from './api'

export const getCharities = async (search = '', featured = false) => {
  const res = await api.get('/charities', {
    params: { search, featured }
  })
  return res.data
}

export const getCharity = async (id) => {
  const res = await api.get(`/charities/${id}`)
  return res.data
}

export const selectCharity = async (charity_id) => {
  const res = await api.post('/charities/select', { charity_id })
  return res.data
}

export const makeDonation = async (charity_id, amount) => {
  const res = await api.post('/charities/donate', { charity_id, amount })
  return res.data
}

export const getUserDonations = async () => {
  const res = await api.get('/charities/user/donations')
  return res.data
}