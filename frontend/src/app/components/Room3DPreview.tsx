"use client";
import * as THREE from "three";
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface Point {
  x: number;
  y: number;
}

interface OpeningConfig {
  width: number;
  height: number;
  color?: number;
}

interface Room3DPreviewProps {
  points: Point[];
  height: number;
  openings?: OpeningConfig[];
  onOpeningIndexChange?: (index: number) => void;
}

export interface OpeningMethods {
  setOpeningIndex: (i: number) => void;
}

/**
 * Room3DPreview: componente Three.js con API imperativa.
 * Expuesto mediante forwardRef para que el padre pueda invocar setOpeningIndex.
 */
const Room3DPreview = forwardRef<OpeningMethods, Room3DPreviewProps>(
  ({ points, height, openings, onOpeningIndexChange }, ref) => {

    // -------------------------
    // REFS Y ESTADO LOCAL (mutables)
    // -------------------------
    const mountRef = useRef<HTMLDivElement | null>(null);
    const currentOpeningIndexRef = useRef<number>(0);

    // --- referencias persistentes para three.js ---
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);

    // persists openings: wallUUID => openings[]
    const openingsRef = useRef<Map<string, THREE.Mesh[]>>(new Map());

    // Global shared materials
    const wallMaterialRef = useRef(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        depthWrite: false,
        roughness: 1,
        metalness: 0,
      })
    );

    const selectedWallMaterialRef = useRef(
      new THREE.MeshStandardMaterial({
        color: 0x00aaff,
        transparent: true,
        opacity: 0.75,
        roughness: 0.8,
        metalness: 0,
        side: THREE.DoubleSide
      })
    );

    const raycaster = useRef(new THREE.Raycaster()).current;
    const mouse = useRef(new THREE.Vector2()).current;

    const addModeRef = useRef(false);
    const selectedWallRef = useRef<THREE.Mesh | null>(null);

    // variables de control para drag (no hooks porque se usan sólo internamente)
    let dragging = false;
    let draggedRect: THREE.Mesh | null = null;
    let activeWall: THREE.Mesh | null = null;

    // -------------------------
    // API imperativa expuesta al padre
    // -------------------------
    const setOpeningIndex = (i: number) => {
      currentOpeningIndexRef.current = i;
      if (onOpeningIndexChange) onOpeningIndexChange(i);
    };

    useImperativeHandle(ref, () => ({
      setOpeningIndex,
    }), [onOpeningIndexChange]);

    // -------------------------
    // helpers
    // -------------------------
    const getCurrentOpening = () => {
      const list = openings || [];
      const index = currentOpeningIndexRef.current;
      return list[index] ?? list[0] ?? { width: 40, height: 40, color: 0xff0000 };
    };

    // Seleccionar automáticamente el último opening cuando cambien las opciones
    useEffect(() => {
      if (!openings || openings.length === 0) return;

      currentOpeningIndexRef.current = openings.length - 1;
      // notificar al padre si existe callback
      if (onOpeningIndexChange) onOpeningIndexChange(currentOpeningIndexRef.current);

      console.log("Nuevo opening seleccionado automáticamente:", currentOpeningIndexRef.current);
    }, [openings, onOpeningIndexChange]);

    // Sincronizar índice inicial con padre (al montar)
    useEffect(() => {
      if (!onOpeningIndexChange) return;
      onOpeningIndexChange(currentOpeningIndexRef.current);
    }, [onOpeningIndexChange]);

    // ===========================================================
    // 1) Inicializar escena (solo una vez)
    // ===========================================================
    useEffect(() => {
      const container = mountRef.current;
      if (!container) return;

      const width = container.clientWidth;
      const heightPx = container.clientHeight;

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setClearColor(0x000000, 0);
      renderer.setSize(width, heightPx);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, -1000, 3000);
      cameraRef.current = camera;

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enableZoom = true;
      controls.rotateSpeed = 0.8;
      controls.zoomSpeed = 1.25;
      controlsRef.current = controls;

      scene.add(new THREE.AmbientLight(0xffffff, 1.2));

      const renderLoop = () => {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(renderLoop);
      };
      renderLoop();

      const handleResize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        renderer.setSize(w, h);
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
        controls.dispose();
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      };
    }, []);

    // ===========================================================
    // 2) Regenerar geometría cuando cambien points/height
    // ===========================================================
    useEffect(() => {
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      const controls = controlsRef.current;
      if (!renderer || !scene || !camera || !controls) return;

      // remover walls/base previos
      const toRemove = scene.children.filter((o) => o.userData?.type === "wall" || o.userData?.type === "base");
      toRemove.forEach((obj) => scene.remove(obj));

      const walls: THREE.Mesh[] = [];
      const wallMaterial = wallMaterialRef.current;

      for (let i = 0; i < points.length; i++) {
        const current = points[i];
        const next = points[(i + 1) % points.length];

        const wallWidth = Math.hypot(next.x - current.x, next.y - current.y);
        const wallHeight = height / 10;

        const geometry = new THREE.PlaneGeometry(wallWidth, wallHeight);
        const wall = new THREE.Mesh(geometry, wallMaterial.clone());
        wall.userData.type = "wall";

        const midX = (current.x + next.x) / 2;
        const midY = (current.y + next.y) / 2;
        wall.position.set(midX, 0, midY);

        const angle = Math.atan2(next.y - current.y, next.x - current.x);
        wall.rotation.y = -angle;

        const existingOpenings = openingsRef.current.get(wall.uuid);
        if (existingOpenings) {
          existingOpenings.forEach((rect) => wall.add(rect));
        } else {
          openingsRef.current.set(wall.uuid, []);
        }

        scene.add(wall);
        walls.push(wall);
      }

      // base (floor)
      const shape = new THREE.Shape();
      points.forEach((p, i) => (i === 0 ? shape.moveTo(p.x, -p.y) : shape.lineTo(p.x, -p.y)));
      shape.closePath();

      const baseGeometry = new THREE.ShapeGeometry(shape);
      const baseMaterial = new THREE.MeshBasicMaterial({ color: 0xe0c9a6, side: THREE.DoubleSide });
      const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
      baseMesh.rotation.x = -Math.PI / 2;
      baseMesh.position.y = -(height / 10) / 2;
      baseMesh.userData.type = "base";
      scene.add(baseMesh);

      // actualizar cámara para encuadrar
      const bbox = new THREE.Box3().setFromObject(scene);
      const size = bbox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      const container = renderer.domElement;
      const W = container.clientWidth;
      const H = container.clientHeight;
      const aspect = W / H;

      const viewSize = maxDim * 0.8;

      camera.left = -viewSize * aspect;
      camera.right = viewSize * aspect;
      camera.top = viewSize;
      camera.bottom = -viewSize;
      camera.updateProjectionMatrix();

      const center = bbox.getCenter(new THREE.Vector3());
      camera.position.set(center.x + maxDim, center.y + maxDim, center.z + maxDim);
      camera.lookAt(center);

      controlsRef.current!.target.copy(center);
    }, [points, height]);

    // ===========================================================
    // 3) Interacciones: click, drag, add-rectangles
    // ===========================================================
    useEffect(() => {
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const controls = controlsRef.current;

      if (!renderer || !scene || !camera || !controls) return;

      const dom = renderer.domElement;

      const onPointerDown = (event: MouseEvent) => {
        const rect = dom.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const allRects: THREE.Mesh[] = [];
        openingsRef.current.forEach(list => list.forEach(r => allRects.push(r)));

        const walls = scene.children.filter(o => o.userData?.type === "wall");
        const hits = raycaster.intersectObjects(walls, true);
        if (hits.length === 0) return;

        const hit = hits[0];
        const wall = hit.object as THREE.Mesh;

        if (selectedWallRef.current && selectedWallRef.current !== wall && wall.userData?.type == "wall") {
          const previous = selectedWallRef.current.material as THREE.MeshStandardMaterial;
          previous.opacity = 0.25;
          previous.color.set(0x000000);
        }

        selectedWallRef.current = wall;

        const mat = wall.material as THREE.MeshStandardMaterial;
        mat.opacity = 0.85;
        mat.color.set(0x00aaff);

        const isAddMode = addModeRef.current;

        if (isAddMode) {
          const rectHits = raycaster.intersectObjects(allRects, true);

          if (rectHits.length > 0) {
            const rectHit = rectHits[0];
            draggedRect = rectHit.object as THREE.Mesh;
            activeWall = draggedRect.parent as THREE.Mesh;

            dragging = true;
            controls.enabled = false;
            return;
          }

          const cfg = getCurrentOpening();

          const rectGeometry = new THREE.PlaneGeometry(cfg.width, cfg.height);
          const rectMaterial = new THREE.MeshBasicMaterial({
            color: cfg.color ?? 0xff0000,
            side: THREE.DoubleSide,
            opacity: 0.95,
          });

          const rectMesh = new THREE.Mesh(rectGeometry, rectMaterial);

          const localPoint = wall.worldToLocal(hit.point.clone());
          rectMesh.position.copy(localPoint);
          rectMesh.position.z = -0.09;

          wall.add(rectMesh);

          const list = openingsRef.current.get(wall.uuid) || [];
          list.push(rectMesh);
          openingsRef.current.set(wall.uuid, list);

          return;
        }
      };

      const onPointerMove = (event: MouseEvent) => {
        if (!dragging || !draggedRect || !activeWall) return;

        const rect = dom.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObject(activeWall, true);
        if (hits.length === 0) return;

        const point = hits[0].point.clone();
        const localPoint = activeWall.worldToLocal(point);

        const gw = (draggedRect.geometry as THREE.PlaneGeometry).parameters.width;
        const gh = (draggedRect.geometry as THREE.PlaneGeometry).parameters.height;

        const ww = (activeWall.geometry as THREE.PlaneGeometry).parameters.width;
        const wh = (activeWall.geometry as THREE.PlaneGeometry).parameters.height;

        draggedRect.position.x = THREE.MathUtils.clamp(localPoint.x, -ww / 2 + gw / 2, ww / 2 - gw / 2);
        draggedRect.position.y = THREE.MathUtils.clamp(localPoint.y, -wh / 2 + gh / 2, wh / 2 - gh / 2);
        draggedRect.position.z = -0.09;
      };

      const onPointerUp = () => {
        dragging = false;
        draggedRect = null;
        activeWall = null;
        controls.enabled = true;
      };

      const onKey = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === "a") {
          addModeRef.current = !addModeRef.current;
          console.log("Modo agregar:", addModeRef.current ? "ON" : "OFF");
        }
        if (!isNaN(Number(e.key))) {
          currentOpeningIndexRef.current = Number(e.key);
          if (onOpeningIndexChange) onOpeningIndexChange(currentOpeningIndexRef.current);
          console.log("Opening type:", currentOpeningIndexRef.current);
        }
      };

      dom.addEventListener("pointerdown", onPointerDown);
      dom.addEventListener("pointermove", onPointerMove);
      dom.addEventListener("pointerup", onPointerUp);
      window.addEventListener("keydown", onKey);

      return () => {
        dom.removeEventListener("pointerdown", onPointerDown);
        dom.removeEventListener("pointermove", onPointerMove);
        dom.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("keydown", onKey);
      };
    }, [onOpeningIndexChange, openings]);

    return <div ref={mountRef} style={{ width: "100%", height: "100%", minHeight: "400px" }} />;
  }
);
Room3DPreview.displayName = "Room3DPreview";
export default Room3DPreview;
