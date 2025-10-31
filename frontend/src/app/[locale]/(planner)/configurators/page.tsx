'use client'
import React from 'react'
import PageLayout from "@/app/components/ui/PageLayout";
import { Button } from '@/app/components/ui/Button';
import { useRouter } from 'next/navigation';
import SetPlanner from '@/app/components/SetPlanner';
const Configurators = () => {
  const router = useRouter()
  return (
    <PageLayout>
    <div className=" w-full min-h-screen flex flex-col items-center justify-center gap-2">
      <SetPlanner/>
       <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/#')}
                >
                  Continuar
                </Button>
    </div>
    </PageLayout>
  )
}

export default Configurators
