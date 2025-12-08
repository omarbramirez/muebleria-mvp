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
  /layout.tsx              // `<html>`, `<body>`, JSON-LD Organization
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

❌ Confirmar con Leonardo si ya tiene logo, textos iniciales o imágenes para integrar.

✅ Sustituir textos Lorem ipsum por contenido real o temporal mejorado.

✅ Integrar estructura de traducciones JSON centralizada (/locales/es.json).

✅ Ajustar componentes con useTranslations() (Navbar, Hero, Contact).

✅ Subir cambios a GitHub y desplegar en Vercel.

✅ Definir paleta de colores y tipografía base (inspirado en referencias de UI de muebles).

✅ Aplicar estilos a Header, Hero y Footer con Tailwind (consistencia estética).

✅ Añadir imágenes de stock de muebles como placeholders de catálogo.

✅ Ajustar spacing, padding y grid responsive (desktop / mobile).

👉 Documentar cambios visuales en /docs/estilos.md.

## 27 de Agosto - 28 de Agosto

👉 Implementar validación en formulario (Zod/Yup).

✅ Configurar endpoint /api/leads en Next.js (guardar datos en consola/log por ahora).

✅ Conectar Mailchimp/SendGrid (sandbox API key) para pruebas de newsletter.

👉 Manejar mensajes de éxito y error (msgOnSuccess / msgOnError).

✅ Hacer test end-to-end: llenar formulario y revisar que el lead se registra.

✅ Revisar que todas las secciones estén navegables con contenido básico.

✅ Mejorar Hero con CTA funcional (scroll a catálogo o formulario).

✅ Asegurar que diseño es 100% responsive (desktop, tablet, móvil).

✅ Subir versión preliminar (v0.2) al servidor Vercel.

✅✅ Preparar mensaje para Leonardo con:

- Link a la demo navegable.
- Mockups refinados con estilos iniciales.
- Preguntar feedback sobre colores, tono de textos y orden de secciones.

**Icons** => https://lucide.dev/

## 05 OCT

1. Generación automatizada de modelos 3D => dejarlo al final del desarrollo por costos operativos.

- Plan de trabajo: desarrollo paralelo mientras se trabaja desarrolla la página principal.

‼️ Three.js 101 Crash Course: Beginner’s Guide to 3D Web Design => https://www.youtube.com/watch?v=KM64t3pA4fs&t=133s

## 06 OCT

1) Conseguir un modelo de cocina o espacio hoguareño para desarrollar .
2) Enviar minuta con plan de trabajo semanal.

‼️ https://www.youtube.com/watch?v=UqX0Jc04vio

📅 Plan de trabajo semanal [6 al 10 de octubre de 2025]

🧩 Objetivos específicos de la semana
✅ Dominar los fundamentos prácticos y avanzados de Three.js, especialmente en carga, renderizado y manipulación de modelos 3D.

- Diseñar la lógica del sondeo dentro del formulario principal.
  ✅ Comenzar la fase exploratoria de integración IA para automatización de modelos

📦 Entregables finales de la semana 
✅ Prototipo 3D experimental con modelo GLTF/FBX/OBJ renderizado en entorno web (Three.js).
✅ Diagrama de flujo del formulario con sondeo (estructura lógica y UX).
👉 Documento técnico sobre la integración y viabilidad de IA + Three.js

🧠 Plan de actividades detallado
Lunes 6
✅ Revisión técnica de la documentación oficial de Three.js (secciones sobre GLTFLoader, OrbitControls y materiales PBR).
✅ Selección de recursos educativos (curso técnico y documentación complementaria).
Martes 7
✅ Implementación práctica básica: carga de un modelo 3D (GLTF o FBX) en un entorno web local.
✅ Pruebas de iluminación, materiales y cámara.
Miércoles 8
✅ Experimentación con interactividad (rotación, zoom, cambio de materiales o texturas en tiempo real).
✅ Ajustes de rendimiento y compatibilidad móvil.
Jueves 9
✅ Diseño del sondeo en formulario (estructura de datos y flujo UX).
✅ Borrador de contenido para la sección principal del sitio (alineado con “accesibilidad y confianza”).
Viernes 10

## 11 OCT

Páginas muestra:

1) https://www.tallergama.com/
2) https://kitchen.planner.ikea.com/mx/es/
3) modelado 3D de Muebles en producción: https://www.perch.mx/
4) https://home.by.me/es/
5) View in AR https://www.dwr.com/

Ejemplos de Flujos:

