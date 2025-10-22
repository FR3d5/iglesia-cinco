import * as THREE from 'https://esm.sh/three@0.161.0';
import { GLTFLoader } from 'https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'https://esm.sh/three@0.161.0/examples/jsm/controls/PointerLockControls.js';

let camera, scene, renderer, controls;
let clock;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let finalPosition = new THREE.Vector3();
let targetPosition = null;
let targetRotation = null;
const overlay = document.getElementById('overlay');

const CAMERA_MODAL_VIEW_OFFSET = new THREE.Vector3(50, 0, 30);
const CAMERA_SPEED = 0.08; 
const CAMERA_VIEWS = {
  'modal-contacto': new THREE.Vector3(60, -10, -30),
  'modal-sobremi': new THREE.Vector3(60, -10, -30),
  'modal-galeria': new THREE.Vector3(70, -10, 30),
  'modal-informacion': new THREE.Vector3(0, -10, -50),
  'modal-modelo3d': new THREE.Vector3(-50, 30, 0),
};

const CAMERA_ROTATIONS = {
  'modal-galeria': { y: -Math.PI },     
  'modal-informacion': { y: -Math.PI*2},
  'modal-modelo3d': { y: -Math.PI / 2 },               
  'modal-sobremi': { y: 0},   
  'modal-contacto': { y: Math.PI*1.2 }
};

function showModalMessage(message) {
    const modal = document.createElement('div');
    modal.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl z-50 max-w-sm text-center border-4 border-blue-500';
    modal.innerHTML = `
        <p class="text-gray-800 text-lg mb-4">${message}</p>
        <button onclick="this.parentNode.remove()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200 shadow-md">
            Cerrar
        </button>
    `;
    document.body.appendChild(modal);
}
window.alert = showModalMessage;

function esMovil() {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
}

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    controls = new PointerLockControls(camera, document.body);

    const isMobile = esMovil();

    if (isMobile) {
        overlay.innerHTML = "<p class='text-xl'>Gira la pantalla para interactuar. Usa los botones para moverte.</p>";
        overlay.style.display = "flex";
        crearControlesMoviles();
    } else {
        overlay.innerHTML = "<p class='text-xl'>Haz clic para mover la cámara (W, A, S, D).</p>";
        overlay.addEventListener("click", () => {
            controls.lock();
        });
    }

    controls.addEventListener("lock", () => {
        overlay.style.display = "none";
    });
    controls.addEventListener("unlock", () => {
        overlay.style.display = "flex";
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(10, 10, 5);
    scene.add(dirLight);

    loadMainScene();

    if (!isMobile) {
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("keyup", onKeyUp);
    }

    clock = new THREE.Clock();
    window.addEventListener("resize", onWindowResize, false);
}

function loadMainScene() {
    const loader = new GLTFLoader();
    loader.load("https://fr3d5.github.io/modelointerior/public/scenesinflores.glb", function (gltf) {
        const model = gltf.scene;
        scene.add(model);
        
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        
        finalPosition.set(center.x - 50, center.y - 70, center.z);
        
        camera.position.copy(finalPosition);
        camera.rotation.y = -1.6;
        controls.getObject().position.copy(camera.position);

        loadFlowers(finalPosition.clone().add(new THREE.Vector3(120, -12, 50)));
        loadFlowers2(finalPosition.clone().add(new THREE.Vector3(120, -12, -55)));
        loadFlowers3(finalPosition.clone().add(new THREE.Vector3(110, -12, -5)));
        loadFlowers4(finalPosition.clone().add(new THREE.Vector3(110, -12, 5)));
        loadFlowers5(finalPosition.clone().add(new THREE.Vector3(120, -12, -65)));
        loadFlowers6(finalPosition.clone().add(new THREE.Vector3(120, -12, 60)));
    }, undefined, function (error) {
        showModalMessage('Error al cargar scenesinflores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar scenesinflores.glb:', error);
    });
}

function loadFlowers(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/flornormal/public/flores.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(11, 11, 11);
        model2.position.copy(position);
        scene.add(model2);
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
    });
}

function loadFlowers2(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/flornormal/public/flores.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(12, 12, 12);
        model2.position.copy(position);
        scene.add(model2);
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
    });
}

