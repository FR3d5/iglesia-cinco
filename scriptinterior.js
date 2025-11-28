import * as THREE from 'https://esm.sh/three@0.161.0';
import { GLTFLoader } from 'https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://esm.sh/three@0.161.0/examples/jsm/loaders/FBXLoader.js';
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
let ambientLight;
let spotLight;
let pointLight;
const overlay = document.getElementById('overlay');

// Loading indicator variables
let loadingOverlay;
let loadingProgress;
let loadingBar;
let modelsToLoad = 7;
let modelsLoaded = 0;

let isIframeOpen = false;
let currentIframeBaseX = 0;

// ✅ ESTADO GLOBAL DEL VIDEO
window.globalVideoState = {
    video: null,
    isPlaying: false,
    planes: [],
    textures: []
};

let videoControlsVisible = false;

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let currentOpenModal = null;

// Raycaster para detectar interacción con video
const raycaster = new THREE.Raycaster();
const screenCenter = new THREE.Vector2(0, 0);
window.isLookingAtVideo = false;
let isCinemaModeAnimating = false;
let initialCameraPosition = null;
let initialCameraRotation = null;

window.activarModoCine = function() {
    if (isCinemaModeAnimating || window.globalVideoState.planes.length === 0) return;
    
    if (controls && controls.isLocked) {
        controls.unlock();
    }
    
    const plane = window.globalVideoState.planes[0];
    if (!initialCameraPosition) {
        initialCameraPosition = camera.position.clone();
        initialCameraRotation = { x: camera.rotation.x, y: camera.rotation.y, z: camera.rotation.z };
    }
    
    const targetPlanePos = plane.position.clone();
    
    if (window.globalVideoState.video) {
        if (window.globalVideoState.video.paused) {
            window.globalVideoState.video.play().catch(e => console.error(e));
            window.globalVideoState.isPlaying = true;
        }
        window.globalVideoState.video.muted = false;
        window.globalVideoState.video.volume = 0.5;
        
        const sliderVolumen = document.getElementById('slider-volumen');
        if (sliderVolumen) sliderVolumen.value = 50;
    }
    
    const startPlanePos = targetPlanePos.clone();
    startPlanePos.y += 50;
    
    plane.visible = true;
    plane.position.copy(startPlanePos);
    
    const targetCameraPos = targetPlanePos.clone();
    targetCameraPos.x -= 40;
    targetCameraPos.y = targetPlanePos.y;
    targetCameraPos.z = targetPlanePos.z;
    
    const startCameraPos = camera.position.clone();
    const startCameraRot = { x: camera.rotation.x, y: camera.rotation.y, z: camera.rotation.z };
    const targetCameraRot = { x: 0, y: -Math.PI / 2, z: 0 };
    
    isCinemaModeAnimating = true;
    if (window.ocultarControlesVideo) window.ocultarControlesVideo();
    
    const duration = 2000;
    const startTime = Date.now();
    
    function animateCinema() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const eased = 1 - Math.pow(1 - progress, 3);
        
        plane.position.lerpVectors(startPlanePos, targetPlanePos, eased);
        camera.position.lerpVectors(startCameraPos, targetCameraPos, eased);
        
        camera.rotation.x = startCameraRot.x + (targetCameraRot.x - startCameraRot.x) * eased;
        camera.rotation.y = lerpAngle(startCameraRot.y, targetCameraRot.y, eased);
        camera.rotation.z = startCameraRot.z + (targetCameraRot.z - startCameraRot.z) * eased;
        
        if (progress < 1) {
            requestAnimationFrame(animateCinema);
        } else {
            isCinemaModeAnimating = false;
            plane.position.copy(targetPlanePos);
            camera.position.copy(targetCameraPos);
            camera.rotation.set(targetCameraRot.x, targetCameraRot.y, targetCameraRot.z);
            
            if (window.mostrarControlesVideo) window.mostrarControlesVideo();
        }
    }
    
    animateCinema();
};

