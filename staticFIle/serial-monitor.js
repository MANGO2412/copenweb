/**
 * Serial Monitor - Controlador Principal
 * Maneja la conexión serial via Web Serial API y la comunicación con dispositivos USB
 */

// ============================================
// VARIABLES GLOBALES
// ============================================

let serialport = null;          // Referencia al puerto serial conectado
let reader = null;        // Lector de flujo de datos entrantes
let keepReading = false;  // Bandera para controlar el loop de lectura
let isConnected = false;  // Estado de conexión
let serialData=[];
let serialTimer;

// ============================================
// REFERENCIAS DEL DOM
// ============================================

const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const selectPortBtn = document.getElementById('selectPortBtn');
const portName = document.getElementById('portName');
const baudSelect = document.getElementById('baudSelect');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const sendInput = document.getElementById('sendInput');
const sendBtn = document.getElementById('sendBtn');
const newlineCheck = document.getElementById('newlineCheck');
const terminal = document.getElementById('terminal');

// ============================================
// FUNCIONES DE ESTADO Y UI
// ============================================

/**
 * Actualiza la interfaz según el estado de conexión
 * @param {boolean} connected - Estado de conexión
 * @param {string} text - Texto descriptivo del estado
 */
function updateStatus(connected, text) {
    statusDot.className = 'status-dot ' + (connected ? 'connected' : 'disconnected');
    statusText.textContent = text;
    disconnectBtn.disabled = !connected;
    sendInput.disabled = !connected;
    sendBtn.disabled = !connected;
}

/**
 * Agrega un mensaje al terminal con timestamp
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de mensaje: 'info', 'recv', 'send', 'error'
 */
function log(message, type = 'info') {
    const time = new Date().toLocaleTimeString('es-ES', { hour12: false });
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `<span class="log-time">[${time}]</span>${message}`;
    terminal.appendChild(entry);
    terminal.scrollTop = terminal.scrollHeight;
}

/**
 * Actualiza el texto del botón según el estado del puerto
 */
function updatePortButton(portInfo) {
    if (portInfo) {
        selectPortBtn.textContent = 'Conectado';
        selectPortBtn.classList.add('primary');
        portName.textContent = portInfo;
    } else {
        selectPortBtn.textContent = 'Seleccionar Puerto';
        selectPortBtn.classList.remove('primary');
        portName.textContent = '';
    }
}

// ============================================
// FUNCIONES DE CONEXIÓN SERIAL
// ============================================

/**
 * Solicita al usuario seleccionar un puerto serial
 * Usa el diálogo nativo del navegador para elegir el dispositivo
 */
async function selectPort() {
    try {
        // Si ya hay un puerto seleccionado, desconectar primero
        if (serialport && isConnected) {
            await disconnect();
        }

        // Solicita acceso al puerto serial - muestra el diálogo del sistema
        serialport = await navigator.serial.requestPort();
        console.log('Puerto seleccionado:', serialport);
        
        // Obtiene la información del puerto seleccionado
        const info = serialport.getInfo();
        const portLabel = info.usbProductId ? `USB Device (VID: ${info.usbVendorId})` : 'Puerto Serial';
        
        updatePortButton(portLabel);
        log(`Puerto seleccionado: ${portLabel}`, 'info');
        
    } catch (err) {
        // El usuario canceló la selección o hubo un error
        if (err.name !== 'NotFoundError') {
            log('Error al seleccionar puerto: ' + err.message, 'error');
        }
    }
}

/**
 * Establece conexión con el puerto serial seleccionado
 * Configura el baud rate y comienza el loop de lectura
 */
async function connect() {
    if (!serialport) {
        log('Selecciona un puerto primero', 'error');
        return;
    }

    try {
        // Abre el puerto con la velocidad configurada
        await serialport.open({ 
            baudRate: parseInt(baudSelect.value),
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            flowControl: 'none',
            bufferSize: 1024 
        });
        isConnected = true;
        updateStatus(true, 'Conectado');
        connectBtn.textContent = 'Cerrar Puerto';
        log(`Puerto abierto @ ${baudSelect.value} baud`, 'info');

        // Inicia el loop de lectura de datos entrantes
        keepReading = true;
        readLoop();
        
    } catch (err) {
        log('Error al abrir puerto: ' + err.message, 'error');
    }
}

/**
 * Cierra la conexión serial y limpia recursos
 * Cancela el lector, cierra el flujo y el puerto
 */
async function disconnect() {
    keepReading = false;
    isConnected = false;

    // Cancela el lector de datos entrantes
    if (reader) {
        try {
            await reader.cancel();
        } catch (e) {}
        reader = null;
    }

    // Cierra el puerto serial
    if (serialport) {
        try {
            await serialport.close();
        } catch (e) {}
    }

    updateStatus(false, 'Desconectado');
    connectBtn.textContent = 'Abrir Puerto';
    serialport = null;
    updatePortButton(null);
    log('Puerto cerrado', 'info');
}

// ============================================
// FUNCIONES DE COMUNICACIÓN
// ============================================

