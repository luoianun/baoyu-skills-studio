import client from './client'

export const authApi = {
  register: (email: string, username: string, password: string) =>
    client.post('/auth/register', { email, username, password }).then(r => r.data),
  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }).then(r => r.data),
  logout: (refresh_token: string) =>
    client.post('/auth/logout', { refresh_token }),
  me: () => client.get('/auth/me').then(r => r.data),
  updateMe: (data: { username?: string; current_password?: string; new_password?: string }) =>
    client.patch('/auth/me', data).then(r => r.data),
  ping: () => client.post('/auth/ping').then(r => r.data),
}
