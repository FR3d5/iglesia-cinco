// ========== FUNCIONES DE CONTROLES DE VIDEO ==========

function crearControlesVideo() {
    const controles = document.createElement('div');
    controles.id = 'video-controls-container';
    controles.innerHTML = `
        <div class="video-controls-panel">
            <div class="video-info">
                <span id="video-tiempo">0:00</span>
                <span class="video-duracion"> / <span id="video-duracion-total">0:00</span></span>
            </div>
            
            <div class="video-barra-progreso">
                <div id="video-progress-bar" class="progress-bar">
                    <div id="video-progress-fill" class="progress-fill"></div>
                </div>
            </div>
            
            <div class="video-botones">
                <button id="btn-play-pause" class="btn-video" title="Play/Pause">▶️</button>
                <button id="btn-stop" class="btn-video" title="Detener">⏹️</button>
                <button id="btn-retroceso" class="btn-video" title="Retroceso 5s">⏪</button>
                <button id="btn-avance" class="btn-video" title="Avance 5s">⏩</button>
                <div class="separador-controles"></div>
                <button id="btn-volumen" class="btn-video" title="Volumen">🔊</button>
                <input id="slider-volumen" type="range" min="0" max="100" value="5" class="slider-volumen">
                <div class="separador-controles"></div>
                <button id="btn-pantalla-completa" class="btn-video" title="Pantalla Completa">⛶</button>
                <button id="btn-cerrar-controles" class="btn-video" title="Cerrar">✕</button>
            
            
            <div class="video-velocidad">
            <p>f para ver el video</p>
                <select id="select-velocidad" class="select-velocidad">
                    <option value="0.5">0.5x</option>
                    <option value="1" selected>1x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                </select>
            </div>
            </div>
        </div>
    `;

    document.body.appendChild(controles);
    inicializarControlesVideo();
}

function inicializarControlesVideo() {
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btnStop = document.getElementById('btn-stop');
    const btnRetroceso = document.getElementById('btn-retroceso');
    const btnAvance = document.getElementById('btn-avance');
    const btnVolumen = document.getElementById('btn-volumen');
    const sliderVolumen = document.getElementById('slider-volumen');
    const btnPantallaCompleta = document.getElementById('btn-pantalla-completa');
    const btnCerrarControles = document.getElementById('btn-cerrar-controles');
    const selectVelocidad = document.getElementById('select-velocidad');
    const progressBar = document.getElementById('video-progress-bar');

    btnPlayPause.addEventListener('click', () => {
        if (!window.globalVideoState.video) return;

        const nuevoEstado = !window.globalVideoState.isPlaying;
        
        if (nuevoEstado) {
             window.globalVideoState.video.muted = false;
        }
        
        actualizarEstadoGlobal(nuevoEstado);
        btnPlayPause.textContent = nuevoEstado ? '⏸️' : '▶️';
        console.log(nuevoEstado ? '▶️ Reproduciendo' : '⏸️ Pausado');
        mostrarControlesVideo();
    });

    btnStop.addEventListener('click', () => {
        if (!window.globalVideoState.video) return;
        window.globalVideoState.video.pause();
        window.globalVideoState.video.currentTime = 0;
        window.globalVideoState.isPlaying = false;
        btnPlayPause.textContent = '▶️';
        actualizarBarraProgreso();
        console.log('⏹️ Detenido');
    });

    btnRetroceso.addEventListener('click', () => {
        if (!window.globalVideoState.video) return;
        window.globalVideoState.video.currentTime = Math.max(0, window.globalVideoState.video.currentTime - 5);
        console.log('⏪ Retroceso a:', window.globalVideoState.video.currentTime);
        mostrarControlesVideo();
    });

    btnAvance.addEventListener('click', () => {
        if (!window.globalVideoState.video) return;
        window.globalVideoState.video.currentTime = Math.min(window.globalVideoState.video.duration, window.globalVideoState.video.currentTime + 5);
        console.log('⏩ Avance a:', window.globalVideoState.video.currentTime);
        mostrarControlesVideo();
    });

    btnVolumen.addEventListener('click', () => {
        if (!window.globalVideoState.video) return;

        window.globalVideoState.video.muted = false;

        if (window.globalVideoState.video.volume > 0) {
            window.globalVideoState.video.volume = 0;
            btnVolumen.textContent = '🔇';
            sliderVolumen.value = 0;
        } else {
            window.globalVideoState.video.volume = sliderVolumen.value / 100;
            if (window.globalVideoState.video.volume === 0) window.globalVideoState.video.volume = 0.5;
            btnVolumen.textContent = window.globalVideoState.video.volume < 0.5 ? '🔉' : '🔊';
            sliderVolumen.value = window.globalVideoState.video.volume * 100;
        }
    });

    sliderVolumen.addEventListener('input', (e) => {
        if (!window.globalVideoState.video) return;
        
        window.globalVideoState.video.muted = false;
        window.globalVideoState.video.volume = e.target.value / 100;
        
        if (window.globalVideoState.video.volume === 0) {
            btnVolumen.textContent = '🔇';
        } else if (window.globalVideoState.video.volume < 0.5) {
            btnVolumen.textContent = '🔉';
        } else {
            btnVolumen.textContent = '🔊';
        }
    });

    btnPantallaCompleta.addEventListener('click', () => {
        if (!window.globalVideoState.video) return;
        if (window.globalVideoState.video.requestFullscreen) {
            window.globalVideoState.video.requestFullscreen().catch(err => console.error('Error:', err));
        }
    });

    btnCerrarControles.addEventListener('click', () => {
        if (window.desactivarModoCine) {
            window.desactivarModoCine();
        } else {
            ocultarControlesVideo();
        }
    });

    selectVelocidad.addEventListener('change', (e) => {
        if (!window.globalVideoState.video) return;
        window.globalVideoState.video.playbackRate = parseFloat(e.target.value);
    });

    progressBar.addEventListener('click', (e) => {
        if (!window.globalVideoState.video) return;
        const rect = progressBar.getBoundingClientRect();
        const porcentaje = (e.clientX - rect.left) / rect.width;
        window.globalVideoState.video.currentTime = porcentaje * window.globalVideoState.video.duration;
    });

    setInterval(() => {
        if (window.globalVideoState.video && window.globalVideoState.isPlaying) {
            actualizarBarraProgreso();
        }
    }, 100);
}

