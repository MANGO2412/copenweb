import {createClient} from '@supabase/supabase-js'
import type { Subcategory,Rate,Category} from "@/interface/rates"
import type { Analysis } from '@/interface/analysis';
import type {Patient} from '@/interface/patient'
import type {Error} from "@/interface/error"
import type {Remedy} from "@/interface/remedy"
import type {BroadcastingForm,Broadcasting,BroadcastingContent} from "@/interface/broadcasting"

const supabase=createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)


export const registerPatient=async(patient:Partial<Patient>)=>{
   try{
       const userId = await getUserId() || ""
       const {data,error}= await supabase.from("rad_pacientes").insert({
                                nombre: patient.nombre || "",
                                apellido1: patient.apellido1 || "",
                                apellido2: patient.apellido2 || "",  
                                fechanacimiento: patient.fechanacimiento || new Date(),
                                sexo: patient.sexo as Patient["sexo"],
                                email: patient.email || "",
                                fpg: patient.fpg || "",
                                foto: patient.foto || "",
                                telefono: patient.telefono || "",
                                user_id: userId,
                            }).select("*").single()

      if(error) throw error
      return data as Patient
   }catch(error){
     return error as Error
   }
}

export const getPatient=async()=>{
   try {
     const userId = await getUserId() || ""
     
     const { data, error } = await supabase.from("rad_pacientes").select("*").eq("user_id", userId)
     
     if (error) throw error

     return data as Patient[]
   } catch (error) {
     return []
   }
}

export const updatePatient=async(patient:Partial<Patient>)=>{
   try{
       const {data,error}=   await supabase.from("rad_pacientes").update({
                                              nombre: patient.nombre || "",
                                              apellido1: patient.apellido1 || "",
                                              apellido2: patient.apellido2 || "",  
                                              fechanacimiento: patient.fechanacimiento || new Date(),
                                              sexo: patient.sexo as Patient["sexo"],
                                              email: patient.email || "",
                                              fpg: patient.fpg || "",
                                              foto: patient.foto || "",
                                              telefono: patient.telefono || "",
                                            }).eq("idp", patient.idp).select("*").single()

     if(error) throw error

      return data as Patient
   }catch(error){
     return error as Error
   }
}

export const uplodImage=async(path:string,image:string )=>{
    try{
     const { data, error } = await supabase.storage.from("patients").upload(path, image? await fetch(image).then(res => res.blob()) : new Blob(), {
        cacheControl: "3600",
        upsert: false,
      });
     
      if (error) throw error
      const photoUrl = data ? supabase.storage.from("patients").getPublicUrl(data.path).data : undefined
      return photoUrl?.publicUrl

    }catch(error){
        console.error("Error uploading image:", error)
        return undefined
    }
}

export const updateImage=async(path:string,image:string )=>{
    try{
     const { data, error } = await supabase.storage.from("patients").update(path, image? await fetch(image).then(res => res.blob()) : new Blob(), {
        cacheControl: "0",
        upsert: true,
      });

      if (error) throw error
      const photoUrl = data ? supabase.storage.from("patients").getPublicUrl(data.path).data : undefined
      return photoUrl?.publicUrl
    }catch(error){
        console.error("Error updating image:", error)
        return undefined
    }
}

export const removeFile=async(path:string)=>{
     try {
      const {error}= await supabase.storage.from("patients").remove([path])
      if(error) throw error
      return true      
     } catch (error) {
      console.log("error to delete file",error)
      return false
     }
}

export const getUserId=async()=>{
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user?.id
  } catch (error) {
     console.error("Error getting user ID:", error)
     return undefined
  }
}

export interface UserInfo {
  id: string
  email: string
  createdAt: string
  role: string
}

export const getUserInfo=async()=>{
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    if (!user) return null

    return {
      id: user.id,
      email: user.email || "",
      createdAt: user.created_at,
      role: user.role || "authenticated"
    } as UserInfo
  } catch (error) {
     console.error("Error getting user info:", error)
     return null
  }
}

export const getCategory=async(getCustom?: boolean)=>{
   try{
       const userId = await getUserId() || ""
       const {data,error}= getCustom? await supabase.from("rad_categoriacustom").select("*").eq("user_id", userId)
                                    :await supabase.from("rad_categoriaingles").select("*")
       if(error) throw error
       return data as Subcategory[]
   }catch(error){
       console.error("Unexpected error:",error)
       return []
   }
}

export const addCategory=async(name:string)=>{
  try{
    const userId = await getUserId() || ""
    
    const {data,error}=await supabase.from("rad_categoriacustom").insert({nombre:name,user_id:userId}).select("*").single()

    if(error) throw error
    return data as Category
  }catch(error){
    console.error("Error adding category:", error)
    return error as Error
  }
}

