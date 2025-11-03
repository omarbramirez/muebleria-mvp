import React from 'react'
import { Heading } from '@/app/components/ui/Heading';
import { Paragraph } from '@/app/components/ui/Paragraph';
import { LinkItem } from "@/app/components/ui/LinkItem";
import Header from '@/app/components/Header';
import { X } from 'lucide-react';
import {filters} from '@/app/assets/assets'

const Filters = ({setIsOpen}) => {

    return (
      <div className="fixed inset-0 z-50 flex flex-col items-start justify-start bg-primary bg-opacity-90 h-screen py-5">
        <div className='flex flex-row content-between w-full justify-center'>
          <div className='w-3/4'>
<Heading as='h1' variant='secondary' size='md' className='text-white'>Filtros</Heading>
          </div>
       <X onClick={()=> setIsOpen(false)}/>
       </div>
           <aside className="w-full rounded-xl my-20">

      <ul className="space-y-6">
        {filters?.map((filter) => (
          <li key={filter.id} className='border-b-2 border-solid h-9 '>
            <p className="font-medium text-gray-800 mb-2 text-center text-white">{filter.label}</p>
          </li>
        ))}
      </ul>
    </aside>
    </div>
    )}


export default Filters
