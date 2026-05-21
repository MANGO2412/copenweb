import { useState, useMemo, useEffect, type ReactNode} from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {Switch} from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
   ResizableHandle,
   ResizablePanel,
   ResizablePanelGroup
} from "@/components/ui/resizable"

import { Spinner } from "@/components/ui/spinner"

import { CreateRateModal } from "@/views/CreateRateModal"
import { 
  SearchIcon, 
  PlusIcon, 
  FolderIcon,
  FolderOpenIcon,
  FileTextIcon,
  ChevronRightIcon,
  Trash2Icon,
  XIcon
} from "lucide-react"


import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from "@/components/ui/context-menu"


import {
 HoverCard,
 HoverCardContent,
 HoverCardTrigger
} from "@/components/ui/hover-card"

import {
  getSubcategoriesByCategoryId,
  getRatesBySubcategoryId,
  addCategory,
  addsubcategory,
  addRate,
  removeRate,
  removeSubcategory,
  removeCategory
} from "@/lib/supabase"

import useGetCategories from "@/hooks/useGetCategory"
import type { 
  Rate, 
  Subcategory 
} from "@/interface/rates"
import { toast } from "sonner"
import { searchRatesByName } from "@/lib/supabase"


interface ListBoxProps {
  title: string
  count: number,
  addResource?: () => void
  children: ReactNode
}

