import { useAuthContext } from "@/context/auth-context"
import {
 Spinner
} from "@/components/ui/spinner"

import { Navigate,useLocation } from "react-router"
import {type ReactNode} from "react"

export  default function CheckAUth({children}:{children:ReactNode}){
    const {session,isLoading}=useAuthContext()
     const location=useLocation()


    if(isLoading){
      <div className="flex justify-center items-center  h-100">
          <Spinner className="size-9" />
      </div>
    }

    if(location.pathname == "/login" && session){
         return <Navigate to="/" replace />   
    }

    if(location.pathname == "/login" && !session){
      return <>{children}</>
    }

    if(!session){
        return <Navigate to="/login" replace />
    }

    return children
}