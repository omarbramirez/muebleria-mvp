import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RoomGeometryPlanner from './RoomGeometryPlanner';

// --- MOCKS ---
const mockSetValue = vi.fn();

// Mock del Store de Zustand
// Utilizamos una implementación parcial para controlar el estado inicial en cada test si fuera necesario
vi.mock('@/store/preferenceWizardStore', () => ({
  usePreferenceWizardStore: () => ({
    values: {
      // Estado inicial conocido: Un cuadrado de 100x100
      room_points: [
          { id: 'p1', x: 0, y: 0 }, 
          { id: 'p2', x: 100, y: 0 }, 
          { id: 'p3', x: 100, y: 100 }, 
          { id: 'p4', x: 0, y: 100 }
      ], 
      room_height: 2400,
      room_openings: []
    },
    setValue: mockSetValue,
  }),
}));

describe('RoomGeometryPlanner Integration Tests', () => {

  // Limpieza: Es crucial limpiar los mocks antes de cada test para evitar
  // "falsos positivos" por llamadas acumuladas de tests anteriores.
  beforeEach(() => {
    mockSetValue.mockClear();
  });

  afterEach(() => {
    cleanup();
  });
  
  // --- PRUEBAS DE RENDERIZADO (UI) ---

  it('debe inicializar en modo Estructura y mostrar la altura correcta', () => {
    render(<RoomGeometryPlanner />);
    
    expect(screen.getByText(/Modifica la forma de tu espacio/i)).toBeInTheDocument();
    
    // Validación de valor inicial en el input (Hydration check)
    // Asumiendo que agregaste data-testid="height-input" a tu input de altura
    // Si no, usa: screen.getByDisplayValue('2400')
    const heightInput = screen.getByDisplayValue('2400');
    expect(heightInput).toBeInTheDocument();
  });

  it('debe cambiar correctamente entre modos (Gestión de Estado Local UI)', () => {
    render(<RoomGeometryPlanner />);
    
    const openingsBtn = screen.getByText(/Aberturas/i);
    fireEvent.click(openingsBtn);

    expect(screen.getByText(/MODO: SELECCIONAR MUROS/i)).toBeInTheDocument();
    
    // Verificar que podemos volver
    const structureBtn = screen.getByText(/Estructura/i);
    fireEvent.click(structureBtn);
    expect(screen.getByText(/Modifica la forma de tu espacio/i)).toBeInTheDocument();
  });

  // --- PRUEBAS DE LÓGICA DE NEGOCIO Y SINCRONIZACIÓN (Store) ---

  it('debe actualizar la altura en el store global al escribir (Sync Pattern)', () => {
    render(<RoomGeometryPlanner />);
    
    // Usamos getByDisplayValue para encontrar el input que tiene '2400'
    const heightInput = screen.getByDisplayValue('2400');

    // Simulamos el cambio de evento
    fireEvent.change(heightInput, { target: { value: '3000' } });

    // VERIFICACIÓN RIGUROSA:
    // 1. Que se llame a la función
    // 2. Que la clave sea correcta ('room_height')
    // 3. Que el valor sea numérico (no string "3000"), validando tu lógica de parseo.
    expect(mockSetValue).toHaveBeenCalledWith('room_height', 3000);
  });

  it('debe actualizar las coordenadas de un punto específico', () => {
    // Este test asume que renderizas inputs para las coordenadas de los puntos
    // o que tienes una tabla de coordenadas editable.
    render(<RoomGeometryPlanner />);

    // Buscamos el input que corresponde a la coordenada X del segundo punto (100)
    // Lo ideal es tener data-testid="point-1-x"
    // Aquí buscamos por valor para el ejemplo:
    const pointXInputs = screen.getAllByDisplayValue('100');
    // Asumimos que el primero es el X del punto 2
    const targetInput = pointXInputs[0]; 

    fireEvent.change(targetInput, { target: { value: '150' } });

    // VERIFICACIÓN DE ESTRUCTURA COMPLEJA:
    // Verificamos que se envía el array COMPLETO actualizado
    expect(mockSetValue).toHaveBeenCalledWith(
      'room_points', 
      expect.arrayContaining([
          expect.objectContaining({ x: 0, y: 0 }),   // Punto 1 intacto
          expect.objectContaining({ x: 150, y: 0 }), // Punto 2 MODIFICADO
          expect.objectContaining({ x: 100, y: 100 }) // Punto 3 intacto
      ])
    );
  });

  it('debe agregar un nuevo punto a la geometría', () => {
    render(<RoomGeometryPlanner />);

    // Busca el botón de "Añadir Punto" o "Split Wall"
    const addPointBtn = screen.getByText(/Añadir/i); // Ajusta el selector según tu UI real
    fireEvent.click(addPointBtn);

    // Verificamos que setValue se llamó con un array de longitud 5 (inicial era 4)
    const calls = mockSetValue.mock.calls;
    const lastCallArgs = calls[calls.length - 1]; // Última llamada
    
    expect(lastCallArgs[0]).toBe('room_points');
    expect(lastCallArgs[1]).toHaveLength(5);
  });
});