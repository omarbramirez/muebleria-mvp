import logo from './next.svg';
import choose from './choose.jpg';
import customize from './customize.jpg';
import receive from './receive.jpg'
import desks from './desks.jpg';
import chairs from './chairs.jpg';
import stools from './stools.jpg'
import shelves from './shelves.jpg'



import right_arrow_white from './right-arrow-white.png'
import { MousePointerClick, ChartCandlestick, PackageCheck, LampDesk, Armchair, Spool,ToolCase } from "lucide-react";


export const NAVBAR_ITEMS = [
  { key: "home", href: "/#top", variant: "primary" },
  { key: "how_it_works", href: "/#how", variant: "primary" },
  { key: "search", href: "/products", variant: "primary" },
  { key: "explore", href: "/explore", variant: "secondary" },
];

import { ServiceProcess } from '@/types/index';
export const assets = {
  logo,
  choose,
  customize,
  receive,
  desks,
  chairs,
  stools,
  shelves,
  right_arrow_white
}

export const serviceProcess: ServiceProcess[] = [
  {
    id: 'choose',
    label: 'processes.choose.title',
    call_to_action: 'processes.choose.call_to_action',
    title: 'processes.choose.title',
    description: 'processes.choose.description',
    button: 'processes.choose.button',
    img: assets.choose,
    icon: MousePointerClick
  },
  {
    id: 'customize',
    label: 'processes.customize.title',
    call_to_action: 'processes.customize.call_to_action',
    title: 'processes.customize.title',
    description: 'processes.customize.description',
    button: 'processes.customize.button',
    img: assets.customize,
    icon: ChartCandlestick,
  },
  {
    id: 'receive',
    label: 'processes.receive.title',
    call_to_action: 'processes.receive.call_to_action',
    title: 'processes.receive.title',
    description: 'processes.receive.description',
    button: 'processes.receive.button',
    link: 'processes.receive.link',
    img: assets.receive,
    icon: PackageCheck,
  },
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
      { key: "3" },
      { key: "4" },
      { key: "5" }
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
    options: [
      { key: "1" },
      { key: "2" }
    ]
  }
]