import client from './client'

export const adminApi = {
  stats: () => client.get('/admin/stats').then(r => r.data),
  users: (params?: object) => client.get('/admin/users', { params }).then(r => r.data),
  getUser: (id: number) => client.get(`/admin/users/${id}`).then(r => r.data),
  createUser: (data: object) => client.post('/admin/users', data).then(r => r.data),
  patchUser: (id: number, data: object) => client.patch(`/admin/users/${id}`, data).then(r => r.data),
  issueCredits: (id: number, amount: number, note: string) =>
    client.post(`/admin/users/${id}/credits`, { amount, note }).then(r => r.data),
  creditHistory: (id: number) => client.get(`/admin/users/${id}/credits`).then(r => r.data),
  userPortfolios: (id: number) => client.get(`/admin/users/${id}/portfolios`).then(r => r.data),
  generations: (params?: object) => client.get('/admin/generations', { params }).then(r => r.data),
  dailyStats: (days = 14) => client.get('/admin/stats/daily', { params: { days } }).then(r => r.data),
  getApiConfig: () => client.get('/admin/config/api').then(r => r.data),
  putApiConfig: (data: object) => client.put('/admin/config/api', data).then(r => r.data),
}

