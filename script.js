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

// Remplacez la partie loader.load par ceci :

loader.load('assets/mousqueton_web.glb', (gltf) => {
    console.log("✅ MODÈLE CHARGÉ !");
    mousqueton = gltf.scene;
    scene.add(mousqueton);

    // --- 1. DEBUG : AFFICHER UNE BOITE AUTOUR ---
    // Ça permet de voir l'objet même s'il est tout noir ou mal éclairé
    const box = new THREE.BoxHelper(mousqueton, 0xffff00); // Boite jaune
    scene.add(box);

    // --- 2. AUTO-CADRAGE (LA SOLUTION MAGIQUE) ---
    // On calcule la boite englobante de l'objet
    const boundingBox = new THREE.Box3().setFromObject(mousqueton);
    const size = boundingBox.getSize(new THREE.Vector3()); // Taille de l'objet
    const center = boundingBox.getCenter(new THREE.Vector3()); // Centre de l'objet

    // Si l'objet est trop petit ou trop grand, on l'affiche dans la console
    console.log("Taille de l'objet :", size);

    // On recentre l'objet pour qu'il soit pile à (0,0,0)
    mousqueton.position.x += (mousqueton.position.x - center.x);
    mousqueton.position.y += (mousqueton.position.y - center.y);
    mousqueton.position.z += (mousqueton.position.z - center.z);

    // On recule la caméra en fonction de la taille de l'objet
    // On prend la plus grande dimension (hauteur ou largeur) et on multiplie par 3
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.z = maxDim * 3; 
    
    // --- 3. RÉGLAGE MANUEL DE L'ÉCHELLE ---
    // Si après ça il est toujours bizarre, décommente la ligne suivante et teste des valeurs (0.1 ou 100)
    // mousqueton.scale.set(10, 10, 10); 

    // --- 4. RECHERCHE DE L'ANIMATION ---
    // D'après votre console, l'objet à animer semble être "vis_base" ou "bloqueur"
    mousqueton.traverse((child) => {
        if (child.isMesh) {
            // Regarde si le nom contient "vis" (votre console montre 'vis_base')
            if (child.name.toLowerCase().includes('vis')) {
                gatePart = child;
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

// --- 6. BOUCLE D'ANIMATION ---
const animate = () => {
    requestAnimationFrame(animate);
    
    if(mousqueton) {
        // C'est ici qu'on règle la hauteur !
        // -1 ou -2 permet de descendre l'objet.
        // Math.sin crée le petit flottement.
        
        mousqueton.position.y = -8 + Math.sin(Date.now() * 0.001) * 0.05;
        
        // Si c'est encore trop haut, essayez -2 ou -3 à la place de -1.
        // Si c'est trop bas, essayez 0 ou 1.
    }

    renderer.render(scene, camera);
};

animate();