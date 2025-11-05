
import logo from './next.svg';
import choose from './choose.jpg';
import customize from './customize.jpg';
import receive from './receive.jpg'
import desks from './desks.jpg';
import chairs from './chairs.jpg';
import stools from './stools.jpg'
import shelves from './shelves.jpg'
import kitchenSet from './kitchenSet.jpg';
import bathroomSet from './bathroomSet.jpg';
import generate from './generate.jpg'
import preview from './preview.jpg'


import dining_table from './dining_table.jpg'
import armchair from './armchair.jpg'
import bar_stool from './bar_stool.jpg'
import ottoman from './ottoman.jpg'
import lower_kitchen_units from './lower_kitchen_units.jpg'
import upper_kitchen_units from './upper_kitchen_units.jpg'
import open_shelf from './open_shelf.jpg'




import right_arrow_white from './right-arrow-white.png'
import { MousePointerClick, ChartCandlestick, PackageCheck, LampDesk, Armchair, Spool, ToolCase, Bath, CookingPot, Table2 } from "lucide-react";


export const NAVBAR_ITEMS = [
  { key: "home", href: "/#top", variant: "primary" },
  { key: "how_it_works", href: "/#how", variant: "primary" },
  { key: "search", href: "/catalog", variant: "primary" },
  { key: "explore", href: "/explore", variant: "secondary" },
];

import { ServiceProcess, SetCategory } from '@/types/index';
export const assets = {
  logo,
  choose,
  customize,
  receive,
  desks,
  chairs,
  stools,
  shelves,
  right_arrow_white,
  kitchenSet,
  bathroomSet,
  generate,
  preview,
  dining_table,armchair,bar_stool,ottoman,lower_kitchen_units,upper_kitchen_units, open_shelf
}

export const serviceProcess: ServiceProcess[] = [
  {
    id: 'generate',
    label: 'processes.generate.title',
    call_to_action: 'processes.generate.call_to_action',
    title: 'processes.generate.title',
    description: 'processes.generate.description',
    img: assets.generate,
    icon: MousePointerClick
  },
  {
    id: 'adjust',
    label: 'processes.adjust.title',
    call_to_action: 'processes.adjust.call_to_action',
    title: 'processes.adjust.title',
    description: 'processes.adjust.description',
    img: assets.customize,
    icon: ChartCandlestick,
  },
  {
    id: 'preview',
    label: 'processes.preview.title',
    call_to_action: 'processes.preview.call_to_action',
    title: 'processes.preview.title',
    description: 'processes.preview.description',
    link: 'processes.preview.link',
    img: assets.preview,
    icon: PackageCheck,
  },
    {
    id: 'reserve',
    label: 'processes.reserve.title',
    call_to_action: 'processes.reserve.call_to_action',
    title: 'processes.reserve.title',
    description: 'processes.reserve.description',
    link: 'processes.reserve.link',
    img: assets.receive,
    icon: PackageCheck,
  }
];

export const setCategories: SetCategory[] = [
  {
    id: 'kitchen',
    title: 'kitchen.title',
    description: 'kitchen.description',
    call_to_action: 'kitchen.call_to_action',
    button_create: 'kitchen.button_create',
    button_generate: 'kitchen.button_generate',
    img: assets.kitchenSet, // asegúrate de tener esta imagen
    icon: CookingPot,
    link_create: '/creation/area',
    link_generate: '/preferences'
  },
  {
    id: 'bathroom',
    title: 'bathroom.title',
    description: 'bathroom.description',
    call_to_action: 'bathroom.call_to_action',
    button_create: 'bathroom.button_create',
    button_generate: 'bathroom.button_generate',
    img: assets.bathroomSet, // asegúrate de tener esta imagen
    icon: Bath,
    link_create: '/creation/area',
    link_generate: '/preferences'
  }
];

// export const categories = [
//   {
//     id: "desks",
//     name: "categories.desks.name",
//     cover: assets.desks,
//     icon: LampDesk,
//   },
//   {
//     id: "chairs",
//     name: "categories.chairs.name",
//     cover: assets.chairs,
//     icon: Armchair,
//   },
//   {
//     id: "stools",
//     name: "categories.stools.name",
//     cover: assets.stools,
//     icon: Spool,
//   },
//   {
//     id: "shelves",
//     name: "categories.shelves.name",
//     cover: assets.shelves,
//     icon: ToolCase,
//   },
// ]


