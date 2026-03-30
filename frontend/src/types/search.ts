export type ProfessionalHit = {
  type: 'professional'
  id: number
  name: string
  email: string
  role: string
}

export type ServiceHit = {
  type: 'service'
  id: number
  title: string
  description: string | null
  price: string
  professional_id: number
  professional_name: string
}

export type SearchResponse = {
  query: string
  results: Array<ProfessionalHit | ServiceHit>
}