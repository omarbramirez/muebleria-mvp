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
  ArrowLeftRight,
  Hammer, // Icono para modo estructura
  MousePointer2 // Icono para modo selección/aberturas
} from "lucide-react";

// ... imports ...
import { usePreferenceWizardStore } from "@/store/preferenceWizardStore";


// --- CONSTANTES ---
const SCALE = 100;
const PX_TO_MM = 10;
const SNAP_THRESHOLD = 10;
const DEFAULT_HEIGHT_MM = 2400;

// --- TIPOS DE DATOS ---
interface Point { x: number; y: number; }
export type OpeningType = 'door' | 'window' | 'opening';

export interface WallOpening {
  id: string;
  type: OpeningType;
  wallIndex: number;
  distFromStart: number;
  width: number;
  height: number;
  sillHeight: number;
}

const DEFAULT_POINTS = [
  { x: 50, y: 100 }, { x: 450, y: 100 },
  { x: 450, y: 400 }, { x: 50, y: 400 },
];

const RoomGeometryPlanner = () => {
  
      // "State Object" universal en Zustand
      // Estrategia de Integración (El Patrón "Sync")
      const { values, setValue } = usePreferenceWizardStore();

  // --- ESTADO ---
  const [points, setPoints] = useState<Point[]>(values.room_points || DEFAULT_POINTS);
  const [roomHeight, setRoomHeight] = useState(values.room_height || DEFAULT_HEIGHT_MM);
  const [openings, setOpenings] = useState<WallOpening[]>(values.room_openings || []);

  // Estado de Interacción
  const [dragging, setDragging] = useState<number | null>(null);
  const [lastTap, setLastTap] = useState(0);
  const [selectedWallIndex, setSelectedWallIndex] = useState<number | null>(null);

  // NUEVO: MODO DE EDICIÓN
  const [editMode, setEditMode] = useState<'geometry' | 'openings'>('geometry');

  // --- SINCRONIZACIÓN ---
  useEffect(() => { setValue("room_points", points); }, [points, setValue]);
  useEffect(() => { setValue("room_height", roomHeight); }, [roomHeight, setValue]);
  useEffect(() => { setValue("room_openings", openings); }, [openings, setValue]);

  // --- CÁLCULOS ---
  // --- CÁLCULOS AVANZADOS ---

  // 1. Área de Piso (Planta) - Shoelace Formula
  const areaBase = Math.abs(points.reduce((acc: number, curr: Point, i: number) => {
    const next = points[(i + 1) % points.length];
    return acc + curr.x * next.y - next.x * curr.y;
  }, 0) / 2);

  // Convertir a m² reales
  const floorAreaM2 = (areaBase / (SCALE * SCALE)).toFixed(2);

  // 2. Perímetro Total (Suma de longitudes de muros)
  const totalPerimeterPx = points.reduce((acc, p, i) => {
    const next = points[(i + 1) % points.length];
    const dist = Math.sqrt(Math.pow(next.x - p.x, 2) + Math.pow(next.y - p.y, 2));
    return acc + dist;
  }, 0);

  const perimeterM = (totalPerimeterPx * PX_TO_MM) / 1000; // Metros lineales

  // 3. Área de Muros Bruta (Sin restar huecos)
  const wallAreaGrossM2 = perimeterM * (roomHeight / 1000);

  // 4. Área de Vanos (Huecos)
  const openingsAreaM2 = openings.reduce((acc, op) => {
    // Convertimos mm² a m²: (ancho * alto) / 1,000,000
    return acc + ((op.width * op.height) / 1000000);
  }, 0);

  // 5. Área de Muros Neta (Real para pintura/acabados)
  const wallAreaNetM2 = (wallAreaGrossM2 - openingsAreaM2).toFixed(2);

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

  // --- LÓGICA DE GEOMETRÍA (Restaurada) ---

  const handleAddVertex = (index: number, e: React.PointerEvent<SVGLineElement>) => {
    e.stopPropagation();
    e.preventDefault(); // Importante para evitar comportamientos dobles

    const svg = e.currentTarget.closest("svg") as SVGSVGElement;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const transformed = pt.matrixTransform(ctm.inverse());

    setPoints(prev => {
      const newPoints = [...prev];
      newPoints.splice(index + 1, 0, { x: transformed.x, y: transformed.y });
      return newPoints;
    });
  };

  const handleDeleteVertex = (i: number, e: React.MouseEvent<SVGCircleElement>) => {
    e.stopPropagation();
    setPoints(prev => {
      if (prev.length <= 3) return prev;
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const handlePointerDownPoint = (i: number, e: React.PointerEvent<SVGCircleElement>) => {
    e.stopPropagation();
    // Si estamos en modo aberturas, no permitimos mover puntos para no romper referencias
    if (editMode === 'openings') return;

    const currentTime = Date.now();
    const tapGap = currentTime - lastTap;

    if (tapGap < 300 && tapGap > 0) {
      // Doble tap/click para borrar
      handleDeleteVertex(i, e as unknown as React.MouseEvent<SVGCircleElement>);
    } else {
      setLastTap(currentTime);
      setDragging(i);
    }
  };

  // --- LÓGICA DE VANOS ---
  const addOpening = (type: OpeningType) => {
    if (selectedWallIndex === null) return;
    const wall = wallMetrics[selectedWallIndex];
    const newOpening: WallOpening = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      wallIndex: selectedWallIndex,
      distFromStart: wall.lengthMm / 2 - 450,
      width: 900,
      height: type === 'door' ? 2100 : 1200,
      sillHeight: type === 'door' ? 0 : 900,
    };
    setOpenings([...openings, newOpening]);
  };

  const updateOpening = (id: string, field: keyof WallOpening, value: number) => {
    setOpenings(prev => prev.map(op => op.id === id ? { ...op, [field]: value } : op));
  };

  const removeOpening = (id: string) => {
    setOpenings(prev => prev.filter(op => op.id !== id));
  };

  // --- MOVIMIENTO SVG ---
  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (dragging === null) return;
    e.preventDefault();
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const transformed = pt.matrixTransform(ctm.inverse());

    setPoints(prev => {
      const newPoints = [...prev];
      let x = transformed.x; let y = transformed.y;
      prev.forEach((p, i) => {
        if (i === dragging) return;
        if (Math.abs(p.x - x) < SNAP_THRESHOLD) x = p.x;
        if (Math.abs(p.y - y) < SNAP_THRESHOLD) y = p.y;
      });
      newPoints[dragging] = { x, y };
      return newPoints;
    });
  }, [dragging]);

  // --- RENDERIZADO DE VANOS SVG ---
  const renderOpeningsOnSVG = () => {
    return openings.map(op => {
      const wall = wallMetrics[op.wallIndex];
      if (!wall) return null;
      const ratioStart = op.distFromStart / wall.lengthMm;
      const ratioEnd = (op.distFromStart + op.width) / wall.lengthMm;
      const x1 = wall.p1.x + (wall.p2.x - wall.p1.x) * ratioStart;
      const y1 = wall.p1.y + (wall.p2.y - wall.p1.y) * ratioStart;
      const x2 = wall.p1.x + (wall.p2.x - wall.p1.x) * ratioEnd;
      const y2 = wall.p1.y + (wall.p2.y - wall.p1.y) * ratioEnd;

      return (
        <g key={op.id} onClick={(e) => {
          if (editMode === 'openings') {
            e.stopPropagation();
            setSelectedWallIndex(op.wallIndex);
          }
        }}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={op.type === 'door' ? '#F87171' : '#60A5FA'} strokeWidth={8} />
          {editMode === 'openings' && selectedWallIndex === op.wallIndex && (
            <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={4} fill="white" stroke="black" />
          )}
        </g>
      );
    });
  };

  return (
    <div className="p-0 shadow-sm h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 pb-2 border-b border-gray-100 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Maximize className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-gray-800">Geometría del Espacio</h2>
          </div>
          <p className="text-sm text-gray-500">
            {editMode === 'geometry'
              ? "Modifica la forma del cuarto. Arrastra puntos o haz clic en líneas para crear muros."
              : "Agrega puertas y ventanas. Haz clic en un muro para seleccionarlo."}
          </p>
        </div>

        {/* SWITCHER DE MODO (LA SOLUCIÓN UX) */}
        <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
          <button
            onClick={() => { setEditMode('geometry'); setSelectedWallIndex(null); }}
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
      </div>

      <div className="flex flex-col sm:flex-row flex-1 overflow-hidden p-6 pt-3 gap-6">

        {/* COLUMNA 1: PLANO 2D */}
        <div className="flex-1 min-h-[300px] sm:min-h-full flex flex-col relative">
          {/* Indicador visual de modo */}
          <div className={`absolute top-2 left-2 z-10 px-2 py-1 rounded text-[10px] font-bold border ${editMode === 'geometry' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
            MODO: {editMode === 'geometry' ? 'EDITAR VÉRTICES' : 'SELECCIONAR MUROS'}
          </div>

          <svg
            viewBox="0 0 500 500"
            className={`w-full h-full aspect-[5/5] border touch-none select-none bg-[url('http://transparenttextures.com/patterns/grid-me.png')] bg-repeat bg-[length:20px_20px] bg-[#FAFAF8] rounded-xl shadow-inner
                        ${editMode === 'geometry' ? 'cursor-crosshair' : 'cursor-default'}
                    `}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDragging(null)}
            onClick={() => setSelectedWallIndex(null)}
          >
            {/* ... Defs (Patrón) ... */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="gray" strokeWidth="0.5" opacity="0.2" />
              </pattern>
            </defs>

            {/* Polígono */}
            <polygon points={points.map(p => `${p.x},${p.y}`).join(" ")} fill={editMode === 'geometry' ? "rgba(252, 211, 77, 0.1)" : "rgba(220, 220, 220, 0.3)"} />

            {/* Muros (Líneas) */}
            {points.map((p, i) => {
              const next = points[(i + 1) % points.length];
              const isSelected = selectedWallIndex === i;

              return (
                <g key={`wall-${i}`}>
                  {/* ZONA DE CLIC DE LA LÍNEA (Invisible y gruesa) */}
                  <line
                    x1={p.x} y1={p.y} x2={next.x} y2={next.y}
                    stroke="transparent" strokeWidth={30}
                    // LÓGICA CONDICIONAL DE EVENTOS
                    onPointerDown={(e) => editMode === 'geometry' && handleAddVertex(i, e)}
                    onClick={(e) => {
                      if (editMode === 'openings') {
                        e.stopPropagation();
                        setSelectedWallIndex(prev => prev === i ? null : i);
                      }
                    }}
                    className={editMode === 'geometry' ? 'cursor-copy' : 'cursor-pointer'}
                  />
                  {/* LÍNEA VISIBLE */}
                  <line
                    x1={p.x} y1={p.y} x2={next.x} y2={next.y}
                    stroke={isSelected && editMode === 'openings' ? "#2563EB" : "#3E4C59"}
                    strokeWidth={isSelected && editMode === 'openings' ? 8 : 6}
                    strokeLinecap="round"
                    pointerEvents="none"
                    opacity={editMode === 'geometry' ? 0.6 : 1}
                  />
                </g>
              );
            })}

            {renderOpeningsOnSVG()}

            {/* Vértices (Puntos) */}
            {points.map((p, i) => (
              <circle
                key={`p-${i}`} cx={p.x} cy={p.y} r={editMode === 'geometry' ? 8 : 4}
                fill={editMode === 'geometry' ? "#F59E0B" : "#9CA3AF"}
                stroke="white" strokeWidth={2}
                // Solo permitir mover/borrar en modo Geometría
                onPointerDown={(e) => handlePointerDownPoint(i, e)}
                style={{ cursor: editMode === 'geometry' ? "grab" : "not-allowed" }}
              />
            ))}

            {/* Medidas */}
            {wallMetrics.map((w, i) => (
              <text key={i}
                x={(w.p1.x + w.p2.x) / 2} y={(w.p1.y + w.p2.y) / 2 - 15}
                textAnchor="middle" fontSize={11} fill="#4B5563"
                className="bg-white/80 px-1 font-mono" pointerEvents="none"
              >
                {Math.round(w.lengthMm)}
              </text>
            ))}
          </svg>
        </div>

        {/* COLUMNA 2: PANEL LATERAL (Lógica Condicional) */}
        <div className="sm:w-80 flex flex-col gap-4 h-full overflow-y-auto">

          {/* MODO ESTRUCTURA */}
          {editMode === 'geometry' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center space-y-4 animate-in fade-in">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto text-yellow-600">
                <Hammer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-900">Modo Estructura</h3>
                <p className="text-xs text-yellow-700 mt-1">
                  Modifica la forma de tu espacio.
                </p>
              </div>
              <ul className="text-left text-xs text-yellow-800 space-y-2 bg-white/50 p-4 rounded-lg">
                <li className="flex gap-2">🔹 <b>Arrastra</b> los puntos naranjas para mover esquinas.</li>
                <li className="flex gap-2">🔹 <b>Clic</b> en una línea gris para crear un nuevo vértice.</li>
                <li className="flex gap-2">🔹 <b>Doble Clic</b> en un punto para borrarlo.</li>
              </ul>
              {/* Input de Altura Global */}
              <div className="pt-4 border-t border-yellow-200">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                  <ArrowDownUp className="w-3 h-3" /> Altura Techo (Z)
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" value={roomHeight} onChange={(e) => setRoomHeight(Number(e.target.value))} className="flex-1 border rounded p-2 text-center" />
                  <span className="text-xs font-bold">mm</span>
                </div>
              </div>
            </div>
          )}

          {/* MODO ABERTURAS (Selección de Muros) */}
          {editMode === 'openings' && selectedWallIndex === null && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center space-y-4 animate-in fade-in">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                <MousePointer2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">Modo Aberturas</h3>
                <p className="text-xs text-blue-700 mt-1">
                  Selecciona un muro para agregar elementos.
                </p>
              </div>
              <p className="text-xs text-blue-600/80 italic">
                Las líneas azules se resaltarán al pasar el mouse.
              </p>
            </div>
          )}

          {/* EDITOR DE MURO (Solo si hay selección en modo aberturas) */}
          {editMode === 'openings' && selectedWallIndex !== null && (
            <div className="flex flex-col h-full animate-in slide-in-from-right-4 fade-in duration-200">
              {/* ... (Mismo código de editor de muro que te di antes) ... */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                  <Ruler className="w-4 h-4" /> Muro #{selectedWallIndex + 1}
                </h3>
                <button onClick={() => setSelectedWallIndex(null)} className="text-xs text-gray-400 hover:text-gray-600 underline">Cerrar</button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={() => addOpening('door')} className="flex flex-col items-center justify-center p-3 bg-white border hover:border-red-400 hover:bg-red-50 rounded-lg transition-all gap-1 group">
                  <DoorOpen className="w-5 h-5 text-gray-500 group-hover:text-red-500" /><span className="text-xs font-medium text-gray-600">Puerta</span>
                </button>
                <button onClick={() => addOpening('window')} className="flex flex-col items-center justify-center p-3 bg-white border hover:border-blue-400 hover:bg-blue-50 rounded-lg transition-all gap-1 group">
                  <AppWindow className="w-5 h-5 text-gray-500 group-hover:text-blue-500" /><span className="text-xs font-medium text-gray-600">Ventana</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {openings.filter(op => op.wallIndex === selectedWallIndex).map(op => (
                  <div key={op.id} className="bg-white p-3 rounded-lg border shadow-sm relative">
                    <div className="flex items-center gap-2 mb-2">
                      {op.type === 'door' ? <DoorOpen className="w-4 h-4 text-red-400" /> : <AppWindow className="w-4 h-4 text-blue-400" />}
                      <span className="text-xs font-bold text-gray-700">{op.type === 'door' ? 'Puerta' : 'Ventana'}</span>
                      <button onClick={() => removeOpening(op.id)} className="ml-auto text-gray-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-[9px] text-gray-400 block">DISTANCIA</label><input type="number" value={Math.round(op.distFromStart)} onChange={(e) => updateOpening(op.id, 'distFromStart', Number(e.target.value))} className="w-full border rounded px-1 text-xs" /></div>
                      <div><label className="text-[9px] text-gray-400 block">ANCHO</label><input type="number" value={op.width} onChange={(e) => updateOpening(op.id, 'width', Number(e.target.value))} className="w-full border rounded px-1 text-xs" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
{/* Resumen de Métricas Avanzado */}
  <div className="space-y-3 p-4 border rounded-lg bg-blue-50 mt-auto"> {/* mt-auto para empujarlo al fondo si hay espacio */}
      <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2 border-b border-blue-200 pb-2">
          <Move3D className="w-4 h-4"/>
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
  );
};

export default RoomGeometryPlanner;