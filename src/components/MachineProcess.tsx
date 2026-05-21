import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle, 
} from "@/components/ui/dialog"

import { useTranslation } from "react-i18next"

interface MachineProcessProps{
  open:boolean;
  txtProcess:string[];
}


export default function MachineProcess({open,txtProcess}:MachineProcessProps){
  const {t}=useTranslation()
  return(
    <Dialog open={open}>
      <DialogContent className="max-w-90 h-50 items-center justify-center rounded-none overflow-hidden flex flex-col" showCloseButton={false} aria-describedby={undefined}>
       <DialogHeader>
            <DialogTitle className="text-xl">{t("common.machineProcessTitle")}</DialogTitle>
        </DialogHeader>
        <div className="flex text-xl font-bold">
          {txtProcess.map((letter,index)=>(
            <span key={index} className={`animate-bounce [animation-delay:${index*100}ms]`}>{letter}</span>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
