import {
 useContext,
 useState,
 createContext,
 type ReactNode,
 useEffect
} from "react"

import supabase from "@/lib/supabase"

interface AuthContextType{
    session:any | null
    isLoading:boolean,
    openSession:()=>void
    closeSession:()=>void
}

const AuthContext=createContext<AuthContextType|null>(null)

export function AuthProvider({children}:{children:ReactNode}){
     const [session,setSession]=useState<any|null>(null)
     const [isLoading,setIsLoading]=useState<boolean>(false)

     useEffect(()=>{
       
       setIsLoading(true)
       supabase.auth.getClaims().then(({ data }) => {
            setSession(data?.claims)
            setIsLoading(false)
       })

      const { data: { subscription },} = supabase.auth.onAuthStateChange(() => {
        setIsLoading(true)
        supabase.auth.getClaims().then(({ data }) => {
           setSession(data?.claims)
           setIsLoading(false)
        })
      })

      return () => subscription.unsubscribe()

     },[])

    const openSession=()=>{

    }

    const closeSession=async()=>{
        await supabase.auth.signOut()
        setSession(false)
    }

    return(
        <AuthContext.Provider
          value={{
            session,
            isLoading,
            openSession,
            closeSession
          }}
        >
        {children}
      </AuthContext.Provider>
    )
}

export function useAuthContext(){
    const ctx=useContext(AuthContext)
    if (!ctx) {
        throw new Error('useAuthContext must be used within AuthProvider')
    }
    return ctx

}