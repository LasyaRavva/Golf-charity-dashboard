import api from './api'

export const getDraws = async () => {
  const res = await api.get('/draws')
  return res.data
}

export const getDraw = async (id) => {
  const res = await api.get(`/draws/${id}`)
  return res.data
}

export const createDraw = async (month, logic_type) => {
  const res = await api.post('/draws', { month, logic_type })
  return res.data
}

export const simulateDraw = async (id) => {
  const res = await api.post(`/draws/${id}/simulate`)
  return res.data
}

export const publishDraw = async (id) => {
  const res = await api.post(`/draws/${id}/publish`)
  return res.data
}

export const getAdminDraws = async () => {
  const res = await api.get('/draws/admin/all')
  return res.data
}