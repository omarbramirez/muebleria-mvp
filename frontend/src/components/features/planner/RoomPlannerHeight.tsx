'use client';
import React, { useState, useRef, useEffect } from "react";
import { Button } from '@/components/ui/Button';
// ... imports de iconos y otros componentes ...
import Room3DPreviewAmateur from '@/components/features/planner/Room3DPreviewAmateur';
import Room3DPreviewProfessional from '@/components/features/planner/Room3DPreviewProfessional';
import Room3DPreviewExpert from '@/components/features/planner/Room3DPreviewExpert';

// Imports de Módulos
import Materials from '@/components/features/planner/options/Materials';
import Budget from '@/components/features/planner/options/Budget';
import Appliances from '@/components/features/planner/options/Appliances';
import Compatibility from '@/components/features/planner/options/Compatibility';
import Position from '@/components/features/planner/options/Position';
import RoomGeometryPlanner from '@/components/features/planner/options/RoomGeometryPlanner/RoomGeometryPlanner'; // NUEVO

// STORE IMPORT
import { usePreferenceWizardStore } from "@/store/preferenceWizardStore";

// ICONS
import { ChevronDown, ChevronUp } from "lucide-react";


interface roomPlannerProps {
    link: string;
}
interface OpeningConfig {
    width: number;
    height: number;
    color?: number;
}

// Agregar esto junto a tus otras interfaces
interface Point {
    x: number;
    y: number;
}

// Mapeo de Módulos (Reemplazamos o añadimos Geometría)
const MODULES: Record<string, React.ReactNode> = {
    "Geometría": <RoomGeometryPlanner />, // Aquí vive la lógica del SVG y Altura
    "Distribución": <Position />,
    "Instalaciones": <Compatibility />,
    "Materiales": <Materials />,
    "Electrodomésticos": <Appliances />,
    "Presupuesto": <Budget />,
};

// VALORES POR DEFECTO (Fallback si el store está vacío)
const DEFAULT_POINTS = [
    { x: 50, y: 100 }, { x: 450, y: 100 },
    { x: 450, y: 200 }, { x: 350, y: 200 },
    { x: 350, y: 400 }, { x: 50, y: 400 },
];
const DEFAULT_HEIGHT = 2500;

