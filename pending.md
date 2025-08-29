## 18 de Agosto - 19 de Agosto

1. Revisar propuesta final aceptada para tener claros los entregables de esta semana. ✅

👉 Para el viernes podrás esperar: ✅✅

- Un primer diseño de la landing page en versión de prueba. ✅
- Una propuesta de estructura visual lista para recibir tus comentarios. ✅
- Opciones de nombres de dominio (si aún no tienes uno elegido). ✅

2. Escribir a Leonardo (si no lo has hecho ya) para confirmar: ✅✅
- Nombre o posibles nombres de dominio.  ✅
- Logo, textos iniciales, imágenes o eslogan que quiera usar.  ✅

5. Crear carpeta de proyecto (estructura organizada: /design, /frontend, /docs). ✅

/app
  /favicon.ico
  /opengraph-image.png
  /robots.txt
  /sitemap.xml
  /api
    /leads/route.ts        // POST: guarda en DynamoDB + Mailchimp
  /layout.tsx              // <html>, <body>, JSON-LD Organization
  /page.tsx                // Landing (todas las secciones)
  /(components)
    Header.tsx
    Hero.tsx
    Catalog.tsx
    HowItWorks.tsx
    Personalization.tsx
    SocialProofOrFAQ.tsx
    LeadForm.tsx
    PartnersCTA.tsx
    Footer.tsx
    ChatWidget.tsx
  /(lib)
    mailchimp.ts           // helper integración
    dynamodb.ts            // helper AWS SDK v3
    schemas.ts             // zod/yup para validar formulario


6. Hacer un diagrama general de secciones (mapa del sitio con Home, Catálogo, Contacto, etc.). ✅

┌───────────────────────────────────────────────────────────────────┐
│ Top Bar (opcional): Preventa abierta | Entrega estimada | Soporte │
├───────────────────────────────────────────────────────────────────┤
│ LOGO             Nav: Catálogo | Cómo funciona | FAQs | Contacto  │
│                                [CTA] Empezar preventa             │
├───────────────────────────────────────────────────────────────────┤
│ HERO: H1 “Muebles personalizables en línea”                        │
│ Subtítulo breve                                                     │
│ [CTA primario: Ver catálogo]  [CTA secundario: Solicitar asesoría] │
│ [Imagen/Poster 3D]   [Trust badges / Sellos]                       │
├───────────────────────────────────────────────────────────────────┤
│ SECCIÓN CATÁLOGO (Grid 3/2/1):                                     │
│ [Card] [Card] [Card]                                               │
│ [Card] [Card] [Card]         [Filtros: Categoría | Material | Color]│
│ Cada Card: Img, Nombre, “desde $”, CTA → (scroll Form + producto)  │
├───────────────────────────────────────────────────────────────────┤
│ CÓMO FUNCIONA (4 pasos con iconos): Elige → Personaliza → Produce →│
│ Recibe. CTA contextual: Empezar ahora                              │
├───────────────────────────────────────────────────────────────────┤
│ PERSONALIZACIÓN (educativa): Próximamente visor 3D, opciones etc.  │
│ Imagen/placeholder y texto                                         │
├───────────────────────────────────────────────────────────────────┤
│ TESTIMONIOS o FAQs (acordeón):                                     │
│ - ¿Cuánto tarda?  - ¿Garantía?  - ¿Materiales?  - ¿Envío?          │
├───────────────────────────────────────────────────────────────────┤
│ FORMULARIO DE CONTACTO (clave):                                    │
│ Nombre | Email | Tel (opc) | Interés/Modelo | Mensaje | Consent    │
│ [Enviar] → éxito + add to Mailchimp/SendGrid                       │
├───────────────────────────────────────────────────────────────────┤
│ TALLES/PROVEEDORES (opcional): “Únete a la red de talleres”        │
├───────────────────────────────────────────────────────────────────┤
│ FOOTER: Contacto | Legales | RRSS | © Marca | Sitemap              │
└───────────────────────────────────────────────────────────────────┘
   [Chat flotante]


7. Documentar la estructura en un archivo simple (ej. docs/estructura.md). ✅

8. Crear wireframes de baja fidelidad (pueden ser en Figma, Whimsical o incluso papel escaneado). ✅
- https://www.relume.io/


9. Definir: ✅
- Orden y jerarquía de secciones.
- Distribución de elementos clave (header, hero, formulario, catálogo, footer).

