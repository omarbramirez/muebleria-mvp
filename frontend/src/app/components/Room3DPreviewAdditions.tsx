"use client";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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

    // --- Luz ambiental ---
    const light = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(light);

    // --- Material base de paredes ---
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
      roughness: 1,
      metalness: 0,
    });

    const walls: THREE.Mesh[] = [];

    // --- Crear paredes dinámicas ---
    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length];

      const wallWidth = Math.hypot(next.x - current.x, next.y - current.y);
      const wallHeight = height / 10;

      const geometry = new THREE.PlaneGeometry(wallWidth, wallHeight);
      const mesh = new THREE.Mesh(geometry, wallMaterial.clone());

      // Posición centrada
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      mesh.position.set(midX, 0, midY);

      // Rotación hacia el siguiente punto
      const angle = Math.atan2(next.y - current.y, next.x - current.x);
      mesh.rotation.y = -angle;

      mesh.userData = { type: "wall", openings: [] as THREE.Mesh[] };

      scene.add(mesh);
      walls.push(mesh);
    }

    // --- Base ---
    const shape = new THREE.Shape();
    points.forEach((p, i) => (i === 0 ? shape.moveTo(p.x, -p.y) : shape.lineTo(p.x, -p.y)));
    shape.closePath();

    const baseGeometry = new THREE.ShapeGeometry(shape);
    const baseMaterial = new THREE.MeshBasicMaterial({
      color: 0xe0c9a6,
      side: THREE.DoubleSide,
    });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.rotation.x = -Math.PI / 2;
    baseMesh.position.y = -((height / 10) / 2);
    scene.add(baseMesh);

    // --- Wireframe de referencia ---
    const edgesGeometry = new THREE.EdgesGeometry(new THREE.ShapeGeometry(shape));
    const wireMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wireframe = new THREE.LineSegments(edgesGeometry, wireMaterial);
    wireframe.rotation.x = -Math.PI / 2;
    wireframe.position.y = -((height / 10) / 2);
    scene.add(wireframe);

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

    // --- Controles de cámara ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.0;
    controls.target.copy(center);

    // --- Raycaster y estados ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let selectedWall: THREE.Mesh | null = null;
    const originalStates = new Map<THREE.Mesh, { opacity: number; transparent: boolean }>();

    let addMode = false;
    let dragging = false;
    let draggedRect: THREE.Mesh | null = null;
    let activeWall: THREE.Mesh | null = null;

    const rectDefaults = {
      width: 75,
      height: 150,
      color: 0xff0000,
    };

    // --- Función de renderizado ---
    const renderScene = () => {
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(renderScene);
    };
    renderScene();

    // --- Click principal ---
    const onPointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      // Prioridad: detectar si se hizo click sobre un rectángulo existente
      if (selectedWall) {
        const rectHits = raycaster.intersectObjects(selectedWall.children, true);
        if (rectHits.length > 0) {
          draggedRect = rectHits[0].object as THREE.Mesh;
          activeWall = selectedWall;
          dragging = true;
          controls.enabled = false;
          return;
        }
      }

      // Detectar paredes
      const wallHits = raycaster.intersectObjects(walls, true);
      if (wallHits.length === 0) return;

      const hit = wallHits[0];
      const wall = hit.object as THREE.Mesh;
      const material = wall.material as THREE.MeshStandardMaterial;

      // Si ya está seleccionada y estamos en modo agregar, crear rectángulo
      if (selectedWall === wall && addMode) {
        const localPoint = wall.worldToLocal(hit.point.clone());
        const rectGeometry = new THREE.PlaneGeometry(rectDefaults.width, rectDefaults.height);
        const rectMaterial = new THREE.MeshBasicMaterial({
          color: rectDefaults.color,
          transparent: false,
          opacity: 0.95,
          side: THREE.DoubleSide,
        });

        const rectMesh = new THREE.Mesh(rectGeometry, rectMaterial);
        rectMesh.position.copy(localPoint);
        rectMesh.position.z = -0.09;
        rectMesh.userData = { type: "opening" };
        wall.add(rectMesh);
        (wall.userData.openings as THREE.Mesh[]).push(rectMesh);

        console.log("Rectángulo agregado a pared:", wall.uuid);
        return;
      }

      // Restaurar pared anterior
      if (selectedWall && originalStates.has(selectedWall)) {
        const { opacity, transparent } = originalStates.get(selectedWall)!;
        const mat = selectedWall.material as THREE.MeshStandardMaterial;
        mat.opacity = opacity;
        mat.transparent = transparent;
      }

      // Guardar estado original
      if (!originalStates.has(wall)) {
        originalStates.set(wall, {
          opacity: material.opacity,
          transparent: material.transparent,
        });
      }

      // Aplicar efecto de selección
      material.transparent = true;
      material.opacity = 0.7;
      selectedWall = wall;
      renderScene();
    };

    // --- Movimiento mientras se arrastra ---
    const onPointerMove = (event: MouseEvent) => {
      if (!dragging || !draggedRect || !activeWall) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const hits = raycaster.intersectObject(activeWall, true);
      if (hits.length === 0) return;

      const point = hits[0].point.clone();
      const localPoint = activeWall.worldToLocal(point);

      const rectWidth = (draggedRect.geometry as THREE.PlaneGeometry).parameters.width;
      const rectHeight = (draggedRect.geometry as THREE.PlaneGeometry).parameters.height;
      const wallWidth = (activeWall.geometry as THREE.PlaneGeometry).parameters.width;
      const wallHeight = (activeWall.geometry as THREE.PlaneGeometry).parameters.height;

      // Limitar dentro del muro
      draggedRect.position.x = THREE.MathUtils.clamp(localPoint.x, -wallWidth / 2 + rectWidth / 2, wallWidth / 2 - rectWidth / 2);
      draggedRect.position.y = THREE.MathUtils.clamp(localPoint.y, -wallHeight / 2 + rectHeight / 2, wallHeight / 2 - rectHeight / 2);
      draggedRect.position.z = -0.09;

      renderScene();
    };

    // --- Soltar el rectángulo ---
    const onPointerUp = () => {
      if (dragging) {
        dragging = false;
        draggedRect = null;
        activeWall = null;
        controls.enabled = true;
      }
    };

    // --- Tecla para activar modo agregar ---
    window.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "a") {
        addMode = !addMode;
        console.log("Modo agregar:", addMode);
      }
    });

    // --- Registrar eventos ---
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

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
    };
    window.addEventListener("resize", handleResize);

    // --- Limpieza ---
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.dispose();
      controls.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [points, height]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", minHeight: "400px" }} />;
}
