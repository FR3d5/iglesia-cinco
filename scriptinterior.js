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
        const overlay = document.getElementById('overlay');
        
        // Variable para almacenar la posición calculada que ambos modelos y la cámara usarán
        const CAMERA_MODAL_VIEW_OFFSET = new THREE.Vector3(50, 0, 30);
        
        // Función para mostrar mensajes modales (reemplaza alert, que no funciona bien en iframes)
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
        window.alert = showModalMessage; // Reemplaza alert() con la función modal

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

            // Iniciar la cadena de carga
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
            loader.load("./public/modelos/scenesinflores.glb", function (gltf) {
                const model = gltf.scene;
                scene.add(model);
                
                // Calculamos el centro del primer modelo
                const box = new THREE.Box3().setFromObject(model);
                const center = new THREE.Vector3();
                box.getCenter(center);
                
                // Calculamos y almacenamos la posición de la cámara
                finalPosition.set(center.x - 50, center.y - 70, center.z);
                
                // Aplicamos la posición a la cámara y los controles
                camera.position.copy(finalPosition);
                camera.rotation.y = -1.6;
                controls.getObject().position.copy(camera.position);

                // Llamamos a la función para cargar el segundo modelo, ahora que finalPosition está lista
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
            loader2.load("./public/modelos/flores.glb", function (gltf) {
                const model2 = gltf.scene;
                model2.scale.set(11, 11, 11);
                // Posicionamos el segundo modelo usando la posición calculada
                model2.position.copy(position);
                scene.add(model2);

            }, undefined, function (error) {
                showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
                console.error('Error al cargar flores.glb:', error);
            });
        }
        function loadFlowers2(position) {
            const loader2 = new GLTFLoader();
            loader2.load("./public/modelos/flores.glb", function (gltf) {
                const model2 = gltf.scene;
                model2.scale.set(12, 12, 12);
                // Posicionamos el segundo modelo usando la posición calculada
                model2.position.copy(position);
                scene.add(model2);

            }, undefined, function (error) {
                showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
                console.error('Error al cargar flores.glb:', error);
            });
        }
        function loadFlowers3(position) {
            const loader2 = new GLTFLoader();
            loader2.load("./public/modelos/floresrojo.glb", function (gltf) {
                const model2 = gltf.scene;
                model2.scale.set(12, 12, 12);
                // Posicionamos el segundo modelo usando la posición calculada
                model2.position.copy(position);
                scene.add(model2);

            }, undefined, function (error) {
                showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
                console.error('Error al cargar flores.glb:', error);
            });
        }
        function loadFlowers4(position) {
            const loader2 = new GLTFLoader();
            loader2.load("./public/modelos/floresrojo.glb", function (gltf) {
                const model2 = gltf.scene;
                model2.scale.set(12, 12, 12);
                // Posicionamos el segundo modelo usando la posición calculada
                model2.position.copy(position);
                scene.add(model2);

            }, undefined, function (error) {
                showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
                console.error('Error al cargar flores.glb:', error);
            });
        }
        function loadFlowers5(position) {
            const loader2 = new GLTFLoader();
            loader2.load("./public/modelos/floresrojo.glb", function (gltf) {
                const model2 = gltf.scene;
                model2.scale.set(12, 12, 12);
                // Posicionamos el segundo modelo usando la posición calculada
                model2.position.copy(position);
                scene.add(model2);

            }, undefined, function (error) {
                showModalMessage('Error al cargar flores.glb. Asegúrate de que la ruta es correcta.');
                console.error('Error al cargar flores.glb:', error);
            });
        }
        function loadFlowers6(position) {
            const loader2 = new GLTFLoader();
            loader2.load("./public/modelos/floresrojo.glb", function (gltf) {
                const model2 = gltf.scene;
                model2.scale.set(12, 12, 12);
                // Posicionamos el segundo modelo usando la posición calculada
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
            

            // 2. LÓGICA DE MOVIMIENTO SUAVE AL ABRIR MODAL (LERP)
            // 2. LÓGICA DE MOVIMIENTO SUAVE AL ABRIR MODAL (LERP)
if (targetPosition) {
    // Mueve la cámara gradualmente hacia la posición objetivo (factor 0.05 = suavidad)
    controls.getObject().position.lerp(targetPosition, 0.05);

    // Si la distancia es mínima, asumimos que hemos llegado al destino
    if (controls.getObject().position.distanceTo(targetPosition) < 0.1) {
        targetPosition = null; // Detiene la interpolación
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
        var modal = document.getElementById(modalId);
            if (modal) {
                // PASO 1: DESBLOQUEAR Y DETENER MOVIMIENTO
                if (controls && controls.isLocked) {
                    controls.unlock();
                }
                
                // PASO 2: ESTABLECER LA POSICIÓN OBJETIVO (targetPosition)
                // Usamos la posición inicial (finalPosition) como punto de referencia
                if (finalPosition) {
                    // Calculamos una posición cómoda para ver la escena mientras el modal está abierto
                    targetPosition = finalPosition.clone().add(CAMERA_MODAL_VIEW_OFFSET); 
                } else {
                    // Fallback si el modelo no cargó, solo sube un poco la cámara actual
                    targetPosition = controls.getObject().position.clone().add(new THREE.Vector3(0, 1, 0)); 
                }
                
                // PASO 3: Mostrar el Modal
                modal.style.display = 'block';
            }
    }

    function cerrarModal(modalElement) {
        modalElement.style.display = 'none';
        targetPosition = finalPosition.clone();
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
            if (modal) {
                cerrarModal(modal);
            }
        });
    });
    window.addEventListener('click', (event) => {
        modales.forEach(modal => {
            if (event.target === modal) {
                cerrarModal(modal);
            }
        });
    });
const menu = document.querySelector('#workarea');
const toggle = document.querySelector('.menu-toggle');

toggle.addEventListener('click', () => {
  menu.classList.toggle('workarea-open');
});