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
        const viewSize = 500; // escala base (ajustable)
        const camera = new THREE.OrthographicCamera(
            -viewSize * aspect,
            viewSize * aspect,
            viewSize,
            -viewSize,
            1,
            1000
        )

        // 🔹 Posición isométrica: 35° y 45°
        const angle = Math.PI / 4
        const elevation = THREE.MathUtils.degToRad(35)
        const dist = maxDim * 2;

        camera.position.set(
            viewSize * Math.cos(angle),
            viewSize * Math.sin(angle),
            viewSize * Math.tan(elevation)
        )
        camera.lookAt(0, 0, 0)

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

        // --- Limpieza
        return () => {
            window.removeEventListener("resize", handleResize);
            renderer.dispose();
            container?.removeChild(renderer.domElement);
        };
    }, [points, height]);

    return <div ref={mountRef} style={{ width: "100%", height: "100%", minHeight: "400px" }} />;
}
