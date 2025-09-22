    import * as THREE from 'https://esm.sh/three@0.161.0';
    import { GLTFLoader } from 'https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';
    import { PointerLockControls } from 'https://esm.sh/three@0.161.0/examples/jsm/controls/PointerLockControls.js';

    let camera, scene, renderer, controls;
    let clock;
    
    // Variables para el movimiento del jugador
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    
    // Elemento del overlay
    const overlay = document.getElementById('overlay');

    init();
    animate();

    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x333333);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(0, -5, 0);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        controls = new PointerLockControls(camera, document.body);

        overlay.addEventListener('click', () => {
            controls.lock();
        });

        controls.addEventListener('lock', () => {
            overlay.style.display = 'none';
        });

        controls.addEventListener('unlock', () => {
            overlay.style.display = 'flex';
        });

        // Luces para el entorno
        const ambientLight = new THREE.AmbientLight(0xffffff, 2);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 2);
        dirLight.position.set(10, 10, 5);
        scene.add(dirLight);

        // --- CÓDIGO CLAVE PARA CARGAR EL MODELO ---
        const loader = new GLTFLoader();
        loader.load('https://drive.google.com/file/d/1QGOe9DNFzbAEVNe0cD9WI6FjhGejC1Lw/view?usp=sharing', gltf =>{
            const model = gltf.scene;
            scene.add(model);
            
            // Si el modelo tiene animaciones, las reproducimos.
            if (gltf.animations && gltf.animations.length) {
                mixer = new THREE.AnimationMixer(model);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
            }

            // Para ajustar la cámara al centro del modelo, como lo tenías en tu código original
            const box = new THREE.Box3().setFromObject(model);
            const center = new THREE.Vector3();
            box.getCenter(center);
            
            // Ajustar la posición inicial de la cámara
            camera.position.set(center.x-50, center.y -70, center.z);
            camera.rotation.y=-1.6;
            controls.getObject().position.copy(camera.position);

            console.log("¡Modelo 3D cargado con éxito!");
        }, undefined, function (error) {
            console.error('An error happened:', error);
        });

        // Oyentes de eventos para el teclado
        const onKeyDown = (event) => {
            switch (event.code) {
                case 'KeyW': moveForward = true; break;
                case 'KeyA': moveLeft = true; break;
                case 'KeyS': moveBackward = true; break;
                case 'KeyD': moveRight = true; break;
            }
        };

        const onKeyUp = (event) => {
            switch (event.code) {
                case 'KeyW': moveForward = false; break;
                case 'KeyA': moveLeft = false; break;
                case 'KeyS': moveBackward = false; break;
                case 'KeyD': moveRight = false; break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        
        // Reloj para movimientos fluidos
        clock = new THREE.Clock();
        window.addEventListener('resize', onWindowResize, false);
    }

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();

        // Aplicamos el movimiento usando los controles
        const speed = 10; // Ajusta la velocidad de movimiento
        if (moveForward) controls.moveForward(speed * delta);
        if (moveBackward) controls.moveForward(-speed * delta);
        if (moveLeft) controls.moveRight(-speed * delta);
        if (moveRight) controls.moveRight(speed * delta);

        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }