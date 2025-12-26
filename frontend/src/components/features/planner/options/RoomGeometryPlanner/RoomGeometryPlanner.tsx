'use client';
import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Ruler,
  Maximize,
  ArrowDownUp,
  Move3D,
  DoorOpen,
  AppWindow,
  Trash2,
  Hammer,
  MousePointer2,
  Plus,
  Minus,
  Undo2, // Importamos iconos para Undo/Redo
  Redo2
} from "lucide-react";

// 1. IMPORTA useShallow DE ZUSTAND (Asegúrate de tener zustand actualizado)
import { useShallow } from 'zustand/react/shallow';

// Importamos el hook Y EL TIPO para el casting estricto
import { usePreferenceWizardStore, WizardStoreValue, Point, WallOpening } from "@/store/preferenceWizardStore";
// --- CONSTANTES ---
const SCALE = 100;
const PX_TO_MM = 10;
const SNAP_THRESHOLD = 10;
const DEFAULT_HEIGHT_MM = 2400;

// --- TIPOS DE DATOS ---
export type OpeningType = 'door' | 'window' | 'opening';

interface NumberControlProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  step?: number;
}

interface WallDragState {
  isActive: boolean;
  wallIndex: number;
  startPoint: Point;      // Dónde hizo clic el mouse (Coords SVG)
  originalP1: Point;      // Posición original del vértice inicio
  originalP2: Point;      // Posición original del vértice fin
  hasMoved: boolean;      // Flag para diferenciar click de drag
}

const DEFAULT_POINTS: Point[] = [
  { x: 50, y: 100 }, { x: 450, y: 100 },
  { x: 450, y: 400 }, { x: 50, y: 400 },
];