function actualizarBarraProgreso() {
    if (window.globalVideoState.video) {
        const progressFill = document.getElementById('video-progress-fill');
        const tiempoActual = document.getElementById('video-tiempo');
        const duracionTotal = document.getElementById('video-duracion-total');

        if (window.globalVideoState.video.duration) {
            const porcentaje = (window.globalVideoState.video.currentTime / window.globalVideoState.video.duration) * 100;
            progressFill.style.width = porcentaje + '%';
            tiempoActual.textContent = formatearTiempo(window.globalVideoState.video.currentTime);
            duracionTotal.textContent = formatearTiempo(window.globalVideoState.video.duration);
        }
    }
}

function formatearTiempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segs = Math.floor(segundos % 60);
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
}

function mostrarControlesVideo() {
    let container = document.getElementById('video-controls-container');
    
    if (!container) {
        console.log('🎬 Creando controles de video por primera vez...');
        crearControlesVideo();
        container = document.getElementById('video-controls-container');
    }
    
    if (container) {
        const panel = container.querySelector('.video-controls-panel');
        if (panel) {
            panel.classList.add('mostrar');
        }
    }
}

function ocultarControlesVideo() {
    const container = document.getElementById('video-controls-container');
    if (container) {
        const panel = container.querySelector('.video-controls-panel');
        if (panel) {
            panel.classList.remove('mostrar');
        }
        
        // Si no estamos en pointer lock (mouse libre), mostrar el overlay de "Click para jugar"
        if (!document.pointerLockElement) {
            const overlay = document.getElementById('overlay');
            if (overlay) overlay.style.display = 'flex';
        }
    }
}

function actualizarEstadoGlobal(shouldPlay) {
    if (!window.globalVideoState.video) return;

    if (shouldPlay && window.globalVideoState.video.paused) {
        window.globalVideoState.video.play().catch(e => console.error('Error:', e));
        window.globalVideoState.isPlaying = true;
    } else if (!shouldPlay && !window.globalVideoState.video.paused) {
        window.globalVideoState.video.pause();
        window.globalVideoState.isPlaying = false;
    }
}


// ========== ATAJOS DE TECLADO PARA VIDEO ==========
document.addEventListener('keydown', (e) => {
    if (!window.globalVideoState.video) return;

    const btnPlayPause = document.getElementById('btn-play-pause');

    switch (e.code) {
        case 'Space':
            e.preventDefault();
            const nuevoEstado = !window.globalVideoState.isPlaying;
            actualizarEstadoGlobal(nuevoEstado);
            if (btnPlayPause) btnPlayPause.textContent = nuevoEstado ? '⏸️' : '▶️';
            mostrarControlesVideo();
            break;

        case 'ArrowRight':
            e.preventDefault();
            window.globalVideoState.video.currentTime = Math.min(window.globalVideoState.video.duration, window.globalVideoState.video.currentTime + 5);
            mostrarControlesVideo();
            break;

        case 'ArrowLeft':
            e.preventDefault();
            window.globalVideoState.video.currentTime = Math.max(0, window.globalVideoState.video.currentTime - 5);
            mostrarControlesVideo();
            break;

        case 'ArrowUp':
            e.preventDefault();
            window.globalVideoState.video.volume = Math.min(1, window.globalVideoState.video.volume + 0.1);
            const sliderUp = document.getElementById('slider-volumen');
            if (sliderUp) sliderUp.value = window.globalVideoState.video.volume * 100;
            mostrarControlesVideo();
            break;

        case 'ArrowDown':
            e.preventDefault();
            window.globalVideoState.video.volume = Math.max(0, window.globalVideoState.video.volume - 0.1);
            const sliderDown = document.getElementById('slider-volumen');
            if (sliderDown) sliderDown.value = window.globalVideoState.video.volume * 100;
            mostrarControlesVideo();
            break;

        case 'KeyF':
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (window.activarModoCine) {
                window.activarModoCine();
            }
            return false; // Asegurar que no se ejecute nada más
            break;

        // Escape removed to prevent conflict with PointerLock unlock
    }
});

// ========== INICIALIZAR CONTROLES AL CARGAR ==========
// Los controles se crean dinámicamente cuando se presiona F (modo cine)
// NO se crean al cargar la página para evitar que sean visibles

// Exponer funciones al scope global para scriptinterior.js
window.mostrarControlesVideo = mostrarControlesVideo;
window.ocultarControlesVideo = ocultarControlesVideo;
