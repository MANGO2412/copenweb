import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { PlusIcon, Trash2Icon, EyeIcon, ClockIcon, UserIcon, PlayIcon,ChevronDownIcon,ChevronRightIcon,SearchIcon } from "lucide-react"
import DatePicker from "@/components/DatePicker"
import {Switch} from "@/components/ui/switch"
import{
  getCustomRemedies,
  getSystemRemedies,
  getAnalysisByPatient,
  getSubcategoriesByCategoryId,
  getRatesBySubcategoryId,
  getPatient,
  addBroadcasting,
  getBroadcasting,
  updatestatusbroadcasting,
  removebroadcasting,
  getContentBroadcasting,
  searchRatesByName
}from "@/lib/supabase"

import {
  formatRate
} from "@/lib/utils"

import useGetCategory from "@/hooks/useGetCategory"
import type { Broadcasting, BroadcastingForm,BroadcastingContent} from "@/interface/broadcasting"
import type { Patient } from "@/interface/patient"
import type { Remedy } from "@/interface/remedy"
import type { Analysis } from "@/interface/analysis"
import Radio from "@/assets/bc-anim.gif"
import { Field, FieldLabel } from "@/components/ui/field"
import {hoursToMilliseconds,minutesToMilliseconds,addMilliseconds,add} from "date-fns"
import type { Rate } from "@/interface/rates"


interface ActiveTreatmentRowProps {
  treatment:Broadcasting
  onViewDetail: (treatment: Broadcasting) => void
  isSelected: boolean
  onSelect: (selected: boolean) => void
  updateContentTreatmentTabe:(treatment: Broadcasting,action:'RMPT'|"RMAT")=>void
}

/**
 * Componente que representa una fila de tratamiento activo en ejecución.
 * Muestra información del paciente, tratamiento, tiempos y barra de progreso.
 */
function ActiveTreatmentRow({ treatment, onViewDetail, isSelected, onSelect,updateContentTreatmentTabe }: ActiveTreatmentRowProps) {
  const { t } = useTranslation()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date().getTime()
      const start = new Date(treatment.fecha_inicio).getTime()
      const end = new Date(treatment.fecha_cierre).getTime()
      const elapsed = now - start
      const total = end - start
      const percentage = Math.min(Math.max((elapsed / total) * 100, 0), 100)
      setProgress(percentage)
    }

    calculateProgress()
    const interval = setInterval(calculateProgress, 1000)
    return () => clearInterval(interval)
  }, [treatment.fecha_inicio, treatment.fecha_cierre])

  const endTime = new Date(treatment.fecha_cierre).toLocaleString()
  const isOverdue = progress >= 95

  if(progress==100){
     updateContentTreatmentTabe(treatment,'RMAT')
  }

  return (
    <div className="flex items-center gap-4 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
      <Checkbox checked={isSelected} onCheckedChange={onSelect} />
      <div className="flex-1 grid grid-cols-4 gap-4 items-center">
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{treatment.pacientenombre}</span>
        </div>
        <div className="flex items-center gap-2">
          <PlayIcon className="w-4 h-4 text-green-500" />
          <span>{treatment.nombre}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{t('broadcasting.finalizes')}</span>
          <span className="text-xs text-muted-foreground">{endTime}</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${isOverdue ? "bg-green-500" : "bg-teal-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onViewDetail(treatment)}>
        <EyeIcon className="w-4 h-4" />
      </Button>
    </div>
  )
}

interface PendingTreatmentRowProps {
  treatment: Broadcasting
  isSelected: boolean
  onSelect: (selected: boolean) => void
  updateContentTreatmentTabe:(treatment: Broadcasting,action:'RMPT'|"RMAT")=>void
}

/**
 * Componente que representa una fila de tratamiento pendiente o periódico.
 * Muestra información del paciente, tratamiento y tiempo faltante (contador).
 */