function loadFlowers3(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/floresrojas/public/floresrojo.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(12, 12, 12);
        model2.position.copy(position);
        scene.add(model2);
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
    });
}

function loadFlowers4(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/floresrojas/public/floresrojo.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(12, 12, 12);
        model2.position.copy(position);
        scene.add(model2);
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
    });
}

function loadFlowers5(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/floresrojas/public/floresrojo.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(12, 12, 12);
        model2.position.copy(position);
        scene.add(model2);
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
    });
}

function loadFlowers6(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/floresrojas/public/floresrojo.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(12, 12, 12);
        model2.position.copy(position);
        scene.add(model2);
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
    });
}

function onKeyDown(event) {
    switch (event.code) {
        case "KeyW": moveForward = true; break;
        case "KeyA": moveLeft = true; break;
        case "KeyS": moveBackward = true; break;
        case "KeyD": moveRight = true; break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case "KeyW": moveForward = false; break;
        case "KeyA": moveLeft = false; break;
        case "KeyS": moveBackward = false; break;
        case "KeyD": moveRight = false; break;
    }
}

function lerpAngle(start, end, t) {
    let diff = end - start;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return start + diff * t;
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const speed = 15;

    if (controls.isLocked) {
        if (moveForward) controls.moveForward(speed * delta);
        if (moveBackward) controls.moveForward(-speed * delta);
        if (moveLeft) controls.moveRight(-speed * delta);
        if (moveRight) controls.moveRight(speed * delta);
    }

    if (targetPosition) {
        controls.getObject().position.lerp(targetPosition, CAMERA_SPEED);
        if (controls.getObject().position.distanceTo(targetPosition) < 0.1) {
            targetPosition = null;
        }
    }
    
    if (targetRotation && camera) {
        camera.rotation.y = lerpAngle(camera.rotation.y, targetRotation.y, CAMERA_SPEED);
        
        if (Math.abs(camera.rotation.y - targetRotation.y) < 0.01) {
            camera.rotation.y = targetRotation.y;
            targetRotation = null;
        }
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function crearControlesMoviles() {
    const pad = document.createElement("div");
    pad.className = "controles-moviles";
    pad.innerHTML = `
    <div class="botones">
        <button id="btn-up">▲</button>
        <div>
            <button id="btn-left">◀</button>
            <button id="btn-right">▶</button>
        </div>
        <button id="btn-down">▼</button>
    </div>
    `;
    document.body.appendChild(pad);

    document.getElementById("btn-up").addEventListener("touchstart", () => moveForward = true);
    document.getElementById("btn-up").addEventListener("touchend", () => moveForward = false);
    document.getElementById("btn-down").addEventListener("touchstart", () => moveBackward = true);
    document.getElementById("btn-down").addEventListener("touchend", () => moveBackward = false);
    document.getElementById("btn-left").addEventListener("touchstart", () => moveLeft = true);
    document.getElementById("btn-left").addEventListener("touchend", () => moveLeft = false);
    document.getElementById("btn-right").addEventListener("touchstart", () => moveRight = true);
    document.getElementById("btn-right").addEventListener("touchend", () => moveRight = false);
}
var abrirBotones = document.querySelectorAll('a[id^="abrir-modal-"]');
var cerrarBotones = document.querySelectorAll('.cerrar-modal');
var modales = document.querySelectorAll('.modal');

function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (controls && controls.isLocked) controls.unlock();

    if (finalPosition) {
        const offset = CAMERA_VIEWS[modalId] || CAMERA_MODAL_VIEW_OFFSET;
        targetPosition = finalPosition.clone().add(offset);
    } else {
        targetPosition = controls.getObject().position.clone().add(new THREE.Vector3(0, 1, 0));
    }

    targetRotation = CAMERA_ROTATIONS[modalId] || { y: camera.rotation.y };

    modal.style.display = 'block';
}

function cerrarModal(modalElement) {
    modalElement.style.display = 'none';
    
    if (finalPosition) {
        targetPosition = finalPosition.clone();
        targetRotation = { y: -1.6 };
    }
}

abrirBotones.forEach(btn => {
    btn.addEventListener('click', (event) => {
        event.preventDefault();
        const modalId = btn.id.replace('abrir-', '');
        abrirModal(modalId);
    });
});

cerrarBotones.forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (modal) cerrarModal(modal);
    });
});

