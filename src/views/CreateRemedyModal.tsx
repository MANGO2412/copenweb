import { useTranslation } from "react-i18next"
import { Spinner } from "@/components/ui/spinner"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  SearchIcon, 
  Trash2Icon, 
  SaveIcon, 
  XIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Edit2Icon
} from "lucide-react"

import useGetCategories from "@/hooks/useGetCategory"
import {
  getSubcategoriesByCategoryId,
  getRatesBySubcategoryId,
  getCategory,
  searchRatesByName
} from "@/lib/supabase"

import type {Rate} from "@/interface/rates"

interface SelectedRateItemProps {
  rate: Rate
  onUpdate: (updatedRate: Rate) => void
  onRemove: () => void
}

interface RatesSelectorProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedRates: Rate[]
  onToggleRate: (rate: Rate) => void

}

interface CreateRemedyModalProps {
  open: boolean
  editRemedy?:{
    idRemedy:string;
    nameRemedy:string;
    selectedRate:Rate[]
  }
  cleanEditForm:(
    value:{
    idRemedy:string;
    nameRemedy:string;
    selectedRate:Rate[]
  }| undefined    
  )=> void
  onOpenChange: (open: boolean) => void
  onSave: (idRemedy:string|undefined,nameRemedy:string,newRate:Rate[],removeRate:Rate[],clearForm:(error:boolean)=>void) => void
}


function SelectedRateItem({ rate, onUpdate, onRemove }: SelectedRateItemProps) {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [editRate, setEditRate] = useState(rate)

  const handleSave = () => {
    onUpdate(editRate)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditRate(rate)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="p-3 border rounded-lg bg-muted/50 space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">{rate.nombre}</span>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-xs">{t("remedies.labelPotency")}</Label>
            <Input 
              value={editRate.potencia || ""} 
              onChange={(e) => setEditRate({ ...editRate, potencia: e.target.value })}
              placeholder="potencia"
              className="h-8"
              type="number"
            />
          </div>
          <div>
            <Label className="text-xs">{t("remedies.labelMethod")}</Label>
            <Select value={editRate.metodo} onValueChange={(v) => setEditRate({ ...editRate, metodo: v })}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="R">R</SelectItem>
                <SelectItem value="X">X</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="LM">LM</SelectItem>
                <SelectItem value="MM">MM</SelectItem>
                <SelectItem value="k">k</SelectItem>
                <SelectItem value="BLL 10*12">BLL 10*12</SelectItem>
                <SelectItem value="TLL 10*18">TLL 10*18</SelectItem>
                <SelectItem value="QDL 10*24">QDL 10*24</SelectItem>
                <SelectItem value="QTL 10*30">QTL 10*30</SelectItem>
                <SelectItem value="SXL 10*36">QTL 10*36</SelectItem> 
                <SelectItem value="SPL 10*42">SPL 10*42</SelectItem>
                <SelectItem value="OCL 10*48">OCL 10*48</SelectItem>
                <SelectItem value="NOL 10*54">NOL 10*54</SelectItem>
                <SelectItem value="DCL 10*60">DCL 10*60</SelectItem>
                <SelectItem value="UDCL 10*66">UDCL 10*66</SelectItem>
                <SelectItem value="DDCL 10*72">DDCL 10*72</SelectItem>
                <SelectItem value="TDCL 10*78">TDCL 10*78</SelectItem>
                <SelectItem value="QDCL 10*84">QDCL 10*84</SelectItem>
                <SelectItem value="QTDCL 10*90">QTDCL 10*90</SelectItem>              
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{t("remedies.labelNivel")}</Label>
            <Select value={editRate.nivel} onValueChange={(v) => setEditRate({ ...editRate, nivel: v })}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 - PHYSICAL">1 - PHYSICAL</SelectItem>
                <SelectItem value="2 - EMOTIONAL">2 - EMOTIONAL</SelectItem>
                <SelectItem value="3 - MENTAL">3 - MENTAL</SelectItem>
                <SelectItem value="4 - SPIRITUAL 1">4 - SPIRITUAL 1</SelectItem>
                <SelectItem value="5 - SPIRITUAL 2">5 - SPIRITUAL 2</SelectItem>
                <SelectItem value="6 - SPIRITUAL 3">6 - SPIRITUAL 3</SelectItem>
                <SelectItem value="7 - SPIRITUAL 4">7 - SPIRITUAL 4</SelectItem>
                <SelectItem value="8 - SPIRITUAL 5">8 - SPIRITUAL 5</SelectItem>
                <SelectItem value="9 - SPIRITUAL 6">9 - SPIRITUAL 6</SelectItem>
                <SelectItem value="10 - SPIRITUAL 7">10 - SPIRITUAL 7</SelectItem>
                <SelectItem value="11 - SPIRITUAL 8">11 - SPIRITUAL 8</SelectItem>
                <SelectItem value="12 - SPIRITUAL 9">12 - SPIRITUAL 9</SelectItem>
                <SelectItem value="13 - AUTOMATIC">13 - AUTOMATIC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSave} size="sm" className="w-full">{t("remedies.save")}</Button>
      </div>
    )
  }

  return (
    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <span className="font-medium">{rate.nombre}</span>
          <p className="text-xs text-muted-foreground">{rate.frecuencia}</p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2Icon className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <Trash2Icon className="w-3 h-3 text-red-500" />
          </Button>
        </div>
      </div>
      <div className="flex gap-2 mt-2 flex-wrap">
        {(rate.metodo && rate.potencia) && (<Badge variant="outline">{rate.potencia} - {rate.metodo}</Badge>)} 
        {rate.nivel && <Badge variant="secondary">{rate.nivel}</Badge>}
      </div>
    </div>
  )
}

