"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

const KitchenScene = dynamic(() => import("@/app/components/scenes/scene"), {
  ssr: false,
});

export default function SetPlanner() {
  const [texture, setTexture] = useState<string>("");
  const [color, setColor] = useState<string>("");

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <select onChange={(e) => setTexture(e.target.value)}>
        <option value="">Original</option>
        <option value="cardboard">Cartón</option>
        <option value="wood">Madera</option>
      </select>
      <select onChange={(e) => setColor(e.target.value)}>
        <option value="">Original</option>
        <option value="red">Rojo</option>
        <option value="blue">Azul</option>
      </select>

      <KitchenScene texture={texture} color={color} />
    </div>
  );
}


