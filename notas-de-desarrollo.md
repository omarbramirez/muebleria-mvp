1. **Sobre CSS y Tailwind** => en proyectos grandes, podrías necesitar variantes (e.g., un <h1> en un hero section vs. un <h1> en un footer). Usar clases reutilizables como .heading-primary o .heading-hero (sin ser redundantes como .h1) puede dar más flexibilidad sin sacrificar semántica.

2. Necesito explicación de esto:

```
export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(' ');
}
```

3. **Sobre la decisión de abtraer elementos `<Link>` y `<button>` en un solo `<Button>`** => Lo correcto no es “poner clases iguales en `<Link>` y `<button>` sino abstraer la lógica visual en un componente UI común, y dejar que cada elemento semántico cumpla su función.

4. **`Record<Size, string>`** => ipo utilitario de TypeScript que construye un objeto donde:
- K son las keys permitidas.
- T es el tipo de valor que tendrán esas keys (`string` porque las clases de Tailwind se representan como cadenas).