window.addEventListener('click', (event) => {
    modales.forEach(modal => {
        if (event.target === modal) cerrarModal(modal);
    });
});

const iframeModal = document.getElementById('modal-paginas');
const iframeVentana = document.getElementById('iframeVentana');

const btnInicio = document.getElementById('abrir-inicio');
const btnGaleria = document.getElementById('abrir-galeria');
const btnInformacion = document.getElementById('abrir-informacion');
const btnModelo3D = document.getElementById('abrir-modelo3d');

function abrirIframe(url, modalId) {
    if (controls && controls.isLocked) controls.unlock();

    if (finalPosition) {
        const offset = CAMERA_VIEWS[modalId] || CAMERA_MODAL_VIEW_OFFSET;
        targetPosition = finalPosition.clone().add(offset);
    } else {
        targetPosition = controls.getObject().position.clone().add(new THREE.Vector3(0, 1, 0));
    }

    targetRotation = CAMERA_ROTATIONS[modalId] || { y: camera.rotation.y };

    iframeVentana.src = url;
    iframeModal.style.display = 'flex';
    if (overlay) overlay.style.display = 'none';
    setTimeout(() => {
        const h1 = document.querySelector('h1');
        const h2 = document.querySelector('.posicion1');
        if (h1) h1.classList.add('posicion-final-h1');
        if (h2) h2.classList.add('posicion-final-h2');
    }, 100);
    
    configurarScrollIframe();
}

function restaurarTitulos() {
    const h1 = document.querySelector('h1');
    const h2 = document.querySelector('.posicion1');
    if (h1) h1.classList.remove('posicion-final-h1');
    if (h2) h2.classList.remove('posicion-final-h2');
    if (overlay) overlay.style.display = 'flex';
}

if (btnInicio) {
    btnInicio.addEventListener('click', (e) => {
        e.preventDefault();
        if (controls && controls.isLocked) controls.unlock();
        
        restaurarTitulos();
        
        if (finalPosition) {
            targetPosition = finalPosition.clone();
            targetRotation = { y: -1.6 };
        }
    });
}

if (btnGaleria) {
    btnGaleria.addEventListener('click', (e) => {
        e.preventDefault();
        abrirIframe('galeria.html', 'modal-galeria');
    });
}

if (btnInformacion) {
    btnInformacion.addEventListener('click', (e) => {
        e.preventDefault();
        abrirIframe('informacion.html', 'modal-informacion');
    });
}

if (btnModelo3D) {
    btnModelo3D.addEventListener('click', (e) => {
        e.preventDefault();
        abrirIframe('interior.html', 'modal-modelo3d');
    });
}

function configurarScrollIframe() {
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'iframe-scroll') {
            const scrollDelta = event.data.deltaY;
            const moveSpeed = 0.5;
            
            if (scrollDelta < 0) {
                controls.getObject().position.x += moveSpeed;
            } else {
                controls.getObject().position.x -= moveSpeed;
            }
        }
    });
}

// Cierre del modal iframe + volver cámara
iframeModal.querySelector('.cerrar-modal').addEventListener('click', () => {
    // 🔸 Primero restaurar los títulos
    restaurarTitulos();
    
    // 🔸 Luego cerrar el modal con un pequeño delay para que se vea la transición
    setTimeout(() => {
        iframeModal.style.display = 'none';
        iframeVentana.src = '';
    }, 300);
    
    if (finalPosition) {
        targetPosition = finalPosition.clone();
        targetRotation = { y: -1.6 }; // Rotación inicial
    }
});

window.addEventListener('click', (e) => {
    if (e.target === iframeModal) {
        // 🔸 Primero restaurar los títulos
        restaurarTitulos();
        
        // 🔸 Luego cerrar el modal con un pequeño delay para que se vea la transición
        setTimeout(() => {
            iframeModal.style.display = 'none';
            iframeVentana.src = '';
        }, 300);
        
        if (finalPosition) {
            targetPosition = finalPosition.clone();
            targetRotation = { y: -1.6 }; // Rotación inicial
        }
    }
});

// =======================
// 🔹 MENÚ DESPLEGABLE
// =======================
const menu = document.querySelector('#workarea');
const toggle = document.querySelector('.menu-toggle');

toggle.addEventListener('click', () => {
    menu.classList.toggle('workarea-open');
});