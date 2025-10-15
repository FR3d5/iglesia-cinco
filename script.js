import * as THREE from 'https://esm.sh/three@0.161.0';
import { GLTFLoader } from 'https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls.js';

let camera, scene, renderer, controls;
let mixer,model;
const clock = new THREE.Clock();
let time = 0;

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
    renderer.setSize(window.innerWidth, window.innerHeight);
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
    loader.load('./public/modelos/esena5.glb', function (gltf) {
        model = gltf.scene;
        scene.add(model);

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
        model.scale.set(0.21, 0.21, 0.21);

        // Ajustar cámara y controles al centro del modelo
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        camera.position.set(center.x+3, center.y, center.z + 20);
        if (window.innerWidth < 768) {
            camera.position.z = 35;
    }
        controls.target.copy(center);
        controls.update();
    });

    window.addEventListener('resize', onWindowResize);
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
     time += delta; 
    //model.rotation.x=0.01;
    if (mixer) mixer.update(delta);
    if(model){model.rotation.y = 4.5 + Math.sin(time * 0.5) * 0.2;}
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
const menu = document.querySelector('#workarea');
const toggle = document.querySelector('.menu-toggle');

toggle.addEventListener('click', () => {
menu.classList.toggle('workarea-open');
});
