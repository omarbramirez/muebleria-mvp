import React from 'react';
import {
    RefreshCw,
    Move,
    Flame,
    Droplet,
    DoorOpen,
    CheckCircle2,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PlannerWelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PlannerWelcomeModal: React.FC<PlannerWelcomeModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="min-w-[400px] bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-blue-600 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <h2 className="text-2xl font-bold mb-2">¡Bienvenido a tu Planner 3D!</h2>
                    <p className="text-blue-100 text-sm">
                        Hemos diseñado esta experiencia para que sea potente pero muy sencilla de usar. Aquí tienes lo básico:
                    </p>
                </div>

                {/* Body Scrollable */}
                <div className="p-6 overflow-y-auto space-y-6 text-gray-700">

                    {/* Feature 1: Sincronización */}
                    <div className="flex gap-4">
                        <div className="mt-1 bg-blue-100 p-2 rounded-lg text-blue-600 h-fit">
                            <RefreshCw size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Todo está Conectado</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Es magia bidireccional. Si escribes una medida en el menú, el 3D cambia.
                                Si arrastras algo en el 3D, el menú se actualiza. Tú decides cómo trabajar.
                            </p>
                        </div>
                    </div>

                    {/* Feature 2: Drag & Drop */}
                    <div className="flex gap-4">
                        <div className="mt-1 bg-purple-100 p-2 rounded-lg text-purple-600 h-fit">
                            <Move size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Arrastrar y Soltar Inteligente</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Toma cualquier mueble o electrodoméstico y arrástralo. El sistema detecta automáticamente las paredes y "pega" los objetos a ellas.
                                ¡Funciona con el mouse o con tu dedo en el celular!
                            </p>
                        </div>
                    </div>

                    {/* Feature 3: Instalaciones */}
                    <div className="flex gap-4">
                        <div className="mt-1 bg-orange-100 p-2 rounded-lg text-orange-600 h-fit">
                            <div className="flex gap-1">
                                <Flame size={18} className="text-red-500" />
                                <Droplet size={18} className="text-blue-500" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Instalaciones Claras</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Visualiza dónde va todo. Busca los iconos rojos para salidas de Gas y azules para tomas de Agua.
                                El sistema valida que todo esté en su lugar correcto.
                            </p>
                        </div>
                    </div>

                    {/* Feature 4: Vanos */}
                    <div className="flex gap-4">
                        <div className="mt-1 bg-green-100 p-2 rounded-lg text-green-600 h-fit">
                            <DoorOpen size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Respeto por tu Espacio</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Configura puertas y ventanas. El planner sabe que ahí no puede haber muros sólidos y te ayuda a distribuir tu cocina respetando la luz y los accesos.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 pt-0 mt-auto">
                    <Button
                        variant="primary"
                        className="w-full py-4 text-lg shadow-lg shadow-blue-500/30"
                        onClick={onClose}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <span>¡Entendido, a diseñar!</span>
                            <CheckCircle2 size={20} />
                        </div>
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default PlannerWelcomeModal;