export const removeCategory=async(categoryId:string)=>{
   try{
     const {error}=await supabase.from("rad_categoriacustom").delete().eq("id",categoryId)
      if(error) throw error
      return true
    }catch(error){  
      console.error("Error deleting category:", error)
      return error as Error
    }
}

export const getSubcategoriesByCategoryId=async(categoryId:string, getCustom?: boolean)=>{
  try{
    const {data,error}=await supabase.from(getCustom ? "rad_subcategoriacustom" : "rad_subcategoriaingles").select( `
                        *,
                        ...rad_subcategoria!inner()
                       `,).eq( `rad_subcategoria.${getCustom ? 'categoriacustomid' : 'categoriaid'}`,categoryId)
    if (error) throw error
    return data as Subcategory[]
  } catch (error) {
    console.error("Error fetching subcategories:", error)
    return undefined
  }
}

export const addsubcategory=async(name:string,categoryId:string)=>{
   try{
      const {data,error}=await supabase.rpc("insert_subcategory",{s_nombre:name,s_categoriaid:categoryId}).select("*").single()

      if(error) throw error
      return data as Subcategory
   }catch(error){
     console.error("Error adding subcategory:", error)
     return error as Error
   }
}

export const removeSubcategory=async(subcategoryId:string)=>{
    try{
      const {error}=await supabase.from("rad_subcategoria").delete().eq("id",subcategoryId)
      if(error) throw error
      return true
    }catch(error){
      console.error("Error deleting subcategory:", error)
      return error as Error
    }
}

export const getRatesBySubcategoryId=async(subcategoryId:string, getCustom?: boolean)=>{
  try{
    const {data,error}=await supabase.from(getCustom ? "rad_codigocustom" : "rad_codigoingles").select(`
                                                                   nombre,
                                                                   ...rad_codigo!inner(
                                                                     id,
                                                                     frecuencia
                                                                   )
                                                                   `,).eq("rad_codigo.subcategoriaid",subcategoryId)
    if (error) throw error
    return data as Rate[]
  } catch (error) {
    console.error("Error fetching rates:", error)
    return undefined
  }
}

export const addRate=async(name:string,frecuencia:string,subcategoryId:string)=>{
   try{
      const {data,error}=await supabase.rpc("insert_rate",{
        r_nombre:name,
        r_frecuencia:frecuencia,
        r_subcategoriaid:subcategoryId
      }).select("*").single()
      
      if(error) throw error
      return data as Rate
   }catch(error){
     console.error("Error adding rate:", error)
     return error as Error
   }
}

export const removeRate=async(rateId:string)=>{
    try{
      const {error}=await supabase.from("rad_codigo").delete().eq("id",rateId)
      if(error) throw error
      return true
    }catch(error){
      console.error("Error deleting rate:", error)
      return error as Error
    }
}

export const searchRatesByName=async(name:string)=>{
  try{
    const {data,error}=await supabase.rpc("get_categories_with_rates", { search: name })

    if (error) throw error
    console.log("Fetched rates:", data)
    return data as Category[]
  } catch (error) {
    console.error("Error fetching rates:", error)
    return undefined
  }
}

export const removePatient=async(patientId:string)=>{
  try{
    const {error}=await supabase.from("rad_pacientes").delete().eq("idp",patientId)
    if(error) throw error
    return true
  }catch(error){
    console.error("Error deleting patient:", error)
    return false
  }
}

export const registerAnalysis=async(analysis:Analysis)=>{
  try{
    const userId = await getUserId() || ""
    const {data,error}=await supabase.from("rad_analisis").insert({
      nombre: analysis.nombre,
      paciente: analysis.patientId,
      fecha: analysis.fecha,
      user_id: userId,
      analisado:true,
      reanalizado:false
    }).select("*").single()

    if(error) throw error
    return data as Analysis
  }catch(error){
    return error as Error
  }
}

export const removeAnalysis=async(analysis_id:string)=>{
   try{
     const {error}=await supabase.from("rad_analisis")
                            .delete()
                            .eq('id',analysis_id)
     if(error) throw error
     return true
   }catch(error){
     console.error("Error remove analysis:", error)
     return false
   }
}

export const updateAnalysisToReanalysis=async(analysis:Analysis)=>{
    try{
    
    const {data,error}=await supabase.from("rad_analisis").update({
      reanalizado:analysis.reanalizado,
      fecha:analysis.fecha
    }).eq("id",analysis.id).select().single()

    console.log(data)
    if(error) throw error
    return data as Analysis
  }catch(error){
    console.error("Error registering analysis:", error)
    return error as Error
  }
}

