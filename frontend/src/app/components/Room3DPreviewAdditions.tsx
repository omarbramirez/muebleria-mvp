"use client";
import * as THREE from "three";
import { useEffect, useRef } from "react";

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

        // --- Escena
        const scene = new THREE.Scene();
        scene.background = null;
        // --- Renderizador
        // 🔹 Renderizador
        const renderer = new THREE.WebGLRenderer({ alpha: true,antialias: true });
        renderer.setClearColor(0x000000, 0);
        renderer.setSize(width, heightPx)
        renderer.setPixelRatio(window.devicePixelRatio)
        container.appendChild(renderer.domElement);


        // --- Crear geometría a partir de puntos
        const shape = new THREE.Shape();
        points.forEach((p, i) => {
            if (i === 0) shape.moveTo(p.x, -p.y);
            else shape.lineTo(p.x, -p.y);
        });
        shape.closePath();

        const extrudeSettings = { depth: height / 10, bevelEnabled: false };

/////////////////////////////////////////////////////////////

// Material base transparente
const baseWallMaterial = new THREE.MeshStandardMaterial({
    color: 0xd6d3d1,
    transparent: true,
    opacity: 0.3, // transparencia
    side: THREE.DoubleSide,
    flatShading: true,
});

// Material de resaltado
const highlightMaterial = new THREE.MeshStandardMaterial({
    color: 0xffc107,
    side: THREE.DoubleSide,
    flatShading: true,
});

// Crear paredes individuales
const wallMeshes: THREE.Mesh[] = [];

for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];

    const wallShape = new THREE.Shape();
    wallShape.moveTo(0, 0);
    wallShape.lineTo(p2.x - p1.x, 0);
    wallShape.lineTo(p2.x - p1.x, -height / 10);
    wallShape.lineTo(0, -height / 10);
    wallShape.closePath();

    const wallGeom = new THREE.ExtrudeGeometry(wallShape, { depth: 0.1, bevelEnabled: false });
    const wallMesh = new THREE.Mesh(wallGeom, baseWallMaterial.clone());

    wallMesh.position.set(p1.x, 0, -p1.y);
    wallMesh.rotation.x = -Math.PI / 2;

    scene.add(wallMesh);
    wallMeshes.push(wallMesh);
}


////////////////////////////////////////////////////////////

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        // --- Crear malla de líneas (wireframe estructural)
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00000, linewidth: 1 });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        wireframe.rotation.x = -Math.PI / 2; // rotar a vista superior realista
        scene.add(wireframe);



        // --- Crear la base (solo el shape original) ---
        const baseGeometry = new THREE.ShapeGeometry(shape);
        const baseMaterial = new THREE.MeshBasicMaterial({
            color: 0xE0C9A6,   // tono beige claro para contraste
            side: THREE.DoubleSide,
        });
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);

        // Colocamos la base en el fondo del extrude
        baseMesh.rotation.x = -Math.PI / 2;
        baseMesh.position.y = 0; // coincide con el origen de la extrusión
        scene.add(baseMesh);


        // --- Calcular límites de la geometría
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox!;
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const center = new THREE.Vector3();
        bbox.getCenter(center);

        // --- Cámara ortográfica
        const aspect = width / heightPx;
       const marginFactor = 0.8; // deja 20% de aire visual
const viewSize = maxDim * marginFactor; // escala base (ajustable)
        const camera = new THREE.OrthographicCamera(
            -viewSize * aspect,
            viewSize * aspect,
            viewSize,
            -viewSize,
   -1000,
  3000
        )

        // 🔹 Posición isométrica: 35° y 45°
        const angle = Math.PI / 4
        const elevation = THREE.MathUtils.degToRad(35)
        // --- Posicionar cámara en vista isométrica fija respecto al centro
const distance = maxDim * 2.5;
camera.position.set(
  center.x + distance * Math.cos(angle),
  center.y + distance * Math.sin(angle),
  center.z + distance * Math.tan(elevation)
);
camera.lookAt(0,0,0);

        // --- Render loop fijo
        const renderScene = () => {
            renderer.render(scene, camera);
        };
        renderScene();

        // --- Responsividad
        const handleResize = () => {
            const w = mountRef.current?.clientWidth || 1;
            const h = mountRef.current?.clientHeight || 1;
            const aspect = w / h
            camera.left = -viewSize * aspect
            camera.right = viewSize * aspect
            camera.top = viewSize
            camera.bottom = -viewSize
            camera.updateProjectionMatrix()
            renderer.setSize(w, h)
            renderScene();
        };

        window.addEventListener("resize", handleResize);
        
///////////////////////////////////////////////////////////////////


// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let lastSelected: THREE.Mesh | null = null;

const onMouseClick = (event: MouseEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(wallMeshes, false);

    if (intersects.length > 0) {
        const selected = intersects[0].object as THREE.Mesh;

        // Restaurar pared anterior si existía
        if (lastSelected && lastSelected !== selected) {
            lastSelected.material = baseWallMaterial.clone();
        }

        // Resaltar pared clickeada
        selected.material = highlightMaterial;
        lastSelected = selected;

        // Restaurar tras 0.6s
        setTimeout(() => {
            if (lastSelected === selected) selected.material = baseWallMaterial.clone();
            lastSelected = null;
        }, 600);
    }
};

renderer.domElement.addEventListener("click", onMouseClick);


//////////////////////////////////////////////////////////////////
        // --- Limpieza
        return () => {
            window.removeEventListener("resize", handleResize);
            renderer.dispose();
            container?.removeChild(renderer.domElement);
        };
    }, [points, height]);

    return <div ref={mountRef} style={{ width: "100%", height: "100%", minHeight: "400px" }} />;
}
