import { StaticImageData } from 'next/image';

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

import lineal from './preference_wizard/lineal.png'
import l_shape from './preference_wizard/l_shape.png'
import u_shape from './preference_wizard/u_shape.png'
import island from './preference_wizard/island.png'
import parallel from './preference_wizard/parallel.png'
import peninsula from './preference_wizard/peninsula.png'

// src/app/assets/assets.ts

// 1. Definimos la forma de una "Opción" (El botón seleccionable)
export interface WizardOption {
  key: string;
  label: string;
  description?: string;
  imageSrc?: string | StaticImageData;


}

// 2. Definimos la forma de un "Electrodoméstico" (Para la sección perdida que recuperamos)
export interface ApplianceOption {
  key: string;
  label: string;
  fields?: string[]; // ej: ["ancho", "alto"]
}

// 3. Definimos la forma de un "Campo de Texto" (Inputs numéricos)
export interface WizardField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email';
}

// 4. Definimos la forma de una "Sección" (El paso completo del wizard)
export interface WizardSection {
  key: string;
  completed: boolean;
  title: string;
  description: string;
  upload?: boolean;
  options?: WizardOption[];     // Array de opciones seleccionables
  fields?: WizardField[];       // Array de inputs manuales
  appliances?: ApplianceOption[];
  layout?: string;
  // Array especial de electrodomésticos
}


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
  dining_table, armchair, bar_stool, ottoman, lower_kitchen_units, upper_kitchen_units, open_shelf,
  lineal, l_shape, u_shape, island, parallel, peninsula
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


export const PREFERENCE_WIZARD_ITEMS: WizardSection[] = [
  /* -------------------------------------------------------------------------- */
  /* 1. Perfil de uso y tipo de proyecto                                        */
  /* -------------------------------------------------------------------------- */
  {
    key: "project_type",
    completed: false,
    title: "Tipo de proyecto",
    description: "Indique si requiere una cocina nueva o una remodelación del espacio existente.",
    options: [
      { key: "nueva_cocina", label: "Cocina nueva (sin instalaciones previas)" },
      { key: "remodelacion", label: "Remodelación (cambiar diseño existente)" }
    ]
  },

  {
    key: "usage_profile",
    completed: false,
    title: "Perfil de uso",
    description: "Seleccione el tipo de uso y la intensidad operativa de la cocina para determinar requerimientos funcionales y materiales adecuados.",
    options: [
      { key: "gourmet", label: "Uso intensivo / cocina gourmet" },
      { key: "familiar", label: "Uso familiar estándar" },
      { key: "minimal", label: "Uso ligero / preparación básica" },
      { key: "airbnb", label: "Renta temporal (Airbnb u hospedaje)" }
    ]
  },

  /* -------------------------------------------------------------------------- */
  /* 2. Presupuesto                                                             */
  /* -------------------------------------------------------------------------- */
  {
    key: "budget",
    completed: false,
    title: "Presupuesto estimado",
    description: "Seleccione el rango de inversión aproximado para orientar la selección de materiales, accesorios y acabados.",
    options: [
      { key: "economico", label: "Entre $25,000 y $60,000 MXN" },
      { key: "medio", label: "Entre $60,000 y $120,000 MXN" },
      { key: "alto", label: "Entre $120,000 y $250,000 MXN" },
      { key: "premium", label: "Más de $250,000 MXN" },
      { key: "indefinido", label: "Aún no tengo un presupuesto claro" }
    ]
  },

  /* -------------------------------------------------------------------------- */
  /* 3. Medidas del espacio / Planos                                            */
  /* -------------------------------------------------------------------------- */
  {
    key: "space_dimensions",
    completed: false,
    title: "Dimensiones del espacio",
    description: "Proporcione las dimensiones aproximadas o exactas del área destinada a la cocina. Si dispone de planos o fotografías, puede subirlos.",
    options: [],
    fields: [
      { name: "ancho_m", label: "Ancho (m)", type: "number" },
      { name: "largo_m", label: "Largo (m)", type: "number" },
      { name: "altura_m", label: "Altura libre (m)", type: "number" }
    ],
    upload: true
  },

  {
    key: "existing_plans",
    completed: false,
    title: "Planos, fotografías y documentación",
    description: "Suba cualquier plano, fotografía o documento técnico que permita comprender mejor el espacio existente.",
    upload: true,
    options: []
  },

  /* -------------------------------------------------------------------------- */
  /* 4. Características arquitectónicas                                         */
  /* -------------------------------------------------------------------------- */
  {
    key: "room_type",
    completed: false,
    title: "Configuración arquitectónica",
    description: "Seleccione el diagrama que mejor represente la forma actual de su cocina.",
    layout: 'grid-3', // ACTIVAMOS EL MODO GRID
    options: [
      {
        key: "lineal",
        label: "Lineal",
        // Referencia a la imagen que muestra la cocina en una sola pared
        imageSrc: assets.lineal,
        description: "Distribución en una sola pared."
      },
      {
        key: "en_l",
        label: "En L",
        imageSrc: assets.l_shape,
        description: "Muebles en dos paredes perpendiculares."
      },
      {
        key: "en_u",
        label: "En U",
        imageSrc: assets.u_shape,
        description: "Muebles en tres paredes."
      },
      {
        key: "con_isla",
        label: "Con Isla",
        imageSrc: assets.island,
        description: "Distribución con módulo central aislado."
      },
      {
        key: "doble_linea",
        label: "Paralela",
        imageSrc: assets.parallel,
        description: "Dos filas de muebles frente a frente."
      },
      {
        key: "peninsula",
        label: "Con Península",
        imageSrc: assets.peninsula,
        description: "Un extremo unido a la pared o muebles."
      }
    ]
  },

  {
    key: "wall_type",
    completed: false,
    title: "Tipo de muro",
    description: "Indique el tipo de muro principal para determinar métodos de fijación, instalación de mobiliario y paso de instalaciones.",
    options: [
      { key: "tablaroca", label: "Tablaroca" },
      { key: "block", label: "Block" },
      { key: "concreto", label: "Concreto" },
      { key: "mixto", label: "Mixto (varios tipos)" },
      { key: "desconocido", label: "No lo sé" }
    ]
  },

  {
    key: "orientation",
    completed: false,
    title: "Orientación y luz natural",
    description: "Seleccione la orientación aproximada del espacio para determinar condiciones de iluminación y temperatura.",
    options: [
      { key: "norte", label: "Norte" },
      { key: "sur", label: "Sur" },
      { key: "este", label: "Este" },
      { key: "oeste", label: "Oeste" },
      { key: "desconocido", label: "No lo sé" }
    ]
  },

  /* -------------------------------------------------------------------------- */
  /* 5. Instalaciones                                                            */
  /* -------------------------------------------------------------------------- */
  {
    key: "utilities",
    completed: false,
    title: "Instalaciones existentes",
    description: "Indique qué instalaciones están presentes y, si es posible, su ubicación. Esto es crucial para la distribución correcta del mobiliario.",
    options: [
      { key: "agua", label: "Salida de agua fría/caliente" },
      { key: "desague", label: "Desagüe" },
      { key: "gas_lp", label: "Gas LP" },
      { key: "gas_natural", label: "Gas natural" },
      { key: "electrica", label: "Contactos eléctricos existentes" },
      { key: "ducto_campana", label: "Salida para campana extractora" }
    ]
  },

  /* -------------------------------------------------------------------------- */
  /* 6. Equipos existentes y nuevos                                             */
  /* -------------------------------------------------------------------------- */
  {
    key: "appliances",
    completed: false,
    title: "Electrodomésticos existentes",
    description: "Indique qué equipos ya posee para integrarlos al diseño. Las medidas son necesarias para asegurar compatibilidad.",
    appliances: [
      { key: "refrigerador", label: "Refrigerador (medidas)", fields: ["ancho_cm", "alto_cm", "fondo_cm"] },
      { key: "estufa", label: "Estufa / parrilla", fields: ["ancho_cm", "alto_cm", "fondo_cm"] },
      { key: "campana", label: "Campana extractora" },
      { key: "microondas", label: "Microondas" },
      { key: "lavavajillas", label: "Lavavajillas" }
    ]
  },

  {
    key: "new_appliances",
    completed: false,
    title: "Electrodomésticos deseados",
    description: "Seleccione los equipos que desea incluir en su nueva cocina.",
    options: [
      { key: "ne_refrigerador", label: "Refrigerador" },
      { key: "ne_estufa", label: "Estufa / parrilla" },
      { key: "ne_campana", label: "Campana extractora" },
      { key: "ne_microondas", label: "Microondas" },
      { key: "ne_horno", label: "Horno independiente" },
      { key: "ne_lavavajillas", label: "Lavavajillas" },
      { key: "ne_tarja_doble", label: "Tarja doble" }
    ]
  },

  /* -------------------------------------------------------------------------- */
  /* 7. Estilo, color y referencias visuales                                    */
  /* -------------------------------------------------------------------------- */
  {
    key: "style",
    completed: false,
    title: "Estilo general",
    description: "Seleccione el estilo predominante que desea lograr en la cocina.",
    options: [
      { key: "minimalista", label: "Minimalista" },
      { key: "moderno", label: "Moderno contemporáneo" },
      { key: "industrial", label: "Industrial" },
      { key: "clasico", label: "Clásico / tradicional" },
      { key: "nordico", label: "Escandinavo / nórdico" }
    ]
  },

  {
    key: "color_palette",
    completed: false,
    title: "Paleta de color",
    description: "Seleccione la paleta cromática preferida para la cocina.",
    options: [
      { key: "claros", label: "Tonos claros (blancos, beige, arena)" },
      { key: "oscuros", label: "Tonos oscuros (negro, grafito, nogal oscuro)" },
      { key: "mixto", label: "Combinación equilibrada (claro + oscuro)" }
    ]
  },

  {
    key: "visual_references",
    completed: false,
    title: "Referencias visuales",
    description: "Suba imágenes o ligas externas que representen el estilo, atmósfera o materiales que desea.",
    upload: true,
    options: []
  },

  /* -------------------------------------------------------------------------- */
  /* 8. Materiales y acabados                                                   */
  /* -------------------------------------------------------------------------- */
  {
    key: "materials",
    completed: false,
    title: "Materiales para módulos y superficies",
    description: "Seleccione los materiales principales para los muebles, cubiertas y acabados.",
    options: [
      { key: "mdf_melamina", label: "MDF con melamina" },
      { key: "mdf_lacado", label: "MDF lacado" },
      { key: "madera_solida", label: "Madera sólida" },
      { key: "cuarzo", label: "Cubierta de cuarzo" },
      { key: "granito", label: "Cubierta de granito" },
      { key: "porcelanico", label: "Superficie porcelánica" }
    ]
  },

  {
    key: "handles",
    completed: false,
    title: "Tipo de jaladera o sistema de apertura",
    description: "Seleccione el tipo de jaladera o mecanismo de apertura para puertas y cajones.",
    options: [
      { key: "integrada", label: "Jaladera integrada (perfil)" },
      { key: "sobremontada", label: "Jaladera sobrepuesta" },
      { key: "push_open", label: "Sistema push-open sin jaladera" }
    ]
  },

  /* -------------------------------------------------------------------------- */
  /* 9. Iluminación                                                             */
  /* -------------------------------------------------------------------------- */
  {
    key: "lighting",
    completed: false,
    title: "Iluminación",
    description: "Seleccione los tipos de iluminación que desea integrar en la cocina.",
    options: [
      { key: "empotrada", label: "Lámparas empotradas en techo" },
      { key: "bajo_mueble", label: "Iluminación LED bajo mueble" },
      { key: "decorativa", label: "Iluminación decorativa (colgantes / lineales)" },
      { key: "indirecta", label: "Iluminación indirecta (cintas LED)" }
    ]
  },

  /* -------------------------------------------------------------------------- */
  /* 10. Accesorios funcionales                                                 */
  /* -------------------------------------------------------------------------- */
  {
    key: "functional_accessories",
    completed: false,
    title: "Accesorios funcionales",
    description: "Seleccione accesorios que mejoren la ergonomía, organización y funcionalidad de la cocina.",
    options: [
      { key: "organizador_cubiertos", label: "Organizador de cubiertos" },
      { key: "despensa_extraible", label: "Despensa extraíble vertical" },
      { key: "bote_integrado", label: "Bote de basura integrado" },
      { key: "porta_especias", label: "Porta-especias" },
      { key: "cajon_ollas", label: "Cajón profundo para ollas" },
      { key: "tomas_usb", label: "Tomas eléctricas con USB" },
      { key: "carga_oculta", label: "Estación de carga oculta" }
    ]
  },
  /* -------------------------------------------------------------------------- */
  /* 3.5 Ergonomía y Usuarios (NUEVO)                                           */
  /* -------------------------------------------------------------------------- */
  {
    key: "ergonomics",
    completed: false,
    title: "Ergonomía y Usuarios",
    description: "Datos clave para ajustar alturas de encimeras y anchos de pasillo para su comodidad.",
    options: [
      { key: "height_low", label: "Usuario principal estatura baja (< 1.60m)", description: "Sugeriremos zoclos más bajos." },
      { key: "height_avg", label: "Estatura promedio (1.60m - 1.75m)", description: "Altura estándar de 90cm." },
      { key: "height_tall", label: "Usuario principal alto (> 1.75m)", description: "Sugeriremos encimeras elevadas (92-95cm)." }
    ],
    fields: [
      { name: "num_users", label: "Personas cocinando simultáneamente", type: "number" } // Si >1, pasillos de 1.20m
    ]
  },
  /* -------------------------------------------------------------------------- */
  /* 3.6 Restricciones Físicas (NUEVO - CRÍTICO)                                */
  /* -------------------------------------------------------------------------- */
  {
    key: "constraints",
    completed: false,
    title: "Restricciones arquitectónicas",
    description: "Identifique elementos que no se pueden mover fácilmente.",
    options: [], // Se llena con inputs
    fields: [
      { name: "window_wall", label: "¿En qué muro está la ventana? (1-4)", type: "number" },
      { name: "window_sill_height", label: "Altura del piso a la ventana (cm)", type: "number" }, // Si < 90, no poner muebles base
      { name: "door_wall", label: "¿En qué muro está la puerta de acceso? (1-4)", type: "number" }
    ]
  },
];




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