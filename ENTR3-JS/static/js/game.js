window.onload = ()=>{

    main();
    
    const botonPausa = document.querySelector('.pause-btn');
    botonPausa.addEventListener('click', pausarJuego);

    const botonRetry = document.querySelector('.retry-btn');
    botonRetry.addEventListener('click', retryJuego);
}



//VARIABLES



let pausa = false; 
let intervaloJuego;
let caerInterval
let moverIntervalX; 
let intervaloContador60; 
let intervaloContador5; 
let bloqueEnCaida;
let bloquesCorrectos; 
let listaBloques = [];
let bloquesGanados = []; 




//funcion que controla el inicio de juego
function juego(){
    if(pausa){
        return; 
    }
}
//simulador que inicia el juego cada segundo
function retryJuego(){
    //limpiamos los intervalos activos
    clearInterval(intervaloJuego);
    clearInterval(caerInterval);
    clearInterval(moverIntervalX);
    clearInterval(intervaloContador60);
    clearInterval(intervaloContador5);
    
    //borramos los bloques del DOM
    const bloques = document.querySelectorAll('.Bloque');
    bloques.forEach(bloque => bloque.remove());

        //limpiamos listas y estado
        listaBloques = [];
        bloquesGanados = [];
        bloquesPerdidos = [];
        actualizarContadorBloques(0);

    //detenemos los contadores y reiniciamos el juego
    pausa = false;
    if(intervaloContador60){
        clearInterval(intervaloContador60); //limpiamos el contador 60
    }
    setTimeout(() => {
        main();
        contadorInicio();
    }, 100);

}
//permite pausar y reanudar
function pausarJuego(){ 
    if (pausa){
        clearInterval(intervaloCaer);
        clearInterval(intervaloMover);
        clearInterval(intervaloContador60);
        clearInterval(intervaloContador5);
    } else{
        // caerInterval = setInterval(crearBloquesAuto, 1000);  
        intervaloContador60 = setInterval(contador60sec, 1000); 
        intervaloContador5 = setInterval(contador5sec, 1000);
        // contador60sec(() => {});
        // contador5sec(()=> {});
    }
    pausa = !pausa;
}
function crearBloquesAuto() {
    intervaloJuego = setInterval(() => {
        if (!pausa) crearBloques();
    }, 1000); 
}



//JUEGO



//CREAR BLOQUE Y GUARDAR EN LISTA 



function crearBloques(){ 
    if (bloqueEnCaida) {
        return; 
    }
    let gameSection = document.querySelector('.game-container');
    let bloque = document.createElement('div');
    
    bloque.style.position = 'absolute';
    bloque.className = 'Bloque';
    
    bloque.style.width =`${intervalAleatorio(30,80)}px`;
    bloque.style.height = `${intervalAleatorio(30,80)}px`
    bloque.style.background = `rgb(${intervalAleatorio(100, 255)}, ${intervalAleatorio(100, 255)}, ${intervalAleatorio(100, 255)})`;
    bloque.style.border = '1px solid white';
    bloque.style.margin = '1px';
    bloque.style.top = '0px';
    bloqueEnCaida = true;

    listaBloques.push(bloque);
    gameSection.appendChild(bloque);

    //CREA BLOQUES AUTOMATICAMENTE DESPUES DE CAER
    horizontalBloque(bloque).then(() => { 
        caerBloque(bloque).then(() => {
            bloqueEnCaida = false;
            crearBloques();
        });
    });
}
//hacer random para el ancho y alto de los bloques
function intervalAleatorio(min, max){ 
    return Math.random() * (max-min)+min;
}



// MOVIMIENTO DEL BLOQUE EN HORIZONTAL



function horizontalBloque(bloque) {
    return new Promise((resolve) => { 
        let posX = 0; 
        let direccion = 1;
        const velocidadX = 60;
        const intervaloX = 50; 
        const containerWidth = document.querySelector('.game-container').offsetWidth; 
        const bloqueWidth = bloque.offsetWidth; 

        bloque.style.position = 'absolute'; 

        let moverIntervalX = setInterval(() => {
            if (pausa) {
                clearInterval(moverIntervalX);
                return;
            }
            posX += velocidadX * direccion; 

            if (posX + bloqueWidth >= containerWidth) {
                direccion = -1;
                posX = containerWidth - bloqueWidth; 
            }
            if (posX <= 0) {
                direccion = 1; 
                posX = 0; 
            }

            bloque.style.left = `${posX}px`;  
        }, intervaloX);
        
        const gameContainer = document.querySelector('.game-container');

        gameContainer.addEventListener('click', function handler() {
            clearInterval(moverIntervalX); 
            resolve();
        }, 
        { once: true }
    );
    });
}



//CAIDA DEL BLOQUE AL HACER CLICK



