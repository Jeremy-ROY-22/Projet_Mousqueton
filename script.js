// 1. SETUP DE BASE
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();

// Caméra
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 6; // Recule ou avance la caméra ici

// Rendu
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lumières (Ambiance Studio)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 1.5);
spotLight.position.set(5, 10, 7);
scene.add(spotLight);

const rimLight = new THREE.DirectionalLight(0xff3333, 2); // Lumière rouge stylée
rimLight.position.set(-5, 0, -5);
scene.add(rimLight);

// 2. CHARGEMENT DU MODÈLE
const loader = new THREE.GLTFLoader();
let mousqueton = null;
let gatePart = null; // La partie qui va bouger

loader.load('assets/mousqueton_web.glb', (gltf) => {
    mousqueton = gltf.scene;
    
    // Réglages initiaux
    mousqueton.scale.set(10, 10, 10); // CHANGE L'ÉCHELLE ICI SI TROP PETIT/GRAND
    mousqueton.rotation.x = 0.2;
    
    scene.add(mousqueton);

    // --- RECHERCHE AUTOMATIQUE DU DOIGT ---
    console.log("--- Noms des objets trouvés dans le fichier ---");
    mousqueton.traverse((child) => {
        if (child.isMesh) {
            console.log(child.name); // Regarde la console (F12) pour voir les vrais noms !
            
            // On cherche l'objet qui contient "vis" ou "amovible" ou "doigt"
            // Adapte ce mot clé selon ce que tu vois dans la console
            if (child.name.toLowerCase().includes('vis') || child.name.toLowerCase().includes('amovible')) {
                gatePart = child; 
                // Si la vis est groupée avec le doigt, on remonte au parent pour tout bouger
                if(child.parent && child.parent.type !== 'Scene') {
                    gatePart = child.parent;
                }
            }
        }
    });

    initScrollAnimations();
});

// 3. ANIMATIONS GSAP
gsap.registerPlugin(ScrollTrigger);

function initScrollAnimations() {
    if (!mousqueton) return;

    // A. Rotation continue du mousqueton au scroll
    gsap.to(mousqueton.rotation, {
        y: Math.PI * 4, // Fait 2 tours complets
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1 // Fluidité
        }
    });

    // B. Mouvement spécifique pour la section "Sécurité"
    if (gatePart) {
        gsap.to(gatePart.rotation, {
            z: -0.6, // OUVRE LE DOIGT (Change l'axe x, y ou z selon ton modèle)
            scrollTrigger: {
                trigger: ".security",
                start: "top center",
                end: "bottom center",
                scrub: true
            }
        });
    }
}

// 4. RESPONSIVE & LOOP
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const animate = () => {
    requestAnimationFrame(animate);
    if(mousqueton) {
        // Petit flottement permanent
        mousqueton.position.y = Math.sin(Date.now() * 0.001) * 0.05;
    }
    renderer.render(scene, camera);
};
animate();