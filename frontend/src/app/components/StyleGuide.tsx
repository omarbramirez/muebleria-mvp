import { Button } from '@/app/components/ui/Button';
import { Heading } from '@/app/components/ui/Heading';
import { Plus } from 'lucide-react'; // si usas lucide-react para íconos

export default function Demo() {
  return (
    <div>
      <div className='space-y-4'>
              <Button>Primario</Button>

      <Button variant="secondary">Secundario</Button>

      <Button variant="outline">Outline</Button>

      <Button size="lg" leftIcon={<Plus />}>
        Crear Proyecto
      </Button>

      <Button href="/catalogo" rightIcon={<Plus />}>
        Ver Catálogo
      </Button>

      <Button loading>Guardando…</Button>
      </div>
      <div>
        <h1 className='text-primary font-heading font-bold  tracking-tight inline-flex items-center justify-center mb-4 text-3xl sm:text-5xl lg:text-[66px]'>
          Esto es un h1
        </h1>
        <Heading as="h1" variant="primary" size='lg'>Debe de salir bien</Heading>
        <h2>
          Esto es un h2
        </h2>
        <h3>
          Esto es un h3
        </h3>
        <Heading as='h3' variant='secondary' size='sm'>Debe salir bien</Heading>
        <h4>
          Esto es un h4
        </h4>
      </div>
    </div>
  );
}

