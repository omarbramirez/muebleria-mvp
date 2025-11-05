"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { categories } from "@/app/assets/assets";
import { Search, SlidersHorizontal } from 'lucide-react';
import Filters from '@/app/components/Filters'
import { Heading } from '@/app/components/ui/Heading';
import { LinkItem } from "@/app/components/ui/LinkItem";
import { X } from 'lucide-react';
const ProductCatalog: React.FC = () => {
  const [search, setSearch] = useState("");
  const [highlight, setHighlight] = useState("");
  const [isOpen, setIsOpen] = useState(false);
const [showInstructions, setShowInstructions] = useState(true);
  // Lista de búsquedas populares
  const popularTags = [
    "madera",
    "menos de $12,000 MXN",
    "tonos oscuros",
    "minimalista",
    "moderno",
    "soltero",
  ];

  // Filtro de búsqueda inteligente
  const filtered = useMemo(() => {
    const keyword = search.toLowerCase() || highlight.toLowerCase();
    if (!keyword) return categories;
    return categories.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.colors.some((c) => c.toLowerCase().includes(keyword))
    );
  }, [search, highlight]);

  return (
    <div className="relative w-full">
      {showInstructions && (
              <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-secondary p-6 rounded-xl shadow-lg mx-4">
            <X  onClick={() => setShowInstructions(false)}/>
            <h2 className="text-lg font-semibold">Crea tus espacios a la medida</h2>
            <p className="text-sm text-gray-600">
              Personaliza los materiales, estilos y elementos de tu conjunto.
              Podrás ver el resultado final en el render 3D antes de confirmar tu pedido.
            </p>
            <button
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-gray-800 mt-2"
             
            >
              Explorar
            </button>
          </div>
        </div>
         )}
      {isOpen && <Filters setIsOpen={setIsOpen} />}

      <div className="relative">
        <div className="z-0 w-full flex flex-row mb-5 px-8 py-10">
          {/* 🔍 Barra de búsqueda */}
          <div className=" w-full relative max-w-xl">
            <input
              type="text"
              placeholder="Buscar por nombre, color o estilo..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlight("");
              }}
              className="w-full border border-gray-300 rounded-xl py-2 pl-4 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">
              <Search />
            </span>
          </div>
          <span className="h-full text-gray-400 m-auto pl-2 flex flex-row content-center" onClick={() => setIsOpen(true)}>
            <SlidersHorizontal />
          </span>
        </div>

        {/* 🔘 Botones de búsqueda rápida */}
        <div className="flex flex-wrap gap-2 mb-8 px-4">
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setHighlight(tag);
                setSearch("");
              }}
              className={`px-4 py-1 rounded-full border transition ${highlight === tag
                ? "bg-primary text-white border-foreground"
                : "bg-white text-gray-700 border-primary hover:bg-secondary"
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* 🧱 Grid de productos */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100"
              >
                <div className="relative w-full h-48 bg-gray-50">
                  <Image
                    src={item.cover || "/placeholder.png"}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    {item.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-800">
                      ${item.price.toLocaleString()}
                    </span>
                    <div className="flex gap-2">
                      {item.colors.map((color) => (
                        <span
                          key={color}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{
                            backgroundColor:
                              color === "gris claro"
                                ? "#d1d5db"
                                : color === "beige claro"
                                  ? "#f5f5dc"
                                  : color === "rosado claro"
                                    ? "#f8d7da"
                                    : color === "roble claro"
                                      ? "#deb887"
                                      : color === "gris humo"
                                        ? "#9ca3af"
                                        : "#ccc",
                          }}
                          title={color}
                        ></span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

          </div>
        ) : (
          <p className="text-gray-500 mt-10 text-center">
            No se encontraron productos con los criterios de búsqueda.
          </p>
        )}
      </div>
      <div className="px-20 my-20">
        <Heading as='h3' variant='secondary' size='lg' className='!text-center !cursor-pointer group-hover:text-foreground-white mb-6'>
          Categorías populares
        </Heading>
        <ul>
          <li>
            <p className="text-sm text-gray-600 text-center text-xl">
             Confort y estética
            </p></li>
                      <li><p className="text-sm text-gray-600 text-center text-xl">
             Ambientes cálidos
            </p></li>
                      <li><p className="text-sm text-gray-600 text-center text-xl">
             Salas modulares
            </p></li>
                      <li><p className="text-sm text-gray-600 text-center text-xl">
             Cocina ideal
            </p></li>
                      <li><p className="text-sm text-gray-600 text-center text-xl">
             Muebles únicos
            </p></li>
        </ul>
      </div>
      <div className="px-20 my-20">
        <Heading as='h3' variant='secondary' size='lg' className='!text-center !cursor-pointer group-hover:text-foreground-white mb-6'>
          Recién vistos
        </Heading>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100"
            >
              <div className="relative w-full h-48 bg-gray-50">
                <Image
                  src={item.cover || "/placeholder.png"}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-5">
                <h2 className="text-lg font-medium text-gray-900 mb-2">{item.title}</h2>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {item.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800">
                    ${item.price.toLocaleString()}
                  </span>

                  <div className="flex gap-2">
                    {item.colors.map((color) => (
                      <span
                        key={color}
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{
                          backgroundColor:
                            color === "gris claro"
                              ? "#d1d5db"
                              : color === "beige claro"
                                ? "#f5f5dc"
                                : color === "rosado claro"
                                  ? "#f8d7da"
                                  : color === "roble claro"
                                    ? "#deb887"
                                    : color === "gris humo"
                                      ? "#9ca3af"
                                      : "#ccc",
                        }}
                        title={color}
                      ></span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}


        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;
