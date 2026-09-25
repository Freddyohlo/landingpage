import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  ExternalLink,
  Github,
  Linkedin,
  MapPin,
  Menu,
  Send,
  X,
} from 'lucide-react';
import AssistantGuide from '@/components/AssistantGuide';

type Project = {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  project_url: string | null;
  featured: boolean;
  image: string;
  width: number;
  height: number;
};

const LINKEDIN_URL = 'https://www.linkedin.com/in/freddy-p%C3%A9rez-toro/';
const GITHUB_URL = 'https://github.com/Freddyohlo';

const NAV_LINKS = [
  { id: 'sobre-mi', label: 'Sobre mí' },
  { id: 'experiencia', label: 'Experiencia' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'contacto', label: 'Contacto' },
] as const;

const projects: Project[] = [
  {
    id: 'project-1',
    title: 'Web Inmobiliaria',
    description: 'Plataforma web para gestión y publicación de propiedades, con buscador avanzado y panel de administración.',
    tech_stack: ['React', 'TypeScript', 'Supabase'],
    project_url: 'https://inmobiliariavregion.surge.sh',
    featured: true,
    image: '/images/inmobiliaria.jpg',
    width: 1200,
    height: 536,
  },
  {
    id: 'project-2',
    title: 'Detección de Litio Geoespacial',
    description: 'Sistema de análisis geoespacial para detectar zonas con potencial de litio usando datos satelitales y machine learning.',
    tech_stack: ['Python', 'GIS', 'Machine Learning'],
    project_url: null,
    featured: false,
    image: '/images/litio.jpg',
    width: 800,
    height: 368,
  },
  {
    id: 'project-3',
    title: 'Billetera Web3',
    description: 'Aplicación descentralizada que conecta una billetera Ethereum (Mainnet y Sepolia) para consultar saldo e interactuar con la red.',
    tech_stack: ['Next.js', 'wagmi', 'viem', 'RainbowKit'],
    project_url: 'https://walletweb3portafolio.netlify.app/',
    featured: false,
    image: '/images/wallet.jpg',
    width: 1200,
    height: 539,
  },
  {
    id: 'project-4',
    title: 'Sistema Gestión de Inventarios',
    description: 'Sistema integral para control de stock, recepción, despacho y reportes de inventario en tiempo real.',
    tech_stack: ['JavaScript', 'SQL', 'UX'],
    project_url: 'https://inventario-interno.surge.sh',
    featured: false,
    image: '/images/inventario.jpg',
    width: 1100,
    height: 558,
  },
  {
    id: 'project-5',
    title: 'Agente IA Telegram',
    description: 'Bot de inteligencia artificial para Telegram que responde consultas y automatiza tareas con procesamiento de lenguaje natural.',
    tech_stack: ['Python', 'NLP', 'Telegram API'],
    project_url: null,
    featured: false,
    image: '/images/agente.jpg',
    width: 1200,
    height: 655,
  },
];

const experiences = [
  {
    period: '2022 — actualidad',
    role: 'Técnico residente',
    company: 'STG Southern Technology Group',
    detail: 'Distribuidor y SSTT en Chile de Zebra.',
    description: 'Mantenimiento, soporte y programación de equipos de picking y radiofrecuencia para la operación logística de CCU.',
    color: 'blue',
  },
  {
    period: '2020 — 2022',
    role: 'Encargado de logística y transporte',
    company: 'Heladería Marie y Pop.',
    detail: 'Pyme de heladería y abarrotes con distribución sector oriente.',
    description: 'Implementación de transporte, inventarios, rutas y estrategias de utilidad para la operación completa.',
    color: 'orange',
  },
  {
    period: '2017 — 2019',
    role: 'Analista de logística y transporte',
    company: 'Telemercados',
    detail: 'Supermercado en línea con distribución de abarrotes y alimentos.',
    description: 'Planificación, diseño y optimización diaria de rutas de despacho, recursos, costos y experiencia de cliente.',
    color: 'green',
  },
  {
    period: '2016 — 2017',
    role: 'Ejecutivo de logística',
    company: 'Usimeca Ltda.',
    detail: 'Representación y distribución de maquinaria e insumos metalmecánicos.',
    description: 'Gestión integral de abastecimiento y bodega, recepción, control de calidad y despacho de maquinaria industrial.',
    color: 'slate',
  },
  {
    period: '2014 — 2016',
    role: 'Ejecutivo comercial',
    company: 'Tecfor Ltda.',
    detail: 'Maquinaria para minería, construcción y forestal.',
    description: 'Venta y asesoría de grúas articuladas, plataformas elevadoras de carga y plataformas de auxilio vehicular.',
    color: 'slate',
  },
];

