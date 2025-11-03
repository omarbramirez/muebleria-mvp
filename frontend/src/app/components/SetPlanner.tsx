"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

const KitchenScene = dynamic(() => import("@/app/components/scenes/scene"), {
  ssr: false,
});

export default function SetPlanner() {
  const [texture, setTexture] = useState<string>("");
  const [color, setColor] = useState<string>("blue");
  const [hiddenPart, setHiddenPart] =useState<string>("pCube38_standardSurface1_0");
  return (
    <div style={{ height: "50vh", width: "100vw" }}>
      <KitchenScene texture={texture} color={color} hiddenPart={hiddenPart}/>
    </div>
  );
}


