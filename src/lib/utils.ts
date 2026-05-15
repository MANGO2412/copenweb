import type { Category, Rate } from "@/interface/rates"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRate(data:Category[]){
  const flattened: Rate[] = []
  if (data && Array.isArray(data)) {
     for (const cat of data as any[]) {
       const categoryName = cat?.nombre ?? ""
       const rates: any[] = cat?.rates ?? []
       if (rates.length) {
         for (const rate of rates) {
           const id = rate?.id ?? `${categoryName}-${rate?.nombre ?? ""}`
           const nombre = rate?.nombre ?? ""
           flattened.push({ id, nombre, frecuencia: rate?.frecuencia ?? "", categoria: categoryName, subcategoria: "" })
         }
       }
       const subs: any[] = cat?.subcategories ?? []
       for (const sub of subs) {
         const subRates: any[] = sub?.rates ?? []
         for (const rate of subRates) {
           const id = rate?.id ?? `${categoryName}-${sub?.nombre ?? ""}-${rate?.nombre ?? ""}`
           const nombre = rate?.nombre ?? ""
           flattened.push({ id, nombre, frecuencia: rate?.frecuencia ?? "", categoria: categoryName, subcategoria: sub?.nombre ?? "" })
         }
       }
     }
  }

  return flattened;
}
