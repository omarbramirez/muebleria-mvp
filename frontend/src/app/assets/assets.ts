
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


import right_arrow_white from './right-arrow-white.png'
import { MousePointerClick, ChartCandlestick, PackageCheck, LampDesk, Armchair, Spool, ToolCase, Bath, CookingPot } from "lucide-react";


export const NAVBAR_ITEMS = [
  { key: "home", href: "/#top", variant: "primary" },
  { key: "how_it_works", href: "/#how", variant: "primary" },
  { key: "search", href: "/products", variant: "primary" },
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
  preview
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

export const categories = [
  {
    id: "desks",
    name: "categories.desks.name",
    cover: assets.desks,
    icon: LampDesk,
  },
  {
    id: "chairs",
    name: "categories.chairs.name",
    cover: assets.chairs,
    icon: Armchair,
  },
  {
    id: "stools",
    name: "categories.stools.name",
    cover: assets.stools,
    icon: Spool,
  },
  {
    id: "shelves",
    name: "categories.shelves.name",
    cover: assets.shelves,
    icon: ToolCase,
  },
]


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