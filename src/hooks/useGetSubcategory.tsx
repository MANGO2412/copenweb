import { useState, useEffect } from "react"
import supabase from "@/lib/supabase"


interface Subcategory {
    id: string;
    name: string;
    subcategoriid: string;
}


const useGetSubcategory = (categoryId: string) => {
    const [subcategories, setSubcategories] = useState<Subcategory[]>([])

    useEffect(() => {
        const fetchSubcategories = async () => {
            try {
                const { data, error } = await supabase
                    .from("rad_subcategoriaingles")
                    .select(   
                       `
                        *,
                        ...rad_subcategoria!inner()
                       `,
                    ).eq("rad_subcategoria.categoriaid", categoryId)

                if (error) {
                    console.error("Error fetching subcategories:", error)
                } else {
                    setSubcategories(data as Subcategory[])
                }
            } catch (error) {
                console.error("Unexpected error:", error)
            }
        }

        fetchSubcategories()
    }, [categoryId])

    return subcategories
}

export default useGetSubcategory;