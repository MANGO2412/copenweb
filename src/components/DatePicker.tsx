import { format,set} from "date-fns"
import { Calendar as CalendarIcon,Clock2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
 Field,
 FieldGroup,
 FieldLabel
} from "@/components/ui/field"

import {
 InputGroup,
 InputGroupAddon,
 InputGroupInput
} from "@/components/ui/input-group"

import {
  useEffect,
  useState
} from "react"

interface DatePickerProps{
   value:Date|undefined;
   label?:string;
   onChangeDate:(date:Date)=>void;
   formatValue?:string
}


export default function DatePicker({value,label,onChangeDate,formatValue="PPP"}:DatePickerProps) {
  const [timeValue,setTimeValue]=useState<string>("")

  useEffect(()=>{
    setTimeValue(format(value || new Date(), "HH:mm:ss").toString())
  },[value])



  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!value}
          className="bg-white  rounded-none border-black/50 border-2 shadow-md/20  w-70 md:w-60  xl:w-60 justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
        >
          <CalendarIcon />
          {value ? format(value, formatValue) : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          required={true}
          selected={value}
          onSelect={(date) =>{
            if(date){
               console
               const time=timeValue.split(":")
               const newDate=set(date,{
                     hours:Number(time[0]),
                     minutes:Number(time[1]),
                     seconds:Number(time[2])
                  })
              onChangeDate(newDate)
            }
          }}
          captionLayout="dropdown"
        />
        {formatValue=="MM/dd/yyyy:p" && (
            <FieldGroup className="border-t-2 border-black/20">
           <Field className="p-3">
              <FieldLabel htmlFor="time-from">Hora</FieldLabel>
              <InputGroup>
              <InputGroupInput
                id="time-from"
                type="time"
                step="1"
                onChange={(event)=>{
                  console.log(timeValue)
                
                  console.log(event.target.value)
                  
                  const time=event.target.value.split(":")
                  
                  console.log(time)
                  
                  const date=set(value || "",{
                     hours:Number(time[0]),
                     minutes:Number(time[1]),
                     seconds:Number(time[2])
                  })

                  setTimeValue(time.join(":"))
                  onChangeDate(date)
                }}
                value={timeValue}
                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
              <InputGroupAddon>
                <Clock2Icon className="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
           </Field>
        </FieldGroup>
        )}
      </PopoverContent>
    </Popover>
  )
}