function ListBox({ title, count, addResource, children }: ListBoxProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col h-full border-2 border-black/30 rounded-lg overflow-hidden">
      <div className="bg-sidebar px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{title}</span>
          <Badge variant="outline">{count}</Badge>
        </div>
         {addResource && (
          <Button onClick={addResource} className="rounded-none  shadow-md/20 bg-foreground">
            <PlusIcon className="w-4 h-4 mr-2" />
            {t('categories.addCategory')}
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1">
        {children}
      </ScrollArea>
    </div>
  )
}

export function CategoriesView() {
  const { t } = useTranslation()
  type SearchResultItem = {
    id: string
    name: string
    frecuencia?: string
    category: string
    subcategory?: string
  }
  const [showUserRates, setShowUserRates] = useState(false)
  const { categories,setCategories,isLoading} = useGetCategories({getCustom:showUserRates})
  const [isGeneralLoading,setIsGeneralLoading] = useState<{
  subcategories: boolean
  rates: boolean
  }>({
    subcategories: false,
    rates: false
  })

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null)


  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([])
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState<{
    open: boolean
    action: "category" | "subcategory" | "rate" | null
  }>({
    open: false,
    action: null
  })

  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([])
  const [subcategoryRates, setSubcategoryRates] = useState<Rate[]>([])

  const selectedCategory = useMemo(() => {
    return categories.find((cat) => cat.id === selectedCategoryId) || null
  }, [selectedCategoryId, categories])

  const selectedSubcategory = useMemo(() => {
    return filteredSubcategories.find((sub) => sub.id === selectedSubcategoryId) || null
  }, [selectedSubcategoryId, filteredSubcategories])

  useEffect(() => {
    if (!selectedCategory) {
      setFilteredSubcategories([])
      return
    }

    let isMounted = true

    const loadSubcategories = async () => {
      setIsGeneralLoading((prev) => ({ ...prev, subcategories: true }))
      const subcategories = await getSubcategoriesByCategoryId(selectedCategory.id, showUserRates)
      setIsGeneralLoading((prev) => ({ ...prev, subcategories: false }))
      if (!isMounted) return
      setFilteredSubcategories(subcategories ?? [])
    }

    loadSubcategories()

    return () => {
      isMounted = false
    }
  }, [selectedCategory,showUserRates])


  useEffect(() => {
    if (!selectedSubcategory) {
      setSubcategoryRates([])
      return
    }

    let isMounted = true

    const loadRates = async () => {
      setIsGeneralLoading((prev) => ({ ...prev, rates: true }))
      const rates = await getRatesBySubcategoryId(selectedSubcategory.subcategoriaid, showUserRates)
      setIsGeneralLoading((prev) => ({ ...prev, rates: false }))
      if (!isMounted) return
      setSubcategoryRates(
        rates ?? []
      )
    }

    loadRates()

    return () => {
      isMounted = false
    }
  }, [selectedSubcategory, showUserRates])



  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId === selectedCategoryId ? null : categoryId)
    setSelectedSubcategoryId(null)
  }

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId === selectedSubcategoryId ? null : subcategoryId)
  }

  const handleSaveNewRate = async (action: "category" | "subcategory" | "rate"| null, name: string,rateCode?: string) => {
    if (action === "category") {
      
       const newCategory = await addCategory(name);

      if("code" in newCategory){
        toast.error(t("categories.errorCreatingCategory").replace("{error}",newCategory.messsage),{position:"top-center"})
        return
      }

      setCategories((prev) => [...prev, newCategory])
      toast.success(t("categories.categoryCreated"),{position:"top-center"})
    } else if (action === "subcategory") {

      const newSubcategory = await addsubcategory(name,selectedCategory!.id)

      if("code" in newSubcategory){
        toast.error(t("categories.errorCreatingSubcategory").replace("{error}",newSubcategory.messsage),{position:"top-center"})
        return
      }

      setFilteredSubcategories((prev) => [...prev, newSubcategory])
      toast.success(t("categories.subcategoryCreated"),{position:"top-center"})
    } else if (action === "rate") {

      const newRate=await addRate(name,rateCode!,selectedSubcategory!.subcategoriaid)
      
      if("code" in newRate){
        toast.error(t("categories.errorCreatingRate").replace("{error}",newRate.messsage),{position:"top-center"})
        return
      }

      setSubcategoryRates((prev) => [...prev, newRate])
      toast.success(t("categories.rateCreated"),{position:"top-center"})
    }

  }

  const handleDeleteRate = async(rateId:string) => {
   
    if(!showUserRates){
      toast.error(t("categories.cannotDeleteSystemRates"),{position:"top-center"})
      return
    }

    const result=await removeRate(rateId)

    if( typeof result === "object" && "code" in result){
      toast.error(t("categories.errorDeletingRate").replace("{error}", result.messsage),{position:"top-center"})
      return
    }

    setSubcategoryRates((prev) => prev.filter((rate) => rate.id !== rateId))
    toast.success(t("categories.rateDeleted"),{position:"top-center"})
  }

  const handleDeleteSubcategory = async(subcategoryId:string) => {
    if(!showUserRates){
      toast.error(t("categories.cannotDeleteSystemSubcategories"),{position:"top-center"})
      return
    }

    const result=await removeSubcategory(subcategoryId)

    if( typeof result === "object" && "code" in result){
      toast.error(t("categories.errorDeletingSubcategory").replace("{error}", result.messsage),{position:"top-center"})
      return
    }
    
    setSubcategoryRates([])
    setSelectedSubcategoryId(null)
    setFilteredSubcategories((prev) => prev.filter((sub) => sub.subcategoriaid !== subcategoryId))
    toast.success(t("categories.cannotDeleteSystemCategories"),{position:"top-center"})
  }

  const handleDeleteCategory = async(categoryId:string) => {
    if(!showUserRates){
      toast.error(t("categories.cannotDeleteSystemCategories"),{position:"top-center"})
      return
    }

    const result=await removeCategory(categoryId)

    if( typeof result === "object" && "code" in result){
      toast.error(t("categories.errorDeletingCategory").replace("{error}", result.messsage),{position:"top-center"})
      return
    }

    if(selectedCategoryId === categoryId){
       setSelectedCategoryId(null)
       setSelectedSubcategoryId(null)
       setFilteredSubcategories([])
       setSubcategoryRates([])
    }
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
    toast.success(t("categories.categoryDeleted"),{position:"top-center"})
  }

  const handleSearchRate=async()=>{
    const term = searchTerm?.trim()
    if(!term){
      setOverlayOpen(false)
      setSearchResults([])
      return
    }

    const data = await searchRatesByName(term)
    const flattened: SearchResultItem[] = []
    if (data && Array.isArray(data)) {
       for (const cat of data as any[]) {
         const categoryName = cat?.nombre ?? ""
         const rates: any[] = cat?.rates ?? []
         if (rates.length) {
           for (const rate of rates) {
             const id = rate?.id ?? `${categoryName}-${rate?.nombre ?? ""}`
             const name = rate?.nombre ?? ""
             flattened.push({ id, name, frecuencia: rate?.frecuencia ?? "", category: categoryName, subcategory: "" })
           }
         }
         const subs: any[] = cat?.subcategories ?? []
         for (const sub of subs) {
           const subRates: any[] = sub?.rates ?? []
           for (const rate of subRates) {
             const id = rate?.id ?? `${categoryName}-${sub?.nombre ?? ""}-${rate?.nombre ?? ""}`
             const name = rate?.nombre ?? ""
             flattened.push({ id, name, frecuencia: rate?.frecuencia ?? "", category: categoryName, subcategory: sub?.nombre ?? "" })
           }
         }
       }
    }

    setSearchResults(flattened)
    setOverlayOpen(flattened.length > 0)
  }

  
 

  return (
    <div className="space-y-4 h-[80%]">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold">{t('categories.title')}</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">      
              <Switch checked={showUserRates} onCheckedChange={setShowUserRates} />
              <span className="text-sm">{t('categories.showCustomRates')}</span>
            </label>

          </div>
        </div>
      </div>

      <div className="relative flex items-center gap-2 w-full">
        <Input
          placeholder={t('categories.searchRates')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className=" rounded-none border-black/50 border-2 shadow-md/20 "
        />
        <Button onClick={handleSearchRate}>
          <SearchIcon className="w-4 h-4" />
           {t('common.search')}
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
          <FolderIcon className="w-4 h-4" />
          <span className="text-sm">{t('categories.categoriesCount')}:</span>
          <span className="font-bold">{categories.length}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
          <FolderOpenIcon className="w-4 h-4" />
          <span className="text-sm">{t('categories.subcategoriesCount')}:</span>
          <span className="font-bold">{filteredSubcategories.length}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
          <FileTextIcon className="w-4 h-4" />
          <span className="text-sm">{t('categories.ratesCount')}:</span>
          <span className="font-bold">{subcategoryRates.length}</span>
        </div>
      </div>

      <Separator />

      <ResizablePanelGroup 
        orientation="vertical"
      >
        <ResizablePanel defaultSize="30%">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
              <ListBox 
                 title={t('categories.categoriesCount')} 
                 count={categories.length} 
                 addResource={showUserRates ? () => setCreateModalOpen({ open: true, action: "category" }) : undefined}
              >
                <div className="p-2 space-y-1 overflow-auto h-[60vh]">
                  {isLoading ? (
                     <div className="flex justify-center items-center  h-100">
                     <Spinner className="size-9" />
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>{t('categories.noCategories')}</p>
                    </div>
                  ) : (
                    categories.map((category) => {
                      const isSelected = selectedCategoryId === category.id
                      return (
                       <ContextMenu key={category.id}>
                          <ContextMenuTrigger className="w-full">
                             <button
                               key={category.id}
                               onClick={() => handleCategorySelect(category.id)}
                               className={`
                                 w-full p-3 rounded-lg  flex items-center  justify-between text-left transition-all
                                 ${isSelected 
                                   ? "bg-primary text-primary-foreground shadow-md" 
                                   : "hover:bg-muted"
                                 }
                               `}
                             >
                               <div className="flex items-center gap-2">
                                 {isSelected ? (
                                   <FolderOpenIcon className="w-5 h-5" />
                                 ) : (
                                   <FolderIcon className="w-5 h-5" />
                                 )}
                                 <div>
                                   <span className="font-medium">{category.nombre}</span>
                                 </div>
                               </div>
                               <div className="flex items-center gap-1">
                                 <ChevronRightIcon className="w-4 h-4" />
                               </div>
                             </button>
                          </ContextMenuTrigger>
                         <ContextMenuContent>
                            <ContextMenuItem onSelect={() => handleDeleteCategory(category.id)}>
                              <Trash2Icon className="w-4 h-4 mr-2" />
                              {t('categories.delete')}
                            </ContextMenuItem>
                         </ContextMenuContent>
                       </ContextMenu>
                      )
                    })
                  )}
                </div>
              </ListBox>

              <ListBox 
                title="Subcategorías" 
                count={filteredSubcategories.length} 
                addResource={showUserRates  ? () => {
                  if(selectedCategory){
                    setCreateModalOpen({ open: true, action: "subcategory" })
                  }else{
                    toast.error(t("categories.selectCategoryFirst"),{position:"top-center"})
                  }
                } : undefined}
              >
                <div className="p-2 space-y-1 overflow-auto h-[60vh]">
                  {isGeneralLoading.subcategories ? (
                    <div className="flex justify-center items-center  h-100">
                     <Spinner className="size-9" />
                    </div>
                  ) : !selectedCategory ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>{t("categories.selectCategory")}</p>
                    </div>
                  ) : filteredSubcategories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>{t("categories.noSubcategories")}</p>
                    </div>
                  ) : (
                    filteredSubcategories?.map((subcategory) => {
                      const isSelected = selectedSubcategoryId === subcategory.id
                      return (
                        <ContextMenu key={subcategory.id}>
                          <ContextMenuTrigger className="w-full">
                             <button
                               key={subcategory.id}
                               onClick={() => handleSubcategorySelect(subcategory.id)}
                               disabled={!selectedCategory}
                               className={`
                                 w-full p-3 rounded-lg flex items-center justify-between text-left transition-all disabled:opacity-50
                                 ${isSelected 
                                   ? "bg-primary text-primary-foreground shadow-md" 
                                   : "hover:bg-muted"
                                 }
                               `}
                             >
                               <div className="flex items-center gap-2">
                                 {isSelected ? (
                                   <FolderOpenIcon className="w-5 h-5" />
                                 ) : (
                                   <FolderIcon className="w-5 h-5" />
                                 )}
                                 <div>
                                   <span className="font-medium">{subcategory.nombre}</span>
                                 </div>
                               </div>
                               <div className="flex items-center gap-1">
                                 <ChevronRightIcon className="w-4 h-4" />
                               </div>
                             </button>
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem onSelect={() => handleDeleteSubcategory(subcategory.subcategoriaid)}>
                              <Trash2Icon className="w-4 h-4 mr-2" />
                              {t("categories.optionDeleteSubcategory")}
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      )
                    })
                  )}
                </div>
              </ListBox> 

              <ListBox 
                title="Rates" 
                count={subcategoryRates?.length || 0}
                addResource={showUserRates? () => {
                  if(selectedSubcategory){
                    setCreateModalOpen({ open: true, action: "rate" })
                  }else{
                    toast.error(t("categories.selectSubcategoryFirst"),{position:"top-center"})
                  }
                } : undefined}
              >
                <ContextMenu>
                  <ContextMenuTrigger className="w-full">
                    <div className="p-2 space-y-2 overflow-auto h-[60vh]">
                  {isGeneralLoading.rates ? (
                    <div className="flex justify-center items-center  h-100">
                     <Spinner className="size-9" />
                    </div>
                  ) : !selectedCategory ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>{t("categories.selectCategory")}</p>
                    </div>
                  ) : selectedSubcategory && (
                    subcategoryRates.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>{t("categories.noRates")}</p>
                      </div>
                    ) : (
                      subcategoryRates.map((rate) => (
                        <ContextMenu key={rate.id}>
                          <ContextMenuTrigger>
                            <div
                              className="p-3 mb-2 border rounded-lg hover:bg-muted transition-colors"
                             >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{rate.nombre}</p>
                                  <p className="text-sm text-muted-foreground">{rate.frecuencia}</p>
                                </div>
                              </div>
                            </div>
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem onSelect={()=>handleDeleteRate(rate.id)}>
                              <Trash2Icon className="w-4 h-4 mr-2" />
                              {t("categories.optionDeleteRate")}
                            </ContextMenuItem>
                            {/* <ContextMenuItem>
                              <CopyIcon className="w-4 h-4 mr-2" />
                              Copiar Rate
                            </ContextMenuItem> */}
                          </ContextMenuContent>
                        </ContextMenu>
                      ))
                    )
                  )}
                </div>
                  </ContextMenuTrigger>
                   {showUserRates && selectedSubcategory && (
                     <ContextMenuContent>
                       {/* <ContextMenuItem onSelect={() => toast.error("Selecciona una subcategoría para agregar un rate",{position:"top-center"})}>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        {t("categories.optionPasteRate")}
                      </ContextMenuItem> */}
                  </ContextMenuContent>
                    )}
                </ContextMenu>
              </ListBox>
         </div>
        </ResizablePanel>
        {overlayOpen  && (
          <>
            <ResizableHandle className="shadow-2xl shadow-black/30 bg-black/50 hover:bg-black/40" />
            <ResizablePanel defaultSize="60%" >
                 <div className="bg-whte">
                       <div className="sticky top-0 bg-sidebar flex items-center justify-between p-3 border-b">
                         <div className="flex items-center gap-2">
                           <span className="font-semibold">Resultados</span>
                           <span className="text-sm text-muted-foreground">{searchResults.length} encontrado(s)</span>
                         </div>
                         <Button variant="link" className="text-muted-foreground cursor-pointer" onClick={() => setOverlayOpen(false)} >
                           <XIcon className="w-4 h-4" />
                         </Button>
                       </div>
                       <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                         {searchResults.map((r) => {
                           let fullname= r.category;
                           fullname+=r.subcategory?"/"+r.subcategory:""
                           return(
                             <HoverCard key={r.id} openDelay={10} closeDelay={100}>
                              <HoverCardTrigger className="w-full">
                                 <div key={r.id} className="w-full h-28 border rounded-lg flex flex-col justify-between p-3 bg-muted/10">
                                     <Badge variant="outline" className="self-start border">
                                       {r.frecuencia}
                                     </Badge>
                                     <div className="text-sm font-semibold truncate">{r.name}</div>
                                     <Badge variant="outline" className="self-start border">
                                       {fullname.length>25?fullname.substring(0,25)+"..":fullname}
                                     </Badge>
                                  </div>
                              </HoverCardTrigger>
                              <HoverCardContent className="flex w-64 flex-col gap-0.5">
                                <div className="text-sm font-semibold">{r.name}</div>
                                <div className="text-sm text-muted-foreground">{r.frecuencia}</div>
                                <Separator />
                                <div className="text-sm">
                                  <span className="font-medium">Categoría:</span> {r.category}
                                </div>
                                {r.subcategory && (
                                  <div className="text-sm">
                                    <span className="font-medium">Subcategoría:</span> {r.subcategory}
                                  </div>
                                )}
                              </HoverCardContent>
                            </HoverCard>
                           )  
                         })}
                       </div>
                     </div>
            </ResizablePanel>
          </>        
        )}
      </ResizablePanelGroup>

     

   
        <CreateRateModal 
        createModalOpen={createModalOpen}
        onOpenChange={(createModalOpen) => setCreateModalOpen(createModalOpen)}
        selectCategory={selectedCategory}
        selectSubcategory={selectedSubcategory}
        onSave={handleSaveNewRate}
      />
    </div>
  )
}
