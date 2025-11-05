"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { orderItems as initialItems } from "@/app/assets/assets";
import PageLayout from "@/app/components/ui/PageLayout";
import { useRouter } from 'next/navigation';

export default function OrderSummary() {
  const [items, setItems] = useState(initialItems);
  const router = useRouter();
  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(item.quantity + delta, 1) }
          : item
      )
    );
  };

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );
  const tax = subtotal * 0.16;
  const shipping = subtotal > 15000 ? 0 : 350;
  const total = subtotal + tax + shipping;

  return (
    <PageLayout>

    
    <div className="my-10 w-10/12 mx-auto">
      <h1 className=" text-2xl font-semibold mb-6">Resumen del pedido</h1>

      {/* 🧾 Lista de productos */}
      <ul className="divide-y divide-gray-200">
        {items.map((item) => (
          <li key={item.id} className="flex items-center py-4">
            <Image
              src={item.image}
              alt={item.name}
              width={70}
              height={70}
              className="rounded-md object-cover"
            />
            <div className="ml-4 flex-1">
              <p className="font-medium text-gray-800">{item.name}</p>
              <p className="text-sm text-gray-500">
                ${item.price.toLocaleString("es-MX")} MXN c/u
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateQuantity(item.id, -1)}
                className="px-2 py-1 border rounded hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, 1)}
                className="px-2 py-1 border rounded hover:bg-gray-100"
              >
                +
              </button>
            </div>

            <p className="ml-6 font-semibold text-gray-800 w-24 text-right">
              ${(item.price * item.quantity).toLocaleString("es-MX")}
            </p>
          </li>
        ))}
      </ul>

      {/* 💰 Resumen de totales */}
      <div className="border-t border-gray-200 mt-6 pt-4 space-y-2 text-gray-700">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toLocaleString("es-MX")}</span>
        </div>
        <div className="flex justify-between">
          <span>IVA (16%)</span>
          <span>${tax.toLocaleString("es-MX")}</span>
        </div>
        <div className="flex justify-between">
          <span>Envío</span>
          <span>{shipping === 0 ? "Gratis" : `$${shipping}`}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold border-t pt-2">
          <span>Total</span>
          <span>${total.toLocaleString("es-MX")} MXN</span>
        </div>
      </div>

      {/* 🚚 Formas de entrega */}
      <section className="mt-8">
        <h2 className="font-semibold mb-2">Forma de entrega</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center gap-2 border rounded p-2 cursor-pointer hover:bg-gray-50">
            <input type="radio" name="delivery" defaultChecked />
            <span>Entrega a domicilio</span>
          </label>
          <label className="flex items-center gap-2 border rounded p-2 cursor-pointer hover:bg-gray-50">
            <input type="radio" name="delivery" />
            <span>Recoger en tienda</span>
          </label>
        </div>
      </section>

      {/* 💳 Métodos de pago */}
      <section className="mt-6">
        <h2 className="font-semibold mb-2">Método de pago</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center gap-2 border rounded p-2 cursor-pointer hover:bg-gray-50">
            <input type="radio" name="payment" defaultChecked />
            <span>Tarjeta de crédito o débito</span>
          </label>
          <label className="flex items-center gap-2 border rounded p-2 cursor-pointer hover:bg-gray-50">
            <input type="radio" name="payment" />
            <span>Transferencia bancaria</span>
          </label>
          <label className="flex items-center gap-2 border rounded p-2 cursor-pointer hover:bg-gray-50">
            <input type="radio" name="payment" />
            <span>Pago en efectivo (OXXO / depósito)</span>
          </label>
        </div>
      </section>

      {/* 🧾 Botón final */}
      <div className="mt-8 text-right">
        <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition" onClick={()=>router.push('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}>
          Confirmar pedido
        </button>
      </div>
    </div>
    </PageLayout>
  );
}
