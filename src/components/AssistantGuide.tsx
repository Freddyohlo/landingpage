import { useEffect, useRef, useState } from 'react';
import { Headset, Send, BriefcaseBusiness, Code2, Mail } from 'lucide-react';

type AssistantGuideProps = {
  onNavigate: (section: string) => void;
};

type Message = {
  id: number;
  text: string;
  fromUser: boolean;
};

const INTRO_TEXT =
  'Te doy la bienvenida al portafolio de Freddy Pérez, aquí podrás encontrar tanto su experiencia laboral, proyectos y contacto. Dime qué te gustaría revisar y te redirijo con gusto a la sección.';

const SECTION_KEYWORDS: Record<string, string[]> = {
  'sobre-mi': ['sobre', 'quien', 'quién', 'perfil', 'historia', 'conocer', 'freddy'],
  experiencia: ['experiencia', 'trabajo', 'trayectoria', 'laboral', 'empleo', 'cargo', 'puesto'],
  proyectos: ['proyecto', 'programacion', 'programación', 'código', 'codigo', 'desarrollo', 'app', 'tecnologia', 'tecnología'],
  contacto: ['contacto', 'contactar', 'correo', 'email', 'telefono', 'teléfono', 'hablar', 'llamar', 'mensaje'],
};

const QUICK_ACTIONS = [
  { label: 'Experiencia', section: 'experiencia', icon: BriefcaseBusiness },
  { label: 'Proyectos', section: 'proyectos', icon: Code2 },
  { label: 'Contacto', section: 'contacto', icon: Mail },
];

let messageIdCounter = 0;