export const registerAnalysisRates=async(analysisId:string, rates:Rate[])=>{
  try{
    const userId = await getUserId() || ""
    const {error}=await supabase.from("rad_codigosdeanalisis").upsert(
      rates.map(rate => ({ 
         rate: rate.id,
         valor:rate.valor,
         nivel:rate.nivel,
         nivelsugerido:rate.nivelsugerido,
         potenciasugerido:rate.potenciasugerido,
         potencia:rate.potencia,
         analisis: analysisId,
         user_id: userId
      })),{
        onConflict:"rate,analisis",
        ignoreDuplicates:false
      }
    )
    if(error) throw error
    return true
  }catch(error){
    console.error("Error registering analysis rates:", error)
    return false
  }
}

export const updateAnalysisRates=async(rateid:string,rate:Omit<Rate,'id'>)=>{
   try{
    const {error}=await supabase.from("rad_codigosdeanalisis").update(rate).eq("id",rateid)

    if(error) throw error
    return true
  }catch(error){
    console.error("Error registering analysis rates:", error)
    return false
  }
}

export const getAnalysisByPatient=async(patientId:string)=>{
    try{
    const {data,error}=await supabase.from("rad_analisis").select( `*`).eq("paciente",patientId)
   
    if (error) throw error
    const result=data as Analysis[]
    return result
  } catch (error) {
    console.error("Error fetching analysis by patient:", error)
    return []
  }

}

export const getAnalysis=async()=>{
    try{
    const userId = await getUserId() || ""
    const {data,error}=await supabase.from("rad_analisis").select( `*`).eq("user_id",userId)
   
    if (error) throw error
    const result=data as Analysis[]
    return result
  } catch (error) {
    console.error("Error fetching analysis by patient:", error)
    return []
  }

}

export const getRatesByAnalysis=async(analysisId:string)=>{
    try{
    const {data,error}= await supabase
                                    .from('rad_codigosdeanalisis')
                                    .select(
                                      `
                                      valor,
                                      nivel,
                                      nivelsugerido,
                                      potencia,
                                      potenciasugerido,
                                      ...rad_codigo!inner(
                                        id,
                                        frecuencia,
                                        ...rad_codigoingles!inner(
                                          nombre
                                        )
                                      )
                                      `,
                                    )
                                    .eq(
                                      'analisis',
                                      analysisId,
                                    )
    
    if (error) throw error
    return data as Rate[]
  } catch (error) {
    console.error("Error fetching subcategories:", error)
    return []
  }

}

export const getSystemRemedies=async()=>{
  try {
    const {data,error}=await supabase.from("rad_remedios_system").select().eq('lenguaje','EN');
    if(error) throw error
    return (data as Remedy[]).map(elem=>{
       return {
        ...elem,
        isCustomRemedy:false
       }
    })
  } catch (error) {
    console.error("Error fetching remedies:", error)
    return []
  }
}

export const getCustomRemedies=async()=>{
   try {
       const userId = await getUserId() || ""
       const {data,error}=await supabase.from("rad_remedios_custom").select().eq('user_id',userId);
       if(error) throw error
       return (data as Remedy[]).map(elem=>{
          return {
           ...elem,
           isCustomRemedy:true
          }
       })
  } catch (error) {
    console.error("Error fetching remedies:", error)
    return []
  }
}

export const getRatesBySystemRemedis=async(remedyId:string)=>{
  try {
    const {data,error}=await supabase.from("rad_codigosderemedios_system").select(`
                                                                                codigoremedioid:id,
                                                                                remedio,
                                                                                metodo,
                                                                                nivel,
                                                                                potencia,
                                                                                complemento,
                                                                                ...rad_codigo!inner(
                                                                                  id,
                                                                                  frecuencia,
                                                                                  ...rad_codigoingles!inner(
                                                                                    nombre
                                                                                  )
                                                                                )        
                                                                            `,).eq('remedio',remedyId);
    if(error) throw error;
    return data as Rate[]
  } catch (error) {
      console.error("Error fetching Rates by custom remedies:", error)
      return []
  }
}

export const getRatesByCustomRemedis=async(remedyId:string)=>{
  try {
    const {data,error}=await supabase.from("rad_codigosderemedios_custom").select(`
                                                                                codigoremedioid:id,
                                                                                metodo,
                                                                                nivel,
                                                                                potencia,
                                                                                complemento,
                                                                                ...rad_codigo!inner(
                                                                                  id,
                                                                                  frecuencia,
                                                                                  ...rad_codigoingles!inner(
                                                                                    nombre
                                                                                  )
                                                                                )        
                                                                            `,).eq('remedio',remedyId);
    if(error) throw error;
    return data as Rate[]
  } catch (error) {
      console.error("Error fetching Rates by custom remedies:", error)
      return []
  }
}

