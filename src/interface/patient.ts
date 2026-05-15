export interface Patient {
  idp?: string
  nombre: string
  apellido1: string
  apellido2: string
  email: string
  fechanacimiento: Date | undefined
  fpg: string
  sexo: "femenino" | "masculino" | "animal" | "planta_tierra" | ""
  foto?: string
  telefono: string
  user_id: string
}

