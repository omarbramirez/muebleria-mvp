import logo from './next.svg';
import choose from './choose.gif';
import customize from './customize.gif';
import produce from './produce.gif';
import receive from './receive.gif'
import right_arrow_white from './right-arrow-white.png'

import {Tabs} from '@/types/types';
export const assets = {
    logo,
    choose,
    customize,
    produce,
    receive,
    right_arrow_white
}

export const tabs: Tabs[] = [
  {
    id: 'choose',
    label: 'tabs.choose.call_to_action',
    call_to_action: 'tabs.choose.call_to_action',
    title: 'tabs.choose.title',
    description: 'tabs.choose.description',
    link: 'tabs.choose.link',
    img: assets.choose
  },
  {
    id: 'customize',
    label: 'tabs.customize.call_to_action',
    call_to_action: 'tabs.customize.call_to_action',
    title: 'tabs.customize.title',
    description: 'tabs.customize.description',
    link: 'tabs.customize.link',
    img: assets.customize
  },
  {
    id: 'produce',
    label: 'tabs.produce.call_to_action',
    call_to_action: 'tabs.produce.call_to_action',
    title: 'tabs.produce.title',
    description: 'tabs.produce.description',
    link: 'tabs.produce.link',
    img:assets.produce
  },
  {
    id: 'receive',
    label: 'tabs.receive.call_to_action',
    call_to_action: 'tabs.receive.call_to_action',
    title: 'tabs.receive.title',
    description: 'tabs.receive.description',
    link: 'tabs.receive.link',
    img:assets.receive
  },
];