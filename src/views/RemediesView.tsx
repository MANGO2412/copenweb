import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { useState, useMemo, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CreateRemedyModal } from "./CreateRemedyModal"
import { 
  PlusIcon, 
  Trash2Icon, 
  CopyIcon, 
  ZapIcon, 
  TimerIcon, 
  CodeIcon, 
  PlayIcon,
  ArrowRightIcon,
  RefreshCwIcon,
  FunnelIcon,
  ScrollTextIcon,
  EditIcon
} from "lucide-react"
import {useSerialContext} from "@/context/serial-context"
import {
  getSystemRemedies,
  getCustomRemedies,
  getRatesByCustomRemedis,
  getRatesBySystemRemedis,
  saveRemedy,
  saveContentRemedies,
  removeRemedy,
  updateRemedy,
  removeRateRemdy
} from "@/lib/supabase"
import type {Remedy} from "@/interface/remedy"
import type {Rate} from "@/interface/rates"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from "@/components/ui/context-menu"

import MachineProcess from "@/components/MachineProcess"

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

interface RemedyFiltersProps {
  showUserRemedies: boolean
  setShowUserRemedies: (value: boolean) => void
  showSystemRemedies: boolean
  setShowSystemRemedies: (value: boolean) => void
  letterFilter: string
  setLetterFilter: (value: string) => void
}

interface RemedyRatesTableProps {
  rates: Rate[]
}

interface MantraPanelProps {
  onAutosimile: () => void
  onNeutralize: () => void
  onTimer: () => void
  onCopy: () => void
  onDecode: () => void
  onCode: () => void
  onDirectTreatment: () => void
  onComplementaryCode: () => void
}