export const saveRemedy=async(remedy:Omit<Remedy,"id"|"lenguaje">)=>{
   try{
    const userId = await getUserId() || "";
    
    remedy={
      ...remedy,
      user_id:userId
    }
    const {data,error}=await supabase.from("rad_remedios_custom").insert(
      remedy,
    ).select("*").single()

    if(error) throw error

    return data as Remedy
  }catch(error){
    return error as Error
  }
}

export const updateRemedy=async(remedy:Omit<Remedy,"lenguaje">)=>{
   try{
    const {data,error}=await supabase.from("rad_remedios_custom").update(
      remedy,
    ).eq("id",remedy.id)
    .select("*").single()

    if(error) throw error
    console.log("data when save remedies",data)
    return data as Remedy
  }catch(error){
    return error as Error
  }
}

export const removeRemedy=async(remedy_id:string)=>{
   try{
     const {error}=await supabase.from("rad_remedios_custom")
                            .delete()
                            .eq('id',remedy_id)
     if(error) throw error
     return true
   }catch(error){
     console.error("Error remove  a remedy:", error)
     return false
   }
}

export const saveContentRemedies=async(rates:Rate[],remedy_id:string)=>{
  try{
    const {error}=await supabase.from("rad_codigosderemedios_custom").upsert(
      rates.map(rate => ({ 
         rate: rate.id,
         potencia:rate.potencia,
         metodo:rate.metodo,
         nivel:rate.nivel,
         remedio: remedy_id
      })),{
        onConflict:"rate,remedio",
        ignoreDuplicates:false
      })

    if(error) throw error
    return true
  }catch(error){
    console.error("Error registering analysis rates:", error)
    return false
  }
}

export const removeRateRemdy=async(codeRemedyRate:string)=>{
  try {
     const {error}=await supabase.from("rad_codigosderemedios_custom")
                            .delete()
                            .eq('id',codeRemedyRate)
     if(error) throw error
     return true
  } catch (error) {
    console.error("Error delete rate from remdey:", error)
    return false
  }
}

export const addBroadcasting=async(treatments:BroadcastingForm[])=>{
  try {
      const userId = await getUserId() || ""
      const {data,error}= await supabase.from("rad_tratamientosadistancia").insert(
         treatments.map(item=>({
          nombre: item.nombre,
          paciente: item.pacienteId,  
          fecha_inicio: item?.fecha_inicio?.toISOString(),
          fecha_cierre: item?.fecha_cierre?.toISOString(),
          contenido:{
              remedioSistemaIds: item.remedioSistemaIds,
              remedioPersonalizadoIds: item.remedioPersonalizadoIds,
              analisisIds: item.analisisIds,
              rateIds: item.rateIds,
              ratePersonalesIds: item.ratePersonalesIds
          },
          estado: item.fecha_inicio &&  item.fecha_inicio > new Date() ? "pending" : "active",
          user_id: userId,
        }))  
      ).select("*")

      if(error) throw error
      return data as Broadcasting[]
    
  } catch (error) {
    return error as Error
  }
}

export const getBroadcasting=async(filterBystatus: "active" | "pending" | "completed" | "cancelled")=>{
  try {
    const userId = await getUserId() || ""
    const { data, error } = await supabase
    .from('rad_tratamientosadistancia')
    .select(
      `
      id,
      nombre,
      contenido,
      fecha_inicio,
      fecha_cierre,
      estado,
      ...rad_pacientes!inner(
        pacienteid:idp,
        pacientenombre:nombre
      )
      `,
    )
    .eq('estado', filterBystatus)
    .eq('user_id', userId)

    if (error) throw error

    return data as Broadcasting[]
    
    
  } catch (error) {
    return error as Error;
  }
}

export const updatestatusbroadcasting=async(id:string,status: "active" | "pending" | "completed" | "cancelled")=>{
   try {
       const {error}=await supabase.from("rad_tratamientosadistancia").update({
         estado:status
       }).eq("id",id)

       if(error) throw error

   } catch (error) {
      console.error("error  to update broadcasting")
   }
}

export const removebroadcasting=async(id:string)=>{
  try {
       const {error}=await supabase.from("rad_tratamientosadistancia").delete().eq("id",id)

       if(error) throw error
       
   } catch (error) {
      console.error("error to  remove broadcasting")
   }
}

export const getContentBroadcasting=async(id:string)=>{
  try{
    const {data,error}=await supabase.rpc("obtener_contenido_tratamiento_distancia", {  tratamiento_id: id })

    if (error) throw error
    return data as BroadcastingContent;
  } catch (error) {
    console.error("Error fetching rates:", error)
    return error as Error
  }
}

export default supabase