function caerBloque(bloque) {
    return new Promise((resolve) => { 
        let pos = parseInt(bloque.style.top) || 0;
        const velocidad = 20; 
        const intervalo = 50; 

        const gameContainer = document.querySelector('.game-container').offsetHeight;
        const base = document.querySelector('.base');
        const baseTop = base.offsetTop;
        const bloqueHeight = bloque.offsetHeight;
        
        let alturaFinal = baseTop
        let limiteIzquierdo = 0;
        let limiteDerecho = gameContainer.offsetWidth;

        if (listaBloques.length > 1) {
            const ultimoBloque = listaBloques[listaBloques.length - 2]; 
            const alturaUltimoBloque = parseInt(ultimoBloque.style.top) || 0; 
            
            alturaFinal = alturaUltimoBloque;
            
            const anchoUltimoBloque = ultimoBloque.offsetWidth;
            const posicionHorizontalUltimoBloque = parseInt(ultimoBloque.style.left) || 0;

            limiteIzquierdo = posicionHorizontalUltimoBloque;
            limiteDerecho = posicionHorizontalUltimoBloque + anchoUltimoBloque;
        }
        const bloqueWidth = bloque.offsetWidth;

        caerInterval = setInterval(() => {
            if (pausa) {
                clearInterval(caerInterval); 
                return;
            }
            pos += velocidad; 
            bloque.style.top = `${pos}px`; 

            if (pos + bloqueHeight >= alturaFinal) {
                clearInterval(caerInterval); 

                const posicionHorizontalBloque = parseInt(bloque.style.left) || 0;

                if (posicionHorizontalBloque + bloqueWidth <= limiteIzquierdo || posicionHorizontalBloque >= limiteDerecho) 
                {
                    window.location.href = "./final.html";
                } 
                else 
                {
                    bloque.style.top = `${alturaFinal - bloqueHeight}px`;
                    listaBloques.push(bloque);
                    bloquesGanados.push(bloque);
                    actualizarContadorBloques(bloquesGanados.length);
                    // Cuando la torre llegue a 4 bloques, se va dezlizando para abajo. 
                    // De esta manera evitamos que colapsen los bloques en la parte superior del container
                    if (listaBloques.length > 6) {
                        bajarTorre();
                    }
                    resolve(); 
                }
            }
        }, intervalo);
    });
}
// BAJAR TORRE A MEDIDA QUE SE VAN APILANDO LOS BLOQUES
function bajarTorre() {
    const alturaBloque = listaBloques[0].offsetHeight; 

    const bloqueInferior = listaBloques.shift(); 
    bloqueInferior.remove(); 

    listaBloques.forEach((bloque) => {
        let posicionActual = parseInt(bloque.style.top) || 0;
        bloque.style.top = `${posicionActual + alturaBloque}px`;
    });
}



//CONTROL DE INICIO DEL JUEGO



function main() {
    actualizarContadorBloques(0);
    contadorInicio(() => {
        juego(()=> {})
        contador60sec(() => {})
        contador5sec(()=>{})
        crearBloquesAuto(()=> {})
    })
}



//CONTADORES



//CONTADOR 3 SEGUNDOS ANTES DE INICIAR



function contadorInicio(callback){

    let mensajeInicioJuego = document.createElement('div');
    mensajeInicioJuego.classList.add('mensaje');

    let blockCountdown = document.createElement('h2');
    mensajeInicioJuego.appendChild(blockCountdown);

    document.body.appendChild(mensajeInicioJuego);
	
	mensajeInicioJuego.style.position = 'fixed'; 
    mensajeInicioJuego.style.top = '50%'; 
    mensajeInicioJuego.style.left = '50%';  
    mensajeInicioJuego.style.transform = 'translate(-50%, -50%)'; 
    mensajeInicioJuego.style.fontFamily = "'Press Start', sans-serif"; 
    mensajeInicioJuego.style.textAlign = 'center'; 
    mensajeInicioJuego.style.zIndex = '9999';  
    mensajeInicioJuego.style.color = 'white'; 
    mensajeInicioJuego.style.fontSize = '30px';  
    mensajeInicioJuego.style.padding = '20px'; 
    mensajeInicioJuego.style.borderRadius = '10px';
    let tiempoRestante = 3;

    let interval = setInterval(()=>{
        blockCountdown.textContent = `${tiempoRestante}`;
        tiempoRestante--;

        if(tiempoRestante<0){
            clearInterval(interval);
            blockCountdown.textContent = "Empieza el juego!";

            setTimeout(()=>{
                mensajeInicioJuego.remove(); 
                callback();
            }, 1000);
        }
    },1000);
}



// CONTADOR 60 SEGUNDOS. TOTAL DE LA PARTIDA



function contador60sec(callback){ 
    let countdown = document.getElementById('countdown');
    let tiempoRestante = 60;

    intervaloContador60 = setInterval(()=>{
        if (pausa){
            clearInterval(intervaloContador60);
            return;
        }
        countdown.textContent = `${tiempoRestante}s`; 
        tiempoRestante--;

        if(tiempoRestante < 0){
            clearInterval(intervaloContador5);
            countdown.textContent = "Se acabó!"; 
            setTimeout(()=>{
                if(callback){
                    callback();
                    window.location.href = "./final.html"; 
                }
            }, 1000)
        }
    },1000);
}



// CONTADOR 5 SEGUNDOS. TIEMPO LIMITE PARA DAR CLICK AL BLOQUE



function contador5sec(callback) {
    let cincoSec = document.getElementById('time');
    let cont5 = 5;

    const gameContainer = document.querySelector('.game-container');
    intervaloContador5 = setInterval(() => {
        cincoSec.textContent = `${cont5}s click`;
        cont5--;
    
        if(pausa){
            clearInterval(intervaloContador5);
            return;
        }
        if(cont5 < 0){ 
            clearInterval(intervaloContador5);
            cincoSec.textContent = "KA-BOOM!";
            
            setTimeout(()=> {
                if(callback) {
                    callback();
                    window.location.href = "./final.html";
                } 
            },50);

        } else {
            gameContainer.addEventListener('click', function handler(){
                clearInterval(intervaloContador5); 
                contador5sec(callback); 
            }, {once:true});
        }

    },1000); 
}



// CONTADOR CANTIDAD DE BLOQUES CAIDOS CORRECTAMENTE


function actualizarContadorBloques(bloquesCorrectos){
    const score  = document.getElementById('score');
    score.textContent = bloquesCorrectos;
}