/**
 * Loop infinito que lee datos del puerto serial
 * Procesa los datos entrantes y los muestra en el terminal
 * Se ejecuta mientras keepReading sea true y el puerto esté abierto
 */
async function readLoop() {
    const decoder = new TextDecoder();
    
    while (keepReading && serialport.readable) {
        reader = serialport.readable.getReader();
        console.log('Esperando datos... y bucle activo:', reader);
        try {
            while (true) {
                const { value, done } = await reader.read();
                console.log('Valor leído:', value, 'Done:', done);
                if (done) break;

                const text = decoder.decode(value);
                dataReceived(text);
                 
            }
               console.log('pasado el bucle de lectura');
        } catch (err) {
            if (keepReading) log('Error: ' + err.message, 'error');
        } finally {
            reader.releaseLock();
        }
    }
    await serialport.close();
    // while (keepReading && serialport.readable) {
    //     reader = serialport.readable.getReader();
    //     console.log('Esperando datos... y bucle activo:',reader);
    //     try {

    //         const decoder = new TextDecoderStream();
    //         const inputStream = reader.pipeThrough(decoder);
    //         reader = inputStream.getReader();

    //         // Lee datos continuamente hasta que se cierre el puerto
    //         while (true) {
    //             const { value, done } = await reader.read();
    //             if (done) break;
    //             console.log('Datos recibidos:', value);
    //             if (value) {
    //                 // Muestra los datos recibidos en el terminal
    //                 log(value.trim() || value, 'recv');
    //             }
    //         }
            
    //     } catch (err) {
    //         if (keepReading) {
    //             log('Error de lectura: ' + err.message, 'error');
    //         }
    //     } finally {
    //         	reader.releaseLock()
    //         // Libera el lock del lector
    //         // if (reader) {
    //         //     try { reader.releaseLock(); } catch (e) {}
    //         //     reader = null;
    //         // }
    //     }
    // }

	
	// await serialport.close()
	
}

function dataReceived(data){
  serialData.push(data);
  if(serialTimer) clearTimeout(serialTimer);
  serialTimer = setTimeout(()=>{
    const text = serialData.join('');
    console.log('Datos recibidos:', text);
    log(text, 'recv');
    serialData=[];
  },50);
}


/**
 * Envía un mensaje por el puerto serial
 * Codifica el texto a bytes y lo escribe en el flujo de salida
 * Añade NL/CR (newline + carriage return) si el checkbox está activado
 */
async function send() {
    const message = sendInput.value;

    if (!message || !serialport?.writable || !isConnected){
        console.warn('No se puede enviar: mensaje vacío o puerto no conectado');
        return;
    }

    try {
        const writer = serialport.writable.getWriter();
        const encoder = new TextEncoder();
        let  data= encoder.encode(message);
        data = new Uint8Array([...data, 0x0d, 0x0a])
        await writer.write(data);
        writer.releaseLock();


        // Prepara el flujo de escritura
        // const encoder = new TextEncoderStream();
        // const writer = encoder.writable.getWriter();
        // const outputStream = serialport.writable.pipeThrough(encoder);
        // const writer2 = outputStream.getWriter();
        
        // Añade terminador de línea si está configurado
        //const toSend = newlineCheck.checked ? message + '\r\n' : message;
        // await writer2.write(toSend);
        // await writer2.close();
        
        // Muestra el mensaje enviado en el terminal
        log(message, 'send');
        sendInput.value = '';
        
    } catch (err) {
        log('Error al enviar: ' + err.message, 'error');
    }
}




// ============================================
// EVENT LISTENERS
// ============================================

// Botón para seleccionar puerto (muestra diálogo del sistema)
selectPortBtn.addEventListener('click', selectPort);

// Botón para abrir/cerrar puerto
connectBtn.addEventListener('click', () => {
    if (isConnected) {
        disconnect();
    } else {
        connect();
    }
});

// Botón para desconectar (mantiene el puerto seleccionado)
disconnectBtn.addEventListener('click', () => {
    if (port) {
        port.forget();
        port = null;
    }
    disconnect();
});

// Botón para enviar mensaje
sendBtn.addEventListener('click', send);

// Enviar con Enter
sendInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') send();
});

// ============================================
// VERIFICACIÓN DE COMPATIBILIDAD
// ============================================

/**
 * Verifica si el navegador soporta Web Serial API
 * Muestra una alerta si no es compatible
 */
function checkSerialSupport() {
    if (!('serial' in navigator)) {
        log('Web Serial API no soportada en este navegador', 'error');
        alert('Tu navegador no soporta Web Serial API.\n\nUsa Chrome, Edge o Brave en versión 89 o superior.');
        selectPortBtn.disabled = true;
        connectBtn.disabled = true;
        return false;
    }
    return true;
}

// ============================================
// INICIALIZACIÓN
// ============================================

if (checkSerialSupport()) {
    log('Web Serial API disponible', 'info');
    updateStatus(false, 'Desconectado');
    connectBtn.textContent = 'Abrir Puerto';
}
