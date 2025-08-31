import logo from './next.svg';
import choose from './choose.jpg';
import customize from './customize.jpg';
import receive from './receive.jpg'
import right_arrow_white from './right-arrow-white.png'
import { MousePointerClick, ChartCandlestick, PackageCheck } from "lucide-react";

import {Tabs} from '@/types/index';
export const assets = {
    logo,
    choose,
    customize,
    receive,
    right_arrow_white
}

export const tabs: Tabs[] = [
  {
    id: 'choose',
    label: 'tabs.choose.title',
    call_to_action: 'tabs.choose.call_to_action',
    title: 'tabs.choose.title',
    description: 'tabs.choose.description',
    button: 'tabs.choose.button',
    link: 'tabs.choose.link',
    img: assets.choose,
    icon: MousePointerClick
  },
  {
    id: 'customize',
    label: 'tabs.customize.title',
    call_to_action: 'tabs.customize.call_to_action',
    title: 'tabs.customize.title',
    description: 'tabs.customize.description',
    button: 'tabs.customize.button',
    link: 'tabs.customize.link',
    img: assets.customize,
    icon: ChartCandlestick,
  }, 
  {
    id: 'receive',
    label: 'tabs.receive.title',
    call_to_action: 'tabs.receive.call_to_action',
    title: 'tabs.receive.title',
    description: 'tabs.receive.description',
    button: 'tabs.receive.button',
    link: 'tabs.receive.link',
    img:assets.receive,
    icon: PackageCheck,
  },
];