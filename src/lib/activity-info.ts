export type ActivityInfo = {
  title: string;
  emoji: string;
  description: string;
  steps: string[];
};

export const ACTIVITY_INFO: Record<string, ActivityInfo> = {
  "respiracion-guia": {
    title: "Respiracion Guiada",
    emoji: "🌬️",
    description:
      "Un ejercicio de respiracion diafragmatica guiada que te ayudara a calmar tu sistema nervioso y reducir la ansiedad en pocos minutos.",
    steps: [
      "Sientate en una posicion comoda con la espalda recta.",
      "Coloca una mano en el pecho y otra en el abdomen.",
      "Sigue el ritmo visual: inhala cuando el circulo crezca, exhala cuando se contraiga.",
      "Repite el ciclo las veces que necesites.",
    ],
  },
  "respiracion-montana": {
    title: "Respiracion Montana",
    emoji: "⛰️",
    description:
      "Visualiza el ascenso y descenso de una montana mientras sincronizas tu respiracion con el movimiento, creando calma interior.",
    steps: [
      "Relaja los hombros y cierra los ojos unos segundos.",
      "Cuando la linea suba, inhala profundamente por la nariz.",
      "Manten el aire en la cima de la montana.",
      "Exhala lentamente por la boca mientras la linea desciende.",
    ],
  },
  "rollercoaster-breathe": {
    title: "Rollercoaster Breathe",
    emoji: "🎢",
    description:
      "Usa la metafora de una montana rusa para explorar tu respiracion: sube con la inhalacion y baja suavemente con la exhalacion.",
    steps: [
      "Imagina que estas en una montana rusa muy suave y tranquila.",
      "Cuando el vagon suba, inhala con fuerza.",
      "Cuando el vagon baje, exhala lentamente soltando toda la tension.",
      "Deja que tu cuerpo se relaje con cada bajada.",
    ],
  },
  "rollercoaster-zen": {
    title: "Rollercoaster Zen",
    emoji: "🧘",
    description:
      "Una version mas lenta y meditativa de la respiracion en montana rusa, disenada para alcanzar un estado profundo de relajacion.",
    steps: [
      "Encuentra una posicion comoda y cierra los ojos.",
      "Sigue el movimiento suave de la animacion.",
      "Inhala en 4 tiempos, reten 4 tiempos, exhala en 4 tiempos.",
      "Repite hasta sentir una calma profunda.",
    ],
  },
  "burbujas-alivio": {
    title: "Burbujas de Alivio",
    emoji: "🫧",
    description:
      "Revienta burbujas virtuales como tecnica de grounding. Cada burbuja que tocas te ancla al momento presente y aleja la ansiedad.",
    steps: [
      "Toma tres respiraciones profundas antes de comenzar.",
      "Haz clic o toca las burbujas que aparecen en pantalla.",
      "Concentrate en el sonido y la sensacion de cada burbuja al reventarse.",
      "Si tu mente divaga, vuelve a enfocarte en la siguiente burbuja.",
    ],
  },
  "trazo-zen": {
    title: "Trazo Zen",
    emoji: "✏️",
    description:
      "Dibuja libremente en el lienzo digital. El dibujo mindful es una tecnica poderosa para despejar la mente y reducir el estres.",
    steps: [
      "No te preocupes por dibujar algo bonito, no es el objetivo.",
      "Mueve el cursor o dedo de forma lenta y consciente.",
      "Observa los colores y trazos que van apareciendo.",
      "Respira profundo con cada trazo que realizas.",
    ],
  },
  "interaccion-montana": {
    title: "Interaccion Montana",
    emoji: "🏔️",
    description:
      "Interactua con un paisaje de montana generativo. Controla elementos del entorno natural para anclar tu atencion al presente.",
    steps: [
      "Explora la pantalla moviendo el cursor con calma.",
      "Observa como el entorno reacciona a tus movimientos.",
      "No hay objetivo que cumplir, solo explorar.",
      "Respira con naturalidad mientras interactuas.",
    ],
  },
  globos: {
    title: "Globos",
    emoji: "🎈",
    description:
      "Infla y suelta globos con el ritmo de tu respiracion. Una metafora visual para aprender a soltar las preocupaciones.",
    steps: [
      "Manten presionado el boton para inflar el globo (inhala).",
      "Sueltalo para dejarlo volar (exhala y suelta la tension).",
      "Imagina que cada globo lleva una preocupacion lejos de ti.",
      "Repite el proceso cuantas veces necesites.",
    ],
  },
  pensamientos: {
    title: "Registro de Pensamientos",
    emoji: "💭",
    description:
      "Un diario de reestructuracion cognitiva. Escribe un pensamiento negativo y transforma su perspectiva de forma guiada.",
    steps: [
      "Escribe con honestidad el pensamiento que te genera ansiedad.",
      "Lee las preguntas de reflexion con calma y sin juzgarte.",
      "Responde desde la compasion, como si le hablaras a un amigo.",
      "Al finalizar, nota si tu percepcion del pensamiento cambio.",
    ],
  },
  "burbujas-emocionales": {
    title: "Burbujas Emocionales IA",
    emoji: "🫧",
    description:
      "Escribe como te sientes y la Inteligencia Artificial convierte tus emociones en burbujas. Las negativas suben y explotan; las positivas flotan y te acompanan.",
    steps: [
      "Escribe en el campo de texto como te sientes en este momento.",
      'Presiona "Enviar" y espera que la IA analice tu emocion.',
      "Observa la burbuja que aparece: si sube y explota, era una emocion dificil que se va.",
      "Si flota y rebota, es una emocion positiva que te acompana. Puedes tocarla.",
    ],
  },
  "arbol-bienestar": {
    title: "Arbol de Bienestar IA",
    emoji: "🌳",
    description:
      "Comparte tus pensamientos, logros y aprendizajes del dia. La IA los convierte en hojas, flores o frutos que hacen crecer tu arbol personal de bienestar.",
    steps: [
      "Escribe un pensamiento, logro o aprendizaje del dia en el campo de texto.",
      "La IA analizara tu mensaje y anadira una hoja (reflexion), flor (logro) o fruto (meta cumplida).",
      "Observa como tu arbol crece con cada aporte que compartes.",
      "Sigue agregando pensamientos hasta que tu arbol este lleno de vida.",
    ],
  },
  "meditacion-guiada": {
    title: "Meditacion Guiada en Video",
    emoji: "🧘‍♀️",
    description:
      "Una sesion de meditacion guiada en video con instrucciones paso a paso para principiantes y personas con ansiedad.",
    steps: [
      "Busca un lugar tranquilo donde nadie te interrumpa.",
      "Ajusta el volumen a un nivel comodo.",
      "Sientate o recuestate en una posicion que sea sostenible.",
      "Sigue las instrucciones del video sin esforzarte demasiado.",
    ],
  },
};
