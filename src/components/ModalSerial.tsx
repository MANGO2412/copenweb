import { useSerialContext } from "@/context/serial-context";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogDescription
} from "@/components/ui/dialog"

import QCareLink from "@/assets/qcarelink.png"
import Quantum from "@/assets/quantum.png"

import {
  FieldGroup,
  Field,
  FieldContent,
  FieldTitle,
  FieldLabel
} from "@/components/ui/field"

import { Checkbox } from "@/components/ui/checkbox"
import {Button} from "@/components/ui/button"
import {useEffect,useState} from "react"
import { toast } from "sonner";

import {useAuthContext} from "@/context/auth-context";
import {useTranslation} from "react-i18next"


let quntumCare="223c-pn33-hj77-13%@-34H&C";
let qCareLink="223c-pn33-hj77-13%@-34H&C"


export  default function ModalSerial(){
    const {t}=useTranslation()
    const {
     isConnected,
     outputText,
     selectPort,
     hasPort,
     connect,
     send,
     setNameMachine,
     nameMachine
    }=useSerialContext()

    const [checkBoxValue,setCheckBoxValue]=useState<"qc"|"qcl">()
    const {closeSession} = useAuthContext()

    useEffect(()=>{
       console.log("output text",outputText)
       if(outputText==quntumCare || outputText==qCareLink){
          setNameMachine("Quantum Care Link")
       }
    },[outputText])

    const handleSelectPort=()=>{
        if(!checkBoxValue){
          toast.error(t("modalConnect.error"),{position:"top-center"})
          return;
        }
        selectPort()
    }

    const connectMachine=()=>{
        connect();
    }

    const checkMachine=()=>{
        send("W");
    }

    return (
        <Dialog open={nameMachine == "" || !isConnected}>
            <DialogContent className="max-w-[45%]!" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle className="text-2xl">{t("modalConnect.title")}</DialogTitle>
                    <DialogDescription >{t("modalConnect.description")}</DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-hidden items-center flex flex-col space-y-5 ">
                    <FieldGroup className=" flex flex-row " >
                        <FieldLabel>
                           <Field orientation="horizontal"  >
                                <Checkbox  checked={checkBoxValue=="qcl"} disabled={hasPort}  onCheckedChange={(value)=>setCheckBoxValue(value?"qcl":undefined)} className="rounded-2xl border-muted-foreground border-2" id="toggle-checkbox-1" name="toggle-checkbox-1" />
                                <FieldContent>
                                   <FieldTitle className="text-xl font-bold">Q care link Machine</FieldTitle>
                                   <img src={QCareLink} width={250} alt="q-care-link_machine" />
                                </FieldContent>
                           </Field>
                        </FieldLabel>

                        <FieldLabel>
                            <Field orientation="horizontal"  >
                             <Checkbox checked={checkBoxValue=="qc"} disabled={hasPort} onCheckedChange={(value)=>setCheckBoxValue(value?"qc":undefined)} id="toggle-checkbox-2" name="toggle-checkbox-2" className="rounded-2xl border-muted-foreground border-2"/>
                             <FieldContent >
                                 <FieldTitle className="text-xl font-bold">Quantum Care</FieldTitle>
                                <img src={Quantum} width={250}  alt="q-care-link_machine" />
                             </FieldContent>
                           </Field>
                        </FieldLabel>
                    </FieldGroup>
                   <Field>
                      {!isConnected
                       ?(<Button className={hasPort ? "bg-foreground":""} onClick={hasPort?connectMachine:handleSelectPort}>{hasPort?t("modalConnect.btnConnect"):t("modalConnect.btnSelectPort")} </Button>)
                       :(<Button onClick={checkMachine} variant="outline">{t("modalConnect.btnCheck")}</Button>)}
                      <Button  variant="link" onClick={closeSession}>{t("modalConnect.btnClose")}</Button>   
                  </Field>                 
                </div>
            </DialogContent>
        </Dialog>
    )

}