![alt text](image.png)
![alt text](image-1.png)
![alt text](image-2.png)
![alt text](image-3.png)
![alt text](image-4.png)
![alt text](image-5.png)
![alt text](image-6.png)
![alt text](image-7.png)
![alt text](image-8.png)
![alt text](image-9.png)
![alt text](image-10.png)
![alt text](image-11.png)
![alt text](image-12.png)
![alt text](image-13.png)
USER FLOW
![alt text](image-14.png)
![alt text](image-15.png)
CLIENT JOURNEY
![alt text](image-20.png)
![alt text](image-21.png)
UI vs UX
![alt text](image-16.png)
![alt text](image-17.png)
WIREFRAME
![alt text](image-18.png)
![alt text](image-19.png)
DIAGRAM
![alt text](image-22.png)
![alt text](image-23.png)
![alt text](image-24.png)
![alt text](image-25.png)
![alt text](image-26.png)
TASK FLOW
![alt text](image-28.png)

# 12 OCT

guia para la realizacion de "Análisis técnico" y "Estudio de Mercado": https://www.domnguyen.co/spotify

# 13 OCT

PenPot Tutorial - The Open Source UI/UX Design App https://www.youtube.com/watch?v=To9lZhP7084

# 14 OCT

## Plan de Trabajo — Semana 13 al 17 de Octubre, 2025

Tareas técnicas:

✅ Configurar entorno base con Three.js y React Three Fiber dentro del proyecto Next.js.
✅ Implementar cargador universal de modelos 3D (GLTF, FBX, OBJ) con fallback visual y manejo de errores.
✅ Crear escena de prueba con iluminación ambiental, cámara orbital y controles interactivos.
✅ Añadir interfaz mínima para manipular parámetros del modelo (rotación, zoom, posición).
👉 Evaluar compatibilidad con materiales PBR y texturas para renders realistas.
👉 Documentar estructura de componentes 3D para futuras integraciones con IA o personalización en tiempo real.

Entregables Totales:

✅ Demo funcional Three.js + modelo cargado de una cocina integral.
✅ Documento “Estructura modular del visor 3D”.
✅ Prototipo navegable de configuradores para optimizar la personalziación del usuario. https://9000-firebase-studio-1760759475632.cluster-hkcruqmgzbd2aqcdnktmz6k7ba.cloudworkstations.dev
✅ Guía para validación de Focus Group.

# 15 OCT

1) Three.js 101 Crash Course: Beginner’s Guide to 3D Web Design (7 HOURS!) [03:31:00] https://www.youtube.com/watch?v=KM64t3pA4fs&t=133s

# 17 OCT

aprovechar modelo 3d para mostrar estructura de mueble: ![alt text](image-27.png)

**Carga entre secciones** => https://linkinpark.com/tour » animación de opacity a cero con pantalla en negro para quitar contenido anterior, opacity a 1 con blur para mostrar nuevo contenido.

# 21 OCT

Prompt para Firebase (Generación de Prototipo de Configuradores)

Título del proyecto:
Prototipo navegable de configuradores 3D para personalización de mobiliario

Contexto general:
Este prototipo forma parte de la segunda etapa de una aplicación web enfocada en conectar usuarios y proveedores del sector mobiliario. El objetivo es facilitar la personalización de productos (como cocinas integrales, baños, mesas y sofás) mediante un flujo de interacción sencillo, accesible y compatible con renderizado 3D en tiempo real.

Stack actual y requerimientos técnicos:

Frontend: Next.js 15 + React 19 + TailwindCSS v4

Motor 3D: Three.js (GLTF, OBJ o FBX)

Estado global: Zustand o Redux Toolkit

Backend provisional: Firebase (Firestore + Storage)

Objetivo: generar un prototipo navegable y funcional, no final, centrado en la UX del configurador.

Requisitos: compatibilidad con los navegadores modernos (Chrome, Edge, Safari) y adaptación responsive.

Objetivo específico del prototipo:
Construir una interfaz navegable de configuradores que permita al usuario:

Seleccionar un tipo de mueble (por ejemplo: cocina, baño, mesa o sofá).

Personalizar su diseño mediante modificadores (color, material, tamaño, textura, disposición).

Visualizar los cambios en un visor 3D integrado (Three.js) con controles de rotación y zoom.

Guardar configuraciones temporalmente (en Firestore o localStorage).

Navegar entre pantallas o pasos con un flujo de tipo “wizard” o “stepper”.

Estructura esperada del prototipo:

src/
├── app/
│   ├── page.tsx                        # Página principal del configurador
│   ├── components/
│   │   ├── ConfiguratorStep.tsx        # Paso individual (materiales, color, medidas)
│   │   ├── ModelViewer.tsx             # Visor 3D (Three.js + Canvas)
│   │   ├── OptionSelector.tsx          # Selector de opciones
│   │   ├── NavigationControls.tsx      # Botones siguiente / anterior / guardar
│   │   └── SummaryScreen.tsx           # Resumen final de la configuración
│   ├── hooks/
│   │   └── useConfigurator.ts          # Estado global (Zustand)
│   ├── services/
│   │   └── firebaseConfig.ts           # Conexión con Firestore + Storage
│   ├── styles/
│   │   └── configurator.css            # Estilos locales o Tailwind utilities
│   └── utils/
│       └── modelLoader.ts              # Función para cargar modelos 3D (GLTFLoader)
├── public/
│   ├── models/                         # Carpeta con modelos de prueba (.gltf, .obj)
│   └── textures/                       # Carpeta con texturas