window.desactivarModoCine = function() {
    if (isCinemaModeAnimating || window.globalVideoState.planes.length === 0) return;
    
    const plane = window.globalVideoState.planes[0];
    if (!plane.visible) return;
    
    if (window.globalVideoState.video) {
        window.globalVideoState.video.pause();
        window.globalVideoState.isPlaying = false;
    }
    
    if (window.ocultarControlesVideo) window.ocultarControlesVideo();
    
    const startPlanePos = plane.position.clone();
    const targetPlanePos = startPlanePos.clone();
    targetPlanePos.y += 50;
    
    const startCameraPos = camera.position.clone();
    const startCameraRot = { x: camera.rotation.x, y: camera.rotation.y, z: camera.rotation.z };
    
    const targetCameraPos = initialCameraPosition || finalPosition.clone();
    const targetCameraRot = initialCameraRotation || { x: 0, y: -1.6, z: 0 };
    
    isCinemaModeAnimating = true;
    
    const duration = 1500;
    const startTime = Date.now();
    
    function animateExit() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const eased = progress * progress * progress;
        
        plane.position.lerpVectors(startPlanePos, targetPlanePos, eased);
        camera.position.lerpVectors(startCameraPos, targetCameraPos, eased);
        
        camera.rotation.x = startCameraRot.x + (targetCameraRot.x - startCameraRot.x) * eased;
        camera.rotation.y = lerpAngle(startCameraRot.y, targetCameraRot.y, eased);
        camera.rotation.z = startCameraRot.z + (targetCameraRot.z - startCameraRot.z) * eased;
        
        if (progress < 1) {
            requestAnimationFrame(animateExit);
        } else {
            isCinemaModeAnimating = false;
            plane.visible = false;
            plane.position.copy(startPlanePos);
            camera.position.copy(targetCameraPos);
            camera.rotation.set(targetCameraRot.x, targetCameraRot.y, targetCameraRot.z);
            
            window.isLookingAtVideo = false;
        }
    }
    
    animateExit();
};

// SISTEMA DE MODELOS DINÁMICOS 3D

const dynamicModels = {
  'modal-galeria': null,
  'modal-informacion': null,
  'modal-modelo3d': null
};

const mixers = [];

const MODEL_POSITIONS = {
  'modal-galeria': new THREE.Vector3(13,0,17),
  'modal-informacion': new THREE.Vector3(-80,-10,-67),
  'modal-modelo3d': new THREE.Vector3(-50, 30, -15)
};

const ANIMATION_CONFIG = {
  'modal-galeria': 'from-above',
  'modal-informacion': 'from-below',
  'modal-modelo3d': 'from-above'
};

const MODEL_PATHS = {
  'modal-galeria': 'public/modelos/padresito2.glb',
  'modal-informacion': 'https://fr3d5.github.io/romano/public/romano1.fbx',
  'modal-modelo3d': 'public/modelos/esena5.glb'
};

const MODEL_SCALES = {
  'modal-galeria': { x: 20, y: 20, z: 20 },
  'modal-informacion': { x: 0.2, y: 0.2, z: 0.2 },
  'modal-modelo3d': { x: 0.3, y: 0.3, z: 0.3 }
};

// CONFIGURACIÓN DE ROTACIÓN Y ANIMACIÓN

const MODEL_ROTATION_SPEEDS = {
  'modal-galeria': 0.005,
  'modal-informacion': 0.01,
  'modal-modelo3d': 0.002
};

const MODEL_ANIMATION_SPEEDS = {
  'modal-galeria': 1.0,
  'modal-informacion': 0.8,
  'modal-modelo3d': 1.0
};

// Rotación inicial del modelo (en radianes)
// Ajusta esto para que el modelo mire al frente correctamente al aparecer
const MODEL_INITIAL_ROTATIONS = {
  'modal-galeria': { x: 0, y: Math.PI / 2, z: 0 },
  'modal-informacion': { x: 0, y: 0, z: 0 },
  'modal-modelo3d': { x: 0, y: -Math.PI, z: 0 }
};

