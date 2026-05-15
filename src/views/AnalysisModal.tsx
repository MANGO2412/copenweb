import { toast } from "sonner"

import {  useEffect, useState,useRef} from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {Checkbox} from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet
} from "@/components/ui/field"

import {Switch} from "@/components/ui/switch"

import { 
  SearchIcon, 
  XIcon,
  PlayIcon, 
  SaveIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from "lucide-react"

import useGetCategories from "@/hooks/useGetCategory"
import {
  getSubcategoriesByCategoryId,
  getRatesBySubcategoryId,
  searchRatesByName,
  updateAnalysisToReanalysis,
  registerAnalysis
} from "@/lib/supabase"

import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue
} from "@/components/ui/select"

import {
 Label
} from "@/components/ui/label"

import type { Rate } from "@/interface/rates"
import {useSerialContext} from "@/context/serial-context"
import{ValorSugerido,NivelSugerido, ValorSugeridoPorcentaje,PotenciaSugerida} from "@/lib/radionica"
import AnalisisHombre from "@/assets/analisis-hombre.gif"

import type { Analysis } from "@/interface/analysis"
import type {Error} from "@/interface/error"

import { formatRate } from "@/lib/utils"

interface AnalysisModalProps {
  open: boolean,
  ratesAnalyzed:Rate[]
  onOpenChange: (open: boolean) => void
  analysisInfo: Analysis | null
  onSave: (rates: Rate[], analysisId: string) => void
}

interface ControlPanelState {
  generateValues: {
    pro: boolean
    percentage: boolean
    scale: boolean
  },
  setGenerateValues: React.Dispatch<React.SetStateAction<{
    pro: boolean
    percentage: boolean
    scale: boolean
  }>>,
  suggestedValues:{
    potency: boolean,
    level: boolean
  },
  setSelectedValue:React.Dispatch<React.SetStateAction<{
    potency:string,
    level:string
  }>>,
  setSuggestedValues: React.Dispatch<React.SetStateAction<{
    potency: boolean
    level: boolean
  }>>,
  
}

function SelectOptions({ options, label, onChange, disabled }: { options: string[], label: string, onChange: (value: string) => void, disabled?: boolean }) {
   return(
     <Select onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full max-w-48  rounded-none border-black/50 border-2 shadow-md/20">
           <SelectValue  placeholder={label} />
        </SelectTrigger>
        <SelectContent className="w-full max-w-48">
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
     </Select>
   )
}

