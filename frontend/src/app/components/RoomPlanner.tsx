'use client';
import React, { useState, useCallback } from "react";
import { Heading } from '@/app/components/ui/Heading';
import { Paragraph } from '@/app/components/ui/Paragraph';
import { Button } from '@/app/components/ui/Button';
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

const SCALE = 100; // 1 m = 100 px
const PX_TO_MM = 10;
const SNAP_THRESHOLD = 10;

interface Point {
  x: number;
  y: number;
}

interface roomPlannerProps{
  link: string;
}

const RoomPlanner: React.FC<roomPlannerProps> = ({link}) => {
  const [points, setPoints] = useState<Point[]>([
    { x: 50, y: 100 },
    { x: 450, y: 100 },
    { x: 450, y: 200 },
    { x: 350, y: 200 },
    { x: 350, y: 400 },
    { x: 50, y: 400 },
  ]);
  const [dragging, setDragging] = useState<number | null>(null);
  const [lastTap, setLastTap] = useState(0);
  const t = useTranslations("pop_ups.space_configuration");

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
      const svg = e.currentTarget;
      const pt = svg.createSVGPoint();

      // Coordenadas reales del puntero
      pt.x = e.clientX;
      pt.y = e.clientY;

      // Convertir a coordenadas internas del viewBox
      const ctm = svg.getScreenCTM();
      if (!ctm) return;

      const inv = ctm.inverse();
      const transformed = pt.matrixTransform(inv);

      let x = transformed.x;
      let y = transformed.y;

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

    const svg = e.currentTarget.closest("svg") as SVGSVGElement;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const inv = ctm.inverse();
    const transformed = pt.matrixTransform(inv);

    const x = transformed.x;
    const y = transformed.y;

    setPoints(prev => {
      const newPoints = [...prev];
      newPoints.splice(index + 1, 0, { x, y });
      return newPoints;
    });
  };

  return (
    <div className="flex gap-2 flex-col select-none bg-[url('http://transparenttextures.com/patterns/grid-me.png')] bg-repeat bg-[length:40px_40px] bg-[#FAFAF8] py-10">
      <div className="px-5">
        <Heading as="h1" variant="primary" size='lg' hierarchy='forContent'>
          {t('title')}
        </Heading>
        <Paragraph variant="primary" size="sm" className="max-w-2xl">
          {t('description')}
        </Paragraph>
      </div>
      <svg
        viewBox="0 0 500 500"
        className="w-full h-3/4 aspect-[5/5] border cursor-crosshair touch-none select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Polígono principal */}
        <polygon
          points={points.map(p => `${p.x},${p.y}`).join(" ")}
          fill="url(#floor)"
          stroke="#3E4C59"
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
            fill="#B98C65"
            stroke="#FAFAF8"
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
          fill="#B98C65"
          fontWeight="bold"
        >
          {`${t('total_area')}: ${areaM2} m²`}
        </text>
      </svg>
      <div className="p-4 rounded-lg text-sm mt-4 text-left ">
        <Heading as='h2' variant='secondary' size='sm'>{t('planner_info.title')}</Heading>
        <Paragraph variant="primary" size="md">
          {`${t('planner_info.scale')}: 1 m = ${SCALE}px`}
        </Paragraph>
        <Paragraph variant="primary" size="md">
          {`${t('planner_info.area')}: ${areaM2} m²`}
        </Paragraph>
        <Paragraph variant="primary" size="md">
          {`${t('planner_info.vertices')}: ${areaM2} m²`}
        </Paragraph>
      </div>
      <Button as="a"
        href={`${link}`}
        variant='secondary'
      >
        {t('link')}
      </Button>
    </div>
  );
};

export default RoomPlanner;