function loadAndAnimateModel(modalId, modelPath) {
  const isFBX = modelPath.toLowerCase().endsWith('.fbx');
  const loader = isFBX ? new FBXLoader() : new GLTFLoader();
  
  loader.load(modelPath, (loadedObject) => {
    const model = isFBX ? loadedObject : loadedObject.scene;
    
    if (currentOpenModal !== modalId) {
        return;
    }
    const scale = MODEL_SCALES[modalId];
    if (scale) {
        model.scale.set(scale.x, scale.y, scale.z);
    }
    
    const targetPos = MODEL_POSITIONS[modalId].clone();
    const startPos = targetPos.clone();
    const direction = ANIMATION_CONFIG[modalId] || 'from-above';
    
    if (direction === 'from-above') {
        startPos.y = 80; // Arriba
    } else {
        startPos.y = -80; // Abajo
    }
    
    model.position.copy(startPos);
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const initialRot = MODEL_INITIAL_ROTATIONS[modalId];
    if (initialRot) {
        model.rotation.set(initialRot.x, initialRot.y, initialRot.z);
    }

    const animations = isFBX ? loadedObject.animations : loadedObject.animations;
    if (animations && animations.length > 0) {
        const mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(animations[0]);
        
        const animSpeed = MODEL_ANIMATION_SPEEDS[modalId] !== undefined ? MODEL_ANIMATION_SPEEDS[modalId] : 1.0;
        action.setEffectiveTimeScale(animSpeed);
        
        action.play();
        mixers.push(mixer);
    }
    
    dynamicModels[modalId] = model;
    scene.add(model);
    
    animateModelEntrance(model, targetPos);
  }, undefined, (error) => {
    console.error(`Error al cargar modelo para ${modalId}:`, error);
  });
}
function animateModelEntrance(model, targetPos) {
  const duration = 2500; 
  const startTime = Date.now();
  const startPos = model.position.clone();
  
  function animate() {
    if (!model.parent) return;

    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const eased = 1 - Math.pow(1 - progress, 3);
    
    model.position.lerpVectors(startPos, targetPos, eased);
    
    model.position.lerpVectors(startPos, targetPos, eased);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  animate();
}

function animateModelExit(model, callback) {
  const duration = 800;
  const startTime = Date.now();
  const startPos = model.position.clone();
  const targetPos = startPos.clone();
  
  targetPos.y = 100; 
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const eased = progress * progress * progress;
    
    model.position.lerpVectors(startPos, targetPos, eased);
    model.rotation.y += 0.02;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      scene.remove(model);
      if (callback) callback();
    }
  }
  
  animate();
}


const CAMERA_MODAL_VIEW_OFFSET = new THREE.Vector3(50, 0, 30);
const CAMERA_SPEED = 0.08; 
const CAMERA_VIEWS = {
  'modal-contacto': new THREE.Vector3(60, -10, -30),
  'modal-sobremi': new THREE.Vector3(60, -10, -30),
  'modal-galeria': new THREE.Vector3(70, -10, 30),
  'modal-informacion': new THREE.Vector3(-3, -5, -20),
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
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (window.innerWidth <= 768);
}

function updateLoadingProgress() {
    modelsLoaded++;
    const progress = Math.round((modelsLoaded / modelsToLoad) * 100);
    
    if (loadingProgress) {
        loadingProgress.textContent = `${progress}%`;
    }
    if (loadingBar) {
        loadingBar.style.width = `${progress}%`;
    }
    
    if (modelsLoaded >= modelsToLoad) {
        setTimeout(() => {
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 500);
            }
        }, 300);
    }
}

loadingOverlay = document.getElementById('loading-overlay');
loadingProgress = document.getElementById('loading-progress');
loadingBar = document.getElementById('loading-bar');

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

        document.addEventListener("mousedown", () => {
            if (controls.isLocked && window.isLookingAtVideo) {
                controls.unlock();
            }
        });
    }

    controls.addEventListener("lock", () => {
        overlay.style.display = "none";
    });
    controls.addEventListener("unlock", () => {
        if (!window.isLookingAtVideo && !videoControlsVisible) {
            overlay.style.display = "flex";
        }
    });

    const savedMode = localStorage.getItem('modoLuz');
    const initialIntensity = (savedMode === '1') ? 2.5 : 0.5;
    ambientLight = new THREE.AmbientLight(0xffffff, initialIntensity);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(-20, 50, 10);
    scene.add(dirLight);

    loadMainScene();

    if (!isMobile) {
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("keyup", onKeyUp);
    }

    clock = new THREE.Clock();
    window.addEventListener("resize", onWindowResize, false);
    luz(24,112,-26);
    luz(-5,112,-26);
    luz(-34,112,-26);
    luz(-65,112,-26);
    luz(-94,112,-26);

    luz(33,13,47);
    luz(10,13,47);
    luz(-13,13,47);
    luz(-35,13,47);
    luz(-57,13,47);
    luz(-79,13,47);
    luz(-101,13,47);
    
    luz(33,13,-97);
    luz(10,13,-97);
    luz(-13,13,-97);
    luz(-35,13,-97);
    luz(-57,13,-97);
    luz(-79,13,-97);
    luz(-101,13,-97);

    luz2(-25,110,-25);
    luz2(25,110,-25);
    luz2(-5,112,-26);
    luz2(-34,112,-26);
    luz2(-65,112,-26);
    luz2(-94,112,-26);

    renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}
