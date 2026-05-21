import { useAuthContext } from "@/context/auth-context"
import {
 Spinner
} from "@/components/ui/spinner"

import { Navigate,useLocation } from "react-router"
import { type ReactNode} from "react"

export  default function CheckAUth({children}:{children:ReactNode}){
    const {session,isLoading}=useAuthContext()
     const location=useLocation()

    if(isLoading){
       return(
        <div className="flex justify-center items-center min-h-screen w-full">
          <Spinner className="size-11" />
        </div>
       )
    }

    if(location.pathname == "/login" && session){
         return <Navigate to="/" replace />   
    }

    if(location.pathname == "/login" && !session){
      return <>{children}</>
    }

    if(!session ){
        return <Navigate to="/login" replace />
    }

    return children
}