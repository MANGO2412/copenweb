import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  SaveIcon, 
  XIcon,
  Wand2Icon,
  RefreshCwIcon,
  FolderIcon,
} from "lucide-react"
import type { 
  Category,
  Subcategory 
} from "@/interface/rates"

import {
 generarCodigoRate
} from "@/lib/radionica"



interface RateGeneratorProps {
  setGeneratedCode: (code: string) => void,
  isGeneratedCodeActive:boolean
}

interface FormRateGeneratorProps {
  rateCode: string
  setRateCode: (code: string) => void
  autoGenerateId: boolean
  setAutoGenerateId: (auto: boolean) => void
  rateName: string
  setRateName: (name: string) => void
  selectedCategory: Category | null
  selectedSubcategory: Subcategory | null
}

interface CreateRateModalProps {
  createModalOpen: {
    open: boolean
    action: "category" | "subcategory" | "rate" | null
  }
  selectCategory:Category | null
  selectSubcategory:Subcategory | null
  onOpenChange: (createModalOpen: { open: boolean; action: "category" | "subcategory" | "rate" | null }) => void
  onSave: (action: "category" | "subcategory" | "rate"| null, name: string,rateCode?: string) => void
}



function RateGenerator({setGeneratedCode,isGeneratedCodeActive }: RateGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { t } = useTranslation()

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const code = generarCodigoRate()
      setGeneratedCode(code)
      setIsGenerating(false)
    }, 500)
  }
  if(isGeneratedCodeActive){
    return (
    <>
     <Separator/>
      <div className="border-2 border-black/30 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Wand2Icon className="w-5 h-5" />
          <span className="font-medium">{t("categories.FormGenerateCodeLabel")}</span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerate} 
            variant="outline"
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wand2Icon className="w-4 h-4 mr-2" />
            )}
            {t("categories.FormGenerateCodeBtn")}
          </Button>
        </div>
      </div>
    </>
  )
  }

  return null;
  
}

function FormRateGenerator({ rateCode, setRateCode, autoGenerateId, setAutoGenerateId, rateName, setRateName, selectedCategory,selectedSubcategory }: FormRateGeneratorProps) {
  const { t } = useTranslation()

  return(
      <>
          <div className="space-y-3">
            <div className="space-y-2 flex">
               <div className="space-y-2">
                   <Label htmlFor="rateCode">{t("categories.rateCode")} </Label>
                   <Input
                     id="rateCode"
                     value={rateCode}
                     onChange={(e) => setRateCode(e.target.value.toUpperCase())}
                     placeholder={t("categories.placeHolderRateCode")}
                     disabled={autoGenerateId}
                     className=" w-md border-black/50 border-2"
                     maxLength={10}
                   />
               </div>
                <div className=" flex items-center gap-2 p-3">
                    <Checkbox 
                      id="autoGenerate"
                      checked={autoGenerateId}
                      onCheckedChange={(checked) =>{setAutoGenerateId(checked as boolean);setRateCode("")}}
                    />
                    <label 
                      htmlFor="autoGenerate" 
                      className="text-sm font-medium cursor-pointer"
                    >
                     {t("categories.generateAutomaticeID")}
                    </label>
                </div>  
            </div>

            <div className="space-y-2">
              <Label htmlFor="rateName">{t("categories.rateName")}</Label>
              <Input
                id="rateName"
                value={rateName}
                onChange={(e) => setRateName(e.target.value)}
                placeholder={t("categories.placeHolderSubcategory")}
                className="border-black/50 border-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FolderIcon className="w-5 h-5" />
                <span className="font-medium">{t("categories.selectInformation")}</span>
              </div>
              {selectedCategory && (
                <Badge variant="outline" className="text-md p-3">
                  {t("categories.sectionCategory")}: {selectedCategory.nombre}
                </Badge>
              )}
              
              {selectedSubcategory && (
                <Badge variant="outline"  className="text-md p-3">
                  {t("categories.sectionSubcategory")}: {selectedSubcategory.nombre}
                </Badge>
              )}
            </div>
          </div>
  
          <RateGenerator 
           setGeneratedCode={setRateCode}
           isGeneratedCodeActive={autoGenerateId}
         />
      </>
  )
}

export function CreateRateModal({ createModalOpen, onOpenChange, onSave,selectCategory,selectSubcategory }: CreateRateModalProps) {
  const { t } = useTranslation()
  const [autoGenerateId, setAutoGenerateId] = useState(false)
  const [rateCode, setRateCode] = useState("")
  const [generalName, setGeneralName] = useState("")

 
  const handleSave = () => {
    onSave(createModalOpen.action,generalName, rateCode)
    handleReset()
    onOpenChange({ ...createModalOpen, open: false })
  }

  const handleReset = () => {
    setAutoGenerateId(false)
    setRateCode("")
    setGeneralName("")
  }

  const handleCancel = () => {
    handleReset()
    onOpenChange({ ...createModalOpen, open: false })
  }



  return (
    <Dialog open={createModalOpen.open} onOpenChange={(open) => onOpenChange({ ...createModalOpen, open })}>
      <DialogContent className="max-w-2xl! max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {t(`categories.dialogTitle.${createModalOpen.action}`)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {createModalOpen.action === "rate" ? (
            <FormRateGenerator 
              rateCode={rateCode}
              setRateCode={setRateCode}
              autoGenerateId={autoGenerateId}
              setAutoGenerateId={setAutoGenerateId}
              rateName={generalName}
              setRateName={setGeneralName}
              selectedCategory={selectCategory}
              selectedSubcategory={selectSubcategory}
            />
          ):(
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">{t(`${createModalOpen.action === "category" ? "categories.categoryName" : "categories.subcategoryName"}`)}</Label>
                <Input
                  id="name"
                  value={generalName}
                  onChange={(e) => setGeneralName(e.target.value)}
                  placeholder={t(`${createModalOpen.action === "category" ? "categories.placeHolderCategory" : "categories.placeHolderSubcategory"}`)}
                  className="border-black/50 border-2"
                />
              </div>
              {createModalOpen.action === "subcategory" && (
                <div className="space-y-2">
                   <Label>{t("categories.categorySelected")}</Label>
                   <Input
                     value={selectCategory?.nombre || ""}
                     disabled
                     className="border-black/50 border-2"
                   />
              </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleCancel}>
            <XIcon className="w-4 h-4 mr-2" />
            {t("categories.cancel")}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!generalName.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <SaveIcon className="w-4 h-4 mr-2" />
            {t("categories.save")} 
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}