function luz(x,y,z){
    pointLight = new THREE.PointLight(0xffffff, 100, 150);
    pointLight.position.set(x,y,z);
    scene.add(pointLight);
}
function luz2(x,y,z){
spotLight = new THREE.SpotLight(0xffffff, 400);
spotLight.position.set(x,y,z);

spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.camera.near = 10;
spotLight.shadow.camera.far = 300;
spotLight.shadow.focus = 1; 
spotLight.shadow.bias = -0.001;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


spotLight.angle = Math.PI / 12;
spotLight.penumbra = 0.2;
spotLight.decay = 1;
spotLight.distance = 150;
spotLight.castShadow = true;

const targetObject = new THREE.Object3D();
targetObject.position.set(x,y-100,z); 
scene.add(targetObject);
spotLight.target = targetObject;        
    scene.add(spotLight);
}
function loadMainScene() {
    const loader = new GLTFLoader();
    loader.load("https://fr3d5.github.io/modelointerior/public/scenesinflores.glb", function (gltf) {
        const model = gltf.scene;
        model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;    
      child.receiveShadow = true; 
    }
  });
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
        
        loadVideoPlane(finalPosition.clone().add(new THREE.Vector3(100, 10, 0)));
        
        updateLoadingProgress();
    }, undefined, function (error) {
        showModalMessage('Error al cargar scenesinflores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar scenesinflores.glb:', error);
        updateLoadingProgress(); 
    });
}

function loadFlowers(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/flornormal/public/flores.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(11, 11, 11);
        model2.position.copy(position);
        scene.add(model2);
        updateLoadingProgress();
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
        updateLoadingProgress();
    });
}

function loadFlowers2(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/flornormal/public/flores.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(12, 12, 12);
        model2.position.copy(position);
        scene.add(model2);
        updateLoadingProgress();
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
        updateLoadingProgress();
    });
}

function loadFlowers3(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/floresrojas/public/floresrojo.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(12, 12, 12);
        model2.position.copy(position);
        scene.add(model2);
        updateLoadingProgress();
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
        updateLoadingProgress();
    });
}

function loadFlowers4(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/floresrojas/public/floresrojo.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(12, 12, 12);
        model2.position.copy(position);
        scene.add(model2);
        updateLoadingProgress();
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
        updateLoadingProgress();
    });
}

function loadFlowers5(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/floresrojas/public/floresrojo.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(12, 12, 12);
        model2.position.copy(position);
        scene.add(model2);
        updateLoadingProgress();
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
        updateLoadingProgress();
    });
}

function loadFlowers6(position) {
    const loader2 = new GLTFLoader();
    loader2.load("https://fr3d5.github.io/floresrojas/public/floresrojo.glb", function (gltf) {
        const model2 = gltf.scene;
        model2.scale.set(12, 12, 12);
        model2.position.copy(position);
        scene.add(model2);
        updateLoadingProgress();
    }, undefined, function (error) {
        showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
        console.error('Error al cargar flores.glb:', error);
        updateLoadingProgress();
    });
}

