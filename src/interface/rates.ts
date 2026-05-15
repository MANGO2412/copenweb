export interface Rate {
  id: string
  frecuencia: string
  nombre: string | string[]

  categoria: string
  subcategoria?: string

  //propierties to analysis code
  valor?: string
  nivel?: string
  nivelsugerido?: string
  potenciasugerido?: string
  potencia?: string

  //propierties to remedy code
  metodo?:string
  complemento?:string
  remedio?:string
  codigoremedioid?:string
}



export interface Category {
  id: string
  nombre: string
  subcategories?: Subcategory[] | undefined
  rates?:Rate[]
}

export interface Subcategory {
  id: string
  nombre: string
  rates: Rate[],
  subcategoriaid: string
}


