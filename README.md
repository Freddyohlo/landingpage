# Portafolio personal — Freddy Pérez

Sitio de portafolio profesional de una sola página (SPA) que presenta perfil,
trayectoria, proyectos y vías de contacto. Incluye un **asistente guiado** que
responde preguntas y dirige al visitante a la sección que busca.

**Demo en vivo:** https://landing-portafolio-fp.vercel.app/

## ✨ Secciones

| Sección | Contenido |
| --- | --- |
| Inicio | Presentación, enfoque profesional y ubicación |
| Sobre mí | Resumen de perfil y competencias |
| Experiencia | Línea de tiempo laboral (con opción de ver trayectoria completa) |
| Proyectos | Tarjetas de proyectos con tecnologías y enlaces |
| Contacto | Correo y teléfono directos |

## 🧠 Asistente guiado

El componente `AssistantGuide` funciona como un pequeño chat: interpreta palabras
clave de la consulta y hace scroll a la sección correspondiente. No usa IA ni
backend; es 100 % en el navegador.

## 🛠️ Tecnologías

- **React 18** + **TypeScript**
- **Vite** (build y dev server)
- **Tailwind CSS**
- **lucide-react** (iconografía)
- Desplegado en **Vercel**

## 🚀 Puesta en marcha

```bash
git clone https://github.com/Freddyohlo/landingpage.git
cd landingpage
npm install
npm run dev
```

### Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Previsualiza el build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Verificación de tipos TypeScript |

## 📁 Estructura

```
index.html                 HTML raíz (metadatos, SEO y Open Graph)
src/
  App.tsx                  Composición de secciones y datos del portafolio
  components/
    AssistantGuide.tsx     Asistente guiado por palabras clave
  index.css                Estilos base y utilidades
  main.tsx                 Punto de entrada
public/
  images/                  Imágenes de los proyectos
  favicon.svg
supabase/
  migrations/              Historial de esquema (referencia; la app es estática)
```

## 📝 Notas

- Los datos del portafolio (experiencia, proyectos y competencias) están
  definidos en `src/App.tsx`.
- Las migraciones en `supabase/migrations/` se conservan como historial del
  esquema, pero el sitio actual no consulta Supabase: el contenido es estático.

## 📄 Licencia

Uso personal. Todos los derechos reservados.
