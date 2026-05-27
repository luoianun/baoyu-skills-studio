import client from './client'

export const portfolioApi = {
  list: (page = 1, module = '') => client.get('/portfolios/', { params: { page, ...(module && { module }) } }).then(r => r.data),
  get: (id: string) => client.get(`/portfolios/${id}`).then(r => r.data),
  rename: (id: string, title: string) => client.patch(`/portfolios/${id}`, { title }).then(r => r.data),
  delete: (id: string) => client.delete(`/portfolios/${id}`),
}
