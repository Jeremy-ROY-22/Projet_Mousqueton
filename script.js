const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();

// 1. CAMÉRA
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 25; // Le recul nécessaire pour voir l'objet entier

// 2. RENDU
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 3. LUMIÈRES (Une seule fois !)
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 2);
spotLight.position.set(10, 10, 10);
scene.add(spotLight);

const rimLight = new THREE.DirectionalLight(0xff3333, 2); // Touche rouge stylée
rimLight.position.set(-5, 0, -10);
scene.add(rimLight);

// 4. CHARGEMENT
const loader = new THREE.GLTFLoader();
let mousqueton = null;
let gatePart = null;

// On utilise bien le dossier assets
loader.load('./assets/mousqueton_web.glb', function (gltf) {
    console.log("✅ MODÈLE CHARGÉ !");
    mousqueton = gltf.scene;
    scene.add(mousqueton);

    // Positionnement
    mousqueton.position.set(0, -9, 0); 
    mousqueton.scale.set(1, 1, 1); 
    mousqueton.rotation.set(0, 0, 0);

    // Recherche du doigt pour l'animation
    mousqueton.traverse((child) => {
        if (child.name === 'DOIGT_MOBILE' || (child.name.includes('vis') && child.parent.type !== 'Scene')) {
            gatePart = child.name === 'DOIGT_MOBILE' ? child : child.parent;
        }
    });

    initScrollAnimations(); // On lance les animations seulement quand l'objet est là
}, 
undefined, 
(error) => {
    console.error("Erreur de chargement :", error);
});

// 5. ANIMATIONS (GSAP)
gsap.registerPlugin(ScrollTrigger);

function initScrollAnimations() {
    if (!mousqueton) return;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        }
    });

    // Rotation complète du mousqueton
    tl.to(mousqueton.rotation, { y: Math.PI * 2 }, 0);

    // Animation du doigt (si trouvé)
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

// 7. BOUCLE D'ANIMATION
const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};
animate();