function loadVideoPlane(position) {
    const video = document.createElement('video');
    video.src = 'public/img/Video1.mp4';
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    
    video.style.display = 'none';
    document.body.appendChild(video);

    video.play().catch(e => console.error("Error playing video:", e));

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;

    const geometry = new THREE.PlaneGeometry(64, 36); 
    const material = new THREE.MeshBasicMaterial({ 
        map: videoTexture, 
        side: THREE.DoubleSide
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.position.copy(position);
    plane.rotation.y = -Math.PI / 2; 
    plane.visible = false;

    scene.add(plane);
    
    window.globalVideoState.video = video;
    window.globalVideoState.planes.push(plane);
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

    // Actualizar animaciones
    if (mixers.length > 0) {
        mixers.forEach(mixer => mixer.update(delta));
    }

    for (const [modalId, model] of Object.entries(dynamicModels)) {
        if (model && MODEL_ROTATION_SPEEDS[modalId]) {
            if (isDragging && currentOpenModal === modalId) {
                continue;
            }
            model.rotation.y += MODEL_ROTATION_SPEEDS[modalId];
        }
    }

    const isMobile = esMovil();
    
    if ((controls.isLocked || isMobile) && !isIframeOpen) {
        const direction = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        camera.getWorldDirection(direction);
        right.crossVectors(camera.up, direction).normalize();
        
        if (moveForward) {
            controls.getObject().position.add(direction.multiplyScalar(speed * delta));
        }
        if (moveBackward) {
            controls.getObject().position.add(direction.multiplyScalar(-speed * delta));
        }
        if (moveLeft) {
            controls.getObject().position.add(right.multiplyScalar(speed * delta));
        }
        if (moveRight) {
            controls.getObject().position.add(right.multiplyScalar(-speed * delta));
        }
    }

    if (targetPosition) {
        controls.getObject().position.lerp(targetPosition, CAMERA_SPEED);
        
        if (controls.getObject().position.distanceTo(targetPosition) < 0.1) {
            targetPosition = null;
        }
    }
    
    if (targetRotation && camera) {
        camera.rotation.y = lerpAngle(camera.rotation.y, targetRotation.y, CAMERA_SPEED);
        camera.rotation.x = 0;
        camera.rotation.z = 0;
        
        if (Math.abs(camera.rotation.y - targetRotation.y) < 0.01) {
            camera.rotation.y = targetRotation.y;
            camera.rotation.x = 0;
            camera.rotation.z = 0;
            targetRotation = null;
        }
    }

    if (window.globalVideoState.planes.length > 0 && !isCinemaModeAnimating) {
        raycaster.setFromCamera(screenCenter, camera);
        const intersects = raycaster.intersectObjects(window.globalVideoState.planes);

        if (intersects.length > 0) {
            if (!window.isLookingAtVideo) {
                window.isLookingAtVideo = true;
                if (window.mostrarControlesVideo) {
                    window.mostrarControlesVideo();
                }
            }
        } else {
            window.isLookingAtVideo = false;
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

    const btnAdelante = document.getElementById("btn-up");
    const btnAtras = document.getElementById("btn-down");

    btnAdelante.addEventListener('touchstart', (e) => { e.preventDefault(); moveForward = true; }, { passive: false });
    btnAdelante.addEventListener('touchend', (e) => { e.preventDefault(); moveForward = false; }, { passive: false });
    
    btnAtras.addEventListener('touchstart', (e) => { e.preventDefault(); moveBackward = true; }, { passive: false });
    btnAtras.addEventListener('touchend', (e) => { e.preventDefault(); moveBackward = false; }, { passive: false });
    
    btnAdelante.addEventListener('mousedown', () => moveForward = true);
    btnAdelante.addEventListener('mouseup', () => moveForward = false);
    btnAdelante.addEventListener('mouseleave', () => moveForward = false);
    
    btnAtras.addEventListener('mousedown', () => moveBackward = true);
    btnAtras.addEventListener('mouseup', () => moveBackward = false);
    btnAtras.addEventListener('mouseleave', () => moveBackward = false);
    document.getElementById("btn-left").addEventListener("touchstart", (e) => { e.preventDefault(); moveLeft = true; }, { passive: false });
    document.getElementById("btn-left").addEventListener("touchend", (e) => { e.preventDefault(); moveLeft = false; }, { passive: false });
    document.getElementById("btn-right").addEventListener("touchstart", (e) => { e.preventDefault(); moveRight = true; }, { passive: false });
    document.getElementById("btn-right").addEventListener("touchend", (e) => { e.preventDefault(); moveRight = false; }, { passive: false });
}
var abrirBotones = document.querySelectorAll('a[id^="abrir-modal-"]');
var cerrarBotones = document.querySelectorAll('.cerrar-modal');
var modales = document.querySelectorAll('.modal');

function abrirModal(modalId) {
    modales.forEach(m => {
        if (m.id !== modalId) m.style.display = 'none';
    });
    
    if (isIframeOpen) {
        iframeModal.style.display = 'none';
        iframeVentana.src = '';
        isIframeOpen = false;
        
        if (currentOpenModal && dynamicModels[currentOpenModal]) {
            scene.remove(dynamicModels[currentOpenModal]);
            dynamicModels[currentOpenModal] = null;
        }
        currentOpenModal = null;
        restaurarTitulos();
    }

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
    // Cerrar otros modales normales
    modales.forEach(m => m.style.display = 'none');

    if (controls && controls.isLocked) controls.unlock();

    if (finalPosition) {
        const offset = CAMERA_VIEWS[modalId] || CAMERA_MODAL_VIEW_OFFSET;
        targetPosition = finalPosition.clone().add(offset);
    } else {
        targetPosition = controls.getObject().position.clone().add(new THREE.Vector3(0, 1, 0));
    }

    // Set base X position for scroll limits
    currentIframeBaseX = targetPosition.x;

    targetRotation = CAMERA_ROTATIONS[modalId] || { y: camera.rotation.y };

    iframeVentana.src = url;
    iframeModal.style.display = 'flex';
    isIframeOpen = true;
    currentOpenModal = modalId; // Track which modal is open
    if (window.ocultarControlesVideo) window.ocultarControlesVideo();
    if (overlay) overlay.style.display = 'none';
    
    // 🌺 CARGAR Y ANIMAR MODELO 3D
    if (MODEL_PATHS[modalId]) {
        if (!dynamicModels[modalId]) {
            // Cargar modelo por primera vez
            loadAndAnimateModel(modalId, MODEL_PATHS[modalId]);
        } else {
            // Reanimar modelo existente
            const model = dynamicModels[modalId];
            scene.add(model);
            animateModelEntrance(model, MODEL_POSITIONS[modalId]);
        }
    }
    
    // CAMBIAR TÍTULOS SEGÚN LA SECCIÓN
    const h1 = document.querySelector('h1');
    const h2 = document.querySelector('.posicion1');
    
    if (h1 && h2) {
        // Opcional: Añadir efecto de transición si se desea
        h2.innerText = " ";
        
        switch(modalId) {
            case 'modal-galeria':
                h1.innerText = "GALERÍA";
                break;
            case 'modal-informacion':
                h1.innerText = "INFORMACIÓN";
                break;
            case 'modal-modelo3d':
                h1.innerText = "MODELO 3D";
                break;
            default:
                h1.innerText = "SECCIÓN";
        }
    }
    
    configurarScrollIframe();
}

function restaurarTitulos() {
    const h1 = document.querySelector('h1');
    const h2 = document.querySelector('.posicion1');
    
    if (h1 && h2) {
        h2.innerText = "INICIO";
        h1.innerText = 'PARROQUIA "NUESTRA SEÑORA DE LA ASUNCIÓN"';
    }
    
    if (overlay) overlay.style.display = 'flex';
}

if (btnInicio) {
    btnInicio.addEventListener('click', (e) => {
        e.preventDefault();
        if (controls && controls.isLocked) controls.unlock();
        
        restaurarTitulos();
        
        // Cerrar iframe si está abierto
        if (isIframeOpen) {
            if (currentOpenModal && dynamicModels[currentOpenModal]) {
                animateModelExit(dynamicModels[currentOpenModal], () => {
                    dynamicModels[currentOpenModal] = null;
                });
            }
            iframeModal.style.display = 'none';
            iframeVentana.src = '';
            isIframeOpen = false;
            currentOpenModal = null;
        }
        
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
        // Cargar página en blanco o contenido simple, ya que el modelo está en la escena principal
        abrirIframe('about:blank', 'modal-modelo3d');
    });
}

let isScrollListenerAdded = false;

function configurarScrollIframe() {
    if (isScrollListenerAdded) return;
    
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'iframe-scroll') {
            const scrollDelta = event.data.deltaY;
            const moveSpeed = 0.5;
            const limitRange = 20; // Limit movement to +/- 20 units
            
            if (scrollDelta < 0) {
                // Moving right (positive X)
                if (controls.getObject().position.x < currentIframeBaseX + limitRange) {
                    controls.getObject().position.x += moveSpeed;
                }
            } else {
                // Moving left (negative X)
                if (controls.getObject().position.x > currentIframeBaseX - limitRange) {
                    controls.getObject().position.x -= moveSpeed;
                }
            }
        }
    });
    
    isScrollListenerAdded = true;
}

// Cierre del modal iframe + volver cámara
// Cierre del modal iframe + volver cámara
// let currentOpenModal = null; // MOVED TO TOP

iframeModal.querySelector('.cerrar-modal').addEventListener('click', () => {
    // 🔸 Primero restaurar los títulos
    restaurarTitulos();
    
    // 🌺 Animar modelo hacia arriba (SALIDA)
    if (currentOpenModal && dynamicModels[currentOpenModal]) {
        animateModelExit(dynamicModels[currentOpenModal], () => {
            dynamicModels[currentOpenModal] = null;
        });
    }
    
    // 🔸 Luego cerrar el modal con un pequeño delay para que se vea la transición
    setTimeout(() => {
        iframeModal.style.display = 'none';
        iframeVentana.src = '';
        isIframeOpen = false;
        currentOpenModal = null;
    }, 300);
    
    if (finalPosition) {
        targetPosition = finalPosition.clone();
        targetRotation = { y: -1.6 };
    }
});

window.addEventListener('click', (e) => {
    if (e.target === iframeModal) {
        // 🔸 Primero restaurar los títulos
        restaurarTitulos();
        
        // 🌺 Animar modelo hacia arriba (SALIDA)
        if (currentOpenModal && dynamicModels[currentOpenModal]) {
            animateModelExit(dynamicModels[currentOpenModal], () => {
                dynamicModels[currentOpenModal] = null;
            });
        }
        
        // 🔸 Luego cerrar el modal con un pequeño delay para que se vea la transición
        setTimeout(() => {
            iframeModal.style.display = 'none';
            iframeVentana.src = '';
            isIframeOpen = false;
            currentOpenModal = null;
        }, 300);
        
        if (finalPosition) {
            targetPosition = finalPosition.clone();
            targetRotation = { y: -1.6 };
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
let modoLuz = localStorage.getItem('modoLuz') !== null ? parseInt(localStorage.getItem('modoLuz')) : 0;
const botonLuz = document.querySelector('.boton-luz');

if (botonLuz) {
    botonLuz.addEventListener('click', () => {
        modoLuz = (modoLuz === 0) ? 1 : 0;
        localStorage.setItem('modoLuz', modoLuz);

        if (modoLuz === 0) {
            ambientLight.intensity = 0.5;
            showModalMessage('🌙 Modo oscuro activado');
        } else {
            ambientLight.intensity = 1.5;
            showModalMessage('💡 Modo brillante activado');
        }
    });
}

// ============================================
// 🖱️ EVENT LISTENERS PARA MANIPULACIÓN DEL MODELO
// ============================================

document.addEventListener('mousedown', (e) => {
    // Solo activar si hay un iframe abierto y un modelo cargado
    if (isIframeOpen && currentOpenModal && dynamicModels[currentOpenModal]) {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    }
});

document.addEventListener('mousemove', (e) => {
    if (isDragging && isIframeOpen && currentOpenModal && dynamicModels[currentOpenModal]) {
        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };

        const model = dynamicModels[currentOpenModal];
        
        // Rotar en el eje Y (horizontal)
        // Ajustar sensibilidad según sea necesario
        const rotationSpeed = 0.005;
        model.rotation.y += deltaMove.x * rotationSpeed;
        
        // Opcional: Rotar en eje X (vertical) si se desea
        // model.rotation.x += deltaMove.y * rotationSpeed;

        previousMousePosition = { x: e.clientX, y: e.clientY };
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

document.addEventListener('wheel', (e) => {
    // Solo activar si hay un iframe abierto y un modelo cargado
    if (isIframeOpen && currentOpenModal && dynamicModels[currentOpenModal]) {
        // Prevenir scroll de la página
        // e.preventDefault(); // Descomentar si se desea bloquear el scroll de la página

        const model = dynamicModels[currentOpenModal];
        const zoomSpeed = 0.001; // Sensibilidad del zoom

        // Calcular factor de escala (Scroll arriba = Zoom In, Scroll abajo = Zoom Out)
        const scaleFactor = 1 - (e.deltaY * zoomSpeed);

        // Calcular nueva escala
        let newScale = model.scale.x * scaleFactor;

        // Limitar escala mínima para que no desaparezca (0.001)
        // No limitamos la máxima para permitir zoom libre
        if (newScale < 0.001) newScale = 0.001;

        model.scale.set(newScale, newScale, newScale);
    }
}, { passive: true }); // passive: true permite mejor rendimiento si no hacemos preventDefault