export const PREFERENCE_WIZARD_ITEMS = [
  {
    key: "roomType",
    completed: false,
    title: "title",
    description: "description",
    options: [
      { key: "1" },
      { key: "2" },
      { key: "3" }
    ]
  },
  {
    key: "budget",
    completed: false,
    title: "title",
    description: "description",
    options: [
      { key: "1" },
      { key: "2" },
      { key: "3" }
    ]
  },
  {
    key: "space_size",
    completed: false,
    title: "title",
    description: "description",
    options: [
      { key: "1" },
      { key: "2" },
      { key: "3" },
      { key: "4" }
    ]
  },
  {
    key: "style",
    completed: false,
    title: "title",
    description: "description",
    options: [
      { key: "1" },
      { key: "2" },
      { key: "3" },
      { key: "4" },
      { key: "5" }
    ]
  },
  {
    key: "color",
    completed: false,
    title: "title",
    description: "description",
    options: [
      { key: "1" },
      { key: "2" }
    ]
  },
  {
    key: "materials",
    completed: false,
    title: "title",
    description: "description",
    button: "button",
    link: "link",
    options: [
      { key: "1" },
      { key: "2" }
    ]
  }
]




export const categories = [
  {
    id: "dining_table",
    name: "categories.dining_table.name",
    title: "Mesa rectangular de comedor",
    description:
      "Mesa de comedor rectangular con acabado gris claro, ideal para espacios modernos y funcionales. Fabricada en madera MDF con recubrimiento liso y resistente.",
    price: 2890,
    colors: ["gris claro", "roble natural"],
    cover: assets.dining_table
  },
  {
    id: "armchair",
    name: "categories.armchair.name",
    title: "Sillón individual tapizado",
    description:
      "Sillón de diseño contemporáneo con tapizado textil en color beige claro. Estructura reforzada y cojines de alta densidad para máximo confort.",
    price: 4320,
    colors: ["beige claro", "gris arena"],
    cover: assets.armchair
  },
  {
    id: "bar_stool",
    name: "categories.bar_stool.name",
    title: "Banco alto metálico",
    description:
      "Taburete metálico de estilo industrial con acabado negro mate. Ideal para barras de cocina o desayunadores modernos.",
    price: 1180,
    colors: ["negro mate", "acero pulido"],
    cover: assets.bar_stool
  },
  {
    id: "ottoman",
    name: "categories.ottoman.name",
    title: "Banco tipo otomana",
    description:
      "Banco tapizado tipo otomana multifuncional. Perfecto como asiento auxiliar o reposapiés en salas y comedores.",
    price: 1680,
    colors: ["beige claro", "gris topo"],
    cover: assets.ottoman
  },
  {
    id: "lower_kitchen_units",
    name: "categories.lower_kitchen_units.name",
    title: "Módulos inferiores de cocina",
    description:
      "Conjunto de gabinetes y cajoneras inferiores fabricados en MDF laminado. Proveen almacenamiento eficiente y un acabado elegante en tono natural.",
    price: 8450,
    colors: ["roble claro", "gris humo"],
    cover: assets.lower_kitchen_units
  },
  {
    id: "upper_kitchen_units",
    name: "categories.upper_kitchen_units.name",
    title: "Módulos superiores de cocina",
    description:
      "Alacenas y repisas superiores con sistema de apertura suave. Diseño minimalista con frentes lisos y tiradores discretos.",
    price: 7590,
    colors: ["roble claro", "blanco mate"],
    cover: assets.upper_kitchen_units
  },
  {
    id: "open_shelf",
    name: "categories.open_shelf.name",
    title: "Estantería abierta lateral",
    description:
      "Estantería lateral abierta con repisas en color rosado claro. Ideal para exhibir objetos decorativos o utensilios de cocina.",
    price: 2490,
    colors: ["rosado claro", "blanco pastel"],
    cover: assets.open_shelf
  },
];

export const catalog = {
  call_to_action: "Cada pieza combina diseño y funcionalidad",
  title: "Explora muebles únicos creados para adaptarse a tu espacio",
  description: "Desde mesas y gabinetes hasta estanterías modulares, encuentra inspiración en nuestra colección cuidadosamente diseñada para entornos modernos.",
  link: "Ver catálogo"
}