function RemedyFilters({ 
  showUserRemedies, 
  setShowUserRemedies, 
  showSystemRemedies, 
  setShowSystemRemedies,
  letterFilter,
  setLetterFilter
}: RemedyFiltersProps) {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-semibold">{t('remedies.filterByLetter')}</Label>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="userRemedies" 
            checked={showUserRemedies}
            onCheckedChange={(checked) => setShowUserRemedies(checked as boolean)}
          />
          <label 
            htmlFor="userRemedies" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t('remedies.customRemedies')}
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="systemRemedies" 
            checked={showSystemRemedies}
            onCheckedChange={(checked) => setShowSystemRemedies(checked as boolean)}
          />
          <label 
            htmlFor="systemRemedies" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t('remedies.systemRemedies')}
          </label>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-base font-semibold">{t('remedies.filterByLetter')}</Label>
        <Select value={letterFilter} onValueChange={setLetterFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('remedies.all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('remedies.all')}</SelectItem>
            {alphabet.map((letter) => (
              <SelectItem key={letter} value={letter}>
                {letter}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function MantraPanel({ 
  onAutosimile, 
  onNeutralize, 
  onTimer, 
  onCopy, 
  onDecode, 
  onCode,
  onDirectTreatment,
  onComplementaryCode 
}: MantraPanelProps) {
  const { t } = useTranslation()
  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold">{t('remedies.title')}</Label>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline"  onClick={onAutosimile} className="text-sm h-12">
          <ZapIcon className="w-4 h-4 mr-2" />
          Autosimile
        </Button>
        <Button variant="outline"  onClick={onNeutralize} className="text-sm h-12">
          <RefreshCwIcon className="w-4 h-4 mr-2" />
          Neutralize
        </Button>
        <Button variant="outline"  onClick={onTimer} className="text-sm h-12">
          <TimerIcon className="w-4 h-4 mr-2" />
          10 sec timer
        </Button>
        <Button variant="outline"  onClick={onCopy} className="text-sm h-12">
          <CopyIcon className="w-4 h-4 mr-2" />
          {t('remedies.duplicate')}
        </Button>
        <Button variant="outline"  onClick={onDecode} className="text-sm h-12">
          <CodeIcon className="w-4 h-4 mr-2" />
          Decode
        </Button>
        <Button variant="outline"  onClick={onCode} className="text-sm h-12">
          <CodeIcon className="w-4 h-4 mr-2" />
          Code
        </Button>
        <Button variant="outline"  onClick={onDirectTreatment} className="text-sm h-12">
          <PlayIcon className="w-4 h-4 mr-2" />
          Direct Treatment
        </Button>
        <Button variant="outline"  onClick={onComplementaryCode} className="text-sm h-12">
          <ArrowRightIcon className="w-4 h-4 mr-2" />
          Complementary Code
        </Button>
      </div>
    </div>
  )
}

function RemedyRatesTable({ rates }: RemedyRatesTableProps) {
  const { t } = useTranslation()
  return (
    <div className="border h-70 rounded-lg overflow-auto">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="px-3 py-3 text-left text-sm font-medium">{t('analysis.codes')}</th>
            <th className="px-3 py-3 text-left text-sm font-medium">{t('analysis.codeName')}</th>
            <th className="px-3 py-3 text-left text-sm font-medium">{t('analysis.potency')}</th>
            <th className="px-3 py-3 text-left text-sm font-medium">{t("remedies.labelMethod")}</th>
            <th className="px-3 py-3 text-left text-sm font-medium">{t('remedies.labelNivel')}</th>
            <th className="px-3 py-3 text-left text-sm font-medium">{t("remedies.labelComp")}</th>
          </tr>
        </thead>
        <tbody>
          {rates.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                {t('remedies.selectRates')}
              </td>
            </tr>
          ) : (
            rates.map((rate, index) => (
              <tr key={`${rate.id}-${index}`} className="border-t hover:bg-muted/50">
                <td className="px-3 py-3 text-sm">{rate.frecuencia}</td>
                <td className="px-3 py-3 text-sm font-medium">{rate.nombre}</td>
                <td className="px-3 py-3 text-sm">{rate.potencia}</td>
                <td className="px-3 py-3 text-sm">{rate.metodo}</td>
                <td className="px-3 py-3 text-sm">{rate.nivel}</td>
                <td className="px-3 py-3 text-sm">{rate.complemento || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}



export function RemediesView() {
  const { t } = useTranslation()
  const {outputText,send,isConnected}=useSerialContext()
  const [openModalProcess,setOpenModalProcess]=useState<boolean>(false);
  const [txtModalProcess,setTxtModalProcess]=useState<string[]>([]);

  const [editRemedy,setEditRemedy]=useState<{
    idRemedy:string;
    nameRemedy:string;
    selectedRate:Rate[]
  }|undefined>(undefined)
  const [showUserRemedies, setShowUserRemedies] = useState(true)
  const [showSystemRemedies, setShowSystemRemedies] = useState(true)
  const [letterFilter, setLetterFilter] = useState("all")
  const [selectedRemedy, setSelectedRemedy] = useState<Remedy | null>(null)
  const [editedRates, setEditedRates] = useState<Rate[]>([])

  const [remedies, setRemedies] = useState<Remedy[]>([])
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const [loadingContentRemedy,setLoadingContentRemedy]=useState<boolean>(false)
  const [loadingRemedyList,setLoadingRemedyList]=useState<boolean>(false)

  const filteredRemedies = useMemo(() => {
    return remedies.filter(remedy => {
      const typeMatch = (showUserRemedies && remedy.isCustomRemedy) || 
                        (showSystemRemedies && !remedy.isCustomRemedy)
      const letterMatch = letterFilter === "all" || 
                         remedy.nombre.toUpperCase().startsWith(letterFilter)
      return typeMatch && letterMatch
    })
  }, [remedies, showUserRemedies, showSystemRemedies, letterFilter])

  const fetchRemedies=async()=>{
     setLoadingRemedyList(true)
     const systemRemedies=await getSystemRemedies()
     const customRemedies=await getCustomRemedies();
     setRemedies([...systemRemedies,...customRemedies])
     setLoadingRemedyList(false)
  }

  useEffect(()=>{
    fetchRemedies();
  },[])

  useEffect(()=>{
    if(outputText=="532" || outputText=="711" || outputText=="534" || outputText =="539" || outputText == "538" || outputText == "533"){
      setOpenModalProcess(false)
    }
  },[outputText])

  const handleSelectRemedy = async (remedy: Remedy) => {
    setLoadingContentRemedy(true)
    setSelectedRemedy(remedy);
    const resultRates=remedy.isCustomRemedy ?await getRatesByCustomRemedis(remedy.id || ""):await getRatesBySystemRemedis(remedy.id || "")
    setEditedRates(resultRates);
    setLoadingContentRemedy(false)
  }

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true)
  }

  const handleSaveNewRemedy = async (idRemedy:string|undefined,nameRemedy:string,newRate:Rate[],removeRate:Rate[],clearForm:(error:boolean)=>void) => {
    const remedy: Remedy = {
      id:idRemedy,
      nombre:nameRemedy,
      fecha: new Date().toISOString(),
    }
    const result=idRemedy?await updateRemedy(remedy):await saveRemedy(remedy)
    
    if("code" in   result){
        if(result.code=="23505") toast.error(t("remedies.remedyExists").replace("{name}",remedy.nombre));
         clearForm(true);
         return;
    }

    for (const rate of removeRate) {
      await removeRateRemdy(rate.codigoremedioid || "")
    }

    await saveContentRemedies(newRate,result.id || "")
    if(!idRemedy){
      setRemedies([...remedies, {...result,isCustomRemedy:true}]);
    }

    if(selectedRemedy?.id == idRemedy) setSelectedRemedy(null);

    clearForm(false);
    setCreateModalOpen(false)
  }

  const handleRemoveRemedy=async(remedy_id:string)=>{
     const remedy=remedies.find(item=>item.id==remedy_id);

     if(remedy?.isCustomRemedy){
        const result=await removeRemedy(remedy_id);
        if(result){
          toast.success(t("remedies.remedyRemoved").replace("{name}",remedy.nombre),{position:"top-center"})
          setRemedies(remedies.filter(item=>item.id != remedy_id))
          if(selectedRemedy?.id == remedy_id) setSelectedRemedy(null);
        }else{
          toast.error(t("remedies.remedyRemoveError").replace("{name}",remedy.nombre),{position:"top-center"})
        }

     }else{
       toast.error(t("remedies.cannotRemoveSystemRemedy"),{position:"top-center"})
     }

  }

  const handleEditRemedy=async(remedy_id:string)=>{
     const remedy=remedies.find(item=>item.id==remedy_id);
      if(remedy?.isCustomRemedy){
        const result=selectedRemedy?.id==remedy_id ?editedRates:await getRatesByCustomRemedis(remedy.id || "")
        setEditRemedy({
          idRemedy:remedy.id || "",
          nameRemedy:remedy.nombre,
          selectedRate:result
        })
     
        setCreateModalOpen(true)
     }else{
       toast.error(t("remedies.cannotEditSystemRemedy"),{position:"top-center"})
     }


  }

  const duplicateRemedy=async(remedy:Remedy)=>{
    const copyRemedy:Remedy={
       nombre:remedy.nombre+"-"+"copy",
       fecha:new Date().toISOString()
    }
    

    const rates=selectedRemedy?.id==remedy.id?
                                           editedRates:remedy.isCustomRemedy?await getRatesByCustomRemedis(remedy.id || "")
                                                                            :await getRatesBySystemRemedis(remedy.id || "")


    const result=await saveRemedy(copyRemedy)
    if("code" in   result){
       if(result.code=="23505") toast.error(t("remedies.remedyExists").replace("{name}",copyRemedy.nombre),{position:'top-center'});
       return;
    }

    await saveContentRemedies(rates,result.id || "")
    setRemedies([...remedies, {...result,isCustomRemedy:true}]);
    toast.success(t("remedies.remedyDuplicated"),{position:'top-center'})
  }

 const onAutosimile=()=>{
  if(!isConnected){
    toast.error(t("common.machineDisconnected"), { position: "top-center" })
    return;
  }
  setTxtModalProcess("Autosimile".split(""))
  setOpenModalProcess(true)
  send("S")
 }

 const onNeutralize=()=>{
  if(!isConnected){
    toast.error(t("common.machineDisconnected"), { position: "top-center" })
    return;
  }
  setTxtModalProcess("Neutralizing".split(""))
  setOpenModalProcess(true)
  send("Z")
 }

 const onTimer=()=>{
  if(!isConnected){
    toast.error(t("common.machineDisconnected"), { position: "top-center" })
    return;
  }
  setTxtModalProcess("10 Second Timer".split(""))
  setOpenModalProcess(true)
  send("P")
 }

 const onCopy=()=>{ 
  if(!isConnected){
    toast.error(t("common.machineDisconnected"), { position: "top-center" })
    return;
  }
  setTxtModalProcess("Copying".split(""))
  setOpenModalProcess(true)
  send("Y")
 }

 const onDecode=()=>{
  if(!isConnected){
    toast.error(t("common.machineDisconnected"), { position: "top-center" })
    return;
  }
  setTxtModalProcess("Decoding".split(""))
  setOpenModalProcess(true)
  send("E")
 }

 const onCode=()=>{
  if(!isConnected){
    toast.error(t("common.machineDisconnected"), { position: "top-center" })
    return;
  }
  setTxtModalProcess("Coding".split(""))
  setOpenModalProcess(true)
  send("V")
 }

  return (
    <div className="space-y-6">      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('remedies.title')}</h1>
        <Button className="bg-foreground rounded-none shadow-md/20" onClick={handleOpenCreateModal}>
          <PlusIcon className="w-4 h-4 mr-2" />
          {t('remedies.addRemedy')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-black/50 border-2 p-0 rounded-none pb-3">
            <CardHeader className="bg-sidebar pb-2 pt-2 mt-0 border-b-4 rounded-none border-black/50">
              <CardTitle className="text-lg font-semibold text-black/70 flex items-center gap-2 pr-2">
                <FunnelIcon className="w-5 h-5"/>
                {t('remedies.filterByLetter')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RemedyFilters 
                showUserRemedies={showUserRemedies}
                setShowUserRemedies={setShowUserRemedies}
                showSystemRemedies={showSystemRemedies}
                setShowSystemRemedies={setShowSystemRemedies}
                letterFilter={letterFilter}
                setLetterFilter={setLetterFilter}
              />
            </CardContent>
          </Card>

          <Card className="border-black/50 border-2 p-0 rounded-none pb-3">
            <CardHeader className="bg-sidebar pb-2 pt-2 mt-0 border-b-4 rounded-none border-black/50">
              <CardTitle className="text-lg font-semibold text-black/70 flex items-center gap-2 pr-2">
               <ScrollTextIcon className="w-5 h-5"/>
               {t('remedies.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRemedyList?(
                 <div className="flex justify-center items-center  h-96">
                    <Spinner className="size-9" />
                </div>
              ):(
                <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredRemedies.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">{t('remedies.noRemedies')}</p>
                ) : (
                  filteredRemedies.map((remedy) => (
                    <ContextMenu  key={remedy.id}>
                      <ContextMenuTrigger  onClick={() => handleSelectRemedy(remedy)}>
                         <div
                            className={`
                              w-full text-left p-3 mb-2 rounded-lg border transition-colors
                              ${selectedRemedy?.id === remedy.id 
                                ? "bg-sidebar text-foreground border-black/50 border-2" 
                                : "hover:bg-muted/50 border-border"
                              }
                            `}
                          >
                          <div className="flex justify-between items-start">
                            <span className="font-medium">{remedy.nombre}</span>
                            {remedy.isCustomRemedy?
                            (
                               <Badge className="text-xs bg-blue-500">{t('remedies.customRemedies')}</Badge>
                            ):(
                              <Badge variant="secondary" className="text-xs">{t('remedies.systemRemedies')}</Badge>
                            )}
                          </div>
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                           <ContextMenuItem onClick={()=>duplicateRemedy(remedy)}><CopyIcon className="w-4 h-4" /> {t('remedies.duplicate')}</ContextMenuItem>
                           <ContextMenuItem onClick={()=>handleEditRemedy(remedy.id || "")}><EditIcon className="w-4 h-4" /> {t('remedies.edit')}</ContextMenuItem>
                           <ContextMenuItem onClick={()=>handleRemoveRemedy(remedy.id || "")}><Trash2Icon className="w-4 h-4" /> {t('remedies.delete')}</ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))
                )}
              </div>
              )}
              
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {selectedRemedy ? (
            <>
              <Card className="border-black/50 border-2 bg-sidebar rounded-none">
                <CardHeader>
                  <CardTitle className="text-lg">{t('remedies.remedyName')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">{t('remedies.remedyName')}</Label>
                      <p className="text-lg font-medium">{selectedRemedy.nombre}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">{t('remedies.description')}</Label>
                      <p className="text-lg font-medium">
                        {selectedRemedy.isCustomRemedy ? t('remedies.customRemedies') : t('remedies.systemRemedies')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">{t('userProfile.createdAt')}</Label>
                      <p className="text-lg font-medium">
                        {new Date(selectedRemedy.fecha).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">{t('categories.ratesCount')}</Label>
                      <p className="text-lg font-medium">{editedRates.length}</p>
                    </div>
                  </div>

                  <Separator />

                  <MantraPanel 
                    onAutosimile={onAutosimile}
                    onNeutralize={onNeutralize}
                    onTimer={onTimer}
                    onCopy={onCopy}
                    onDecode={onDecode}
                    onCode={onCode}
                    onDirectTreatment={() => console.log("Direct Treatment")}
                    onComplementaryCode={() => console.log("Complementary Code")}
                  />
                </CardContent>
              </Card>

              <Card className="border-black/50 border-2 bg-sidebar rounded-none">
                <CardHeader>
                  <CardTitle className="text-lg">{t('remedies.ratesSelected')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingContentRemedy ?(
                    <div className="flex justify-center items-center  h-70">
                       <Spinner className="size-9" />
                    </div>
                  ):(
                    <RemedyRatesTable 
                      rates={editedRates}
                     
                    />
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-sidebar border-2 border-black/50">
              <CardContent className="py-12 text-center  text-muted-foreground">
                <p className="text-lg">{t('remedies.selectRates')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CreateRemedyModal 
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSave={handleSaveNewRemedy}
        editRemedy={editRemedy}
        cleanEditForm={setEditRemedy}
      />

      <MachineProcess 
        open={openModalProcess} 
        txtProcess={txtModalProcess}
      />
    </div>
  )
}
