export type ServiceMini = {
  id: number
  title: string
}

export type SearchResponse = {
  id: number
  name: string
  role: string
  services: ServiceMini[]
}