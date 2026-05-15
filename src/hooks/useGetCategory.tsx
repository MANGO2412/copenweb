import {useState,useEffect} from "react"
import supabase,{getUserId} from "@/lib/supabase"
import type { Category } from "@/interface/rates"


const useGetCategories=({getCustom}:{getCustom?: boolean})=>{
    const [categories,setCategories]=useState<Category[]>([])
    const [isLoading,setIsLoading]=useState<boolean>(false)

    useEffect(()=>{
        const fetchCategories=async()=>{
            setIsLoading(true)
            try{
                const userId = await getUserId() || ""
                const {data,error}=getCustom ? await supabase.from("rad_categoriacustom").select("*").eq("user_id", userId) : await supabase.from("rad_categoriaingles").select("*")
                if(error){
                    console.error("Error fetching categories:",error)
                }else{
                    setCategories(data as Category[])
                }
            }catch(error){
                console.error("Unexpected error:",error)
            }
            setIsLoading(false)
        }
        // if(categories.length !=0) return;

        fetchCategories()
    },[getCustom])

    return {categories,setCategories,isLoading};
}


export default useGetCategories;