Flujo de navegación (Task Flow):

Pantalla inicial → selección de tipo de mueble.

Configuración de color y material → aplicación visual inmediata.

Ajuste de dimensiones y proporciones.

Vista previa completa 3D.

Resumen de configuración → opción de guardar o reiniciar.

Requisitos de UI/UX:

Diseño minimalista, accesible, con colores base turquesa pastel + gris neutro.

Controles visibles y consistentes (botones grandes, texto legible, feedback claro).

Tipografía: Inter / Poppins.

Compatible con dark mode y sistema prefers-color-scheme.

Mostrar un estado de carga (“Cargando modelo…”) antes de cada render.

Incluir mensajes de feedback (“Configuración guardada”, “Error al cargar modelo”).

Entrega esperada:

Prototipo navegable alojado en Firebase Hosting.

Conexión básica con Firestore (guardado de configuraciones).

Un modelo 3D de ejemplo cargado desde /public/models/demo.gltf.

Flujo funcional completo, aunque con datos simulados.

Código estructurado y documentado con comentarios técnicos en inglés.

Objetivo final del entregable:
Mostrar una demostración navegable del flujo de personalización (UX) y la integración del visor 3D modular que servirá de base para futuras implementaciones de IA y automatización de diseño.

## 24 OCT

1) hacer planos por metro cuadrado para facilitar acomodo
   ![alt text](image-30.png)
2) Server-Driven UI: El Costo Oculto de la Flexibilidad [00:00:00] https://www.youtube.com/watch?v=gJWBHk0ZwiA
3) SEO programático en Next.js: guía completa [00:11:00] https://www.youtube.com/watch?v=290Ytj96vL4

## 25 OCT

Entregables Totales (sábado 25 de Octubre):

1) Desarrollo avanzado del Prototipo navegable de configuradores para optimizar la personalización del usuario, integrado a la página principal en la sección /products.
   ✅ App de renderizado 3D (Three.js) con nuevas funciones de personalización: selección de color y material.
2) (Extra) Interacción directa dentro del modelo 3D: el usuario podrá mover objetos con el mouse.

## 28 OCT

todavia tengo que regionalizar los links
![alt text](image-31.png)

tengo en navbar y el responsive navbar separados, debo mejorar eso

![alt text](image-32.png)

aun no me queda clara la logica de negocio, es decir, cómo se va a implementar la última parte de la conversión?

![alt text](image-33.png)

porque seria explore/creation explore/generation explore/planner

COSAS IMPORTANTES

accesibilidad web (a11y) garantiza que personas con discapacidades visuales, auditivas o motrices

TTI (Time To Interactive) mide cuánto tarda una página en estar completamente interactiva después de comenzar a cargar.
Es una de las Core Web Vitals indirectas, usada para cuantificar la sensación de rapidez.
El navegador pinta y reacomoda el contenido constantemente cuando cambian estilos o el layout.
Estos procesos consumen CPU y son la causa principal de micro-lags o baja fluidez visual en UI complejas (animaciones, scroll, 3D, etc.).

<<<<<<< HEAD

## 03 NOV

1) motor de ensamblado inteligente
   =======

## 30 OCT

ya debería estar seleccionada la cocina o baño si se accede desde sus botones

![alt text](image-34.png)

necesito refactorizar esto para usar params y router.get("from") en flujos con componentes compartidos como el area

![alt text](image-35.png)

## 1 NOV

![alt text](image-36.png)

solo dos en presupuesto, quitar estanterias y banco en detalle

## 3 NOV

Agregar altura,
Agregar ventanas y puertas
Hacer que el modelo se mueve ? en un plano isometrico

Testing

## 07 NOV

he estado trabajando hoy en 3 nuevas características:

1) Asignación de altura
2) Asignación de puertas y ventanas
3) Perspectiva isométrica simplificada

![alt text](image-37.png)

![alt text](image-38.png)

![alt text](image-39.png)

![alt text](image-40.png)

![alt text](image-41.png)

![alt text](image-42.png)

![alt text](image-43.png)

![alt text](image-44.png)

![alt text](image-45.png)

![alt text](image-46.png)

## 07 DIC

Cabinets => es importante definir cuántos cajones o puertas debe tener un mueble? cómo validamos eso?
