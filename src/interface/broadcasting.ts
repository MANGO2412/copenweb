import type { Remedy } from "./remedy"
import type { Analysis } from "./analysis"
import type { Rate } from "./rates"


export interface Broadcasting {
  id: string
  pacienteid: string
  pacientenombre: string
  nombre:string
  fecha_inicio: Date
  fecha_cierre: Date
  estado: "active" | "pending" | "completed" | "cancelled"
}

export interface BroadcastingForm {
  nombre: string
  pacienteId: string
  pacientenombre:string
  remedioSistemaIds: string[]
  remedioPersonalizadoIds: string[]
  analisisIds: string[]
  rateIds: string[]
  ratePersonalesIds: string[]
  fecha_inicio?: Date
  fecha_cierre?: Date
}

export interface BroadcastingContent{
  tratamiento_id:string,
  remedios_system:Remedy[],
  remedios_custom:Remedy[],
  analisis:Analysis[],
  rates_system:Rate[],
  rates_custom:Rate[]
}