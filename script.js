const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();

// 1. CAMÉRA
// On la place à z=25 car votre objet fait environ 8 mètres de haut.
// Il faut du recul pour le voir en entier.
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 25; 

// 2. RENDU
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 3. LUMIÈRES
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 2);
spotLight.position.set(10, 10, 10);
scene.add(spotLight);

const rimLight = new THREE.DirectionalLight(0xff3333, 2); // Touche rouge
rimLight.position.set(-5, 0, -10);
scene.add(rimLight);

// 4. CHARGEMENT
const loader = new THREE.GLTFLoader();
let mousqueton = null;
let gatePart = null;

loader.load('assets/mousqueton_web.glb', (gltf) => {
    console.log("✅ MODÈLE CHARGÉ !");
    mousqueton = gltf.scene;
    scene.add(mousqueton);

    // --- CORRECTION DE POSITION (Basée sur votre console) ---
    // Votre objet est centré à Y=9. On le descend de 9 pour le mettre à 0.
    mousqueton.position.set(0, -9, 0);
    
    // Votre objet a une taille de ~8. L'échelle 1 est donc parfaite.
    // On ne touche pas au scale (ou on met 1 par sécurité).
    mousqueton.scale.set(1, 1, 1); 

    // Rotation initiale pour qu'il soit face à nous
    mousqueton.rotation.x = 0;
    mousqueton.rotation.y = 0;

    // Recherche du doigt
    mousqueton.traverse((child) => {
        if (child.name === 'DOIGT_MOBILE' || (child.name.includes('vis') && child.parent.type !== 'Scene')) {
            gatePart = child.name === 'DOIGT_MOBILE' ? child : child.parent;
        }
    });

    initScrollAnimations();
}, 
undefined, 
(error) => console.error(error));


// 5. ANIMATIONS
gsap.registerPlugin(ScrollTrigger);

function initScrollAnimations() {
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        }
    });

    // Rotation complète
    if (mousqueton) {
        tl.to(mousqueton.rotation, { y: Math.PI * 2 }, 0);
    }

    // Ouverture doigt
    if (gatePart) {
        tl.to(gatePart.rotation, { y: -0.6, duration: 0.5 }, 0.3)
          .to(gatePart.rotation, { y: 0, duration: 0.5 }, 0.7);
    }
}

// 6. REDIMENSIONNEMENT
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 7. BOUCLE
const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};
animate();