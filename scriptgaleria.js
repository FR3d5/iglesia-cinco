import * as THREE from 'https://esm.sh/three@0.161.0';
import { GLTFLoader } from 'https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls.js';

let camera, scene, renderer, controls;
let mixer;
const clock = new THREE.Clock();

init();
animate();

function init() {
    // Escena
    scene = new THREE.Scene();

    // Luces
    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(0, 20, 10);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Renderizador
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth*0.2, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight,0.1,2000);

    // Controles
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;

    // Cargar modelo GLB
    const loader = new GLTFLoader();
    loader.load('./public/modelos/padresito.glb', function (gltf) {
        const model = gltf.scene;
        scene.add(model);

        // Animaciones
        if (gltf.animations && gltf.animations.length) {
            mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
        }

        model.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        model.rotation.y = 4.5;
        model.scale.set(65,25,65);

        // Ajustar cámara y controles al centro del modelo
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        camera.position.set(center.x+3, center.y + 5, center.z + 20);
        controls.target.copy(center);
        controls.update();
    });

    // Redimensionamiento
    window.addEventListener('resize', onWindowResize);
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    //controls.update(); 
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

var abrirBotones = document.querySelectorAll('a[id^="abrir-modal-"]');
    var cerrarBotones = document.querySelectorAll('.cerrar-modal');
    var modales = document.querySelectorAll('.modal');

    // Función para abrir un modal
    function abrirModal(modalId) {
        var modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }

    // Función para cerrar un modal
    function cerrarModal(modalElement) {
        modalElement.style.display = 'none';
    }

    // Agregar evento a cada botón de "abrir"
    abrirBotones.forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.preventDefault(); // Evita que el enlace salte
            // Obtiene el ID del modal a abrir del ID del enlace
            const modalId = btn.id.replace('abrir-', '');
            abrirModal(modalId);
        });
    });

    // Agregar evento a cada botón de "cerrar" (la X)
    cerrarBotones.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                cerrarModal(modal);
            }
        });
    });

    // Cerrar el modal al hacer clic fuera de él
    window.addEventListener('click', (event) => {
        modales.forEach(modal => {
            if (event.target === modal) {
                cerrarModal(modal);
            }
        });
    });
