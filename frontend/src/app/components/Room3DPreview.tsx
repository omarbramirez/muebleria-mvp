
"use client";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Point {
  x: number;
  y: number;
}

interface Room3DPreviewProps {
  points: Point[];
  height: number;
}

export default function Room3DPreview({ points, height }: Room3DPreviewProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const heightPx = container.clientHeight;

    // --- Escena ---
    const scene = new THREE.Scene();
    scene.background = null;

    // --- Renderizador ---
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // --- Luz ambiental suave ---
    const light = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(light);

    // --- Material “fantasma” colisionable ---
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25, // casi invisible, pero sólido
      side: THREE.DoubleSide,
      depthWrite: false,
      roughness: 1,
      metalness: 0
    });

    // --- Crear paredes dinámicas ---
    const walls: THREE.Mesh[] = [];

    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length];

      const wallWidth = Math.hypot(next.x - current.x, next.y - current.y);
      const wallHeight = height / 10;

      const geometry = new THREE.PlaneGeometry(wallWidth, wallHeight);

      const mesh = new THREE.Mesh(geometry, wallMaterial.clone());

      // Posicionar centro del muro
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      mesh.position.set(midX, 0, midY);

      // Calcular rotación hacia el siguiente punto
      const angle = Math.atan2(next.y - current.y, next.x - current.x);
      mesh.rotation.y = -angle;

      scene.add(mesh);
      walls.push(mesh);
    }

    // --- Wireframe superior (opcional para visualizar estructura) ---
    const shape = new THREE.Shape();
    points.forEach((p, i) => (i === 0 ? shape.moveTo(p.x, -p.y) : shape.lineTo(p.x, -p.y)));
    shape.closePath();
    const edgesGeometry = new THREE.EdgesGeometry(new THREE.ShapeGeometry(shape));
    const wireMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wireframe = new THREE.LineSegments(edgesGeometry, wireMaterial);
    wireframe.rotation.x = -Math.PI / 2;
    scene.add(wireframe);
wireframe.position.y = -((height / 10)/2);


        // --- Crear la base (solo el shape original) ---
        const baseGeometry = new THREE.ShapeGeometry(shape);
        const baseMaterial = new THREE.MeshBasicMaterial({
            color: 0xE0C9A6,   // tono beige claro para contraste
            side: THREE.DoubleSide,
        });
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);

        // Colocamos la base en el fondo del extrude
        baseMesh.rotation.x = -Math.PI / 2;
        baseMesh.position.y = -((height / 10)/2); // coincide con el origen de la extrusión
        scene.add(baseMesh);


    // --- Cámara ortográfica ---
    const bbox = new THREE.Box3().setFromObject(scene);
    const size = bbox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const aspect = width / heightPx;
    const marginFactor = 0.8;
    const viewSize = maxDim * marginFactor;

    const camera = new THREE.OrthographicCamera(
      -viewSize * aspect,
      viewSize * aspect,
      viewSize,
      -viewSize,
      -1000,
      3000
    );

    const center = bbox.getCenter(new THREE.Vector3());
    const distance = maxDim * 2.5;
    const angle = Math.PI / 4;
    const elevation = THREE.MathUtils.degToRad(35);
    camera.position.set(
      center.x + distance * Math.cos(angle),
      center.y + distance * Math.sin(angle),
      center.z + distance * Math.tan(elevation)
    );
    camera.lookAt(center);


// --- Controles de cámara (rotación, zoom, paneo) ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;       // suaviza el movimiento
controls.dampingFactor = 0.05;
controls.enableZoom = true;          // permite hacer zoom
controls.enablePan = false;          // desactiva el paneo lateral
controls.rotateSpeed = 0.8;          // velocidad de rotación con el mouse
controls.zoomSpeed = 1.0;
controls.target.copy(center);        // apunta al centro del modelo



    // --- Raycaster ---
// --- Raycaster ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let selectedWall: THREE.Mesh | null = null;
const originalStates = new Map<
  THREE.Mesh,
  { opacity: number; transparent: boolean }
