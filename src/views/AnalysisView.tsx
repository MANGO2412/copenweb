import { Spinner } from "@/components/ui/spinner"
import { useState,useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { PlusIcon, Trash2Icon, EyeIcon, RefreshCwIcon,UserIcon,FlaskConicalIcon} from "lucide-react"
import type { Patient } from "@/interface/patient"
import { AnalysisModal } from "./AnalysisModal"
import type { Rate } from "@/interface/rates"
import  
supabase,
{getUserId,
registerAnalysisRates,
removeAnalysis,
getAnalysisByPatient,
getRatesByAnalysis}from "@/lib/supabase";
import type { Analysis } from "@/interface/analysis"

interface PatientSearchListProps {
  patients: Patient[]
  selectedPatient: Patient | null
  onSelectPatient: (patient: Patient) => void
  // searchTerm: string
  // onSearchChange: (term: string) => void
}

interface AnalysisFormProps {
  selectedPatient: Patient | null
  onCreate: (analysis: Omit<Analysis, "id" | "createdAt">) => void
}

interface AnalysisListProps {
  analyses: Analysis[]
  onDelete: (id: string) => void
  onViewResults: (analysis: Analysis) => void
  onReanalyze: (analysis: Analysis) => void
}


function TableRates({rates}:{rates:Rate[]}){
  const { t } = useTranslation()
  return(
       <div className="flex-1 overflow-y-auto h-100 border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-base font-semibold">{t('analysis.codes')}</th>
              <th className="px-4 py-3 text-left text-base font-semibold">{t('analysis.codeName')}</th>
              <th className="px-4 py-3 text-left text-base font-semibold">{t('analysis.value')}</th>
              <th className="px-4 py-3 text-left text-base font-semibold">{t('analysis.levels')}</th>
              <th className="px-4 py-3 text-left text-base font-semibold">{t('analysis.suggestedLevel')}</th>
              <th className="px-4 py-3 text-left text-base font-semibold">{t('analysis.potency')}</th>
              <th className="px-4 py-3 text-left text-base font-semibold">{t('analysis.suggestedPotency')}</th>
            </tr>
          </thead>
          <tbody>
            {rates.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-lg">
                  {t('analysis.selectRates')}
                </td>
              </tr>
            ) : (
              rates.map((rate) => (
                <tr key={`${rate.id}`} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3 text-base">{rate.frecuencia}</td>
                  <td className="px-4 py-3 text-base font-medium">{ Array.isArray(rate.nombre) ? rate.nombre[0] : rate.nombre}</td>
                  <td className="px-4 py-3 text-base">{rate.valor || "0"}</td>
                  <td className="px-4 py-3 text-base">{rate.nivel || "-"}</td>
                  <td className="px-4 py-3 text-base">{rate.nivelsugerido || "-"}</td>
                  <td className="px-4 py-3 text-base">{rate.potencia  || "-"}</td>
                  <td className="px-4 py-3 text-base">{rate.potenciasugerido || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
  )
}

function AnalysisForm({ selectedPatient, onCreate }: AnalysisFormProps) {
  const { t } = useTranslation()
  const [analysisName, setAnalysisName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient || !analysisName.trim()) return
    
    onCreate({
      nombre: analysisName,
      patientId: selectedPatient.idp || "",
      patientName: `${selectedPatient.nombre} ${selectedPatient.apellido1}`,
    })
    setAnalysisName("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="analysisName">{t('analysis.analysisName')}</Label>
        <Input
          id="analysisName"
          value={analysisName}
          onChange={(e) => setAnalysisName(e.target.value)}
          placeholder={t('analysis.analysisName')}
          className="max-w-md rounded-none border-black/50 border-2 shadow-md/20"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>{t('analysis.patient')}</Label>
        <div className="p-3 bg-muted">
          {selectedPatient ? (
            <span className="text-sm">
              {selectedPatient.nombre} {selectedPatient.apellido1} (ID: {selectedPatient.idp || "N/A"})
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">{t('analysis.selectPatientFirst')}</span>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full rounded-none  shadow-md/20 bg-foreground" disabled={!selectedPatient || !analysisName.trim()}>
        <PlusIcon className="w-4 h-4 mr-2" />
        {t('analysis.createAnalysis')}
      </Button>
    </form>
  )
}

function PatientSearchList({ 
  patients, 
  selectedPatient, 
  onSelectPatient, 

}: PatientSearchListProps) {
  const { t } = useTranslation()
  // const filteredPatients = patients.filter(
  //   (patient) =>
  //     // patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     patient.apellido1.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     patient.idp?.includes(searchTerm)
  // )

  return (
    <div className="space-y-3">
      {/* <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por ID o nombre..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div> */}

      <div className="border rounded-none overflow-hidden max-h-64 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium">No</th>
              <th className="px-3 py-2 text-left text-xs font-medium">{t('patient.name')}</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-3 py-4 text-center text-sm text-muted-foreground">
                  {t('patient.noPatients')}
                </td>
              </tr>
            ) : (
              patients.map((patient,index) => (
                <tr
                  key={patient.idp}
                  onClick={() => onSelectPatient(patient)}
                  className={`
                    cursor-pointer border-t hover:bg-muted/50 transition-colors
                    ${selectedPatient?.idp === patient.idp ? "bg-primary/10" : ""}
                  `}
                >
                  <td className="px-3 py-2 text-xs">{index + 1}</td>
                  <td className="px-3 py-2 text-xs">
                    {patient.nombre} {patient.apellido1}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{t('analysis.selectPatient')}</p>
    </div>
  )
}

function AnalysisList({ 
  analyses, 
  onDelete, 
  onViewResults, 
  onReanalyze 
}: AnalysisListProps) {
  const { t } = useTranslation()
  return (
    <div className="space-y-3">
      {analyses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">{t('analysis.noAnalysis')}</p>
          <p className="text-xs mt-1">{t('analysis.selectPatientFirst')}</p>
        </div>
      ) : (
        <div className="space-y-2 overflow-auto h-100">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-sm">{analysis.nombre}</h4>
                  <p className="text-xs text-muted-foreground">
                    {t('analysis.patient')}: {analysis.patientName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('analysis.date')}: {new Date(analysis.fecha || "").toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => onViewResults(analysis)}>
                  <EyeIcon className="w-3 h-3 mr-1" />
                  {t('analysis.results')}
                </Button>
                {!analysis.reanalizado && (
                  <Button variant="outline" size="sm" onClick={() => onReanalyze(analysis)}>
                    <RefreshCwIcon className="w-3 h-3 mr-1" />
                    {t('analysis.reanalyze')}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => onDelete(analysis.id || "")} >
                  <Trash2Icon className="w-3 h-3" />
                  {t('common.delete')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function AnalysisView() {
  const { t } = useTranslation()
  const [isLoading,setIsLoading]=useState<boolean>(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  // const [searchTerm, setSearchTerm] = useState("")
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  
  const [viewingAnalysis, setViewingAnalysis] = useState<Analysis | null>(null)
  const [contentAnalysis,setContentAnalysis]=useState<Rate[]>([])


  const [analysisModalOpen, setAnalysisModalOpen] = useState(false)
  const [currentAnalysisInfo, setCurrentAnalysisInfo] = useState<{
    id?: string,
    nombre: string
    patientName: string,
    patientId: string,
    fecha: string,
    reanalizado?:boolean
  } | null>(null)

  useEffect(() => { 
    const fetchAnalyses = async () => {
      try {
        setIsLoading(true);
        const userId = await getUserId() || ""
        const { data, error } = await supabase.from("rad_pacientes").select("*").eq("user_id", userId)
        if (error) throw error
        setPatients(data as Patient[])
        setIsLoading(false)

      } catch (error) {
         console.error("Error fetching patients:", error)
      }
    }

    fetchAnalyses()
  }, [])


  const handleCreateAnalysis = (analysisData: Omit<Analysis, "id" | "createdAt">) => {
    const newAnalysis: Analysis = {
      ...analysisData,
      fecha: new Date().toISOString(),
    }
  
    setCurrentAnalysisInfo({
      nombre: newAnalysis.nombre,
      patientName: newAnalysis.patientName || "",
      patientId: newAnalysis.patientId || "",
      fecha: newAnalysis.fecha || "",
    })
    setAnalysisModalOpen(true)
  }

  const handleDeleteAnalysis= async (id: string) => {
    const result=await removeAnalysis(id);
    if(result){
      setAnalyses(analyses.filter((a) => a.id !== id))
    }
  }

  const handleViewResults = async(analysis: Analysis) => {

    setViewingAnalysis(analysis)
    const rates=await getRatesByAnalysis(analysis.id || "")
    setContentAnalysis(rates)
  }

  const handleReanalyze = async (analysis: Analysis) => {
    const newAnalysis: Analysis = {
      ...analysis,
      id: analysis.id,
      nombre: `${analysis.nombre} (Reanálisis)`,
      fecha: new Date().toISOString(),
    }
    const rates=await getRatesByAnalysis(analysis.id || "")

    setContentAnalysis(rates)
    setCurrentAnalysisInfo({
      id: newAnalysis.id,
      nombre: newAnalysis.nombre,
      patientName: newAnalysis.patientName || "",
      patientId: newAnalysis.patientId || "",
      fecha: newAnalysis.fecha || "",
      reanalizado:true
    })
    setAnalysisModalOpen(true)
  }

  const handleSaveModalRates = async(rates: Rate[], analysisId: string) => {
    console.log("Rates guardados:", rates, "para análisis:", analysisId)    
    await registerAnalysisRates(analysisId, rates)
    if(selectedPatient){
      const resultAnalysis=await getAnalysisByPatient(selectedPatient.idp || "");
      setAnalyses(resultAnalysis.map(item=>{
        return {
         ...item,
         patientName:selectedPatient.nombre+" "+selectedPatient.apellido1,
         patientId:selectedPatient.idp
        }
      }))
    }
    setAnalysisModalOpen(false)
  }

  const SelectAndShowInfoPatient=async (patient: Patient)=>{
       setSelectedPatient(patient)
       const resultAnalysis=await getAnalysisByPatient(patient.idp || "");
       setAnalyses(resultAnalysis.map(item=>{
         return {
          ...item,
          patientName:patient.nombre+" "+patient.apellido1,
          patientId:patient.idp
         }
       }))
  }


  return (
    <>
<Dialog open={!!viewingAnalysis} onOpenChange={() => {setViewingAnalysis(null);setContentAnalysis([])}}>
        <DialogContent className="w-200! max-w-none! max-h-none!">
          <DialogHeader>
            <DialogTitle>{t('analysis.results')}</DialogTitle>
            <DialogDescription>
              {viewingAnalysis?.nombre} - {viewingAnalysis?.patientName} - {t('analysis.date')}: {new Date(viewingAnalysis?.fecha || "").toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          {viewingAnalysis && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <TableRates rates={contentAnalysis}/>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-black/50 border-2  pt-0 pb-4 rounded-none">
          <CardHeader className="bg-sidebar pb-2 pt-2 mt-0 border-b-4 rounded-none border-black/50">
            <CardTitle className="text-lg font-semibold text-black/70 flex items-center gap-2">
               <UserIcon className="w-5 h-5 " />
               {t('analysis.selectPatient')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading?(
               <div className="flex justify-center items-center  h-100">
                 <Spinner className="size-9" />
             </div>
            ):(
                  <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">{t('analysis.createAnalysis')}</Label>
                <AnalysisForm
                  selectedPatient={selectedPatient}
                  onCreate={handleCreateAnalysis}
                />
              </div>
              <Separator />
              <PatientSearchList
                patients={patients}
                selectedPatient={selectedPatient}
                onSelectPatient={SelectAndShowInfoPatient}
                // searchTerm={searchTerm}
                // onSearchChange={setSearchTerm}
              />
            </div>

            )}

          </CardContent>
        </Card>

        <Card className="border-black/50 border-2  pt-0 pb-4 rounded-none">
          <CardHeader className="bg-sidebar pb-2 pt-2 mt-0 border-b-4 rounded-none border-black/50">
            <CardTitle className="text-lg font-semibold text-black/70 flex items-center gap-2">
              <FlaskConicalIcon className="w-5 h-5"/>
              {t('analysis.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPatient ? (
              <div>
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    {t('analysis.patient')}: {selectedPatient.nombre} {selectedPatient.apellido1}
                  </p>
                  <p className="text-xs text-muted-foreground">ID: {selectedPatient.idp || "N/A"}</p>
                </div>
                <AnalysisList
                  analyses={analyses}
                  onDelete={handleDeleteAnalysis}
                  onViewResults={handleViewResults}
                  onReanalyze={handleReanalyze}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">{t('analysis.selectPatientFirst')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AnalysisModal
        open={analysisModalOpen}
        onOpenChange={setAnalysisModalOpen}
        analysisInfo={currentAnalysisInfo}
        onSave={handleSaveModalRates}
        ratesAnalyzed={contentAnalysis}
      />
    </>
  )
}