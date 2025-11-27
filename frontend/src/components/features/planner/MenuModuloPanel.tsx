"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";

const MODULES: Record<string, React.ReactNode> = {
  Presupuesto: (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Presupuesto</h2>
      <p className="text-sm text-gray-700">
        Módulo para ajustar el rango de costos y límites financieros del proyecto.
      </p>
    </div>
  ),
  Materiales: (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Materiales</h2>
      <p className="text-sm text-gray-700">
        Opciones de selección de acabados, texturas y tipo de material base.
      </p>
    </div>
  ),
  Dimensiones: (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Dimensiones</h2>
      <p className="text-sm text-gray-700">
        Herramientas de configuración de ancho, alto y profundidad.
      </p>
    </div>
  ),
  Distribución: (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Distribución</h2>
      <p className="text-sm text-gray-700">
        Configuración de posicionamiento espacial y layout del mobiliario.
      </p>
    </div>
  ),
  Compatibilidad: (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Compatibilidad técnica</h2>
      <p className="text-sm text-gray-700">
        Validación de conexiones, normas y requisitos técnicos.
      </p>
    </div>
  ),
  "Electrodomésticos y accesorios": (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Electrodomésticos y accesorios</h2>
      <p className="text-sm text-gray-700">
        Parámetros para añadir equipos complementarios.
      </p>
    </div>
  ),
};

export default function MenuModuloPanel() {
  const [activeOption, setActiveOption] = useState<"MENU" | "MODULO" | null>(null);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // --- CLICK OUTSIDE ---
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
        setActiveOption(null);
      }
    }
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // --- TOGGLES ---
  const toggleMenu = () => {
    setActiveOption("MENU");
    setIsMenuOpen((prev) => !prev);
  };

  const openModule = () => {
    setActiveOption("MODULO");
    setIsMenuOpen(false);
  };

  // --- HANDLE CLICK ON MENU ITEM ---
  const handleSelectOption = (option: string) => {
    setCurrentModule(option);
    setActiveOption("MODULO");
    setIsMenuOpen(false);
  };

  return (
    <div className="absolute bottom-0 w-full bg-blue-500">

      {/* BOTONES SUPERIORES */}
      <div className="flex flex-row px-5 py-2 justify-between w-full">
        <Button
          variant={activeOption === "MODULO" ? "primary" : "secondary"}
          onClick={openModule}
        >
          MÓDULO
        </Button>

        <Button
          variant={activeOption === "MENU" ? "primary" : "secondary"}
          onClick={toggleMenu}
        >
          MENÚ
        </Button>
      </div>

      {/* PANEL DESLIZABLE */}
      <div
        ref={menuRef}
        className={`
          overflow-hidden bg-white text-black shadow-xl 
          transition-all duration-300 ease-out 
          ${isMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <ul className="p-4 space-y-2 cursor-pointer">
          {Object.keys(MODULES).map((item) => (
            <li
              key={item}
              className="hover:bg-gray-200 rounded-md px-2 py-1 transition-all"
              onClick={() => handleSelectOption(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* CONTENIDO DEL MÓDULO */}
      <div className="w-full bg-gray-100 border-t border-white">
        {activeOption === "MODULO" && currentModule && (
          <div>{MODULES[currentModule]}</div>
        )}

        {activeOption === "MODULO" && !currentModule && (
          <div className="p-4 text-gray-700 italic">
            No se ha seleccionado ningún módulo.
          </div>
        )}
      </div>
    </div>
  );
}