>();

// Estado del modo “agregar rectángulos”
let addMode = false;

const rectDefaults = {
  width: 200,
  height: 400,
  color: 0x3399ff,
};

// --- Evento click principal ---
const onPointerDown = (event: MouseEvent) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(walls, true);

  if (intersects.length > 0) {
    const hit = intersects[0];
    const wall = hit.object as THREE.Mesh;
    const material = wall.material as THREE.MeshStandardMaterial;

    // --- Si hay una pared seleccionada y estamos en modo “agregar” ---
if (selectedWall === wall && addMode) {
  // Punto de impacto en coordenadas locales de la pared
  const localPoint = wall.worldToLocal(hit.point.clone());

  const rectGeometry = new THREE.PlaneGeometry(rectDefaults.width, rectDefaults.height);
const rectMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,   // rojo
  transparent: false, // opaco
  opacity: 0.95,      // casi totalmente opaco
  side: THREE.DoubleSide,
});

  const rectMesh = new THREE.Mesh(rectGeometry, rectMaterial);

  // Posición en espacio LOCAL del muro
  rectMesh.position.copy(localPoint);

  // Alinearlo con el plano de la pared (en espacio local, la plane está en XY,
  // así que dejamos rotacion en 0). Si la pared tiene escala, se heredará.
  rectMesh.rotation.set(0, 0, 0);

  // Empujar levemente en el eje local Z para evitar z-fighting (hacia "afuera" del muro).
  rectMesh.position.z -= 0.09; // valor en unidades locales (ajusta si lo necesitas)

  // Opcional: marcar userData para identificarlo luego
  rectMesh.userData = { type: "opening", width: rectDefaults.width, height: rectDefaults.height };

  // Añadir como hijo del muro (heredará transformaciones)
  wall.add(rectMesh);

  console.log("Rectángulo agregado a pared (local):", wall.uuid, rectMesh.position);
  return;
}





    // --- Restaurar pared anterior ---
    if (selectedWall && originalStates.has(selectedWall)) {
      const { opacity, transparent } = originalStates.get(selectedWall)!;
      const mat = selectedWall.material as THREE.MeshStandardMaterial;
      mat.opacity = opacity;
      mat.transparent = transparent;
    }

    // --- Guardar estado original ---
    if (!originalStates.has(wall)) {
      originalStates.set(wall, {
        opacity: material.opacity,
        transparent: material.transparent,
      });
    }

    // --- Aplicar efecto de selección ---
    material.transparent = true;
    material.opacity = 0.7;

    selectedWall = wall;
    console.log("Pared seleccionada:", wall.uuid);
    renderScene();
  } else {
    // --- Deseleccionar ---
    if (selectedWall && originalStates.has(selectedWall)) {
      const { opacity, transparent } = originalStates.get(selectedWall)!;
      const mat = selectedWall.material as THREE.MeshStandardMaterial;
      mat.opacity = opacity;
      mat.transparent = transparent;
    }
    selectedWall = null;
  }
};

// --- Activar o desactivar modo de agregar rectángulos (por ejemplo con tecla) ---
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "a") {
    addMode = !addMode;
    console.log("Modo agregar:", addMode);
  }
});


    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    // --- Render loop ---
const renderScene = () => {
  controls.update(); // ← actualiza suavizado de OrbitControls
  renderer.render(scene, camera);
  requestAnimationFrame(renderScene); // ← mantiene animación fluida
};
renderScene();

    // --- Responsividad ---
    const handleResize = () => {
      const w = mountRef.current?.clientWidth || 1;
      const h = mountRef.current?.clientHeight || 1;
      const aspect = w / h;
      camera.left = -viewSize * aspect;
      camera.right = viewSize * aspect;
      camera.top = viewSize;
      camera.bottom = -viewSize;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderScene();
    };

    window.addEventListener("resize", handleResize);

    // --- Limpieza ---
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.dispose();
      controls.dispose();
      container.removeChild(renderer.domElement);
      
    };
  }, [points, height]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", minHeight: "400px" }} />;
}