// src/data/filters.ts
export const filters = [
  { id: 1, label: "Material", options: ["Madera", "Acero", "Melamina", "Vidrio"] },
  { id: 2, label: "Color", options: ["Blanco", "Negro", "Roble", "Nogal", "Gris"] },
  { id: 3, label: "Estilo", options: ["Minimalista", "Industrial", "Moderno", "Clásico"] },
  { id: 4, label: "Dimensiones", options: ["Pequeño", "Mediano", "Grande"] },
  { id: 5, label: "Uso", options: ["Cocina", "Baño", "Sala", "Comedor"] },
  { id: 6, label: "Precio", options: ["<$5,000", "$5,000-$10,000", ">$10,000"] },
  { id: 7, label: "Disponibilidad", options: ["En stock", "Bajo pedido"] },
  { id: 8, label: "Sostenibilidad", options: ["Material reciclado", "Certificación FSC", "Ecológico"] },
];


// src/data/orderItems.ts

export const orderItems = [
  {
    id: 1,
    name: "Mesa rectangular de comedor (gris claro)",
    price: 7800,
    quantity: 1,
    image: assets.dining_table,
  },
  {
    id: 2,
    name: "Sillón individual tapizado (beige claro)",
    price: 4200,
    quantity: 2,
    image: assets.armchair
  },
  {
    id: 3,
    name: "Banco alto o taburete metálico (negro)",
    price: 1850,
    quantity: 3,
    image: assets.ottoman
  },
  {
    id: 4,
    name: "Banco tipo otomana (tapizado beige claro)",
    price: 2900,
    quantity: 1,
    image: assets.ottoman
  },
  {
    id: 5,
    name: "Módulos inferiores de cocina (gabinetes y cajoneras)",
    price: 16500,
    quantity: 1,
    image: assets.bar_stool
  },
  {
    id: 6,
    name: "Módulos superiores de cocina (alacenas y repisas)",
    price: 8900,
    quantity: 1,
    image: assets.open_shelf
  },
  {
    id: 7,
    name: "Estantería abierta (lateral derecha, con repisas rosadas)",
    price: 5300,
    quantity: 1,
    image: assets.upper_kitchen_units
  },
];


export const materials = [
  { id: "wood_oak", name: "Madera de roble", color: "#d7b899" },
  { id: "wood_walnut", name: "Nogal oscuro", color: "#4b2e05" },
  { id: "metal_black", name: "Metal negro mate", color: "#1a1a1a" },
  { id: "stone_gray", name: "Granito gris", color: "#7a7a7a" },
  { id: "fabric_beige", name: "Tela beige", color: "#d8c7a4" },
];

export const defaultProducts = [
  { id: 1, name: "Mesa rectangular de comedor", price: 7800, selected: true },
  { id: 2, name: "Sillón individual tapizado", price: 4200, selected: true },
  { id: 3, name: "Banco alto o taburete metálico", price: 1850, selected: true },
  { id: 4, name: "Banco tipo otomana", price: 2900, selected: true },
  { id: 5, name: "Módulos inferiores de cocina", price: 16500, selected: true },
  { id: 6, name: "Módulos superiores de cocina", price: 8900, selected: true },
  { id: 7, name: "Estantería abierta", price: 5300, selected: true },
];


export const configuradores = [
  { name: "Color", options: ["Blanco", "Negro", "Roble", "Nogal"] },
  { name: "Textura", options: ["Lisa", "Madera", "Piedra", "Metal"] },
  { name: "Material", options: ["MDF", "Melamina", "Madera sólida"] },
  { name: "Dimensiones", options: ["80x60x40 cm", "120x60x40 cm", "160x60x40 cm"] },
  { name: "Manijas y herrajes", options: ["Push-open", "Acero cepillado", "Negro mate", "Latón antiguo"] },
  { name: "Tipo de acabado", options: ["Brillante", "Mate", "Satinado"] },
  { name: "Altura / disposición", options: ["Bajo", "Medio", "Alto"] },
  { name: "Iluminación", options: ["Sin luz", "Cálida", "Fría", "RGB ajustable"] },
];