function ControlPanel({generateValues,setGenerateValues,suggestedValues,setSuggestedValues,setSelectedValue}:ControlPanelState){

  const toggleOption = (option: keyof ControlPanelState["generateValues"]) => {
    if(option === "pro"){
      setGenerateValues(prev => ({
        ...prev,
        pro: !prev.pro,
        percentage: prev.pro ? prev.percentage : false,
        scale: prev.pro ? prev.scale : false
      }))
    }else if(option === "percentage"){
      setGenerateValues(prev => ({
        ...prev,
        percentage: !prev.percentage,
        pro: prev.percentage ? prev.pro : false,
        scale: prev.percentage ? prev.scale : false
      }))
    }else if(option === "scale"){
      setGenerateValues(prev => ({
        ...prev,
        scale: !prev.scale,
        pro: prev.scale ? prev.pro : false,
        percentage: prev.scale ? prev.percentage : false
      }))
    }
   
  }

  const toggleSuggested = (option: keyof ControlPanelState["suggestedValues"]) => {
    setSuggestedValues(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
  }

  return(
    <div className="flex flex-col">
      <FieldSet>
         <FieldGroup className="gap-2 flex flex-row" >
            <Field orientation="horizontal">
              <Checkbox
                className="rounded-md border-2 w-4 h-4 border-black/50"
                checked={generateValues.pro}
                onCheckedChange={() => toggleOption("pro")}
              />
              <FieldLabel className="font-normal text-md" >PRO</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Checkbox
                checked={generateValues.percentage}
                onCheckedChange={() => toggleOption("percentage")}
                className="rounded-md border-2 w-4 h-4 border-black/50"
              />
              <FieldLabel className="font-normal text-md">Porcentage</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Checkbox
                checked={generateValues.scale}
                onCheckedChange={() => toggleOption("scale")}
                className="rounded-md border-2 w-4 h-4 border-black/50"
              />
              <FieldLabel className="font-normal text-md">-100/100</FieldLabel>
            </Field>
         </FieldGroup>
      </FieldSet>
      <FieldSet className="mt-4">
          <FieldGroup className="gap-2 flex flex-row justify-center" >
             <Field orientation="horizontal" className="w-40">
                <Checkbox
                  className="border-2 w-4 h-4 border-black/50"
                  checked={suggestedValues.level}
                  onCheckedChange={() => toggleSuggested("level")}
                
                />
                <FieldLabel className="font-normal text-md">Suggest Level</FieldLabel>
             </Field>
             <Field orientation="horizontal" className="w-40">
                <Checkbox
                  className="border-2 w-4 h-4 border-black/50"
                  checked={suggestedValues.potency}
                  onCheckedChange={() => toggleSuggested("potency")}
                />
                <FieldLabel className="font-normal text-md">Suggest Potency</FieldLabel>
             </Field>
          </FieldGroup>
      </FieldSet>
      <div className="relative flex justify-center space-x-1 mt-4 mb-4">
          <div className="flex flex-row">
          <Label className="text-md font-normal me-2" >Level:</Label>
          <SelectOptions disabled={suggestedValues.level} label="level" options={["1 - PHYSICAL","2 - EMOTIONAL","3 - MENTAL",'4 - SPIRITUAL 1','5 - SPIRITUAL 2','6 - SPIRITUAL 3','7 - SPIRITUAL 4','8 - SPIRITUAL 5','9 - SPIRITUAL 6','10 - SPIRITUAL 7','11 - SPIRITUAL 8','12 - SPIRITUAL 9','13 - AUTOMATIC']} onChange={(value) => setSelectedValue(prev => ({ ...prev, level: value })) } />
         </div>
         <div className="flex flex-row">
          <Label className="text-md font-normal me-2">Potency:</Label>
          <SelectOptions disabled={suggestedValues.potency} label="potency" options={["1X","3X","6X","10X","2X","12X","8X","24X","30X","50X","100X","200X","20C","40C",'50C','200C','1CM','1LM','2LM','3LM','6LM','10LM','16LM','20LM','30LM','1M','2M','5M','10M','50M','500M','1MM','2MM','5MM','10MM']} onChange={(value) => setSelectedValue(prev => ({ ...prev, potency: value })) } />
         </div>
      </div>
    </div>
  )

}

function RatesSection({ 
  searchTerm, 
  onSearchChange, 
  selectedRates, 
  onToggleRate
}: { 
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedRates: Rate[]
  onToggleRate: (rate: Rate) => void
}) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set())
  const [showUserRates,setShowUserRates]=useState(false)
  const { categories ,setCategories} = useGetCategories({getCustom:showUserRates})
  const [searchResults,setSearchResults]=useState<Rate[]>([])

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

  const onSearch = async () => {
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

  const clearexpanded = () => {
    setExpandedCategories(new Set())
    setExpandedSubcategories(new Set())
  }

  const isRateSelected = (rateId: string) => selectedRates.some(r => r.id === rateId)


  return (
    <div className="flex flex-col h-full ">
      <div className="relative flex space-x-1 mb-4 ">
        <Input
          placeholder="Buscar rate por nombre o código..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className=" mt-2 text-lg max-w-md rounded-none border-black/50 border-2"
        />
      
          <Button 
            size="icon"
            className="rounded-none shadow-md/20 border-none   mt-2  ml-1"
            onClick={onSearch}
          >
            <SearchIcon className=" text-white" />
          </Button>
         <div className="ml-7 flex justify-end">
          <label className="flex items-center gap-2">      
               <Switch checked={showUserRates} onCheckedChange={(value)=>{
                setShowUserRates(value)
                clearexpanded();
                setSearchResults([])
                onSearchChange("")                                  
               }} />
             < span className="text-sm">Mostrar rates personalizados</span>
           </label>
      </div>
      </div>
      <div className="max-h-full overflow-y-auto space-y-2">
       {searchResults.length>0?(
           <div className="grid grid-cols-2 gap-2">
             {searchResults.map(r => (
               <div key={r.id} className={`
                  space-y-2 p-2 bg-muted/50 rounded-md
                   ${isRateSelected(r.id) ? "bg-primary/10 border border-primary" : "hover:bg-muted"}
                `}>
                      <Checkbox
                        checked={isRateSelected(r.id)}
                        onCheckedChange={() =>onToggleRate(r)}
                        className="border-muted-foreground"
                      />
                     <p className="text-sm">{r.frecuencia}</p>
                     <p className="text-sm">{r.nombre}</p>
                     <div className="w-full border-2 mb-1.5"/>
                     <p className="text-xs text-muted-foreground mb-2"><span className="font-bold mr-0.5">Categoria:</span>{r.categoria}</p>
                     <p className="text-xs text-muted-foreground"><span className="font-bold mr-0.5">Subcategoria:</span>{r.subcategoria}</p>
               </div>
                ))
             }
          </div> 
        ):(
         <>
           {categories.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Seleccione rates de la lista</p>
             ):(
              categories.map((category)=>(
                  <div key={category.id} className="border rounded-lg overflow-hidden">
                     <button
                       onClick={()=>toggleCategory(category.id)} 
                       className="w-full p-3 bg-muted/50 hover:bg-muted flex items-center justify-between text-left"
                     >
                       <span className="font-medium text-sm">{category.nombre}</span>
                       {expandedCategories.has(category.id) ? (
                          <ChevronDownIcon className="w-4 h-4" />
                       ) : (
                         <ChevronRightIcon className="w-4 h-4" />
                       )}
                     </button>
                     {/* category content */}
                     {expandedCategories.has(category.id) && (
                       <div className="p-2 space-y-2">
                         {category.subcategories?.map((subcategory)=>(
                                   <div key={subcategory.id} className="border rounded overflow-hidden">
                                      <button
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
                                     {/* subcategory content  */}
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
                                               onCheckedChange={() => onToggleRate(rate)}
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
              ))
            )}
         </>
        )}
      </div>
    </div>
  )
}

function SelectedRatesTable({ 
  rates, 
  onRemove, 
  onClear,
  onStartAnalysis,
  isAnalyzed,
  isReanalisis
}: { 
  rates: Rate[]
  onRemove: (id: string) => void
  onClear: () => void
  onStartAnalysis: () => void
  isAnalyzed: boolean
  isReanalisis?:boolean
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button onClick={onStartAnalysis} size="lg" className="text-lg px-6" disabled={rates.length === 0 || isAnalyzed}>
            <PlayIcon className="w-5 h-5 mr-2" />
            Iniciar Análisis
          </Button>
          <Button onClick={onClear}  variant="outline" size="lg" className="text-lg px-6" disabled={rates.length === 0 || isAnalyzed || isReanalisis}>
            <XIcon className="w-5 h-5 mr-2" />
            Limpiar
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-base font-semibold">Código</th>
              <th className="px-4 py-3 text-left text-base font-semibold">Nombre</th>
              <th className="px-4 py-3 text-left text-base font-semibold">Valor</th>
              <th className="px-4 py-3 text-left text-base font-semibold">Niveles</th>
              <th className="px-4 py-3 text-left text-base font-semibold">Niv.s.</th>
              <th className="px-4 py-3 text-left text-base font-semibold">Potencia</th>
              <th className="px-4 py-3 text-left text-base font-semibold">P.s.</th>
              <th className="px-4 py-3 text-center text-base font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody>
            {rates.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-lg">
                  Seleccione rates de la lista izquierda
                </td>
              </tr>
            ) : (
              rates.map((rate, index) => (
                <tr key={`${rate.id}-${index}`} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3 text-base">{rate.frecuencia}</td>
                  <td className="px-4 py-3 text-base font-medium">{rate.nombre}</td>
                  <td className="px-4 py-3 text-base">{rate.valor || "0"}</td>
                  <td className="px-4 py-3 text-base">{rate.nivel || "-"}</td>
                  <td className="px-4 py-3 text-base">{rate.nivelsugerido || "-"}</td>
                  <td className="px-4 py-3 text-base">{rate.potencia  || "-"}</td>
                  <td className="px-4 py-3 text-base">{rate.potenciasugerido || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    {((!isAnalyzed && !isReanalisis) || !rate.valor ) && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onRemove(rate.id)}
                        className="hover:bg-red-100 hover:text-red-600"
                      >
                        <XIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ShowModelProccessAnalysis({open}:{open?:boolean}){
  return(
    <Dialog open={open} onOpenChange={()=>{}} >
       <DialogContent className=" p-6 flex flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-semibold">Processing analysis...</h2>
          <p className="text-muted-foreground">This may take a moment, please wait.</p>
          <img src={AnalisisHombre} alt="Processing analysis" className="w-70" />
       </DialogContent>
    </Dialog>
  )
}

export function AnalysisModal({ open, onOpenChange, analysisInfo, onSave,ratesAnalyzed }: AnalysisModalProps) {
  const timeoutID=useRef<number|undefined>(undefined)
  const {send,outputText,resetDataReceived,isConnected,serialport}=useSerialContext()
  const [isAnalyzed,setIsAnalyzed]=useState(false)
  const [showModelProcess,setShowModelProcess]=useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRates, setSelectedRates] = useState<Rate[]>([])
  
  const [suggestedValues, setSuggestedValues] = useState({
    potency: false,
    level: false
  })
  
  const [generateValues, setGenerateValues] = useState({
    pro: false,
    percentage: false,
    scale: false
  })

  const [selectedValue,setSelectedValue]=useState({
     potency:"-",
     level:"-"
  })

  useEffect(()=>{
    setSelectedRates(ratesAnalyzed)
  },[ratesAnalyzed])

  useEffect(() => {
    console.log("Output text changed in view Analysis:", outputText)
    if(!isConnected && serialport.current && open){
      setShowModelProcess(false)
      clearInterval(timeoutID.current);
      toast.error("Your machine was disconnected", { position: "top-center" })
    }

    if(outputText.includes("603")){
      setShowModelProcess(false)
      setIsAnalyzed(true);
      resetDataReceived();
    }
  }, [outputText,isConnected])

  const resetState = () => {
    onOpenChange(false)
    setSearchTerm("")
    setSelectedRates([])
    setSuggestedValues({
      potency: false,
      level: false
    })
    setGenerateValues({
      pro: false,
      percentage: false,
      scale: false
    })
    setSelectedValue({
      potency: "-",
      level: "-"
    })
    setIsAnalyzed(false)
  }

  const handleRemoveRate = (id: string) => {
    setSelectedRates(selectedRates.filter(r => r.id !== id))
  }

  const handleToggleRate = (rate: Rate) => {
      const exists = selectedRates.find(r => r.id === rate.id)
      if (exists) {
        setSelectedRates(selectedRates.filter(r => r.id !== rate.id))
      } else {
        setSelectedRates([...selectedRates, { ...rate }])
      }
  }

  const handleClear = () => {
    setSelectedRates([])
  }

  const handleStartAnalysis = () => {
    if(!generateValues.pro &&!generateValues.percentage && !generateValues.scale){
      toast.error("You don't select some options from control panel", { position: "top-center" })
      return;
    }

    if(!suggestedValues.level && !suggestedValues.potency && selectedValue.level == "-" && selectedValue.potency == "-"){
      toast.error("You don't selected some  value or suggest option of the level and potency from control panel", { position: "top-center" })
      return;
    }

    if(!isConnected){
      toast.error("your machine is not connected", { position: "top-center" })
      return;
    }

    setShowModelProcess(true)
    send("A")
    

    timeoutID.current=setTimeout(()=>{
        if(generateValues.pro){
          const updatedRates = selectedRates.map(rate => ({
            ...rate,
            valor: ValorSugerido(),
            nivel: NivelSugerido()
          }))
          
          setSelectedRates(updatedRates)
        }else if(generateValues.percentage){
          const updatedRates = selectedRates.map(rate => ({
            ...rate,
            valor: ValorSugeridoPorcentaje(),
            potencia:suggestedValues.potency ? "-":selectedValue.potency ,
            nivel:suggestedValues.level ? "-":selectedValue.level ,
            nivelsugerido:suggestedValues.level ? NivelSugerido() : "-",
            potenciasugerido:suggestedValues.potency ? PotenciaSugerida() : "-"
          }))
          setSelectedRates(updatedRates)
        }else if(generateValues.scale){
          const updatedRates = selectedRates.map(rate => ({
            ...rate,
            valor: ValorSugerido(),
            potencia:suggestedValues.potency ? "-":selectedValue.potency ,
            nivel:suggestedValues.level ? "-":selectedValue.level ,
            nivelsugerido:suggestedValues.level ? NivelSugerido() : rate.nivelsugerido,
            potenciasugerido:suggestedValues.potency ? PotenciaSugerida() : rate.potenciasugerido
          }))
          setSelectedRates(updatedRates)
        }
    },23000)
  }

  const handleSaveAnalysis = async() => {
    if (analysisInfo) {  
      const analysis:Analysis|Error= analysisInfo.reanalizado? await updateAnalysisToReanalysis(analysisInfo): await registerAnalysis(analysisInfo)

      if('code' in analysis){
       if(analysis.code=="23505") toast.error("This analysis's name is dupliacated, try to create analysis with different name please", { position: "top-center" }) 
       return
      }


      resetState();
      onSave(selectedRates, analysis?.id || "")

    }
  }

  if (!analysisInfo) return null

  return (
    <Dialog open={open} onOpenChange={()=>resetState()}>
      <DialogContent className="w-screen! h-screen! max-w-none! max-h-none! rounded-none m-0!   p-6 flex flex-col">
        <ShowModelProccessAnalysis open={showModelProcess} />
        <div className="shrink-0 p-4 bg-muted/50 rounded-lg mb-2">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Nombre del Análisis</span>
              <p className="text-xl font-medium">{analysisInfo.nombre}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Paciente</span>
              <p className="text-xl font-medium">{analysisInfo.patientName}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Fecha de Creación</span>
              <p className="text-xl font-medium">{new Date(analysisInfo.fecha || "").toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 overflow-hidden">
          <div className="border rounded-lg p-4 flex flex-col overflow-hidden">
            <h3 className="text-xl font-semibold mb-3">Control panel</h3>
            <Separator className="mb-3"/>
            <div >
              <ControlPanel setSuggestedValues={setSuggestedValues} suggestedValues={suggestedValues} generateValues={generateValues} setGenerateValues={setGenerateValues} setSelectedValue={setSelectedValue} />
            </div>
            {!isAnalyzed && (
              <>
                <h3 className="text-xl font-semibold mb-3">Rates Disponibles</h3>
                <Separator className="mb-3"/>
                <div className="flex-1 overflow-hidden">
                  <RatesSection
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedRates={selectedRates}
                    onToggleRate={handleToggleRate}
                  />
                </div>  
              </>
            )}
          </div>

          <div className="border rounded-lg p-4 flex flex-col overflow-hidden">
            <h3 className="text-xl font-semibold mb-3">Rates Seleccionados</h3>
            <Separator className="mb-3" />
            <div className="flex-1 overflow-hidden">
              <SelectedRatesTable
                rates={selectedRates}
                onRemove={handleRemoveRate}
                onClear={handleClear}
                onStartAnalysis={handleStartAnalysis}
                isAnalyzed={isAnalyzed}
                isReanalisis={analysisInfo.reanalizado}

              />
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={()=>{resetState()}} variant="default" size="lg" className="text-lg px-6 bg-red-600 hover:bg-red-700" >
             <XIcon className="w-5 h-5 mr-2" />
             Cerrar
          </Button> 
           <Button onClick={handleSaveAnalysis} variant="default" size="lg" className="text-lg px-6 bg-green-600 hover:bg-green-700"  disabled={!isAnalyzed} >
             <SaveIcon className="w-5 h-5 mr-2" />
             Guardar
          </Button> 
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
