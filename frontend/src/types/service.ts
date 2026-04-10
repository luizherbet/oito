export type ServiceItem = {
  id: number
  professional_id: number
  title: string
  description: string | null
  price: number
  is_active: boolean
  // opcional se a API devolver: created_at, updated_at em string
}