'use client';
'use client';
import React, { useState, useCallback } from "react";

const SCALE = 100; // 1 m = 100 px
const PX_TO_MM = 10;
const SNAP_THRESHOLD = 10;

interface Point {
  x: number;
  y: number;
}

const RoomPlanner: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([
    { x: 100, y: 100 },
    { x: 450, y: 100 },
    { x: 450, y: 200 },
    { x: 350, y: 200 },
    { x: 350, y: 400 },
    { x: 100, y: 400 },
  ]);
  const [dragging, setDragging] = useState<number | null>(null);
  const [lastTap, setLastTap] = useState(0);

  // --- Calcular área
  const area = Math.abs(
    points.reduce((acc, curr, i) => {
      const next = points[(i + 1) % points.length];
      return acc + curr.x * next.y - next.x * curr.y;
    }, 0) / 2
  );
  const areaM2 = (area / (SCALE * SCALE)).toFixed(2);

  // --- Calcular longitudes
  const distances = points.map((p, i) => {
    const next = points[(i + 1) % points.length];
    const dx = next.x - p.x;
    const dy = next.y - p.y;
    const distPx = Math.sqrt(dx * dx + dy * dy);
    return {
      midX: (p.x + next.x) / 2,
      midY: (p.y + next.y) / 2,
      distMm: (distPx * PX_TO_MM).toFixed(0),
    };
  });

  // --- Eliminar vértice (acepta MouseEvent, no PointerEvent)
  const handleDeleteVertex = (i: number, e: React.MouseEvent<SVGCircleElement>) => {
    e.stopPropagation();
    setPoints(prev => {
      if (prev.length <= 3) return prev; // mínimo 3 vértices
      return prev.filter((_, idx) => idx !== i);
    });
  };

  // --- Iniciar arrastre o eliminar por doble tap
  const handlePointerDown = (i: number, e: React.PointerEvent<SVGCircleElement>) => {
    const currentTime = Date.now();
    const tapGap = currentTime - lastTap;

    if (tapGap < 300 && tapGap > 0) {
      // doble tap detectado (táctil o mouse rápido)
      handleDeleteVertex(i, e as unknown as React.MouseEvent<SVGCircleElement>);
    } else {
      setLastTap(currentTime);
      setDragging(i);
    }
  };

  // --- Terminar arrastre
  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(null);
  };

  // --- Movimiento con snapping magnético
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (dragging === null) return;
      e.preventDefault();

      const svgRect = e.currentTarget.getBoundingClientRect();
      let x = e.clientX - svgRect.left;
      let y = e.clientY - svgRect.top;

      setPoints(prev => {
        const newPoints = [...prev];

        prev.forEach((p, i) => {
          if (i === dragging) return;
          const dx = Math.abs(p.x - x);
          const dy = Math.abs(p.y - y);
          if (dy < SNAP_THRESHOLD) y = p.y;
          if (dx < SNAP_THRESHOLD) x = p.x;
        });

        newPoints[dragging] = { x, y };
        return newPoints;
      });
    },
    [dragging]
  );

  // --- Añadir vértice en línea
  const handleAddVertex = (index: number, e: React.PointerEvent<SVGLineElement>) => {
    e.stopPropagation();
    const svgRect = e.currentTarget.closest("svg")!.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;

    setPoints(prev => {
      const newPoints = [...prev];
      newPoints.splice(index + 1, 0, { x, y });
      return newPoints;
    });
  };

  return (
    <div className="flex gap-4 flex-col select-none">
      <svg
        viewBox="0 0 700 500"
        className="w-full max-w-4xl aspect-[7/5] border border-gray-300 bg-gray-50 cursor-crosshair touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <defs>
          <pattern id="floor" patternUnits="userSpaceOnUse" width="40" height="40">
            <image
              href="http://transparenttextures.com/patterns/grid-me.png"
              width="40"
              height="40"
            />
          </pattern>
        </defs>

        {/* Polígono principal */}
        <polygon
          points={points.map(p => `${p.x},${p.y}`).join(" ")}
          fill="url(#floor)"
          stroke="#555"
          strokeWidth={6}
          strokeLinejoin="round"
        />

        {/* Líneas interactivas */}
        {points.map((p, i) => {
          const next = points[(i + 1) % points.length];
          return (
            <line
              key={`line-${i}`}
              x1={p.x}
              y1={p.y}
              x2={next.x}
              y2={next.y}
              stroke="transparent"
              strokeWidth={20}
              onPointerDown={(e) => handleAddVertex(i, e)}
              style={{ cursor: "copy" }}
            />
          );
        })}

        {/* Medidas */}
        {distances.map((d, i) => (
          <text
            key={i}
            x={d.midX}
            y={d.midY - 10}
            textAnchor="middle"
            fontSize={12}
            fill="#333"
          >
            {d.distMm} mm
          </text>
        ))}

        {/* Vértices */}
        {points.map((p, i) => (
          <circle
            key={`point-${i}`}
            cx={p.x}
            cy={p.y}
            r={8}
            fill="#007bff"
            stroke="#fff"
            strokeWidth={2}
            onPointerDown={(e) => handlePointerDown(i, e)}
            onDoubleClick={(e) => handleDeleteVertex(i, e)}
            style={{ cursor: "pointer" }}
          />
        ))}

        {/* Área total */}
        <text
          x={350}
          y={250}
          textAnchor="middle"
          fontSize={14}
          fill="#000"
          fontWeight="bold"
        >
          Área total: {areaM2} m²
        </text>
      </svg>

      <div className="p-4 rounded-lg text-sm mt-4 text-left bg-gray-100">
        <h2 className="font-semibold text-gray-700 mb-2">Datos del plano</h2>
        <p><strong>Escala:</strong> 1 m = {SCALE}px</p>
        <p><strong>Área:</strong> {areaM2} m²</p>
        <p><strong>Vértices:</strong> {points.length}</p>
      </div>
    </div>
  );
};

export default RoomPlanner;
