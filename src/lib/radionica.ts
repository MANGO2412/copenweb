export function RandomDigits(size:number){
    let ouput:string=""

    for(let i=0;i<size;i++){
        ouput+=Math.floor(Math.random()*10).toString()
    }
    return ouput
}

export function next(min:number,max:number){
    return Math.floor(Math.random() * (max - min + 1) + min);
}


export function ValorSugerido(){
     return next(-100,100).toFixed(2).toString()
}

export function ValorSugeridoPorcentaje(){
    return next(0,100).toFixed(2).toString()
}

export function generarCodigoRate(){
    return next(10000000,99999999).toString()
}



export function NivelSugerido(){
    const niveles = ["1 - PHYSICAL","2 - EMOTIONAL","3 - MENTAL",'4 - SPIRITUAL 1','5 - SPIRITUAL 2','6 - SPIRITUAL 3','7 - SPIRITUAL 4','8 - SPIRITUAL 5','9 - SPIRITUAL 6','10 - SPIRITUAL 7','11 - SPIRITUAL 8','12 - SPIRITUAL 9','13 - AUTOMATIC']
    return niveles[Math.floor(Math.random()*niveles.length)]
}

export function PotenciaSugerida(){
    const potencias = ["1X","3X","6X","10X","2X","12X","8X","24X","30X","50X","100X","200X","20C","40C",'50C','200C','1CM','1LM','2LM','3LM','6LM','10LM','16LM','20LM','30LM','1M','2M','5M','10M','50M','500M','1MM','2MM','5MM','10MM']
    return potencias[Math.floor(Math.random()*potencias.length)]
}