10. Preparar un mockup principal de la landing page. ✅
- Chair: Three.js : https://threejs.org/examples/#webgl_loader_gltf_sheen 
- Progressive building/customization: https://threejs.org/examples/#webgl_loader_ldraw
- How to create simplified furnitures in ThreeJS: https://amrishodiq.medium.com/how-to-create-simplified-furnitures-in-threejs-6373d1a5363f
- Template 1: https://www.behance.net/gallery/227943121/E-commerce-B2B-Furniture-Platform-Redesign-UI-UX?tracking_source=search_projects|furniture+store+web+design&l=0
- Template 2: https://www.behance.net/gallery/221790215/Furniture-Store-eCommerce-Website-Design-Home-Decor?tracking_source=search_projects|furniture+store+web+design&l=5
- Template 3: https://www.behance.net/gallery/232570025/Furniture-Store-Modern-Website-Template

11. Si el cliente ya envió logo/nombre, integrarlo en el diseño. ❌

12. Exportar imágenes o PDF de los bocetos para revisión. ✅

## 22 de Agosto - 23 de Agosto

1. Inicializar repositorio privado en GitHub  ✅ ✅
- Crear repo muebleria-mvp. ✅
- Subir carpeta inicial con estructura básica /frontend, /design, /docs. ✅
- Configurar .gitignore para Node, .env y dependencias. ✅

2. Configurar frontend ✅ ✅
- Decide si usarás Next.js (ideal SEO) o React + Vite (más ligero). ✅
- Ejecuta npx create-next-app@latest o npm create vite@latest. ✅
- Instala TailwindCSS (npm install -D tailwindcss postcss autoprefixer). ✅
- Configura tailwind.config.js y globals.css. ✅

3. Montar entorno en Vercel ✅ ✅
- Conectar repositorio Git en Vercel para hosting automático. ✅
- Desplegar con push a rama principal; usa CDN global integrado. ✅
- Usar subdominio temporal tipo demo-muebleria.vercel.app (luego vincular dominio personalizado en Vercel Domains). ✅

4. Estructura de componentes React (según wireframes): ✅✅
- Header (logo, menú ancla). ✅
- Hero (texto y CTA). ✅
- CatalogPreview (cards vacías con imágenes dummy). ✅
- ContactForm (inputs vacíos por ahora). ✅
- Footer. ✅

5. Primera versión navegable básica ✅✅
- Rutas ancla (#inicio, #catalogo, #contacto). ✅
- Contenido de prueba (texto lorem ipsum y placeholders). ✅
- Push al repo y deploy a AWS. ❌

7. Muestra (idea) de Silla en threejs: https://www.youtube.com/watch?v=O8q8H9c9XZ4 ✅

rafce

## 25 de Agosto - 26 de Agosto

☐ Confirmar con Leonardo si ya tiene logo, textos iniciales o imágenes para integrar.

☐ Sustituir textos Lorem ipsum por contenido real o temporal mejorado.

☐ Integrar estructura de traducciones JSON centralizada (/locales/es.json).

☐ Ajustar componentes con useTranslations() (Navbar, Hero, Contact).

☐ Subir cambios a GitHub y desplegar en Vercel.

📌 Definir paleta de colores y tipografía base (inspirado en referencias de UI de muebles). 

☐ Aplicar estilos a Header, Hero y Footer con Tailwind (consistencia estética).

☐ Añadir imágenes de stock de muebles como placeholders de catálogo.

☐ Ajustar spacing, padding y grid responsive (desktop / mobile).

☐ Documentar cambios visuales en /docs/estilos.md.

## 27 de Agosto - 28 de Agosto

☐ Implementar validación en formulario (Zod/Yup).

☐ Configurar endpoint /api/leads en Next.js (guardar datos en consola/log por ahora).

☐ Conectar Mailchimp/SendGrid (sandbox API key) para pruebas de newsletter.

☐ Manejar mensajes de éxito y error (msgOnSuccess / msgOnError).

☐ Hacer test end-to-end: llenar formulario y revisar que el lead se registra.

☐ Revisar que todas las secciones estén navegables con contenido básico.

☐ Mejorar Hero con CTA funcional (scroll a catálogo o formulario).

☐ Asegurar que diseño es 100% responsive (desktop, tablet, móvil).

☐ Subir versión preliminar (v0.2) al servidor Vercel.

☐ Preparar mensaje para Leonardo con:
- Link a la demo navegable.
- Mockups refinados con estilos iniciales.
- Preguntar feedback sobre colores, tono de textos y orden de secciones.

**Icons** => https://lucide.dev/


Genera una ilustración estilo comic futurista de dos personajes juntos vistos a la distancia, entre la multitud, en un asentamiento urbano con lluvia: 

1) una mujer hechicera poderosa y joven, 27 años, con cabello super negro, vestimenta gótica juvenil, mirada muy cansada, está herida y un poco sucia de su sangre, tiene vendajes blancos solo en sus muñecas, las manos están libre de vendajes. Y una curita en su frente.

2) un robot poderoso hombre con su cuerpo color carbon, desgastado y sucio de oxido y lodo,  con una actitud derrotada, y una kufiya palestina alrededor de su cuello. 