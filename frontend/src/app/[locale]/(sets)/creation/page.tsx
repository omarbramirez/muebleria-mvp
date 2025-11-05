
import React from 'react'
import { Button } from '@/app/components/ui/Button';
import PageLayout from "@/app/components/ui/PageLayout";

const Creation = () => {
  return (
    <PageLayout>
       <div className="w-full min-h-screen flex flex-row items-start justify-between gap-12 relative overflow-hidden px-10 pr-20">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => console.log('bu')}
                        >
                          Siguiente
                        </Button>
       </div>
    </PageLayout>

  )
}

export default Creation
