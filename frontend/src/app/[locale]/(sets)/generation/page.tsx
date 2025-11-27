'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/Button';
import PageLayout from "@/components/layout/PageLayout";
import { Paragraph } from '@/components/ui/Paragraph';
import { useRouter } from 'next/navigation';
import SetPlanner from '@/components/features/planner/SetPlanner';
const Generation = () => {
  const [budget, setBudget] = useState(55000);
  const [details, setDetails] = useState(25000);


  const router = useRouter()
  return (
    <PageLayout>
      <div className={`w-full min-h-screen flex flex-col items-center justify-center gap-2 bg-[url('http://transparenttextures.com/patterns/grid-me.png')]`}>
        <section className={`h-1/2 `}>
        <SetPlanner/>
        </section>
        <section>
          <ul>
            <li>
              <label htmlFor="budget" className="text-sm font-medium text-gray-700">
                Presupuesto:{" "}
                <span className="font-semibold text-secondary">
                  ${budget.toLocaleString()}
                </span>
              </label>
              <Paragraph variant="secondary" size="sm" className='text-left' >
                Limita materiales y cantidad de muebles
              </Paragraph>
              <input
                id="budget"
                type="range"
                min={10000}
                max={80000}
                step={5000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary"
              />
            </li>

            <li>
              <label htmlFor="details" className="text-sm font-medium text-gray-700">
                Nivel de detalle
              </label>
              <Paragraph variant="secondary" size="sm" className='text-left' >
                Controla densidad de objetos decorativos
              </Paragraph>
              <input
                id="details"
                type="range"
                min={10000}
                max={50000}
                step={5000}
                value={details}
                onChange={(e) => setDetails(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary"
              />
            </li>
          </ul>
        </section>


        <div className='flex flex-row justify-between w-full'>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/summary')}
          >
            Confirmar
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/configurators')}
          >
            Modificar
          </Button>
        </div>
      </div>
    </PageLayout>

  )
}

export default Generation
