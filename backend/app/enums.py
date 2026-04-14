from enum import Enum

class AppointmentStatus(str, Enum):
    pending = "Pendente"
    confirmed = "Confirmado"
    rescheduled = "Reagendado"
    cancelled = "Cancelado"
    completed = "Concluído"