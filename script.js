// 1. SETUP DE BASE
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();

// Caméra
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 6; 

// Rendu
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lumières
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 1.5);
spotLight.position.set(5, 10, 7);
scene.add(spotLight);

const rimLight = new THREE.DirectionalLight(0xff3333, 2); 
rimLight.position.set(-5, 0, -5);
scene.add(rimLight);

// 2. CHARGEMENT DU MODÈLE
const loader = new THREE.GLTFLoader();
let mousqueton = null;
let gatePart = null; 

loader.load('assets/mousqueton_web.glb', (gltf) => {
    console.log("✅ MODÈLE CHARGÉ !");
    mousqueton = gltf.scene;
    scene.add(mousqueton);

    // --- AUTO-CADRAGE ---
    const boundingBox = new THREE.Box3().setFromObject(mousqueton);
    const size = boundingBox.getSize(new THREE.Vector3()); 
    const center = boundingBox.getCenter(new THREE.Vector3());

    mousqueton.position.x += (mousqueton.position.x - center.x);
    mousqueton.position.y += (mousqueton.position.y - center.y);
    mousqueton.position.z += (mousqueton.position.z - center.z);

    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.z = maxDim * 3.5; // Recule un peu la caméra

    // --- RECHERCHE PRÉCISE DU DOIGT ---
    mousqueton.traverse((child) => {
        if (child.isMesh || child.type === 'Group') {
            // On cherche le nom EXACT que tu viens de mettre
            if (child.name === 'DOIGT_MOBILE') {
                console.log("🎯 Doigt trouvé :", child.name);
                gatePart = child;
            }
            // Sécurité : si tu n'as pas renommé, on essaie de trouver un parent logique
            // au lieu du grip.
            else if (!gatePart && (child.name.includes('vis_base') || child.name.includes('bloqueur'))) {
                 // Si on tombe sur la vis, on prend son parent (qui est souvent le doigt entier)
                 if(child.parent && child.parent.type !== 'Scene') {
                     gatePart = child.parent;
                     console.log("⚠️ Grip détecté, utilisation du parent :", gatePart.name);
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

    // A. Rotation continue
    gsap.to(mousqueton.rotation, {
        y: Math.PI * 4, 
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        }
    });

    // B. Étape 2 : Design (Rotation Z)
    // CORRECTION : On cible la classe '.description' (celle du HTML)
    gsap.to(mousqueton.rotation, {
        z: 0.8, // Penche le mousqueton
        scrollTrigger: {
            trigger: ".description", // C'est ici que c'était faux avant
            start: "top center",
            end: "bottom center",
            scrub: 1
        }
    });

    // C. Étape 3 : Sécurité (Ouverture du doigt)
    if (gatePart) {
        // CORRECTION : On cible la classe '.security'
        gsap.to(gatePart.rotation, {
            y: -0.8, // Ajuste cet axe (x, y ou z) selon ton modèle !
            scrollTrigger: {
                trigger: ".DOIGT_MOBILE", // C'est ici que c'était faux avant
                start: "top center",
                end: "bottom center",
                scrub: true
            }
        });
    }
}

// 4. BOUCLE D'ANIMATION
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const animate = () => {
    requestAnimationFrame(animate);
    if(mousqueton) {
        // Flottement ajusté (plus bas avec le -1)
        mousqueton.position.y = -1 + Math.sin(Date.now() * 0.001) * 0.05;
    }
    renderer.render(scene, camera);
};
animate();