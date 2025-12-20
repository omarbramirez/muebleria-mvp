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
} from "lucide-react";

// Importamos el hook Y EL TIPO para el casting estricto
import { usePreferenceWizardStore, WizardStoreValue } from "@/store/preferenceWizardStore";


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

interface NumberControlProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  step?: number; // Paso por defecto (ej. 10mm)
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


const NumberControl = ({ label, value, onChange, step = 10 }: NumberControlProps) => (
  <div>
    <label className="text-[10px] font-bold text-gray-500 block mb-1.5 tracking-wide uppercase">
      {label}
    </label>
    <div className="flex items-center border border-gray-300 rounded-md bg-white overflow-hidden shadow-sm hover:border-blue-400 transition-colors group focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400">

      {/* Botón Decrementar */}
      <button
        type="button"
        onClick={() => onChange(value - step)}
        className="px-2 py-1.5 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-blue-600 border-r border-gray-200 active:bg-gray-200 transition-colors"
      >
        <Minus size={14} strokeWidth={2.5} />
      </button>

      {/* Input Numérico */}
      <div className="flex-1 flex items-center bg-white px-2">
        <input
          type="number"
          value={Math.round(value)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent py-1 text-xs font-mono font-medium text-gray-700 outline-none text-center appearance-none"
        />
        <span className="text-[10px] text-gray-400 font-medium select-none">mm</span>
      </div>

      {/* Botón Incrementar */}
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
  // 1. USAR ESTADO GLOBAL EN LUGAR DE LOCAL
  const { values, setValue, activeWallIndex, setActiveWall } = usePreferenceWizardStore();

  // --- ESTADO (CORRECCIÓN DE TIPADO ESTRICTO) ---

  // 1. Puntos: Casting doble para asegurar que es Point[]
  const [points, setPoints] = useState<Point[]>(
    (values.room_points as unknown as Point[]) || DEFAULT_POINTS
  );

  // 2. Altura: Casting doble para asegurar que es number
  const [roomHeight, setRoomHeight] = useState(
    (values.room_height as unknown as number) || DEFAULT_HEIGHT_MM
  );

  // 3. Aberturas: Casting doble para asegurar que es WallOpening[]
  const [openings, setOpenings] = useState<WallOpening[]>(
    (values.room_openings as unknown as WallOpening[]) || []
  );

  // Estado de Interacción
  const [dragging, setDragging] = useState<number | null>(null);
  const [lastTap, setLastTap] = useState(0);

  // MODO DE EDICIÓN
  const [editMode, setEditMode] = useState<'geometry' | 'openings'>('geometry');

  const [draggingOpeningId, setDraggingOpeningId] = useState<string | null>(null);

  // ==============================================================================
  // 🟢 SOLUCIÓN DE SINCRONIZACIÓN (NUEVO CÓDIGO)
  // ==============================================================================

  // Sincronización Global -> Local (MODIFICADA)
  useEffect(() => {
    // CLÁUSULA DE PROTECCIÓN (CRÍTICA):
    // Si estamos editando activamente (arrastrando muro o ventana),
    // bloqueamos la entrada de datos externos. Nosotros somos la autoridad ahora.
    if (dragging !== null || draggingOpeningId !== null) return;

    const storeOpenings = values.room_openings as unknown as WallOpening[];

    // VALIDACIÓN DE PROFUNDIDAD:
    // Solo actualizamos si la data entrante es semánticamente diferente a la local.
    // Esto rompe el ciclo cuando no estamos arrastrando (ej. al agregar una ventana nueva).
    if (storeOpenings && JSON.stringify(storeOpenings) !== JSON.stringify(openings)) {
      setOpenings(storeOpenings);
    }

    // Es vital incluir los estados de dragging en las dependencias para que
    // el efecto se "reactive" apenas soltemos el mouse.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.room_openings, dragging, draggingOpeningId]);

  // (Opcional) Hacemos lo mismo para puntos y altura por si en el futuro el 3D los edita
  useEffect(() => {
    const storeHeight = values.room_height as unknown as number;
    if (storeHeight && storeHeight !== roomHeight) setRoomHeight(storeHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.room_height]);

  // --- SINCRONIZACIÓN (ESCRITURA SEGURA) ---
  useEffect(() => {
    setValue("room_points", points as unknown as WizardStoreValue);
  }, [points, setValue]);

  useEffect(() => {
    setValue("room_height", roomHeight as unknown as WizardStoreValue);
  }, [roomHeight, setValue]);

  useEffect(() => {
    setValue("room_openings", openings as unknown as WizardStoreValue);
  }, [openings, setValue]);

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

  // --- LÓGICA DE GEOMETRÍA ---

  const handleAddVertex = (index: number, e: React.PointerEvent<SVGLineElement>) => {
    e.stopPropagation();
    e.preventDefault();

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
    if (editMode === 'openings') return;

    const currentTime = Date.now();
    const tapGap = currentTime - lastTap;

    if (tapGap < 300 && tapGap > 0) {
      handleDeleteVertex(i, e as unknown as React.MouseEvent<SVGCircleElement>);
    } else {
      setLastTap(currentTime);
      setDragging(i);
    }
  };



  // LÓGICA: Iniciar interacción con Muro (Click o Drag)
  const handleWallDown = (index: number, e: React.PointerEvent<SVGLineElement>) => {
    // Solo permitimos esto en modo estructura y si no estamos haciendo otra cosa
    if (editMode !== 'geometry' || dragging !== null) return;

    e.stopPropagation();
    e.preventDefault();

    const svg = e.currentTarget.closest("svg") as SVGSVGElement;
    if (!svg) return;

    // Captura del puntero para asegurar fluidez aunque el mouse salga de la línea
    e.currentTarget.setPointerCapture(e.pointerId);

    // Obtener coordenadas SVG del clic
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const transformed = pt.matrixTransform(ctm.inverse());

    // Guardamos el estado inicial exacto (Snapshot)
    const nextIndex = (index + 1) % points.length;

    setWallDrag({
      isActive: true,
      wallIndex: index,
      startPoint: { x: transformed.x, y: transformed.y },
      originalP1: { ...points[index] },
      originalP2: { ...points[nextIndex] },
      hasMoved: false
    });
  };









  // --- LÓGICA DE VANOS ---
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


  // --- LÓGICA DE ACTUALIZACIÓN CON VALIDACIÓN (CLAMPING) ---
  const updateOpening = (id: string, field: keyof WallOpening, value: number) => {
    setOpenings(prev => prev.map(op => {
      if (op.id !== id) return op;

      const wall = wallMetrics[op.wallIndex];
      const maxWallLength = wall?.lengthMm || 0;
      const maxWallHeight = Number(roomHeight);

      const currentSill = Number(op.sillHeight) || 0;
      const currentHeight = Number(op.height) || 0;
      const currentDist = Number(op.distFromStart) || 0;
      const currentWidth = Number(op.width) || 0;

      let newValue = Number(value);

      if (field === 'height') {
        newValue = Math.max(10, newValue);
        if (newValue + currentSill > maxWallHeight) {
          newValue = Math.max(10, maxWallHeight - currentSill);
        }
      }

      if (field === 'sillHeight') {
        newValue = Math.max(0, newValue);
        if (newValue + currentHeight > maxWallHeight) {
          newValue = Math.max(0, maxWallHeight - currentHeight);
        }
      }

      if (field === 'width') {
        newValue = Math.max(10, newValue);
        if (newValue + currentDist > maxWallLength) {
          newValue = Math.max(10, maxWallLength - currentDist);
        }
      }

      if (field === 'distFromStart') {
        newValue = Math.max(0, newValue);
        if (newValue + currentWidth > maxWallLength) {
          newValue = Math.max(0, maxWallLength - currentWidth);
        }
      }

      return { ...op, [field]: newValue };
    }));
  };

  const removeOpening = (id: string) => {
    setOpenings(prev => prev.filter(op => op.id !== id));
  };

  // --- MOVIMIENTO SVG ---
  // Reemplaza tu handlePointerMove actual con este:

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();

    // Si no hay acción activa, salir
    if (dragging === null && draggingOpeningId === null && !wallDrag?.isActive) return;

    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    // Transformación de coordenadas de pantalla a SVG
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const transformed = pt.matrixTransform(ctm.inverse());

    // --- CASO A: ARRASTRAR VÉRTICES (GEOMETRÍA) ---
    if (dragging !== null) {
      setPoints(prev => {
        const newPoints = [...prev];
        let x = transformed.x;
        let y = transformed.y;

        // Snapping simple a otros puntos
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

    // --- CASO B: DESLIZAR ABERTURA (PUERTA/VENTANA) ---
    if (draggingOpeningId !== null) {
      setOpenings(prev => {
        // 1. Encontrar la abertura y su muro correspondiente
        const openingIndex = prev.findIndex(op => op.id === draggingOpeningId);
        if (openingIndex === -1) return prev;

        const op = prev[openingIndex];
        const wall = wallMetrics[op.wallIndex];
        if (!wall) return prev;

        // 2. Definir vectores
        // P1: Inicio del muro, P2: Fin del muro, M: Mouse
        const x1 = wall.p1.x;
        const y1 = wall.p1.y;
        const x2 = wall.p2.x;
        const y2 = wall.p2.y;

        // Vector del Muro (V)
        const vx = x2 - x1;
        const vy = y2 - y1;

        // Vector Mouse desde P1 (W)
        const wx = transformed.x - x1;
        const wy = transformed.y - y1;

        // 3. Proyección Escalar: t = (W · V) / |V|^2
        // Esto nos da la posición normalizada (0 a 1) del mouse a lo largo del muro
        const wallLengthSq = vx * vx + vy * vy;
        // Evitar división por cero
        if (wallLengthSq === 0) return prev;

        const t = (wx * vx + wy * vy) / wallLengthSq;

        // 4. Convertir 't' a milímetros reales
        // Distancia en píxeles desde el inicio
        const distPx = t * Math.sqrt(wallLengthSq);
        let distMm = distPx * PX_TO_MM;

        // 5. Aplicar Clamping (Restricciones)
        // No puede ser menor a 0
        // No puede ser mayor que (LargoMuro - AnchoAbertura)
        const maxDistMm = wall.lengthMm - op.width;

        if (distMm < 0) distMm = 0;
        if (distMm > maxDistMm) distMm = maxDistMm;

        // 6. Actualizar inmutablemente
        const newOpenings = [...prev];
        newOpenings[openingIndex] = {
          ...op,
          distFromStart: distMm
        };

        return newOpenings;
      });
    }

    // --- CASO C: ARRASTRE PARALELO DE MURO (CON BLOQUEO ORTOGONAL) ---
    if (wallDrag && wallDrag.isActive) {
      const rawDx = transformed.x - wallDrag.startPoint.x;
      const rawDy = transformed.y - wallDrag.startPoint.y;

      // 1. Filtro de Jitter (Zona muerta inicial)
      if (!wallDrag.hasMoved && Math.abs(rawDx) < 5 && Math.abs(rawDy) < 5) return;

      if (!wallDrag.hasMoved) {
        setWallDrag(prev => prev ? { ...prev, hasMoved: true } : null);
      }

      // 2. Lógica de Bloqueo de Eje (Ortho-Lock)
      // Determinamos cuál es el eje dominante del movimiento del mouse
      let finalDx = rawDx;
      let finalDy = rawDy;

      if (Math.abs(rawDx) > Math.abs(rawDy)) {
        // Movimiento Horizontal predominante -> Bloqueamos Y
        finalDy = 0;
      } else {
        // Movimiento Vertical predominante -> Bloqueamos X
        finalDx = 0;
      }

      setPoints(prev => {
        // Captura segura de valores
        const { wallIndex, originalP1, originalP2 } = wallDrag;

        const newPoints = [...prev];
        const i1 = wallIndex;
        const i2 = (wallIndex + 1) % prev.length;

        // Aplicamos el Delta restringido a los puntos originales
        newPoints[i1] = {
          x: originalP1.x + finalDx,
          y: originalP1.y + finalDy
        };
        newPoints[i2] = {
          x: originalP2.x + finalDx,
          y: originalP2.y + finalDy
        };

        return newPoints;
      });
    }

  }, [dragging, draggingOpeningId, wallDrag, wallMetrics]);// Dependencias críticas

  // --- RENDERIZADO DE VANOS SVG ---
  // Reemplaza tu función renderOpeningsOnSVG con esta:

  const renderOpeningsOnSVG = () => {
    return openings.map(op => {
      const wall = wallMetrics[op.wallIndex];
      if (!wall) return null;

      // Convertir mm a píxeles para renderizar
      const distPx = op.distFromStart / PX_TO_MM;
      const widthPx = op.width / PX_TO_MM;

      // Cálculo de interpolación lineal para coordenadas (x,y)
      // ratioStart: porcentaje del recorrido donde empieza la abertura
      const ratioStart = distPx / (wall.lengthMm / PX_TO_MM);
      const ratioEnd = (distPx + widthPx) / (wall.lengthMm / PX_TO_MM);

      const x1 = wall.p1.x + (wall.p2.x - wall.p1.x) * ratioStart;
      const y1 = wall.p1.y + (wall.p2.y - wall.p1.y) * ratioStart;
      const x2 = wall.p1.x + (wall.p2.x - wall.p1.x) * ratioEnd;
      const y2 = wall.p1.y + (wall.p2.y - wall.p1.y) * ratioEnd;

      const isSelected = editMode === 'openings' && activeWallIndex === op.wallIndex;
      const isDraggingThis = draggingOpeningId === op.id;

      return (
        <g
          key={op.id}
          // EVENTO DE INICIO DE ARRASTRE
          onPointerDown={(e) => {
            if (editMode === 'openings') {
              e.stopPropagation(); // Evita seleccionar el muro o crear puntos
              e.currentTarget.setPointerCapture(e.pointerId); // Captura crítica para UX fluida
              setDraggingOpeningId(op.id);
              setActiveWall(op.wallIndex); // Opcional: selecciona el muro al tocar la ventana
            }
          }}
          onClick={(e) => e.stopPropagation()} // Evita burbujeo al clic simple
          className={editMode === 'openings' ? 'cursor-grab active:cursor-grabbing' : ''}
          style={{ pointerEvents: editMode === 'openings' ? 'all' : 'none' }}
        >
          {/* Línea de representación */}
          <line
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={op.type === 'door' ? '#F87171' : '#60A5FA'}
            strokeWidth={8}
          />

          {/* Hitbox transparente para facilitar el agarre (UX Senior) */}
          <line
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="transparent"
            strokeWidth={20}
          />

          {/* Indicador de selección */}
          {(isSelected || isDraggingThis) && (
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
      </div>

      <div className="flex flex-col flex-1 overflow-hidden p-6 sm:px-30  pt-3 gap-6">

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
            onPointerUp={(e) => {
              // 1. Limpieza de arrastres previos
              setDragging(null);
              setDraggingOpeningId(null);

              // 2. Lógica de finalización de Muro
              if (wallDrag?.isActive) {
                // Si NO se movió (hasMoved === false), significa que fue un Clic rápido.
                // Ejecutamos la lógica original de "Añadir Vértice".
                if (!wallDrag.hasMoved) {
                  // Requerimos recrear el evento sintético o llamar a la lógica directamente.
                  // Para simplificar y reutilizar, llamamos a una versión modificada de handleAddVertex
                  // O simplemente insertamos el punto aquí usando wallDrag.startPoint

                  setPoints(prev => {
                    const newPoints = [...prev];
                    // Insertamos en el punto exacto del clic inicial
                    newPoints.splice(wallDrag.wallIndex + 1, 0, {
                      x: wallDrag.startPoint.x,
                      y: wallDrag.startPoint.y
                    });
                    return newPoints;
                  });
                }
                // Limpiamos estado
                setWallDrag(null);
              }

              // 3. Persistencia (Existente)
              setValue("room_openings", openings as unknown as WizardStoreValue);
              setValue("room_points", points as unknown as WizardStoreValue);
            }}
            onClick={() => setActiveWall(null)}
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
              const isSelected = activeWallIndex === i;

              return (
                <g key={`wall-${i}`}>
                  {/* ZONA DE CLIC / ARRASTRE */}
                  <line
                    x1={p.x} y1={p.y} x2={next.x} y2={next.y}
                    stroke="transparent" strokeWidth={30}
                    // CAMBIO AQUÍ: Usamos handleWallDown en lugar de handleAddVertex directo
                    onPointerDown={(e) => editMode === 'geometry' && handleWallDown(i, e)}
                    onClick={(e) => {
                      if (editMode === 'openings') {
                        e.stopPropagation();
                        setActiveWall(i);
                      }
                    }}
                    // CAMBIO VISUAL: Cursor 'move' para indicar arrastre
                    className={editMode === 'geometry' ? 'cursor-move' : 'cursor-pointer'}
                  />
                  {/* ... (Línea visible sin cambios) ... */}
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

        {/* COLUMNA 2: PANEL LATERAL */}
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




              <ul className="text-left text-xs text-yellow-900/80 space-y-1.5 bg-yellow-50/80 p-3 rounded-lg border border-yellow-100/50">
                <li>
                  <h3 className="font-bold text-yellow-900 mb-1">Control de Vértices</h3>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="mt-0.5">🔹</span>
                  <span>
                    <b>Arrastrar:</b> Reubica las esquinas y ajusta ángulos.
                  </span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="mt-0.5">🔹</span>
                  <span>
                    <b>Doble Clic:</b> Elimina el vértice seleccionado.
                  </span>
                </li>
              </ul>

              {/* Sección Muros */}
              <ul className="text-left text-xs text-yellow-900/80 space-y-1.5 bg-yellow-50/80 p-3 rounded-lg border border-yellow-100/50">
                <li>
                  <h3 className="font-bold text-yellow-900 mb-1">Control de Muros</h3>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="mt-0.5">🔹</span>
                  <span>
                    <b>Clic Simple:</b> Divide el muro creando un nuevo nodo.
                  </span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="mt-0.5">🔹</span>
                  <span>
                    <b>Arrastrar:</b> Desplaza el segmento completo (movimiento ortogonal).
                  </span>
                </li>
              </ul>







              {/* Input de Altura Global */}
              <div className="pt-4 border-t border-yellow-200">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                  <ArrowDownUp className="w-3 h-3" /> Altura Techo (Z) uwu
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" value={roomHeight} onChange={(e) => setRoomHeight(Number(e.target.value))} className="flex-1 border rounded p-2 text-center" />
                  <span className="text-xs font-bold text-black">mm</span>
                </div>
              </div>
            </div>
          )}

          {/* MODO ABERTURAS (Selección de Muros) */}
          {editMode === 'openings' && activeWallIndex === null && (
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

          {/* EDITOR DE MURO */}
          {editMode === 'openings' && activeWallIndex !== null && (
            <div className="flex flex-col h-full animate-in slide-in-from-right-4 fade-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                  <Ruler className="w-4 h-4" /> Muro #{activeWallIndex + 1}
                </h3>
                <button onClick={() => setActiveWall(null)} className="text-xs text-gray-400 hover:text-gray-600 underline">Cerrar</button>
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
                {openings.filter(op => op.wallIndex === activeWallIndex).map(op => (

                  <div key={op.id} className="bg-white p-3 rounded-lg border shadow-sm relative space-y-3">

                    {/* Encabezado del Card */}
                    <div className="flex items-center gap-2">
                      {op.type === 'door' ? <DoorOpen className="w-4 h-4 text-red-400" /> : <AppWindow className="w-4 h-4 text-blue-400" />}
                      <span className="text-xs font-bold text-gray-700">{op.type === 'door' ? 'Puerta' : 'Ventana'}</span>
                      <button onClick={() => removeOpening(op.id)} className="ml-auto text-gray-300 hover:text-red-500">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* FILA 1: HORIZONTAL (Ubicación X y Ancho) */}
                    <div className="grid grid-cols-2 gap-3">
                      <NumberControl
                        label="Distancia (X)"
                        value={op.distFromStart}
                        onChange={(val) => updateOpening(op.id, 'distFromStart', val)}
                        step={50} // Pasos grandes para mover rápido
                      />
                      <NumberControl
                        label="Ancho"
                        value={op.width}
                        onChange={(val) => updateOpening(op.id, 'width', val)}
                        step={10} // Pasos precisos para dimensionar
                      />
                    </div>

                    {/* FILA 2: VERTICAL (Altura y Elevación) - NUEVO */}
                    <div className="grid grid-cols-2 gap-2">
                      <NumberControl
                        label="Altura (Y)"
                        value={op.height}
                        onChange={(val) => updateOpening(op.id, 'height', val)}
                        step={10}
                      />
                      <NumberControl
                        label="Elevación (Z)"
                        value={op.sillHeight}
                        onChange={(val) => updateOpening(op.id, 'sillHeight', val)}
                        step={50}
                      />
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
  );
};

export default RoomGeometryPlanner;