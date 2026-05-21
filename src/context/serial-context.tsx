import {
 useContext,
 createContext,
 type ReactNode,
 useEffect,
 useState,
 useRef
} from "react"

interface SerialContextType{
    //global variables
    outputText:string;
    serialport:React.RefObject<any | null> ;
    reader:any | null;
    hasPort:boolean

    keepReading:React.RefObject<boolean>;
    isConnected:boolean;

    resetDataReceived:()=>void;

    //global functions
    serialTimer:ReturnType<typeof setTimeout>|null;
    selectPort:()=>void
    disconnect:()=>void
    connect:()=>void 
    send:(message:string)=>void
}

const SerialContext=createContext<SerialContextType|null>(null)

export function SerialProvider({children}:{children:ReactNode}){
    const [outputText,setOuputText]=useState<string>("")
    const [reader,setReader]=useState<any>(null)
    const [isConnected,setIsConnected]=useState<boolean>(false)
    const [hasPort,setHaspPort]=useState<boolean>(false)



    let serialData:string[]=[]
    let serialTimer:ReturnType<typeof setTimeout>|null=null;
    const serialport=useRef<any>(null)
    const keepReading=useRef<boolean>(false)



    const selectPort=async ()=>{
        try{
           if(serialport.current && isConnected){
               await disconnect()
           }
           serialport.current=await (navigator as any).serial.requestPort()
           setHaspPort(true)
        }catch(err:any){
         if (err?.name !== 'NotFoundError') {
            console.error('Error al seleccionar puerto: ' + err.message, 'error');
           }
        }
    }

    const disconnect=async ()=>{
        keepReading.current=false
        setIsConnected(false);

        if(reader){
              try {
            await reader?.cancel();
        } catch (e) {}
          setReader(null)
        }

       if (serialport) {
        try {
            await serialport.current.close();
        } catch (e) {}
          serialport.current=null
          setHaspPort(false)
     }
    }

    const connect=async ()=>{
       if (!serialport.current) {
          console.error('Selecciona un puerto primero', 'error');
          return;
        }

        try {
          await serialport.current.open({ 
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            flowControl: 'none',
            bufferSize: 1024 
         });

         setIsConnected(true);
         keepReading.current=true
         console.info(`Puerto abierto @ 9600 baud`)
      
         readLoop();
            
        } catch (error:any) {
            console.error('Error al abrir puerto: ' + error.message)
        }
    }

    const readLoop=async ()=>{
        const decoder=new TextDecoder();
        while (keepReading.current && serialport.current?.readable){
            const localReader=serialport.current.readable.getReader();
            setReader(localReader)
            console.log('Esperando datos... y bucle activo:', reader);

            try{
                while(true){
                    const { value, done } = await localReader.read();
                    if (done) break;
                    if (value) {
                        const chunk = decoder.decode(value);
                        dataReceived(chunk);
                    }
                }

            }catch(err:any){
                  if (keepReading.current){
                    console.log('Error: ' + err.message, 'error');
                     setHaspPort(false)
                     setIsConnected(false)
                  }
            }finally{
                localReader.releaseLock();
            }
        }
        await serialport.current.close();
    }

    const send=async (message:string)=>{
     setOuputText("");
     if (!message || !serialport.current?.writable || !isConnected){
        console.warn('No se puede enviar: mensaje vacío o puerto no conectado');
        return;
     }

     try { 
        const writer = serialport.current.writable.getWriter();
        const encoder = new TextEncoder();
        let  data= encoder.encode(message);
        data = new Uint8Array([...data, 0x0d, 0x0a])
        await writer.write(data);
        writer.releaseLock();        
        console.log(message, 'send');
     } catch (err:any) {
        console.error('Error al enviar: ' + err.message);
     }

    }

    const dataReceived=(data:string)=>{
         serialData.push(data)
         if(serialTimer) clearTimeout(serialTimer);
         serialTimer=setTimeout(()=>{
              const text = serialData.join('');
              console.log('Datos recibidos:', text);
              console.log('recv',text);
              setOuputText(text)
              serialData=[]
        },50);
    }

    const resetDataReceived=()=>{
       setOuputText("")
    }

    useEffect(()=>{
      if(serialport.current){
        const info = serialport.current.getInfo();
        const portLabel = info.usbProductId ? `USB Device (VID: ${info.usbVendorId})` : 'Puerto Serial';
        console.log(`Puerto seleccionado: ${portLabel}`, 'info');
      }
    },[hasPort])

    return(
        <SerialContext.Provider value={{
            hasPort,
            outputText,
            selectPort,
            reader,
            isConnected,
            keepReading,
            serialport,
            serialTimer,
            connect,
            disconnect,
            send,
            resetDataReceived
        }}>
            {children}
        </SerialContext.Provider>
    )
    
}

export function useSerialContext(){
    const ctx=useContext(SerialContext)
    if (!ctx) {
        throw new Error('usePlayerContext must be used within PlayerProvider')
    }
    return ctx
}

