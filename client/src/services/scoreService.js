import api from './api'

export const getScores = async () => {
  const res = await api.get('/scores')
  return res.data
}

export const addScore = async (score, date) => {
  const res = await api.post('/scores', { score, date })
  return res.data
}

export const editScore = async (id, score, date) => {
  const res = await api.put(`/scores/${id}`, { score, date })
  return res.data
}

export const deleteScore = async (id) => {
  const res = await api.delete(`/scores/${id}`)
  return res.data
}