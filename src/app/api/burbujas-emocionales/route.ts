import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { sentimiento } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API KEY no definida");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: { temperature: 1.4 },
    });

    const prompt = `
Eres un asistente de bienestar emocional empático y creativo. El usuario escribió cómo se siente:
"${sentimiento}"

CLASIFICACIÓN DE SENTIMIENTO (sé muy preciso):
- "negativo": tristeza, ansiedad, estrés, miedo, enojo, frustración, agotamiento, soledad, culpa, preocupación, nerviosismo, llanto, desesperanza, decepción, cualquier emoción difícil o dolorosa.
- "positivo": alegría, gratitud, amor, entusiasmo, calma, paz, esperanza, orgullo, motivación, felicidad, tranquilidad.
- En caso de duda, clasifica como "negativo".

INSTRUCCIONES PARA EL MENSAJE:
- Escribe UNA frase corta (máximo 12 palabras) que valide emocionalmente al usuario.
- Sé CREATIVO y VARIADO: nunca uses frases genéricas como "Tu sentimiento es válido". 
- Adapta el tono: si es tristeza, usa ternura; si es ansiedad, usa calma; si es alegría, usa celebración.
- Escribe siempre en español, en segunda persona ("tú").
- Ejemplos de frases variadas: "La tristeza también necesita su espacio hoy", "Respirar profundo siempre ayuda un poco", "Este momento pasará, lo prometo", "Tu esfuerzo merece ser reconocido hoy".

INSTRUCCIONES PARA EL COLOR:
- Usa colores pastel suaves en hexadecimal.
- Emociones difíciles: tonos azules/morados suaves (#B8D4E8, #C5B3D4, #A8C5DA).
- Emociones positivas: tonos cálidos/verdes suaves (#FFD3B6, #B8E0B8, #FFE5A0, #F9C6D0).

Responde ÚNICAMENTE con JSON válido, sin texto adicional:
{
  "sentimiento": "positivo" o "negativo",
  "color": "#RRGGBB",
  "mensaje": "frase corta aquí"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return Response.json(parsed);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error en burbujas-emocionales:", message);
    return Response.json(
      {
        sentimiento: "positivo",
        color: "#ADD8E6",
        mensaje: "Tu sentimiento es válido y tiene un lugar aquí.",
      }
    );
  }
}
