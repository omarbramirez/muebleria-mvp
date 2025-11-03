"use client";

import React, { useState } from "react";
import { materials,defaultProducts,configuradores } from "@/app/assets/assets";
import PageLayout from "@/app/components/ui/PageLayout";
import { Button } from '@/app/components/ui/Button';
import { useRouter } from 'next/navigation';




export default function SetConfigurator() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(materials[0].id);
  const [style, setStyle] = useState("moderno");
  const [products, setProducts] = useState(defaultProducts);
const router = useRouter()
  const toggleProduct = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const selectedCount = products.filter((p) => p.selected).length;
  const total = products
    .filter((p) => p.selected)
    .reduce((acc, p) => acc + p.price, 0);

  return (
    <PageLayout>
    <div className=" bg-white shadow-lg py-25 px-10">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">
        Configuración del conjunto
      </h1>
<ul className="space-y-4 bg-primary px-5 rounded-lg py-6">
  {configuradores.map((config) => (
    <li key={config.name}>
      <h3 className="font-semibold mb-1">{config.name}</h3>
      <select className="w-full border rounded p-1">
        {config.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </li>
  ))}
</ul>

      {/* 🧭 Pop-up de instrucciones */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg mx-4">
            <h2 className="text-lg font-semibold">Instrucciones</h2>
            <p className="text-sm text-gray-600">
              Personaliza los materiales, estilos y elementos de tu conjunto.
              Podrás ver el resultado final en el render 3D antes de confirmar tu pedido.
            </p>
            <button
              onClick={() => setShowInstructions(false)}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 mt-2"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* 🎨 Configuradores */}
      <section className="mt-4 space-y-6  ">
        <div>
          <h2 className="font-medium text-gray-700 mb-2">Material principal</h2>
          <div className="flex flex-wrap gap-3 overflow-x-scroll p-10">
            {materials.map((mat) => (
              <button
                key={mat.id}
                onClick={() => setSelectedMaterial(mat.id)}
                className={`p-3 border rounded-lg flex items-center gap-1 transition ${
                  selectedMaterial === mat.id
                    ? "border-black"
                    : "border-gray-300 hover:border-gray-500"
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: mat.color }}
                />
                <span className="text-sm">{mat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-medium text-gray-700 mb-2">Estilo general</h2>
          <div className="flex gap-2 flex-col">
            {["moderno", "minimalista", "rústico", "industrial"].map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="style"
                  checked={style === option}
                  onChange={() => setStyle(option)}
                />
                <span className="capitalize">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* 🪑 Lista de productos */}
      <section className="mt-8">
        <h2 className="font-medium text-gray-700 mb-3">Lista de productos</h2>
        <ul className="divide-y divide-gray-200 flex-wrap">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-800">{p.name}</p>
                <p className="text-sm text-gray-500">
                  ${p.price.toLocaleString("es-MX")} MXN
                </p>
              </div>
              <input
                type="checkbox"
                checked={p.selected}
                onChange={() => toggleProduct(p.id)}
                className="w-5s h-5 accent-black"
              />
            </li>
          ))}
        </ul>
      </section>

      {/* 💰 Resumen */}
      <div className="mt-6 border-t pt-4 ">
        <p className="text-gray-700">
          <strong>{selectedCount}</strong> elementos seleccionados
        </p>
        <p className="text-lg font-semibold text-gray-800">
          Total estimado: ${total.toLocaleString("es-MX")} MXN
        </p>
      </div>

      {/* ✅ Acciones finales */}
        <div className='flex flex-row justify-between w-full mt-20'>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/summary')}
          >
            Confirmar
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/generation')}
          >
            Regresar
          </Button>
        </div>
    </div>
    </PageLayout>
  );
}