const RoomPlannerHeight: React.FC<roomPlannerProps> = ({ link }) => {

    // 1. CONEXIÓN CON EL STORE (Solo lectura aquí)
    const { values } = usePreferenceWizardStore();

// Hacemos cast a 'Point[]' y a 'number' explícitamente
const points = (values.room_points as unknown as Point[]) || DEFAULT_POINTS;
const heightMm = (values.room_height as number) || DEFAULT_HEIGHT;

    // Estado de UI (Menús, Vistas, etc.)
    const [activeLayout, setActiveLayout] = useState<number>(1);
    const [activeOption, setActiveOption] = useState<string>("MODULO");
    const [currentModule, setCurrentModule] = useState<string | null>("Geometría"); // Iniciar en Geometría
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isOptionsRef, setIsOptionsRef] = useState(true); // Iniciar abierto para ver el planner

    // ... Estado de Openings (Ventanas) puede migrar al store luego ...
    const [openings, setOpenings] = useState<OpeningConfig[]>([
        { width: 80, height: 50, color: 0x66ccff },
    ]);

    const menuRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);

    // ... (Hooks de click outside y toggles se mantienen igual) ...
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
                // Lógica opcional para cerrar
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = () => {
        setActiveOption("MENU");
        setIsMenuOpen((prev) => !prev);
        setIsOptionsRef(true);
    };

    const openModule = () => {
        setActiveOption("MODULO");
        setIsMenuOpen(false);
        setIsOptionsRef(true);
    };

    const handleSelectOption = (option: string) => {
        setCurrentModule(option);
        setActiveOption("MODULO");
        setIsMenuOpen(false);
        setIsOptionsRef(true);
    };

    return (
        <div className="flex flex-col select-none bg-[url('http://transparenttextures.com/patterns/grid-me.png')] bg-repeat bg-[length:40px_40px] bg-[#FAFAF8] h-screen overflow-hidden relative">

            {/* TOP BAR: Selector de Nivel de Usuario */}
            <div className="absolute top-0 z-10 flex flex-row px-5 py-4 justify-center w-full gap-4 pointer-events-none">
                <div className="pointer-events-auto bg-white/80 backdrop-blur-md p-1 rounded-lg shadow-sm border border-gray-200 flex gap-1">
                    <Button variant={`${activeLayout === 1 ? "primary" : "secondary"}`} onClick={() => setActiveLayout(1)} size="sm">AMATEUR</Button>
                    <Button variant={`${activeLayout === 2 ? "primary" : "secondary"}`} onClick={() => setActiveLayout(2)} size="sm">INTERMEDIO</Button>
                    <Button variant={`${activeLayout === 3 ? "primary" : "secondary"}`} onClick={() => setActiveLayout(3)} size="sm">EXPERTO</Button>
                </div>
            </div>

            {/* VISOR 3D (Recibe datos reactivos del Store automáticamente) */}
            <div className="h-full w-full">
                {activeLayout === 1 && <Room3DPreviewAmateur points={points} height={heightMm} openings={openings} />}
                {activeLayout === 2 && <Room3DPreviewProfessional points={points} height={heightMm} openings={openings} />}
                {activeLayout === 3 && <Room3DPreviewExpert points={points} height={heightMm} openings={openings} />}
            </div>

            {/* MODULO INFERIOR (Panel de Control) */}
            <div ref={optionsRef} className={`absolute bottom-0 w-full z-20 flex flex-col justify-end transition-all duration-500 ease-in-out ${isOptionsRef ? 'translate-y-0' : 'translate-y-[85%]'}`}>

                {/* Pestaña / Header del Panel */}
                <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl">
                    <div className="flex flex-row px-6 justify-between items-center w-full">
                        <div className="w-5/6 flex gap-2 ">
                            <Button variant={activeOption === "MODULO" ? "primary" : "secondary"} onClick={openModule} size="sm">
                                CONFIGURACIÓN
                            </Button>
                            <Button variant={activeOption === "MENU" ? "primary" : "secondary"} onClick={toggleMenu} size="sm">
                                MÓDULOS
                            </Button>
                        </div>
                        <Button variant="primary"
                            onClick={() => setIsOptionsRef(!isOptionsRef)}
                            aria-label={isOptionsRef ? "Colapsar panel" : "Expandir panel"}
                        >
                            {/* Renderizado condicional del icono */}
                            {isOptionsRef ? (
                                <div className="flex flex-col items-center">
                                    {/* Opcional: Mantener una línea muy sutil para estética de 'drawer' */}
                                    <ChevronDown className="w-[3em] h-[4em]" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <ChevronUp className="w-[3em] h-[4em] animate-bounce-slow" /> {/* animate-bounce le da vida */}
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
                {/* CONTENIDO DEL PANEL (Fondo Blanco Solido) */}
                <div className="bg-white h-[60vh] w-full relative flex flex-col"> {/* CAMBIO 1: flex flex-col */}

                    {/* MENU DE SELECCIÓN (Overlay) */}
                    <div className={`absolute inset-0 bg-white z-20 transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                        <div className="p-6 grid grid-cols-2 gap-3 overflow-y-auto h-full pb-20">
                            {Object.keys(MODULES).map((item) => (
                                <button
                                    key={item}
                                    className={`p-4 rounded-xl border text-left transition-all hover:shadow-md ${currentModule === item ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}`}
                                    onClick={() => handleSelectOption(item)}
                                >
                                    <span className="font-semibold text-gray-700 block">{item}</span>
                                    <span className="text-xs text-gray-400">Configurar {item.toLowerCase()}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AREA DE RENDERIZADO DEL MÓDULO ACTIVO */}
                    {/* CAMBIO 2: flex-1, overflow-y-auto y overscroll-contain para móviles */}
                    <div className="flex-1 w-full overflow-y-auto overflow-x-hidden pb-24 overscroll-contain">
                        {currentModule && (
                            // CAMBIO 3: Wrapper interno para asegurar que el padding funcione
                            <div className="min-h-full w-full">
                                {MODULES[currentModule]}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RoomPlannerHeight;