function AssistantGuide({ onNavigate }: AssistantGuideProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: messageIdCounter++, text: INTRO_TEXT, fromUser: false },
  ]);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  useEffect(() => {
    if (!isSpeaking) return;
    const timer = window.setTimeout(() => setIsSpeaking(false), 2200);
    return () => window.clearTimeout(timer);
  }, [isSpeaking]);

  function findSection(question: string): string | null {
    const normalized = question.toLowerCase().trim();
    for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
      if (keywords.some((keyword) => normalized.includes(keyword))) {
        return section;
      }
    }
    return null;
  }

  function respond(question: string) {
    const section = findSection(question);
    let answer: string;
    let target: string;

    if (section) {
      const sectionNames: Record<string, string> = {
        'sobre-mi': 'Sobre mí',
        experiencia: 'Experiencia',
        proyectos: 'Proyectos',
        contacto: 'Contacto',
      };
      answer = `¡Por supuesto! Te llevo a la sección "${sectionNames[section]}" para que la revises.`;
      target = section;
    } else {
      answer = 'Te recomiendo que te contactes con Freddy para más información.';
      target = 'contacto';
    }

    setMessages((current) => [
      ...current,
      { id: messageIdCounter++, text: question, fromUser: true },
      { id: messageIdCounter++, text: answer, fromUser: false },
    ]);
    setIsSpeaking(true);
    setHasInteracted(true);
    setInput('');
    window.setTimeout(() => onNavigate(target), 600);
  }

  function handleQuickAction(section: string) {
    const sectionNames: Record<string, string> = {
      'sobre-mi': 'Sobre mí',
      experiencia: 'Experiencia',
      proyectos: 'Proyectos',
      contacto: 'Contacto',
    };
    setMessages((current) => [
      ...current,
      { id: messageIdCounter++, text: `Quiero ver "${sectionNames[section]}"`, fromUser: true },
      { id: messageIdCounter++, text: `¡Claro! Te dirijo a "${sectionNames[section]}" ahora mismo.`, fromUser: false },
    ]);
    setIsSpeaking(true);
    setHasInteracted(true);
    window.setTimeout(() => onNavigate(section), 500);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (trimmed) respond(trimmed);
  }

  return (
    <div className="assistant-card overflow-hidden rounded-2xl border border-[#dce5ec] bg-white shadow-[0_24px_70px_rgba(23,43,77,0.12)]">
      <div className="assistant-stage">
        <div className="assistant-glow" />
        <svg
          viewBox="0 0 200 220"
          className="assistant-svg"
          role="img"
          aria-label="Asistente virtual animada"
        >
          {/* Desk / counter */}
          <ellipse cx="100" cy="208" rx="72" ry="14" fill="#0a66c2" opacity="0.08" />
          {/* Shoulders / body */}
          <path
            d="M55 200 Q60 165 80 158 L120 158 Q140 165 145 200 Z"
            fill="#0a66c2"
          />
          <path
            d="M55 200 Q60 165 80 158 L120 158 Q140 165 145 200 Z"
            fill="url(#bodyShade)"
          />
          {/* Collar */}
            <path d="M85 158 Q100 168 115 158 L115 162 Q100 172 85 162 Z" fill="#eaf2f8" />
          {/* Neck */}
          <rect x="92" y="142" width="16" height="20" rx="6" fill="#e8c4a0" />
          {/* Hair back */}
          <path
            d="M58 95 Q50 130 65 150 L75 148 Q70 120 72 95 Z"
            fill="#3a2418"
          />
          <path
            d="M142 95 Q150 130 135 150 L125 148 Q130 120 128 95 Z"
            fill="#3a2418"
          />
          {/* Head */}
          <ellipse cx="100" cy="98" rx="34" ry="38" fill="#f0d0ad" />
          {/* Hair top */}
          <path
            d="M66 92 Q60 55 100 50 Q140 55 134 92 Q130 72 115 68 Q100 72 85 68 Q70 72 66 92 Z"
            fill="#3a2418"
          />
          <path
            d="M68 70 Q72 48 100 46 Q128 48 132 70 Q120 58 100 58 Q80 58 68 70 Z"
            fill="#4a2e20"
          />
          {/* Ears */}
          <ellipse cx="66" cy="100" rx="4" ry="6" fill="#e8c4a0" />
          <ellipse cx="134" cy="100" rx="4" ry="6" fill="#e8c4a0" />
          {/* Headset band */}
          <path
            d="M68 78 Q100 55 132 78"
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M68 78 Q100 55 132 78"
            fill="none"
            stroke="#3d3d5c"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Headset ear cups */}
          <ellipse cx="66" cy="100" rx="7" ry="9" fill="#1a1a2e" />
          <ellipse cx="134" cy="100" rx="7" ry="9" fill="#1a1a2e" />
          <ellipse cx="66" cy="100" rx="4" ry="5" fill="#3d3d5c" />
          <ellipse cx="134" cy="100" rx="4" ry="5" fill="#3d3d5c" />
          {/* Headset mic arm */}
          <path
            d="M66 106 Q52 118 58 135"
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Mic */}
          <ellipse cx="59" cy="138" rx="5" ry="4" fill="#1a1a2e" />
          <ellipse cx="59" cy="138" rx="3" ry="2.5" fill="#3d3d5c" />
          {/* Eyebrows */}
          <path d="M78 86 Q86 82 92 86" fill="none" stroke="#3a2418" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M108 86 Q114 82 122 86" fill="none" stroke="#3a2418" strokeWidth="2.5" strokeLinecap="round" />
          {/* Eyes */}
          <g className="assistant-eyes">
            <ellipse cx="85" cy="96" rx="3.5" ry="4.5" fill="#1a1a2e" />
            <ellipse cx="115" cy="96" rx="3.5" ry="4.5" fill="#1a1a2e" />
          </g>
          {/* Eye highlights */}
          <circle cx="86" cy="94.5" r="1" fill="white" opacity="0.8" />
          <circle cx="116" cy="94.5" r="1" fill="white" opacity="0.8" />
          {/* Nose */}
          <path d="M100 102 Q98 108 100 112 Q102 108 100 102" fill="none" stroke="#d4a878" strokeWidth="1.5" strokeLinecap="round" />
          {/* Mouth - changes when speaking */}
          {isSpeaking ? (
            <g className="assistant-mouth-speaking">
              <ellipse cx="100" cy="118" rx="6" ry="4" fill="#c44a5a" />
              <ellipse cx="100" cy="118" rx="4" ry="2.5" fill="#e07080" />
            </g>
          ) : (
            <path
              d="M92 117 Q100 122 108 117"
              fill="none"
              stroke="#b04a40"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
          {/* Cheeks */}
          <ellipse cx="76" cy="110" rx="5" ry="3" fill="#f0b8a0" opacity="0.4" />
          <ellipse cx="124" cy="110" rx="5" ry="3" fill="#f0b8a0" opacity="0.4" />

          <defs>
            <linearGradient id="bodyShade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="white" stopOpacity="0" />
              <stop offset="1" stopColor="#004182" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
        <div className="assistant-status">
          <span className="assistant-status-dot" />
          <span className="assistant-status-text">En línea</span>
        </div>
      </div>

      <div className="assistant-body">
        <div className="assistant-name-row">
          <div>
            <p className="assistant-name">Valentina</p>
            <p className="assistant-role">Orientadora del portafolio</p>
          </div>
          <span className="assistant-badge"><Headset size={13} /> Asistente</span>
        </div>

        <div className="assistant-messages" aria-live="polite">
          {messages.map((message) => (
            <div
              key={message.id}
              className={message.fromUser ? 'chat-message user-message' : 'chat-message assistant-message'}
            >
              {!message.fromUser && <span className="chat-avatar-mini">V</span>}
              <span>{message.text}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {!hasInteracted && (
          <div className="assistant-quick-row">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.section}
                className="quick-rect"
                onClick={() => handleQuickAction(action.section)}
              >
                <span className="quick-rect-icon"><action.icon size={16} /></span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}

        <form className="assistant-form" onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="chat-input"
            placeholder="Escribe tu pregunta..."
            aria-label="Escribe tu pregunta"
          />
          <button className="chat-send" type="submit" aria-label="Enviar pregunta">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default AssistantGuide;