function RatesSelector({ searchTerm, onSearchChange, selectedRates, onToggleRate }: RatesSelectorProps) {
  const { t } = useTranslation()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set())
  const { categories ,setCategories,isLoading} = useGetCategories({getCustom:false})


  const toggleCategory = async (id: string) => {
    const newSet = new Set(expandedCategories)
    const category=categories.find(c=>c.id==id)
    
    if(!category?.subcategories && category){
      category.subcategories=await getSubcategoriesByCategoryId(id) || []
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
      subcategory.rates=await getRatesBySubcategoryId(subcategory.subcategoriaid) || []
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
    if(searchTerm.trim() === ""){
        clearexpanded()
        const data= await getCategory()
        setCategories(data)
    }else{
      const data= await searchRatesByName(searchTerm)
      if(data) setCategories(data)
    }
  }

   const clearexpanded = () => {
    setExpandedCategories(new Set())
    setExpandedSubcategories(new Set())
  }

  const isRateSelected = (rateId: string) => selectedRates.some(r => r.id === rateId)

  return (
    <div className="space-y-3">
      <div className="relative flex space-x-1">
        <Input
          placeholder={t("remedies.placeHolderInputSearch")}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="mt-2 text-lg h-10 max-w-md rounded-none border-black/50 border-2 shadow-md/20"
        />

        <Button 
            size="lg"
            className="rounded-none shadow-md/20 border-none h-10 mt-2  ml-1"
            onClick={onSearch}
          >
            <SearchIcon className=" text-white" />
          </Button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto space-y-2">
         {isLoading?(
          <div className="h-64 flex justify-center items-center">
             <Spinner className="size-7"/>
          </div>
         ):(
          <>
          {categories.length === 0 ? (
             <p className="text-center text-muted-foreground py-4">{t("remedies.NotFoundRate")}</p>
            ) : (
            categories.map((category) => (
            <div key={category.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-3 bg-muted/50 hover:bg-muted flex items-center justify-between text-left"
              >
                <span className="font-medium text-sm">{category.nombre}</span>
                {expandedCategories.has(category.id) ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>
              {expandedCategories.has(category.id) && (
                          <div className="p-2 space-y-2">
                            {category.subcategories?.map((subcategory) => (
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
                                
                                {expandedSubcategories.has(subcategory.id) && (
                                  <div className="p-2 space-y-1">
                                    {subcategory.rates.map((rate) => (
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

export function CreateRemedyModal({ open, onOpenChange, onSave ,editRemedy,cleanEditForm}: CreateRemedyModalProps) {
  const { t } = useTranslation()
  const [remedyName, setRemedyName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRates, setSelectedRates] = useState<Rate[]>([])
  const [removeSelectedRates,setRemoveSelectedRates]=useState<Rate[]>([])
  const [isLoading,setIsLoading]=useState<boolean>(false)

  useEffect(()=>{
    if(editRemedy){
      setRemedyName(editRemedy.nameRemedy)
      setSelectedRates(editRemedy.selectedRate)
    }
  },[editRemedy])

  const handleToggleRate = (rate: Rate) => {
    console.log(rate)
    const exists = selectedRates.find(r => r.id === rate.id)
    if (exists) {
      setSelectedRates(selectedRates.filter(r => r.id !== rate.id))
    } else {
      setSelectedRates([...selectedRates, { ...rate }])
    }
  }

  const handleUpdateRate = (updatedRate: Rate) => {
    setSelectedRates(selectedRates.map(r => r.id === updatedRate.id ? updatedRate : r))
  }

  const handleRemoveRate =(rate: Rate) => {
    if(rate.codigoremedioid){
      setRemoveSelectedRates([...removeSelectedRates,rate])
    }
    setSelectedRates(selectedRates.filter(r => r.id !== rate.id))
  }

  const handleSave = () => {
    if (!remedyName.trim() || selectedRates.length === 0) return
    setIsLoading(true)
    
    onSave(
    editRemedy?.idRemedy,
    remedyName,
    selectedRates,
    removeSelectedRates,
    (error:boolean)=>{
      if(error){
        setIsLoading(false)
      }else{
        resetForm();
        setIsLoading(false)
      }
      
    }
   )
    
  }

  const resetForm = () => {
    setRemedyName("")
    setSelectedRates([])
    setSearchTerm("")
    onOpenChange(false)
    cleanEditForm(undefined);
    setRemoveSelectedRates([])
  }

  return (
    <Dialog open={open} onOpenChange={resetForm}>
      <DialogContent className="max-w-full! h-full! rounded-none overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{editRemedy?t("remedies.editRemedy"):t("remedies.createRemedy")}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="remedyName" className="text-base font-semibold">{t("remedies.remedyName")}</Label>
            <Input
              id="remedyName"
              value={remedyName}
              onChange={(e) => setRemedyName(e.target.value)}
              placeholder={t("remedies.placeHolderInputName")}
              className="text-lg border-black/50 border-2"
            />
          </div>

          <Separator />

          <div className="flex-1 overflow-hidden flex gap-4 min-h-0">
            <div className="flex-1 overflow-hidden ">
              <h4 className="font-semibold mb-2">{t("remedies.selectRates")}</h4>
              <div className="h-full overflow-hidden">
                <RatesSelector
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedRates={selectedRates}
                  onToggleRate={handleToggleRate}
                />
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              <h4 className="font-semibold mb-2">
                {t("remedies.ratesSelected")} ({selectedRates.length})
              </h4>
              <div className="flex-1  max-h-120 overflow-y-auto space-y-2">
                {selectedRates.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t("remedies.selectRateList")}
                  </p>
                ) : (
                  selectedRates.map((rate) => (
                    <SelectedRateItem
                      key={rate.id}
                      rate={rate}
                      onUpdate={handleUpdateRate}
                      onRemove={() => handleRemoveRate(rate)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={resetForm} size="lg">
            <XIcon className="w-4 h-4 mr-2" />
            {t("remedies.cancel")}
          </Button>
          <Button 
            onClick={handleSave} 
            size="lg"
            disabled={!remedyName.trim() || selectedRates.length === 0 || isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {
              isLoading?(
                 <Spinner/>
              ):(
                <SaveIcon className="w-4 h-4 mr-2" />
              )
            }
            {t("remedies.save")}  
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
