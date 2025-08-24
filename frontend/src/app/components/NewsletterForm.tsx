"use client"
import { useState , FormEvent} from 'react';

const NewsletterForm: React.FC  =()=>{
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Validación básica
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Por favor, ingresa un correo electrónico válido.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Aquí iría la lógica para enviar el correo a tu servicio de newsletter (e.g., Mailchimp, Supabase, etc.)
      // Por ahora, simulamos una llamada API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulación de llamada API
      setMessage('¡Gracias por suscribirte! Revisa tu correo para confirmar.');
      setEmail('');
    } catch (error) {
      setMessage('Hubo un error al procesar tu suscripción. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full m-auto min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto" >
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
        Suscríbete a nuestro Newsletter
      </h2>
      <p className="text-center text-gray-600 mb-6">
        Recibe las últimas noticias y actualizaciones directamente en tu correo.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>
        {message && (
          <p className={`text-center ${message.includes('Gracias') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-md text-white font-semibold ${
            isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors`}
        >
          {isSubmitting ? 'Enviando...' : 'Suscribirse'}
        </button>
      </form>
      </div>
    </div>
  );
}

export default NewsletterForm;