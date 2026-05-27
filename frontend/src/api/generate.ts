import client from './client'

export const generateApi = {
  coverImage: (params: object) => client.post('/generate/cover-image', params).then(r => r.data),
  infographic: (params: object) => client.post('/generate/infographic', params).then(r => r.data),
  articleIllustrator: (params: object) => client.post('/generate/article-illustrator', params).then(r => r.data),
  comic: (params: object) => client.post('/generate/comic', params).then(r => r.data),
  slideDeck: (params: object) => client.post('/generate/slide-deck', params).then(r => r.data),
  xhsImages: (params: object) => client.post('/generate/xhs-images', params).then(r => r.data),
}
