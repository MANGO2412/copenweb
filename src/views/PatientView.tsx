import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
    uplodImage,
    updateImage,
    removePatient,
    updatePatient,
    registerPatient,
    removeFile,
    getPatient
  }
from "@/lib/supabase"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Edit2Icon, Trash2Icon, EyeIcon,UserIcon,BookUserIcon } from "lucide-react"
import {useSerialContext} from "@/context/serial-context"
import DatePicker from "@/components/DatePicker"
import {next,RandomDigits} from "@/lib/radionica"
import type {Patient} from "@/interface/patient"
import MachineProcess from "@/components/MachineProcess"

interface PatientFormProps {
  patient?: Patient
  onSave: (patient: Partial<Patient>,clearForm:()=>void) => void
  onCancel: () => void
}

function PatientForm({ patient, onSave, onCancel }: PatientFormProps) {
   const { t } = useTranslation()
   const {send,outputText}=useSerialContext()
   const [openModalProcess,setOpenModalProcess]=useState<boolean>(false);
   const [txtModalProcess,setTxtModalProcess]=useState<string[]>([]);
   const [imagePreview, setImagePreview] = useState<string | null>(null)
   const [formData, setFormData] = useState<Partial<Patient>>({
       nombre: "",
       apellido1: "",
       fechanacimiento: undefined,
       sexo: "",
       fpg: "",
   })

   useEffect(()=>{
     if(patient){
       setFormData(patient)
     }
   },[patient])

   useEffect(()=>{
    if(outputText == "603" || outputText=="538"){
       if(outputText == "603"){
          const output=RandomDigits(next(16,22))
           setFormData({ ...formData, fpg: output })
       }

       setOpenModalProcess(false);

    }

   },[outputText])
  
  const clearForm=()=>{
     setFormData({
       nombre: "",
       apellido1: "",
       apellido2: "",
       fechanacimiento: undefined,
       sexo: "",
       email: "",
       fpg: "",
       foto: undefined,
       telefono: "",
       user_id: "",
     })

     const inputFIle= document.getElementById("image")
     if( inputFIle && "value" in inputFIle){
       inputFIle.value="";
     }

    setImagePreview(null)
    
  }

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    
    const newUrl=`private/${formData.nombre}_${formData.apellido1}_${Date.now()}.jpg`    
    const newPatient:Partial<Patient> = {
      idp: formData.idp,
      nombre: formData.nombre || "",
      apellido1: formData.apellido1 || "",
      apellido2: formData.apellido2 || "",  
      fechanacimiento: formData.fechanacimiento || new Date(),
      sexo: formData.sexo as Patient["sexo"],
      email: formData.email || "",
      fpg: formData.fpg || "",
      foto:  imagePreview ? newUrl : formData.foto,
      telefono: formData.telefono || "",
    }
    
    onSave(newPatient,async ()=>{
         imagePreview ?(
           formData.foto? await updateImage(formData.foto, imagePreview)
                        :await uplodImage(newUrl, imagePreview)
           ): formData.foto

        clearForm();
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateFrequency = () => {
    send("A")   
    setOpenModalProcess(true);
    setTxtModalProcess(t("common.processFindPgr").split(""))
  }

  const saveFrequency =()=>{
    send("V")
    setOpenModalProcess(true);
    setTxtModalProcess(t("common.processSavePgr").split(""))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('patient.name')}</Label>
          <Input
            id="name"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder={t('patient.name')}
            required
            className="max-w-md rounded-none border-black/50 border-2 shadow-md/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t('patient.lastName')}</Label>
          <Input
            id="lastName"
            value={formData.apellido1}
            onChange={(e) => setFormData({ ...formData, apellido1: e.target.value })}
            placeholder={t('patient.lastName')}
            required
            className="max-w-md rounded-none border-black/50 border-2 shadow-md/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birthYear">{t('patient.birthYear')}</Label>
          <DatePicker label={t('patient.birthYear')} value={formData.fechanacimiento} onChangeDate={(date:Date)=>setFormData({ ...formData, fechanacimiento: date })}/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">{t('patient.gender')}</Label>
          <Select
            value={formData.sexo}
            onValueChange={(value) => setFormData({ ...formData, sexo: value as Patient["sexo"] })}
            required
          >
            <SelectTrigger id="gender"  className="max-w-md rounded-none border-black/50 border-2 shadow-md/20">
              <SelectValue placeholder={t('patient.gender')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="femenino">{t('patient.labelFemale')}</SelectItem>
              <SelectItem value="masculino">{t('patient.labelMale')}</SelectItem>
              <SelectItem value="animal">{t('patient.labelAnimal')}</SelectItem>
              <SelectItem value="planta_tierra">{t('patient.labelThings')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">{t('patient.photo')}</Label>
        <div className="flex items-center gap-4">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"

          />
          <Button type="button" variant="outline" onClick={() => document.getElementById("image")?.click()}>
            {t('patient.uploadImage')}
          </Button>
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t('patient.phone')}</Label>
        <Input
          id="phone"
          value={formData.telefono}
          onChange={(e) => setFormData({ ...formData, telefono  : e.target.value })}
          placeholder="123 456 7890"
          required
          className="max-w-md rounded-none border-black/50 border-2 shadow-md/20"
        />
      </div>

      <div className="space-y-2 mt-5">
        <Label htmlFor="frequency">{t('patient.fpg')}</Label>
        <div className="flex gap-2">
          
          <Button type="button" className="rounded-none shadow-md/20 bg-green-600"  onClick={generateFrequency}>
            {t("patient.btnFindPGR")}
          </Button>
          <Button type="button" className="rounded-none shadow-md/20 bg-foreground" onClick={saveFrequency}>
            {t("patient.btnSavePGR")} 
          </Button>
          <Input
            id="frequency"
            value={formData.fpg || ""}
            onChange={(e) => setFormData({ ...formData, fpg: e.target.value })}
            placeholder={t('patient.fpg')}
            className="max-w-md rounded-none border-black/50 border-2 shadow-md/20"
            readOnly
            required
          />
        </div>
      </div>

      <div className="flex gap-2 pt-10 mt-20">
        <Button type="submit" className="flex-1 bg-foreground">
          {t('patient.save')}
        </Button>
        <Button type="button" className="flex-1"  variant="outline" onClick={()=>{
            onCancel();
            clearForm();
          }}>
          {t('patient.cancel')}
        </Button>
      </div>

      <MachineProcess open={openModalProcess} txtProcess={txtModalProcess} />
    </form>
  )
}

interface PatientListProps {
  patients: Patient[]
  onEdit: (patient: Patient) => void
  onDelete: (patient: Patient) => void
  onView: (patient: Patient) => void
}

function PatientList({ patients, onEdit, onDelete, onView }: PatientListProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPatients = patients.filter(
    (patient) =>
      patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.apellido1.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <Input
        placeholder={t('patient.searchPlaceholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md rounded-none border-black/50 border-2 shadow-md/20 "
      />

      <div className="border h-100 rounded-none overflow-auto">
        <table className="w-full table-auto">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">No</th>
              <th className="px-4 py-3 text-left text-sm font-medium">{t('patient.name')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  {t('patient.noPatients')}
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient,index) => (
                <tr key={patient.idp} className="border-t">
                  <td className="px-4 py-3 text-sm">{index+1}</td>
                  <td className="px-4 py-3 text-sm">
                    {patient.nombre} {patient.apellido1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onView(patient)}>
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(patient)}>
                        <Edit2Icon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(patient)}>
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </div>
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

export function PatientView() {
  const { t } = useTranslation()
  const [isLoading,setIsLoading]=useState<boolean>(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null)

  const fetchPatients = async () => {
     setIsLoading(true);
     const response=await getPatient()
     setPatients(response)
     setIsLoading(false);
  }


  useEffect(() => {
    fetchPatients()
  }, [])



  const handleSave = async (patient: Partial<Patient>,clearForm:()=>void) => {
      const response=editingPatient?await updatePatient(patient):await registerPatient(patient)
      if("code" in response){
        if(response.code=="23505") toast.error(t("patient.patientExists").replace("{name}",`${(patient.nombre ||"")+(patient.apellido2 || "")}`),{position:'top-center'});
         return;
      }

      if(editingPatient){
        const newPatients=patients.filter(item=>item.idp!=response.idp)
        setPatients([...newPatients,response])
      }else{
        setPatients(prev=>[...prev,response])
      }
      
     clearForm();
  }

  const handleDelete = async(patient: Patient) => {
    const success = await removePatient(patient.idp || "")
    await removeFile(patient.foto || "");

    if (success) {
      const newPatients=patients.filter(e=>e.idp!=patient.idp)
      setPatients(newPatients);
    }
  }

  const handleView = (patient: Patient) => {
    setViewingPatient(patient)
  }

  return (
    <>
      <Dialog open={!!viewingPatient} onOpenChange={() => setViewingPatient(null)}>
        <DialogContent  aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t('patient.view')}</DialogTitle>
            {/* <DialogDescription>
              {t('patient.confirmDelete')}
            </DialogDescription> */}
          </DialogHeader>
          {viewingPatient && (
            <div className="space-y-4">
              {viewingPatient.foto && (
                <img src={"https://ozcsvqziqjdehvxomnxa.supabase.co/storage/v1/object/public/patients/"+viewingPatient.foto} alt="Paciente" className="w-32 h-32 object-cover rounded-lg mx-auto" />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('patient.name')}</Label>
                  <p className="text-sm">{viewingPatient.nombre} {viewingPatient.apellido1}</p>
                </div>
                <div>
                  <Label>{t('patient.birthYear')}</Label>
                  <p className="text-sm">{new Date(viewingPatient.fechanacimiento || "").toDateString()}</p>
                </div>
                <div>
                  <Label>{t('patient.gender')}</Label>
                  <p className="text-sm">{viewingPatient.sexo}</p>
                </div>
                <div>
                  <Label>{t('patient.phone')}</Label>
                  <p className="text-sm">{viewingPatient.telefono}</p>
                </div>
                {viewingPatient.fpg && (
                  <div className="col-span-2">
                    <Label>{t('patient.fpg')}</Label>
                    <p className="text-sm font-bold text-primary">{viewingPatient.fpg}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-black/50 border-2 p-0 rounded-none">
          <CardHeader className="bg-sidebar pb-2 pt-2 mt-0 border-b-4 rounded-none border-black/50">
            <CardTitle className="text-lg font-semibold text-black/70 flex items-center gap-2 pr-2">
              <UserIcon className="w-5 h-5" />
              {t('patient.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>   
            {isLoading ?(
              <div className="flex justify-center items-center  h-100">
                 <Spinner className="size-9" />
              </div>
            ):(
              <PatientList
              patients={patients || []}
              onEdit={setEditingPatient}
              onDelete={handleDelete}
              onView={handleView}
            />
            )}  
            
          </CardContent>
        </Card>

        <Card className="border-black/50 border-2 pt-0 rounded-none">
          <CardHeader className="bg-sidebar pb-2 pt-2 mt-0 border-b-4 rounded-none border-black/50">
            <CardTitle className="text-xl font-semibold text-black/70 flex items-center gap-2 pr-2">
              <BookUserIcon className="w-5 h-5 " />
              {editingPatient ? t('patient.editPatient') : t('patient.addPatient')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PatientForm
              patient={editingPatient || undefined}
              onSave={handleSave}
              onCancel={() => setEditingPatient(null)}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
