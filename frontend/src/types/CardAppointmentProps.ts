export type CardAppointmentProps = {
  service: string
  nome: string
  data: string // esperado "YYYY-MM-DD" (usado no split('-'))
  time: string // "HH:MM" ou "HH:MM:SS" (você faz slice(0,5))
  status: "Pendente" | "Cancelado" | string
  isProfessional: boolean
  onConfirm?: () => void
  onCancel?: () => void
  onReschedule?: () => void
}