const skills = ['Análisis de sistemas', 'Programación', 'Logística', 'Optimización de rutas', 'Gestión de equipos', 'Excel avanzado'];

function App() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [showAllExperience, setShowAllExperience] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('sobre-mi');

  const visibleExperiences = useMemo(
    () => (showAllExperience ? experiences : experiences.slice(0, 3)),
    [showAllExperience],
  );

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Highlight the nav item whose section is closest to the sticky header.
  useEffect(() => {
    const sections = NAV_LINKS.map(({ id }) => document.getElementById(id)).filter(
      (section): section is HTMLElement => section !== null,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    const header = document.querySelector('header');
    const offset = header instanceof HTMLElement ? header.offsetHeight + 16 : 84;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#f3f6f8] text-[#172b4d]">
      <header className="sticky top-0 z-40 border-b border-[#dce5ec] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-5 lg:px-8">
          <button className="flex items-center gap-3" onClick={() => scrollTo('inicio')} aria-label="Ir al inicio">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#0a66c2] text-lg font-bold text-white">F</span>
            <span className="hidden text-[15px] font-bold tracking-[-0.02em] text-[#172b4d] sm:block">FREDDY PÉREZ</span>
          </button>
          <nav className="hidden items-center gap-8 text-[14px] font-semibold text-[#52677d] md:flex">
            {NAV_LINKS.map(({ id, label }) => (
              <button
                key={id}
                className={`nav-link${activeSection === id ? ' active' : ''}`}
                aria-current={activeSection === id ? 'true' : undefined}
                onClick={() => scrollTo(id)}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <a className="icon-button" href={LINKEDIN_URL} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={18} /></a>
            <a className="button-outline" href="mailto:freddy.perez.t@gmail.com">Hablemos <ArrowUpRight size={15} /></a>
          </div>
          <button className="rounded-md p-2 text-[#172b4d] md:hidden" onClick={() => setMenuOpen((current) => !current)} aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={isMenuOpen} aria-controls="mobile-menu">
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {isMenuOpen && <div id="mobile-menu" className="border-t border-[#e4ebf0] bg-white px-5 py-4 md:hidden"><div className="flex flex-col gap-4 text-sm font-semibold">{NAV_LINKS.map(({ id, label }) => <button key={id} onClick={() => scrollTo(id)}>{label}</button>)}</div></div>}
      </header>

      <main id="inicio">
        <section className="hero-grid mx-auto grid max-w-[1180px] items-center gap-12 px-5 pb-24 pt-16 lg:grid-cols-[1fr_420px] lg:px-8 lg:pb-28 lg:pt-24">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot" /> Disponible para nuevos desafíos</div>
            <h1 className="mt-6 max-w-[650px] text-[46px] font-bold leading-[1.04] tracking-[-0.055em] text-[#172b4d] sm:text-[64px]">Conecto operaciones, datos y <span className="text-[#0a66c2]">soluciones digitales.</span></h1>
            <p className="mt-7 max-w-[570px] text-[17px] leading-8 text-[#52677d]">Soy Freddy Pérez, profesional de operaciones y analista de sistemas en formación. Me gusta entender cómo funcionan las cosas y construir formas más simples de hacerlas mejor.</p>
            <div className="mt-9 flex flex-wrap gap-3"><button className="button-primary" onClick={() => scrollTo('proyectos')}>Ver mis proyectos <ArrowUpRight size={16} /></button><button className="button-quiet" onClick={() => scrollTo('sobre-mi')}>Conocer mi historia <ChevronDown size={16} /></button></div>
            <div className="mt-12 flex items-center gap-5 text-sm text-[#71859a]"><span className="flex items-center gap-2"><MapPin size={16} className="text-[#0a66c2]" /> Quilicura, Santiago</span><span className="h-1 w-1 rounded-full bg-[#a8b8c5]" /><span>Chile</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-[420px]">
            <AssistantGuide onNavigate={scrollTo} />
          </div>
        </section>

        <section id="sobre-mi" className="border-y border-[#dce5ec] bg-white"><div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8"><div><p className="section-kicker">01 / Sobre mí</p><h2 className="section-title mt-4">Una mirada práctica para resolver problemas reales.</h2></div><div className="space-y-5 text-[16px] leading-8 text-[#52677d]"><p>Mi recorrido comenzó en la gestión comercial y logística, donde aprendí a trabajar con personas, recursos y decisiones que tienen impacto directo en el día a día.</p><p>Hoy estoy sumando mi formación en análisis de sistemas y programación para llevar esa experiencia a productos digitales útiles: herramientas claras, procesos medibles y experiencias que hacen que el trabajo fluya.</p><div className="flex flex-wrap gap-2 pt-2">{skills.map((skill) => <span key={skill} className="chip chip-blue">{skill}</span>)}</div></div></div></section>

        <section id="experiencia" className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="section-kicker">02 / Trayectoria</p><h2 className="section-title mt-4">Experiencia que se construyó en terreno.</h2></div><span className="text-sm text-[#71859a]">2005 — actualidad</span></div><div className="mt-12 space-y-0">{visibleExperiences.map((experience) => <article className="timeline-item grid gap-4 border-t border-[#dce5ec] py-7 sm:grid-cols-[150px_1fr] lg:grid-cols-[180px_1fr_320px]" key={experience.company}><div className="flex items-start gap-3 text-sm font-semibold text-[#71859a]"><span className={`timeline-dot ${experience.color}`} />{experience.period}</div><div><h3 className="text-[18px] font-bold text-[#172b4d]">{experience.role}</h3><p className="mt-1 font-semibold text-[#0a66c2]">{experience.company}</p><p className="mt-2 text-sm text-[#71859a]">{experience.detail}</p></div><p className="text-sm leading-6 text-[#52677d] lg:pt-1">{experience.description}</p></article>)}</div><button className="button-quiet mt-3" onClick={() => setShowAllExperience((current) => !current)}>{showAllExperience ? 'Ver menos' : 'Ver trayectoria completa'} <ChevronDown className={showAllExperience ? 'rotate-180' : ''} size={16} /></button></section>

        <section id="proyectos" className="scroll-mt-24 border-y border-[#dce5ec] bg-[#eaf2f8]"><div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8"><div><p className="section-kicker">03 / Proyectos</p><h2 className="section-title mt-4">Ideas que estoy convirtiendo en herramientas.</h2><p className="mt-4 max-w-[540px] leading-7 text-[#52677d]">Una selección de proyectos y experimentos para mostrar cómo pienso, diseño y construyo.</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">{projects.map((project, index) => <article className={`project-card group ${project.featured ? 'featured-card md:col-span-2' : ''}`} key={project.id}><div className="project-visual"><img src={project.image} alt={`Vista del proyecto ${project.title}`} className="project-image" loading="lazy" decoding="async" width={project.width} height={project.height} /><span className="project-number">0{index + 1}</span>{project.featured && <span className="featured-label">Destacado</span>}</div><div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="text-[18px] font-bold leading-6 text-[#172b4d] group-hover:text-[#0a66c2]">{project.title}</h3>{project.project_url && <a href={project.project_url} target="_blank" rel="noreferrer" className="text-[#71859a] transition-colors hover:text-[#0a66c2]" aria-label={`Abrir ${project.title} en una pestaña nueva`}><ExternalLink size={17} /></a>}</div><p className="mt-3 text-sm leading-6 text-[#52677d]">{project.description}</p><div className="mt-5 flex flex-wrap gap-2">{project.tech_stack.map((tech) => <span className="project-tag" key={tech}>{tech}</span>)}</div></div></article>)}</div></div></section>

        <section id="contacto" className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8"><div className="rounded-2xl bg-[#172b4d] px-7 py-12 text-white sm:px-12 lg:flex lg:items-center lg:justify-between lg:px-16"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8dc7f4]">04 / Contacto</p><h2 className="mt-4 max-w-[550px] text-3xl font-bold leading-tight tracking-[-0.04em] sm:text-4xl">¿Tienes un desafío que podamos ordenar juntos?</h2><p className="mt-4 max-w-[500px] leading-7 text-[#bbcad8]">Estoy abierto a conversar sobre operaciones, tecnología y proyectos donde el pensamiento práctico pueda marcar una diferencia.</p></div><div className="mt-8 flex flex-wrap gap-3 lg:mt-0 lg:max-w-[235px]"><a className="button-light" href="mailto:freddy.perez.t@gmail.com"><Send size={16} /> Escribirme</a><a className="button-dark" href="tel:+56952514280"><span>+56 9 5251 4280</span><ArrowUpRight size={15} /></a></div></div></section>
      </main>
      <footer className="border-t border-[#dce5ec] bg-white"><div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-5 py-7 text-sm text-[#71859a] sm:flex-row sm:items-center sm:justify-between lg:px-8"><p>© {currentYear} Freddy Pérez. Hecho con intención.</p><div className="flex items-center gap-4"><a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-[#0a66c2]" aria-label="LinkedIn"><Linkedin size={17} /></a><a href={GITHUB_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-[#0a66c2]" aria-label="GitHub"><Github size={17} /></a></div></div></footer>
    </div>
  );
}

export default App;