function PendingTreatmentRow({ treatment, isSelected, onSelect,updateContentTreatmentTabe }: PendingTreatmentRowProps) {
  const { t } = useTranslation()
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const start = new Date(treatment.fecha_inicio).getTime()
      const diff = start - now

      if (diff <= 0) {
        setTimeLeft(t('broadcasting.finalizes'))
        updateContentTreatmentTabe(treatment,"RMPT")
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${seconds}s`)
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [treatment.fecha_inicio])

  const startTime = new Date(treatment.fecha_inicio).toLocaleString()

  return (
    <div className="flex items-center gap-4 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
      <Checkbox checked={isSelected} onCheckedChange={onSelect} />
      <div className="flex-1 grid grid-cols-3 gap-4 items-center">
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{treatment.pacientenombre}</span>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-orange-500" />
          <span>{treatment.nombre}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{t('broadcasting.startDate')}: {startTime}</span>
          <span className="text-sm font-semibold text-orange-600">{timeLeft}</span>
        </div>
      </div>
    </div>
  )
}

interface TreatmentTableProps {
  title: string
  treatments: Broadcasting[]
  selectedIds: string[]
  onSelect: (id: string, selected: boolean, action: 'active' | 'pending') => void
  onSelectAll: (selected: boolean) => void
  onDelete: () => void
  onViewDetail?: (treatment: Broadcasting) => void
  updateContentTreatmentTabe:(treatment: Broadcasting,action:'RMPT'|"RMAT")=>void
  type: "active" | "pending"
}

/**
 * Componente de tabla genérica para mostrar tratamientos.
 * Puede mostrar tratamientos activos o pendientes según el tipo especificado.
 */
function TreatmentTable({
  title,
  treatments,
  selectedIds,
  onSelect,
  onSelectAll,
  onDelete,
  onViewDetail,
  type,
  updateContentTreatmentTabe
}: TreatmentTableProps) {
  const { t } = useTranslation()
  const allSelected = treatments.length > 0 && selectedIds.length === treatments.length

  const handleDeleteAll = () => {
    onDelete();
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleDeleteAll}>
               <Trash2Icon className="w-4 h-4 mr-1" />
                {t('broadcasting.delete')}
              </Button>
           )}
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) => onSelectAll(!!checked)}
            />
            <span className="text-xs text-muted-foreground">{t('common.selectAll')}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2">
            {treatments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{type === "active" ? t('broadcasting.noActiveTreatments') : t('broadcasting.noPendingTreatments')}</p>
              </div>
            ) : (
              treatments.map((treatment) =>
                type === "active" ? (
                  <ActiveTreatmentRow
                    key={treatment.id}
                    treatment={treatment}
                    onViewDetail={onViewDetail!}
                    isSelected={selectedIds.includes(treatment.id)}
                    onSelect={(selected) => onSelect(treatment.id, selected,"active")}
                    updateContentTreatmentTabe={updateContentTreatmentTabe}
                  />
                ) : (
                  <PendingTreatmentRow
                    key={treatment.id}
                    treatment={treatment}
                    isSelected={selectedIds.includes(treatment.id)}
                    onSelect={(selected) => onSelect(treatment.id, selected, "pending")}
                    updateContentTreatmentTabe={updateContentTreatmentTabe}
                  />
                )
              )
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

interface CreateTreatmentModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: (treatment: BroadcastingForm[]) => void
  patients:Patient[]
}

/**
 * Modal para crear un nuevo tratamiento de broadcasting.
 * Permite seleccionar paciente, remedy/analysis/rates y configurar tiempos de inicio y fin.
 */

interface timeProgramming{
    seconds:number,
    minutes:number,
    hours:number,
}

type DurationTime='minute'|'hour'| 'day';

interface TreatmentDetailContentProps {
  treatment: Broadcasting
  patients: Patient[]
}

function TreatmentDetailContent({ treatment, patients }: TreatmentDetailContentProps) {
  const { t } = useTranslation()
  const [content,setContent]=useState<BroadcastingContent>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const resp=await getContentBroadcasting(treatment.id)

      if("code" in resp){
          console.error("Error fetching detail data:", resp.messsage)
          return;
      }
     
      setContent(resp)
      setIsLoading(false)
    }
    fetchData()
  }, [])


  const patient = patients.find(p => p.idp === treatment.pacienteid)
  const patientName = patient ? `${patient.nombre} ${patient.apellido1} ${patient.apellido2 || ""}` : treatment.pacientenombre

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleString()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-3 bg-muted/50 p-2 rounded-xl">
        <div className="flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-muted-foreground" />
          <div>
            <span className="text-sm text-muted-foreground">{t('broadcasting.patientLabel')}</span>
            <span className="ml-2 font-medium">{patientName}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-muted-foreground" />
          <div>
            <span className="text-sm text-muted-foreground">{t('broadcasting.startTime')}</span>
            <span className="ml-2 font-medium">{formatDate(treatment.fecha_inicio)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-muted-foreground" />
          <div>
            <span className="text-sm text-muted-foreground">{t('broadcasting.endTime')}</span>
            <span className="ml-2 font-medium">{formatDate(treatment.fecha_cierre)}</span>
          </div>
        </div>
      </div>

      {/* System Remedies */}
      {content &&  content?.remedios_system.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold border-b-2">{t('broadcasting.systemRemediesTitle')}</h3>
          <div className="grid grid-cols-2 gap-2">
            {content.remedios_system.map(r => (
              <div key={r.id} className="p-2 mt-2 bg-muted/50 rounded-md">
                <Badge variant="outline" className="mb-1">{t('common.system')}</Badge>
                <p className="text-sm">{r.nombre}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Remedies */}
      {content && content.remedios_custom.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold border-b-2">{t('broadcasting.customRemediesTitle')}</h3>
          <div className="grid grid-cols-2 gap-2">
            {content.remedios_custom.map(r => (
              <div key={r.id} className="p-2 bg-muted/50 rounded-md">
                <Badge variant="secondary" className="mb-1">{t('common.personal')}</Badge>
                <p className="text-sm">{r.nombre}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyses */}
      {content && content?.analisis.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold border-b-2">{t('broadcasting.analysesTitle')}</h3>
          <div className="grid grid-cols-2 gap-2">
            {content.analisis.map(a => (
              <div key={a.id} className="p-2 bg-muted/50 rounded-md">
                <p className="text-sm">{a.nombre}</p>
                <p className="text-xs text-muted-foreground">{a.fecha ? formatDate(a.fecha) : ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Rates */}
      {content && content.rates_system.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold border-b-2">{t('broadcasting.systemRatesTitle')} ({content.rates_system.length})</h3>
          <div className="grid grid-cols-2 gap-2">
            {content.rates_system.map((rate) => (
              <div key={rate.id} className="p-2 bg-muted/50 rounded-md">
                <Badge variant="outline" className="mb-1">{t('common.system')}</Badge>
                <p className="text-sm">{rate.frecuencia}</p>
                <p className="text-sm">{rate.nombre}</p>
                <div className="w-full border-2 mb-1.5"/>

                <p className="text-xs text-muted-foreground mb-2"><span className="font-bold mr-0.5">{t('categories.categoriesCount')}:</span>{rate.categoria}</p>
                <p className="text-xs text-muted-foreground"><span className="font-bold mr-0.5">{t('categories.subcategoriesCount')}:</span>{rate.subcategoria}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal Rates */}
      {content &&  content.rates_custom.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold border-b-2">{t('broadcasting.personalRatesTitle')} ({content.rates_custom.length})</h3>
          <div className="grid grid-cols-2 gap-2">
            {content.rates_custom.map((rate) => (
              <div key={rate.id} className="p-2 bg-muted/50 rounded-md">
                <Badge variant="secondary" className="mb-1">{t('common.personal')}</Badge>
                <p className="text-sm">{rate.frecuencia}</p>
                <p className="text-sm">{rate.nombre}</p>
                <div className="w-full border-2 mb-1.5"/>
                <p className="text-xs text-muted-foreground mb-2"><span className="font-bold mr-0.5">{t('categories.categoriesCount')}:</span>{rate.categoria}</p>
                <p className="text-xs text-muted-foreground"><span className="font-bold mr-0.5">{t('categories.subcategoriesCount')}:</span>{rate.subcategoria}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!content && (
        <div className="text-center py-4 text-muted-foreground">
          {t('broadcasting.noContent')}
        </div>
      )}
    </div>
  )
}

function CreateTreatmentModal({
  isOpen,
  onOpenChange,
  onSave,
  patients
}: CreateTreatmentModalProps) {
  const { t } = useTranslation()
  //variables to periodic treatment
  const [treatmenttype,setTreatmentType]=useState<"simple"|"periodic">("simple")
  
  const [everyValue,setEveryValue]=useState<number>(0)
  const [durationValue,setDurationValue]=useState<number>(0)
  const [durationPerCycle,setDurationPerCycle]=useState<timeProgramming>({seconds:0,minutes:0,hours:0})

  const [selectEvery,setSelectEvery]=useState<DurationTime>("minute")
  const [selectDuration,setSelectDuration]=useState<DurationTime>("minute")


  const [isLoading, setIsLoading] = useState(false)
  const [showUserRates,setShowUserRates]=useState(false)
  const {categories,setCategories}=useGetCategory({getCustom:showUserRates})
  const [systemRemedies, setSystemRemedies] = useState<Remedy[]>()
  const [customRemedies, setCustomRemedies] = useState<Remedy[]>()
  const [allAnalyses, setAllAnalyses] = useState<Analysis[]>([])
  const [searchTerm,setSearchTerm]=useState<string>()
  const [searchResults,setSearchResults]=useState<Rate[]>([])


  const [selectedPatient, setSelectedPatient] = useState<Patient>()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set())

  const [formData, setFormData] = useState<Omit<BroadcastingForm,"pacienteId"|"pacientenombre">>({
    nombre:"" ,
    rateIds:[],
    ratePersonalesIds:[],
    remedioPersonalizadoIds:[],
    remedioSistemaIds:[],
    analisisIds:[]
  })

  const fetchData = async () => {
    try {
      setIsLoading(true)
    
      if(!systemRemedies){
         setSystemRemedies(await getSystemRemedies())
      }
      if(!customRemedies){
         setCustomRemedies(await getCustomRemedies())
      }

      setAllAnalyses(await getAnalysisByPatient(selectedPatient?.idp || ""))
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching data:", error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedPatient) {
      fetchData()
    }
  }, [selectedPatient])

  useEffect(()=>{
    setFormData(() => {
      const now = new Date()
      now.setHours(now.getHours() + 1)
      return {
        ...formData,
        fecha_inicio: new Date(),
        fecha_cierre: now,
      }
    })
  },[isOpen])

  const handleRemedyToggle = (remedyId: string,type:"system"|"custom") => {
    if(type=="system"){
      const newSelectRemedy=formData.remedioSistemaIds.includes(remedyId)
                                                                         ?formData.remedioSistemaIds.filter((id) => id !== remedyId)
                                                                         :[...formData.remedioSistemaIds, remedyId]
      setFormData({...formData,remedioSistemaIds:newSelectRemedy})

    }else{
      const newSelectRemedy=formData.remedioPersonalizadoIds.includes(remedyId)
                                                                         ?formData.remedioPersonalizadoIds.filter((id) => id !== remedyId)
                                                                         :[...formData.remedioPersonalizadoIds, remedyId]
      setFormData({...formData,remedioPersonalizadoIds:newSelectRemedy})

    }
  }

  const handleAnalysisToggle = (analysisId: string) => {
     const newanalysisId=formData.analisisIds.includes(analysisId)
                                                                  ?formData.analisisIds.filter((id) => id !== analysisId)
                                                                  :[...formData.analisisIds, analysisId]
     setFormData({...formData,analisisIds:newanalysisId})
  }

  const handleRateToggle = (rateId: string) => {
    if(!showUserRates){
      const newSelectRate=formData.rateIds.includes(rateId)
                                                           ?formData.rateIds.filter((id) => id !== rateId)
                                                           :[...formData.rateIds, rateId]
      setFormData({...formData,rateIds:newSelectRate})

    }else{
      const newSelectRate=formData.ratePersonalesIds.includes(rateId)
                                                                     ?formData.ratePersonalesIds.filter((id) => id !== rateId)
                                                                     :[...formData.ratePersonalesIds, rateId]
      setFormData({...formData,ratePersonalesIds:newSelectRate})

    }
  
  }

  const toggleCategory = async (id: string) => {
    const newSet = new Set(expandedCategories)
    const category = categories.find(c => c.id === id)
    if(!category?.subcategories && category){
      category.subcategories=await getSubcategoriesByCategoryId(id,showUserRates) || []
      setCategories(categories.map(c => c.id === id ? category : c))
    }
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setExpandedCategories(newSet)
  }
  
  const toggleSubcategory = async (id: string) => {
    const newSet = new Set(expandedSubcategories)
    const subcategory = categories.flatMap(c => c.subcategories || []).find(s => s.id === id)
    if(!subcategory?.rates && subcategory){
      subcategory.rates=await getRatesBySubcategoryId(subcategory.subcategoriaid,showUserRates) || []
      setCategories(categories.map(c => ({
        ...c,
        subcategories: c.subcategories?.map(s => s.id === id ? subcategory : s)
      })))
    }
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setExpandedSubcategories(newSet)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) {
      toast.error("Selecciona un paciente", { position: "top-center" })
      return
    }
    if (formData.remedioPersonalizadoIds.length=== 0 && formData.remedioSistemaIds.length=== 0 && formData.analisisIds.length=== 0  && formData.rateIds.length=== 0 && formData.ratePersonalesIds.length=== 0) {
      toast.error("Selecciona al menos un remedy, análisis o rate", { position: "top-center" })
      return
    }

    const newTreatment:BroadcastingForm[]=[]
    if(treatmenttype == "periodic"){
      let starDate=formData.fecha_inicio;

      const durationMS= selectDuration=="minute"?minutesToMilliseconds(durationValue)
                                                :selectDuration=="hour"?hoursToMilliseconds(durationValue)
                                                                        :durationValue*86400000
      const everyMS=selectEvery=="minute"?minutesToMilliseconds(everyValue)
                                                :selectEvery=="hour"?hoursToMilliseconds(everyValue)
                                                                        :everyValue*86400000
      const totalTreatment=durationMS / everyMS;

      for(let i=0;i<totalTreatment;i++){
        newTreatment.push({
           ...formData,
           pacienteId:selectedPatient.idp || "",
           pacientenombre:selectedPatient.nombre,
           fecha_inicio:starDate,
           fecha_cierre:add(starDate || "",{
            hours:durationPerCycle.hours,
            minutes:durationPerCycle.minutes,
            seconds:durationPerCycle.minutes
           })       
        })

        starDate=addMilliseconds(starDate || "",everyMS);
      }
    }else{
      newTreatment.push({
        ...formData,
        pacienteId:selectedPatient.idp || "",
        pacientenombre:selectedPatient.nombre,
      })
    }

    console.log(newTreatment)

    onSave(newTreatment)
    setSelectedPatient(undefined)
    onOpenChange(false)
  }

  const isRateSelected = (rateId: string) => {
     if(showUserRates)
        return formData.ratePersonalesIds.some(id=>id==rateId)
    
    return formData.rateIds.some(id=>id==rateId)
  }

  const resetForm=()=>{
    onOpenChange(false)
    setFormData(()=>{
    const now = new Date()
    now.setHours(now.getHours() + 1)
    return {
      nombre: "",
      fecha_inicio: new Date(),
      fecha_cierre: now,
      rateIds:[],
      ratePersonalesIds:[],
      remedioPersonalizadoIds:[],
      remedioSistemaIds:[],
      analisisIds:[]
    }
   })
   setSelectedPatient(undefined)
   setSystemRemedies(undefined)
   setCustomRemedies(undefined)
   setAllAnalyses([])
   setTreatmentType('simple')
   setDurationPerCycle({hours:0,minutes:0,seconds:0})
   setEveryValue(0)
   setDurationValue(0)
   setSelectDuration("minute")
   setSelectEvery("minute")
   clearexpanded();
  }

  const clearexpanded = () => {
    setExpandedCategories(new Set())
    setExpandedSubcategories(new Set())
  }


  const handleSearchRate=async()=>{
    const term = searchTerm?.trim()

    if(!term){
      setSearchResults([])
      return
    }

    const data = await searchRatesByName(term)
    const result=formatRate(data || [])
    console.log(result)
    setSearchResults(result)
  }

return (
    <div className={`fixed inset-0 z-50 flex  items-center justify-center bg-black/50 ${isOpen ? "flex" : "hidden"}`}>
      <div className="bg-background p-6 mt-3 rounded-lg shadow-xl w-full max-w-2xl  overflow-hidden flex flex-col">
        <h2 className="text-xl font-semibold mb-4">{t('broadcasting.createTreatment')}</h2>        
          <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="space-y-2">
              <Label htmlFor="nombre">{t('broadcasting.treatmentName')}</Label>
              <Input
                id="nombre"
                value={formData?.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder={t('broadcasting.treatmentName')}
                required
                className="w-full pt-5 pb-5  border border-muted-foreground rounded-md"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient">{t('broadcasting.patient')}</Label>
              <select
                id="patient"
                className="w-full p-2 border rounded-md"
                value={selectedPatient?selectedPatient.idp:""}
                onChange={(e) => setSelectedPatient(patients.find(item=>item.idp==e.target.value))}
              >
                <option value="">{t('broadcasting.selectPatient')}</option>
                {patients.map((p) => (
                  <option key={p.idp} value={p.idp}>
                    {p.nombre} {p.apellido1} {p.apellido2}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-hidden ">
              <Tabs defaultValue="contenido" className="flex flex-col h-full">
                <TabsList variant="line" className="w-full justify-start">
                  <TabsTrigger value="contenido">{t('broadcasting.content')}</TabsTrigger>
                  <TabsTrigger value="programar">{t('broadcasting.scheduleTime')}</TabsTrigger>
                </TabsList>

                  <TabsContent value="contenido" className=" mt-0 p-4">
                    {selectedPatient ? (
                      isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Spinner className="w-8 h-8" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Tabs defaultValue="remedies" className="flex flex-col">
                            <TabsList variant="line" className="w-full justify-start">
                              <TabsTrigger value="remedies">
                                {t('broadcasting.remedies')} ({formData.remedioPersonalizadoIds.length+formData.remedioSistemaIds.length})
                              </TabsTrigger>
                              <TabsTrigger value="analyses">
                                {t('broadcasting.analyses')} ({formData.analisisIds.length})
                              </TabsTrigger>
                              <TabsTrigger value="rates">
                                {t('broadcasting.rates')} ({formData.rateIds.length+formData.ratePersonalesIds.length})
                              </TabsTrigger>
                            </TabsList>

                            <div className="2xl:h-98 xl:h-60 p-1 mt-2  overflow-auto">
                              <TabsContent value="remedies" className="mt-0 space-y-4 ">
                                <div>
                                  <div className="text-sm font-medium text-muted-foreground mb-2">{t('broadcasting.systemRemedies')}</div>
                                  {systemRemedies?.map((r) => (
                                    <div key={r.id} className="flex items-center gap-2 py-1">
                                      <Checkbox
                                        checked={formData.remedioSistemaIds.includes(r.id || "")}
                                        onCheckedChange={() => handleRemedyToggle(r.id || "","system")}
                                        className="border-muted-foreground"
                                      />
                                      <span>{r.nombre}</span>
                                    </div>
                                  ))}
                                </div>
                                {customRemedies && (
                                  <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-2">{t('broadcasting.customRemedies')}</div>
                                    {customRemedies.map((r) => (
                                      <div key={r.id} className="flex items-center gap-2 py-1">
                                        <Checkbox
                                          checked={formData.remedioPersonalizadoIds.includes(r.id || "")}
                                          onCheckedChange={() => handleRemedyToggle(r.id || "","custom")}
                                          className="border-muted-foreground"
                                        />
                                        <span>{r.nombre}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </TabsContent>

                              <TabsContent value="analyses" className="mt-0">
                                {allAnalyses.length === 0 ? (
                                  <p className="text-muted-foreground py-4">{t('broadcasting.noAnalyses')}</p>
                                ) : (
                                  allAnalyses.map((a) => {
                                    const analysisId = a.id || ""
                                    const analysisFecha = a.fecha || ""
                                    return (
                                      <div key={analysisId} className="flex items-center gap-2 py-1">
                                        <Checkbox
                                          checked={formData.analisisIds.includes(analysisId)}
                                          onCheckedChange={() => handleAnalysisToggle(analysisId)}
                                          className="border-muted-foreground"
                                        />
                                        <span>{a.nombre}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {analysisFecha ? new Date(analysisFecha).toLocaleDateString() : ""}
                                        </span>
                                      </div>
                                    )
                                  })
                                )}
                              </TabsContent>

                              <TabsContent value="rates" className="mt-0">
                                 <div className="relative flex items-center gap-2 w-full mb-2">
                                    <Input
                                      placeholder="Escribe el nombre de algun rate..."
                                      value={searchTerm}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                      className=" rounded-xl border-black/50 border-2  "
                                    />
                                    <Button type="button" className="rounded-xl" onClick={handleSearchRate}>
                                      <SearchIcon className="w-4 h-4" />
                                    </Button>
                                 </div>
                                 
                                 <div className="mb-2 flex justify-end">
                                   <label className="flex items-center gap-2">      
                                     <Switch checked={showUserRates} onCheckedChange={(value)=>{
                                      setShowUserRates(value)
                                      clearexpanded();
                                      setSearchResults([])
                                      setSearchTerm("")
                                    
                                     }} />
                                   < span className="text-sm">Mostrar rates personalizados</span>
                                 </label>
                                 </div>

                                <div className="space-y-3">
                                 {searchResults.length>0?(
                                  <div className="grid grid-cols-2 gap-2">
                                      {searchResults.map(r => (
                                        <div key={r.id} className={`
                                           space-y-2 p-2 bg-muted/50 rounded-md
                                            ${isRateSelected(r.id) ? "bg-primary/10 border border-primary" : "hover:bg-muted"}
                                          `}>
                                                <Checkbox
                                                        checked={isRateSelected(r.id)}
                                                        onCheckedChange={() => handleRateToggle(r.id)}
                                                        className="border-muted-foreground"
                                                      />
                                              <p className="text-sm">{r.frecuencia}</p>
                                              <p className="text-sm">{r.nombre}</p>
                                              <div className="w-full border-2 mb-1.5"/>
                                              <p className="text-xs text-muted-foreground mb-2"><span className="font-bold mr-0.5">Categoria:</span>{r.categoria}</p>
                                              <p className="text-xs text-muted-foreground"><span className="font-bold mr-0.5">Subcategoria:</span>{r.subcategoria}</p>
                                        </div>
                                      ))}
                                  </div>                                   
                                 ):(
                                  <>
                                     {categories.map((cat) => (
                                    <div key={cat.id} className="border rounded-lg overflow-hidden">
                                      <button
                                        type="button"
                                        onClick={()=>toggleCategory(cat.id)} 
                                        className="cursor-pointer w-full p-3 bg-muted/50 hover:bg-muted flex items-center justify-between text-left"
                                      >
                                        <span className="font-medium text-sm">{cat.nombre}</span>
                                        {expandedCategories.has(cat.id) ? (
                                          <ChevronDownIcon className="w-4 h-4" />
                                        ) : (
                                          <ChevronRightIcon className="w-4 h-4" />
                                        )}
                                      </button>
                                      {expandedCategories.has(cat.id) && (
                                        <div className="p-2 space-y-2">
                                          {cat.subcategories?.map((subcategory)=>(
                                            <div key={subcategory.id} className="border rounded overflow-hidden">
                                              <button
                                                type="button"
                                                onClick={() => toggleSubcategory(subcategory.id)}
                                                className="w-full p-2 bg-muted/30 hover:bg-muted flex items-center justify-between text-left"
                                              >
                                                <span className="text-sm">{subcategory.nombre}</span>
                                                {expandedSubcategories.has(subcategory.id) ? (
                                                  <ChevronDownIcon className="w-3 h-3" />
                                                ) : (
                                                  <ChevronRightIcon className="w-3 h-3" />
                                                )}
                                              </button>
                                              {expandedSubcategories.has(subcategory.id) && (
                                                <div className="p-2 space-y-1">
                                                  {subcategory.rates?.map((rate) => (
                                                    <label
                                                      key={rate.id}
                                                      className={`
                                                        flex items-center gap-2 p-2 rounded cursor-pointer transition-colors
                                                        ${isRateSelected(rate.id) ? "bg-primary/10 border border-primary" : "hover:bg-muted"}
                                                      `}
                                                    >
                                                      <Checkbox
                                                        checked={isRateSelected(rate.id)}
                                                        onCheckedChange={() => handleRateToggle(rate.id)}
                                                        className="border-muted-foreground"
                                                      />
                                                      <div className="flex-1">
                                                        <span className="text-sm">{rate.nombre}</span>
                                                        <span className="text-xs text-muted-foreground ml-2">{rate.frecuencia}</span>
                                                      </div>
                                                    </label>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  </>
                                 )}
                                </div>
                              </TabsContent>
                            </div>
                          </Tabs>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground">
                        Selecciona un paciente para ver el contenido
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="programar" className="mt-0 p-4">
                    <Tabs value={treatmenttype} onValueChange={(value)=>setTreatmentType(value as "simple" | "periodic")} className="flex flex-col">
                      <TabsList variant="line" className="w-full justify-start">
                        <TabsTrigger value="simple">Tratamiento Simple</TabsTrigger>
                        <TabsTrigger value="periodic">Tratamiento Periódico</TabsTrigger>
                      </TabsList>

                      <div className="mt-4">
                        <TabsContent value="simple" className="mt-0">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="startTime">Fecha de Inicio</Label>
                              <DatePicker 
                                value={formData.fecha_inicio}
                                onChangeDate={(date:Date)=>setFormData({ ...formData, fecha_inicio: date })}  
                                formatValue="MM/dd/yyyy:p" 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="endTime">Fecha de Cierre</Label>
                              <DatePicker 
                                value={formData.fecha_cierre}
                                onChangeDate={(date:Date)=>setFormData({ ...formData, fecha_cierre: date })} 
                                formatValue="MM/dd/yyyy:p"   
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="periodic" className="mt-0">
                          <div className="space-y-4">
                            <div className="border-2 p-4 rounded-md border-muted-foreground">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="periodicStart">Fecha de Inicio</Label>
                                  <DatePicker 
                                    value={formData.fecha_inicio}
                                    onChangeDate={(date:Date)=>setFormData({ ...formData, fecha_inicio: date })}  
                                    formatValue="MM/dd/yyyy:p" 
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Duración por ciclo</Label>
                                  <div className="grid grid-cols-3 gap-2">
                                    <Field>
                                      <FieldLabel>Horas</FieldLabel>
                                      <Input
                                        type="number"
                                        min={0}
                                        value={durationPerCycle.hours}
                                        className="h-9 border border-muted-foreground rounded-md"
                                        onChange={(e)=>setDurationPerCycle({...durationPerCycle,hours:Number(e.target.value.toString())})}
                                      />
                                    </Field>
                                    <Field>
                                      <FieldLabel>Minutos</FieldLabel>
                                      <Input
                                        type="number"
                                        min={0}
                                        value={durationPerCycle.minutes}
                                        className="h-9 border border-muted-foreground rounded-md"
                                        onChange={(e)=>setDurationPerCycle({...durationPerCycle,minutes:Number(e.target.value.toString())})}
                                      />
                                    </Field>
                                    <Field>
                                      <FieldLabel>Segundos</FieldLabel>
                                      <Input
                                        type="number"
                                        min={0}
                                        value={durationPerCycle.seconds}
                                        className="h-9 border border-muted-foreground rounded-md"
                                        onChange={(e)=>setDurationPerCycle({...durationPerCycle,seconds:Number(e.target.value.toString())})}
                                      />
                                    </Field>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="border-2 p-4 rounded-md border-muted-foreground">
                              <Label className="mb-2 block">Programación</Label>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold">Cada</p>
                                  <Input 
                                    name="every"
                                    type="number" 
                                    value={everyValue}
                                    min={0}
                                    onChange={(e)=>{setEveryValue(Number(e.target.value.toString() != ""?e.target.value.toString():undefined))}}
                                    className="w-20 border border-muted-foreground rounded-md"
                                  />
                                  <select
                                    className="bg-muted border rounded-md p-2"
                                    value={selectEvery}
                                    onChange={(e)=>setSelectEvery(e.target.value.toString() as DurationTime)}
                                  >
                                    <option value="minute">Minuto(s)</option>
                                    <option value="hour">Hora(s)</option>
                                    <option value="day">Dia(s)</option>
                                  </select>
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold">Duración</p>
                                  <Input 
                                    name="duration"
                                    type="number" 
                                    min={0}
                                    value={durationValue}
                                    onChange={(e)=>setDurationValue(Number(e.target.value.toString() != ""?e.target.value.toString():undefined))}
                                    className="w-20 border border-muted-foreground rounded-md"
                                  />
                                  <select
                                    className="bg-muted border rounded-md p-2"
                                    value={selectDuration}
                                    onChange={(e)=>setSelectDuration(e.target.value.toString() as DurationTime)}
                                  >
                                    <option value="minute">Minuto(s)</option>
                                    <option value="hour">Hora(s)</option>
                                    <option value="day">Dia(s)</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </TabsContent>
              </Tabs>
           </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit">
                Crear Tratamiento
              </Button>
            </div>
          </form>
      </div>
    </div>
  )
}

/**
 * Vista principal de Broadcasting.
 * Muestra dos tablas: tratamientos activos y tratamientos pendientes.
 * Permite crear nuevos tratamientos y eliminarlos.
 */
export function BroadcastingView() {
  const { t } = useTranslation()
  const [patients,setPatients]=useState<Patient[]>([])
  const [activeTreatments, setActiveTreatments] = useState<Broadcasting[]>([])
  const [pendingTreatments, setPendingTreatments] = useState<Broadcasting[]>([])
  const [selectedIdsPending, setSelectedIdsPending] = useState<string[]>([])
  const [selectedIdsActive, setSelectedIdsActive] = useState<string[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [selectedTreatment, setSelectedTreatment] = useState<Broadcasting | null>(null)


  const handleSelect = (id: string, selected: boolean, action: 'active' | 'pending') => {
    if (action === 'active') {
      setSelectedIdsActive((prev) =>
        selected ? [...prev, id] : prev.filter((sid) => sid !== id)
      )
    } else {
      setSelectedIdsPending((prev) =>
        selected ? [...prev, id] : prev.filter((sid) => sid !== id)
      )
    }
  }

  const handleSelectAll = (selected: boolean, treatments: Broadcasting[], action: 'active' | 'pending') => {
    if (selected) {
      if (action === 'active') {
        setSelectedIdsActive(treatments.map((t) => t.id))
      } else {
        setSelectedIdsPending(treatments.map((t) => t.id))
      }
    } else {
      if (action === 'active') {
        setSelectedIdsActive([])
      } else {
        setSelectedIdsPending([])
      }
    }
  }

  
  const handleDelete = () => {

    setActiveTreatments((prev) => prev.filter((t) => {
      if(!selectedIdsActive.includes(t.id)){
         return t
      }
      removebroadcasting(t.id)
      
    }))
    setPendingTreatments((prev) => prev.filter((t) => {
      if(!selectedIdsPending.includes(t.id)){
         return t
      }
       removebroadcasting(t.id)
    }))
    setSelectedIdsActive([])
    setSelectedIdsPending([])
    toast.success(t('broadcasting.treatmentDeleted'), { position: "top-center" })
  }

  const handleViewDetail = (treatment: Broadcasting) => {
    setSelectedTreatment(treatment)
    setDetailDrawerOpen(true)
  }

  const handleSaveTreatment = async (formData: BroadcastingForm[]) => {
    if (formData.length<=0) return
    const response=await addBroadcasting(formData)

    if("code" in response){
      toast.error(response.messsage, { position: "top-center" })
      return
    }

    response.forEach(item=>{
       if (item.estado === "active") {
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         setActiveTreatments((prev) => [...prev, {...item,pacientenombre:formData[0].pacientenombre}])
       } else {
         setPendingTreatments((prev) => [...prev, {...item,pacientenombre:formData[0].pacientenombre}])
       }
    })

    toast.success(t('broadcasting.treatmentCreated'), { position: "top-center" })
  }

  const updateContentTreatmentTabe=(treatment: Broadcasting,action:'RMPT'|"RMAT")=>{
     if(action=="RMPT"){

        updatestatusbroadcasting(treatment.id,"active")
        setActiveTreatments([...activeTreatments,{
          ...treatment,
         estado:"active"
        }])

       setPendingTreatments((prev) => prev.filter((t) => t.id!=treatment.id))

     }else if(action=="RMAT"){
       setActiveTreatments((prev) => prev.filter((t) => t.id!=treatment.id))
       removebroadcasting(treatment.id)
     }
  }


  const fetchData=async()=>{
    const [patient,activebroadcasting,pedingbroadcasting]=await Promise.all([
      await getPatient(),
      await getBroadcasting("active"),
      await getBroadcasting("pending"),
    ])
    
    console.log(!("code" in pedingbroadcasting))
    setPatients(patient)
    if(! ("code" in activebroadcasting)) setActiveTreatments(activebroadcasting)
    if(! ("code" in pedingbroadcasting)) setPendingTreatments(pedingbroadcasting)
    
  }

  useEffect(()=>{
    fetchData()
  },[])

  return (
    <div className="space-y-4 h-full">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold">{t('broadcasting.title')}</h1>
        <div className="flex items-center gap-4">
          <img src={Radio} alt="Animación de broadcasting" width={200} height={200} />
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            {t('broadcasting.createTreatment')}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(89vh-250px)]">
        <TreatmentTable
          title={t('broadcasting.activeTreatments')}
          treatments={activeTreatments}
          selectedIds={selectedIdsActive}
          onSelect={handleSelect}
          onSelectAll={(selected) => handleSelectAll(selected, activeTreatments, "active")}
          onDelete={handleDelete}
          onViewDetail={handleViewDetail}
          type="active"
          updateContentTreatmentTabe={updateContentTreatmentTabe}
        />
        <TreatmentTable
          title={t('broadcasting.pendingTreatments')}
          treatments={pendingTreatments}
          selectedIds={selectedIdsPending}
          onSelect={handleSelect}
          onSelectAll={(selected) => handleSelectAll(selected, pendingTreatments, "pending")}
          onDelete={handleDelete}
          type="pending"
          updateContentTreatmentTabe={updateContentTreatmentTabe}
        />
      </div>

      <CreateTreatmentModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveTreatment}
        patients={patients}
      />

      <Drawer direction="right" open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen}>
        <DrawerContent className="max-w-md w-full">
          <DrawerHeader>
            <DrawerTitle>{t('broadcasting.treatmentDetail')}</DrawerTitle>
            <DrawerDescription>
              {t('broadcasting.treatmentInfo')}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 space-y-6 overflow-y-auto max-h-[90vh]">
            {selectedTreatment && (
              <TreatmentDetailContent treatment={selectedTreatment} patients={patients} />
            )}
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button >{t('common.close')}</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default BroadcastingView