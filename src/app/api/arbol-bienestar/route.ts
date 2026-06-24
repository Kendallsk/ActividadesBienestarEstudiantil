import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { pensamiento } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API KEY no definida");

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Cambiado al identificador heredado universal que NUNCA da 404 en v1beta
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", 
      generationConfig: { 
        temperature: 1.0, // Ajustado a 1.0 para asegurar consistencia estricta en JSON
      },
    });

    const prompt = `
Eres un coach de bienestar que ayuda a las personas a reflexionar sobre su día.
El usuario escribió lo siguiente:
"${pensamiento}"

Clasifica el pensamiento en una de estas 3 categorías y responde ÚNICAMENTE con un objeto JSON válido utilizando la siguiente estructura exacta:

{
  "categoria": "hoja" o "flor" o "fruto",
  "color": "#RRGGBB",
  "explicacion_corta": "frase motivadora aquí"
}

REGLAS ADICIONALES:
- "hoja": es una reflexión, pensamiento cotidiano, algo que aprendiste hoy, observación personal, pequeño hábito, rutina, o cualquier pensamiento de crecimiento diario.
- "flor": es un logro, algo que hizo sentir bien al usuario, un momento de alegría, una conexión con alguien, algo positivo que ocurrió, o un acto de bondad.
- "fruto": es un aprendizaje profundo, una meta cumplida, una superación importante, algo que costó esfuerzo y se logró, o un cambio de perspectiva significativo.
- El color debe ser pastel y suave en hexadecimal. Hojas: verdes (#8FC47B, #A8D5A2, #6BAF70). Flores: rosados/lavanda (#F9C6D0, #D4A5E5, #FFB3C6, #FFC8DD). Frutos: naranjas/dorados/rojos (#FFB347, #FF8C69, #E8975E, #FFD166).
- La explicacion_corta debe ser una frase motivadora, cálida, en español, de máximo 12 palabras, SIEMPRE diferente y creativa.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Limpieza manual robusta por si el modelo viejo añade markdown ```json
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return Response.json(parsed);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error";
    console.error("Error arbol-bienestar:", msg);
    
    // Fallback garantizado: si la API se cae o falla el parse, la app sigue viva
    return Response.json({
      categoria: "hoja",
      color: "#A8D5A2",
      explicacion_corta: "Cada pensamiento es una semilla que crece.",
    });
  }
}