// 1. SETUP DE BASE
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();

// Caméra
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 6; 

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);

camera.position.z = 6;  // Recul
camera.position.y = 2;  // <--- AJOUTE CECI (Monter la caméra = Descendre l'objet)

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
    
    // On garde ton scale qui marchait bien s'il y en avait un, sinon on laisse tel quel
    // mousqueton.scale.set(25, 25, 25); // Décommente si besoin de grossir

    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.z = maxDim * 3.5; 

    // --- 🕵️‍♂️ MODE DÉTECTIVE : AFFICHER LA STRUCTURE ---
    // Ouvre ta console (F12) pour voir les noms exacts !
    console.group("Structure du Mousqueton");
    mousqueton.traverse((child) => {
        if (child.isMesh) {
            console.log(`🔹 Pièce : ${child.name} | Parent : ${child.parent.name} | Grand-Parent : ${child.parent?.parent?.name}`);
        }
    });
    console.groupEnd();

    // --- RECHERCHE ET CORRECTION DU DOIGT ---
    mousqueton.traverse((child) => {
        // 1. Cas Idéal : Tu as le bon nom
        if (child.name === 'DOIGT_MOBILE' || child.name === 'Doigt' || child.name === 'Gate') {
             gatePart = child;
             console.log("🎯 BINGO : Doigt trouvé par son nom direct !");
        }
        
        // 2. Cas de Secours : On tombe sur le grip ou la vis
        else if (!gatePart && (child.name.includes('vis') || child.name.includes('bloqueur') || child.name.includes('grip'))) {
             // C'est ici l'astuce : On remonte d'un cran supplémentaire !
             // Si le parent s'appelle "Scene", on est allé trop loin, on garde le parent simple.
             // Sinon, on prend le grand-parent.
             
             if (child.parent.parent && child.parent.parent.type !== 'Scene') {
                 gatePart = child.parent.parent;
                 console.log("🔧 Grip détecté -> On a pris le GRAND-PARENT :", gatePart.name);
             } else {
                 gatePart = child.parent;
                 console.log("🔧 Grip détecté -> On a pris le PARENT :", gatePart.name);
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
                trigger: ".security", // C'est ici que c'était faux avant
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
        mousqueton.position.y = -6 + Math.sin(Date.now() * 0.001) * 0.05;
    }
    renderer.render(scene, camera);
};
animate();