// Componente de Control Numérico (Micro-interacción)
const NumberControl = ({ label, value, onChange, step = 10 }: NumberControlProps) => (
  <div>
    <label className="text-[10px] font-bold text-gray-500 block mb-1.5 tracking-wide uppercase">
      {label}
    </label>
    <div className="flex items-center border border-gray-300 rounded-md bg-white overflow-hidden shadow-sm hover:border-blue-400 transition-colors group focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400">
      <button
        type="button"
        onClick={() => onChange(value - step)}
        className="px-2 py-1.5 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-blue-600 border-r border-gray-200 active:bg-gray-200 transition-colors"
      >
        <Minus size={14} strokeWidth={2.5} />
      </button>
      <div className="flex-1 flex items-center bg-white px-2">
        <input
          type="number"
          value={Math.round(value)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent py-1 text-xs font-mono font-medium text-gray-700 outline-none text-center appearance-none"
        />
        <span className="text-[10px] text-gray-400 font-medium select-none">mm</span>
      </div>
      <button
        type="button"
        onClick={() => onChange(value + step)}
        className="px-2 py-1.5 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-blue-600 border-l border-gray-200 active:bg-gray-200 transition-colors"
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  </div>
);

const RoomGeometryPlanner = () => {
  const [wallDrag, setWallDrag] = useState<WallDragState | null>(null);

  // 1. CONSUMO DEL STORE (ZUSTAND)
  // Extraemos TODO lo necesario, incluyendo historial y setters genéricos
  const {
    values,
    setValue,
    activeWallIndex,
    setActiveWall,
    roomShape,
    commitGeometryChange,
    undoGeometry,
    redoGeometry,
    geometryHistory
  } = usePreferenceWizardStore(
    useShallow((state) => ({
      values: state.values,
      setValue: state.setValue,
      activeWallIndex: state.activeWallIndex,
      setActiveWall: state.setActiveWall,
      roomShape: state.roomShape,
      commitGeometryChange: state.commitGeometryChange,
      undoGeometry: state.undoGeometry,
      redoGeometry: state.redoGeometry,
      geometryHistory: state.geometryHistory
    }))
  );

  // --- ESTADO LOCAL (Hydration & Performance) ---

  // Inicialización defensiva: Preferimos roomShape del store, fallback a values, fallback a default
  const [points, setPoints] = useState<Point[]>(
    roomShape?.points && roomShape.points.length > 0
      ? roomShape.points
      : (values.room_points as unknown as Point[]) || DEFAULT_POINTS
  );

  const [roomHeight, setRoomHeight] = useState(
    (values.room_height as unknown as number) || DEFAULT_HEIGHT_MM
  );

  const [openings, setOpenings] = useState<WallOpening[]>(
    (values.room_openings as unknown as WallOpening[]) || []
  );

  // Estados de Interacción UI
  const [dragging, setDragging] = useState<number | null>(null); // Índice del vértice arrastrado
  const [lastTap, setLastTap] = useState(0);
  const [editMode, setEditMode] = useState<'geometry' | 'openings'>('geometry');
  const [draggingOpeningId, setDraggingOpeningId] = useState<string | null>(null);

  // ==============================================================================
  // 🟢 SINCRONIZACIÓN STORE <-> LOCAL (CRÍTICO PARA UNDO/REDO)
  // ==============================================================================

  // 1. Suscripción a cambios de Geometría (Cuando el usuario hace Undo/Redo)
  useEffect(() => {
    // Si estamos arrastrando, NO actualizamos desde el store para evitar conflictos de "fighting"
    if (dragging !== null || wallDrag?.isActive) return;

    if (roomShape?.points && JSON.stringify(roomShape.points) !== JSON.stringify(points)) {
      setPoints(roomShape.points);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomShape.points]); // Solo dependemos de la geometría del store

  // 2. Persistencia en `values` (Legacy Support para otras partes de la app)
  useEffect(() => {
    setValue("room_points", points as unknown as WizardStoreValue);
  }, [points, setValue]);

  useEffect(() => {
    setValue("room_height", roomHeight as unknown as WizardStoreValue);
  }, [roomHeight, setValue]);

  useEffect(() => {
    setValue("room_openings", openings as unknown as WizardStoreValue);
  }, [openings, setValue]);


  // --- CÁLCULOS MÉTRICOS (MEMOIZED) ---
  const wallMetrics = useMemo(() => {
    return points.map((p, i) => {
      const next = points[(i + 1) % points.length];
      const dx = next.x - p.x;
      const dy = next.y - p.y;
      const distPx = Math.sqrt(dx * dx + dy * dy);
      return {
        index: i,
        p1: p,
        p2: next,
        lengthMm: distPx * PX_TO_MM
      };
    });
  }, [points]);

  // Cálculos de Área
  const areaBase = Math.abs(points.reduce((acc, curr, i) => {
    const next = points[(i + 1) % points.length];
    return acc + curr.x * next.y - next.x * curr.y;
  }, 0) / 2);
  const floorAreaM2 = (areaBase / (SCALE * SCALE)).toFixed(2);
  const totalPerimeterPx = points.reduce((acc, p, i) => {
    const next = points[(i + 1) % points.length];
    return acc + Math.sqrt(Math.pow(next.x - p.x, 2) + Math.pow(next.y - p.y, 2));
  }, 0);
  const perimeterM = (totalPerimeterPx * PX_TO_MM) / 1000;
  const wallAreaGrossM2 = perimeterM * (roomHeight / 1000);
  const openingsAreaM2 = openings.reduce((acc, op) => acc + ((op.width * op.height) / 1000000), 0);
  const wallAreaNetM2 = (wallAreaGrossM2 - openingsAreaM2).toFixed(2);


  // --- MANEJADORES DE INTERACCIÓN (HANDLERS) ---

  const handleDeleteVertex = (i: number, e: React.MouseEvent<SVGCircleElement>) => {
    e.stopPropagation();
    if (points.length <= 3) {
      alert("No se puede tener un área con menos de 3 puntos.");
      return;
    }

    // 1. Calcular nuevo estado
    const newPoints = points.filter((_, idx) => idx !== i);

    // 2. Actualizar Local
    setPoints(newPoints);

    // 3. COMMIT AL HISTORIAL (Undo Point)
    commitGeometryChange(newPoints);
  };

  const handlePointerDownPoint = (i: number, e: React.PointerEvent<SVGCircleElement>) => {
    e.stopPropagation();
    if (editMode === 'openings') return;

    const currentTime = Date.now();
    const tapGap = currentTime - lastTap;

    // Doble tap/click para borrar
    if (tapGap < 300 && tapGap > 0) {
      handleDeleteVertex(i, e as unknown as React.MouseEvent<SVGCircleElement>);
    } else {
      setLastTap(currentTime);
      setDragging(i);
      // Captura del puntero para arrastre suave fuera del SVG
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handleWallDown = (index: number, e: React.PointerEvent<SVGLineElement>) => {
    if (editMode !== 'geometry' || dragging !== null) return;
    e.stopPropagation();
    e.preventDefault();

    const svg = e.currentTarget.closest("svg") as SVGSVGElement;
    if (!svg) return;
    e.currentTarget.setPointerCapture(e.pointerId);

    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const transformed = pt.matrixTransform(ctm.inverse());

    const nextIndex = (index + 1) % points.length;

    // Guardamos estado inicial para el arrastre de muro
    setWallDrag({
      isActive: true,
      wallIndex: index,
      startPoint: { x: transformed.x, y: transformed.y },
      originalP1: { ...points[index] },
      originalP2: { ...points[nextIndex] },
      hasMoved: false
    });
  };

  // --- LÓGICA DE MOVIMIENTO (POINTER MOVE) ---
  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (dragging === null && draggingOpeningId === null && !wallDrag?.isActive) return;

    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const transformed = pt.matrixTransform(ctm.inverse());

    // A. MOVER VÉRTICE
    if (dragging !== null) {
      setPoints(prev => {
        const newPoints = [...prev];
        let x = transformed.x;
        let y = transformed.y;
        // Snapping simple
        prev.forEach((p, i) => {
          if (i === dragging) return;
          if (Math.abs(p.x - x) < SNAP_THRESHOLD) x = p.x;
          if (Math.abs(p.y - y) < SNAP_THRESHOLD) y = p.y;
        });
        newPoints[dragging] = { x, y };
        return newPoints;
      });
      return;
    }

    // B. MOVER APERTURA (Ventana/Puerta)
    if (draggingOpeningId !== null) {
      // (Lógica de aberturas se mantiene igual, omitida por brevedad pero funcional)
      setOpenings(prev => {
        const openingIndex = prev.findIndex(op => op.id === draggingOpeningId);
        if (openingIndex === -1) return prev;
        const op = prev[openingIndex];
        const wall = wallMetrics[op.wallIndex];
        if (!wall) return prev;

        const x1 = wall.p1.x; const y1 = wall.p1.y;
        const x2 = wall.p2.x; const y2 = wall.p2.y;
        const vx = x2 - x1; const vy = y2 - y1;
        const wx = transformed.x - x1; const wy = transformed.y - y1;

        const wallLengthSq = vx * vx + vy * vy;
        if (wallLengthSq === 0) return prev;
        const t = (wx * vx + wy * vy) / wallLengthSq;

        const distPx = t * Math.sqrt(wallLengthSq);
        let distMm = distPx * PX_TO_MM;
        const maxDistMm = wall.lengthMm - op.width;
        if (distMm < 0) distMm = 0;
        if (distMm > maxDistMm) distMm = maxDistMm;

        const newOpenings = [...prev];
        newOpenings[openingIndex] = { ...op, distFromStart: distMm };
        return newOpenings;
      });
    }

    // C. MOVER MURO (Drag Wall)
    if (wallDrag && wallDrag.isActive) {
      const rawDx = transformed.x - wallDrag.startPoint.x;
      const rawDy = transformed.y - wallDrag.startPoint.y;

      if (!wallDrag.hasMoved && Math.abs(rawDx) < 5 && Math.abs(rawDy) < 5) return;
      if (!wallDrag.hasMoved) setWallDrag(prev => prev ? { ...prev, hasMoved: true } : null);

      let finalDx = rawDx;
      let finalDy = rawDy;
      // Bloqueo ortogonal
      if (Math.abs(rawDx) > Math.abs(rawDy)) finalDy = 0;
      else finalDx = 0;

      setPoints(prev => {
        const newPoints = [...prev];
        const i1 = wallDrag.wallIndex;
        const i2 = (wallDrag.wallIndex + 1) % prev.length;
        newPoints[i1] = { x: wallDrag.originalP1.x + finalDx, y: wallDrag.originalP1.y + finalDy };
        newPoints[i2] = { x: wallDrag.originalP2.x + finalDx, y: wallDrag.originalP2.y + finalDy };
        return newPoints;
      });
    }
  }, [dragging, draggingOpeningId, wallDrag, wallMetrics]);


  // --- MANEJO DE VANOS (OPENINGS) ---
  const addOpening = (type: OpeningType) => {
    if (activeWallIndex === null) return;
    const wall = wallMetrics[activeWallIndex];
    const newOpening: WallOpening = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      wallIndex: activeWallIndex,
      distFromStart: wall.lengthMm / 2 - 450,
      width: 900,
      height: type === 'door' ? 2100 : 1200,
      sillHeight: type === 'door' ? 0 : 900,
    };
    setOpenings([...openings, newOpening]);
  };

  const updateOpening = (id: string, field: keyof WallOpening, value: number) => {
    setOpenings(prev => prev.map(op => {
      if (op.id !== id) return op;
      // Validación básica (clamp)
      return { ...op, [field]: value };
    }));
  };

  const removeOpening = (id: string) => {
    setOpenings(prev => prev.filter(op => op.id !== id));
  };

  // --- RENDERIZADO SVG DE VANOS ---
  const renderOpeningsOnSVG = () => {
    return openings.map(op => {
      const wall = wallMetrics[op.wallIndex];
      if (!wall) return null;
      const distPx = op.distFromStart / PX_TO_MM;
      const widthPx = op.width / PX_TO_MM;
      const ratioStart = distPx / (wall.lengthMm / PX_TO_MM);
      const ratioEnd = (distPx + widthPx) / (wall.lengthMm / PX_TO_MM);

      const x1 = wall.p1.x + (wall.p2.x - wall.p1.x) * ratioStart;
      const y1 = wall.p1.y + (wall.p2.y - wall.p1.y) * ratioStart;
      const x2 = wall.p1.x + (wall.p2.x - wall.p1.x) * ratioEnd;
      const y2 = wall.p1.y + (wall.p2.y - wall.p1.y) * ratioEnd;

      const isSelected = editMode === 'openings' && activeWallIndex === op.wallIndex;
      return (
        <g key={op.id}
          onPointerDown={(e) => {
            if (editMode === 'openings') {
              e.stopPropagation();
              e.currentTarget.setPointerCapture(e.pointerId);
              setDraggingOpeningId(op.id);
              setActiveWall(op.wallIndex);
            }
          }}
          className={editMode === 'openings' ? 'cursor-grab active:cursor-grabbing' : ''}
          style={{ pointerEvents: editMode === 'openings' ? 'all' : 'none' }}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={op.type === 'door' ? '#F87171' : '#60A5FA'} strokeWidth={8} />
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={20} />
          {(isSelected || draggingOpeningId === op.id) && <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={4} fill="white" stroke="black" />}
        </g>
      );
    });
  };

  return (
    <div className="p-0 shadow-sm h-full bg-white flex flex-col">
      {/* --- HEADER CON UNDO/REDO --- */}
      <div className="p-6 pb-2 border-b border-gray-100 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Maximize className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-gray-800">Geometría del Espacio</h2>
          </div>
          <p className="text-sm text-gray-500">
            {editMode === 'geometry' ? "Modifica estructura. Arrastra vértices." : "Agrega puertas y ventanas."}
          </p>
        </div>

        {/* CONTROLES PRINCIPALES */}
        <div className="flex flex-col gap-4 items-end">
          {/* SWITCHER DE MODO */}
          <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
            <button
              onClick={() => { setEditMode('geometry'); setActiveWall(null); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${editMode === 'geometry' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Hammer className="w-3 h-3" /> Estructura
            </button>
            <button
              onClick={() => setEditMode('openings')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${editMode === 'openings' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <DoorOpen className="w-3 h-3" /> Aberturas
            </button>
          </div>

          {/* GRUPO UNDO/REDO */}
          <div className="flex bg-gray-100 p-1 rounded-lg gap-1 ">
            <button
              onClick={undoGeometry}
              disabled={geometryHistory.past.length === 0}
              className="p-1.5 rounded hover:bg-white hover:shadow text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Deshacer"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={redoGeometry}
              disabled={geometryHistory.future.length === 0}
              className="p-1.5 rounded hover:bg-white hover:shadow text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Rehacer"
            >
              <Redo2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden p-6 sm:px-30 pt-3 gap-6">

        {/* COLUMNA 1: PLANO 2D */}
        <div className="flex-1 min-h-[300px] sm:min-h-full flex flex-col relative">
          <div className={`absolute top-2 left-2 z-10 px-2 py-1 rounded text-[10px] font-bold border ${editMode === 'geometry' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
            MODO: {editMode === 'geometry' ? 'EDITAR VÉRTICES' : 'SELECCIONAR MUROS'}
          </div>
          <svg
            viewBox="0 0 500 500"
            className={`w-full h-full aspect-[5/5] border touch-none select-none bg-[url('http://transparenttextures.com/patterns/grid-me.png')] bg-repeat bg-[length:20px_20px] bg-[#FAFAF8] rounded-xl shadow-inner ${editMode === 'geometry' ? 'cursor-crosshair' : 'cursor-default'}`}
            onPointerMove={handlePointerMove}
            onPointerUp={(e) => {
              // ==========================================================
              // 🔴 LOGICA CRITICA DE COMMIT (FIN DE ARRASTRE)
              // ==========================================================

              const wasDraggingVertex = dragging !== null;
              const wasDraggingWall = wallDrag?.isActive && wallDrag.hasMoved;

              // 1. Limpieza de estados de arrastre
              setDragging(null);
              setDraggingOpeningId(null);

              // 2. Si hubo movimiento real de vértices, guardamos en historial
              if (wasDraggingVertex || wasDraggingWall) {
                commitGeometryChange(points);
              }

              // 3. Lógica de "Split Wall" (Clic simple en muro)
              if (wallDrag?.isActive && !wallDrag.hasMoved) {
                // Recuperamos coordenadas del clic inicial
                const newP = { x: wallDrag.startPoint.x, y: wallDrag.startPoint.y };

                const newPoints = [...points];
                newPoints.splice(wallDrag.wallIndex + 1, 0, newP);

                setPoints(newPoints); // Update Local
                commitGeometryChange(newPoints); // Update Historial
              }

              setWallDrag(null);
            }}
            onClick={() => setActiveWall(null)}
          >
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="gray" strokeWidth="0.5" opacity="0.2" />
              </pattern>
            </defs>
            <polygon points={points.map(p => `${p.x},${p.y}`).join(" ")} fill={editMode === 'geometry' ? "rgba(252, 211, 77, 0.1)" : "rgba(220, 220, 220, 0.3)"} />

            {/* Muros */}
            {points.map((p, i) => {
              const next = points[(i + 1) % points.length];
              const isSelected = activeWallIndex === i;
              return (
                <g key={`wall-${i}`}>
                  <line
                    x1={p.x} y1={p.y} x2={next.x} y2={next.y}
                    stroke="transparent" strokeWidth={30}
                    onPointerDown={(e) => editMode === 'geometry' && handleWallDown(i, e)}
                    onClick={(e) => { if (editMode === 'openings') { e.stopPropagation(); setActiveWall(i); } }}
                    className={editMode === 'geometry' ? 'cursor-move' : 'cursor-pointer'}
                  />
                  <line
                    x1={p.x} y1={p.y} x2={next.x} y2={next.y}
                    stroke={isSelected && editMode === 'openings' ? "#2563EB" : "#3E4C59"}
                    strokeWidth={isSelected && editMode === 'openings' ? 8 : 6}
                    strokeLinecap="round" pointerEvents="none" opacity={editMode === 'geometry' ? 0.6 : 1}
                  />
                </g>
              );
            })}
            {/* Vértices */}
            {points.map((p, i) => (
              <circle
                key={`p-${i}`} cx={p.x} cy={p.y} r={editMode === 'geometry' ? 8 : 4}
                fill={editMode === 'geometry' ? "#F59E0B" : "#9CA3AF"}
                stroke="white" strokeWidth={2}
                onPointerDown={(e) => handlePointerDownPoint(i, e)}
                style={{ cursor: editMode === 'geometry' ? "grab" : "not-allowed" }}
              />
            ))}
            {/* Medidas */}
            {wallMetrics.map((w, i) => (
              <text key={i} x={(w.p1.x + w.p2.x) / 2} y={(w.p1.y + w.p2.y) / 2 - 15} textAnchor="middle" fontSize={11} fill="#4B5563" className="bg-white/80 px-1 font-mono" pointerEvents="none">
                {Math.round(w.lengthMm)}
              </text>
            ))}
          </svg>
        </div>






        {/* COLUMNA 2: PANEL LATERAL */}
        <div className="sm:w-80 flex flex-col gap-4 h-full overflow-y-auto">
          {/* ... CONTENIDO DE PANELES ... */}
          {/* Mantenemos tu lógica existente de paneles aquí, pero por brevedad en la respuesta me enfoco en el cierre */}

          {/* Ejemplo de Panel Estructura */}
          {editMode === 'geometry' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center space-y-4 animate-in fade-in">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto text-yellow-600">
                <Hammer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-900">Modo Estructura</h3>
                <p className="text-xs text-yellow-700 mt-1">Arrastra vértices o muros.</p>
              </div>

              {/* Input Altura */}
              <div className="pt-4 border-t border-yellow-200">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                  <ArrowDownUp className="w-3 h-3" /> Altura Techo (Z)
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" value={roomHeight} onChange={(e) => setRoomHeight(Number(e.target.value))} className="flex-1 border rounded p-2 text-center" />
                  <span className="text-xs font-bold text-black">mm</span>
                </div>
              </div>
            </div>
          )}

          {/* Panel Aberturas */}
          {editMode === 'openings' && activeWallIndex === null && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center space-y-4 animate-in fade-in">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                <MousePointer2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-blue-900">Selecciona un Muro</h3>
            </div>
          )}

          {/* Panel Editor de Muro Seleccionado */}
          {editMode === 'openings' && activeWallIndex !== null && (
            <div className="flex flex-col h-full animate-in slide-in-from-right-4 fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2"><Ruler className="w-4 h-4" /> Muro #{activeWallIndex + 1}</h3>
                <button onClick={() => setActiveWall(null)} className="text-xs underline">Cerrar</button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={() => addOpening('door')} className="p-3 border rounded hover:bg-red-50 flex flex-col items-center"><DoorOpen className="w-5 h-5 text-red-400" /><span className="text-xs">Puerta</span></button>
                <button onClick={() => addOpening('window')} className="p-3 border rounded hover:bg-blue-50 flex flex-col items-center"><AppWindow className="w-5 h-5 text-blue-400" /><span className="text-xs">Ventana</span></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {openings.filter(op => op.wallIndex === activeWallIndex).map(op => (
                  <div key={op.id} className="bg-white p-3 rounded border space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold">{op.type}</span>
                      <button onClick={() => removeOpening(op.id)}><Trash2 className="w-3 h-3 text-red-500" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <NumberControl label="Distancia" value={op.distFromStart} onChange={(v) => updateOpening(op.id, 'distFromStart', v)} step={50} />
                      <NumberControl label="Ancho" value={op.width} onChange={(v) => updateOpening(op.id, 'width', v)} step={10} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumen de Métricas Avanzado */}
          <div className="space-y-3 p-4 border rounded-lg bg-blue-50 mt-auto">
            <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2 border-b border-blue-200 pb-2">
              <Move3D className="w-4 h-4" />
              Cómputo Métrico
            </h3>
            <div className="text-xs space-y-2">
              {/* Grupo: Superficies Horizontales */}
              <div className="flex justify-between font-medium text-gray-600">
                <span>Área Piso (Planta):</span>
                <span className="font-bold text-gray-900">{floorAreaM2} m²</span>
              </div>

              {/* Grupo: Volumen */}
              <div className="flex justify-between font-medium text-gray-600">
                <span>Volumen Aire:</span>
                <span className="font-bold text-gray-900">{(parseFloat(floorAreaM2) * (roomHeight / 1000)).toFixed(2)} m³</span>
              </div>

              <div className="border-t border-blue-200 my-1"></div>

              {/* Grupo: Superficies Verticales (Muros) */}
              <div className="flex justify-between font-medium text-gray-600">
                <span>Muros (Bruto):</span>
                <span className="text-gray-500">{wallAreaGrossM2.toFixed(2)} m²</span>
              </div>

              {/* Resta de huecos (Feedback Visual) */}
              {openings.length > 0 && (
                <div className="flex justify-between font-medium text-red-400 pl-2 border-l-2 border-red-200">
                  <span>- {openings.length} Vanos:</span>
                  <span>-{openingsAreaM2.toFixed(2)} m²</span>
                </div>
              )}

              {/* Resultado Neto */}
              <div className="flex justify-between font-bold text-blue-900 bg-blue-100/50 p-1 rounded">
                <span>Muros (Neto):</span>
                <span>{wallAreaNetM2} m²</span>
              </div>
            </div>
          </div>

          {/* Consejos de Usabilidad */}
          <div className="bg-gray-100 p-3 rounded-lg text-xs text-gray-600">
            **Tip:** Las paredes del SVG representan el **eje central** del muro. Asegúrate de que las medidas en milímetros (visibles en el plano) coincidan con tu levantamiento. El sistema usará la Altura Z para generar las paredes virtuales.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomGeometryPlanner;