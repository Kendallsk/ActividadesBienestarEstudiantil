// src/app/api/arbol-bienestar/route.ts

export async function POST(req: Request) {
    try {
        const { pensamiento } = await req.json();
        console.log("📝 Pensamiento recibido:", pensamiento);

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error("❌ OPENROUTER_API_KEY no definida");
            return Response.json(fallbackResponse);
        }

        // === PROMPT ===
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

REGLAS:
- "hoja": reflexión, pensamiento cotidiano, algo que aprendiste, observación personal, hábito, rutina.
- "flor": logro, algo que hizo sentir bien, momento de alegría, conexión, algo positivo.
- "fruto": aprendizaje profundo, meta cumplida, superación importante, cambio de perspectiva.
- Colores pastel: Hojas (#8FC47B, #A8D5A2, #6BAF70), Flores (#F9C6D0, #D4A5E5, #FFB3C6), Frutos (#FFB347, #FF8C69, #E8975E).
- Explicacion_corta: frase motivadora en español, máximo 12 palabras.

RESPONDE SOLO CON EL JSON, sin texto adicional.
`;

        console.log("🔄 Enviando petición a OpenRouter...");

        // === MODELOS QUE SÍ FUNCIONAN (actualizado) ===
        const modelos = [
            // Modelos gratuitos QUE SÍ EXISTEN
            "google/gemini-flash-1.5:free",      // Gratuito
            "google/gemini-pro:free",            // Gratuito
            "microsoft/phi-3-mini-128k-instruct:free", // Gratuito
            "qwen/qwen-2.5-72b-instruct:free",   // Gratuito (a veces)
            
            // Modelos de pago (muy económicos) - FALLBACK
            "openai/gpt-4o-mini",                // ~$0.15 por 1M tokens
            "anthropic/claude-3-haiku",          // ~$0.25 por 1M tokens
            "meta-llama/llama-3.2-3b-instruct",  // Muy barato
        ];

        let respuesta = null;
        let modeloUsado = null;

        for (const modelo of modelos) {
            try {
                console.log(`🔄 Probando modelo: ${modelo}`);
                
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://tuaplicacion.com",
                        "X-Title": "Árbol de Bienestar"
                    },
                    body: JSON.stringify({
                        model: modelo,
                        messages: [
                            {
                                role: "system",
                                content: "Eres un coach de bienestar experto en análisis emocional. Responde SIEMPRE en formato JSON válido."
                            },
                            {
                                role: "user",
                                content: prompt
                            }
                        ],
                        max_tokens: 200,
                        temperature: 0.3
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    respuesta = data.choices[0].message.content;
                    modeloUsado = modelo;
                    console.log(`✅ ¡Funcionó con ${modelo}!`);
                    console.log("📄 Respuesta:", respuesta);
                    break;
                } else {
                    const errorData = await response.json();
                    const errorMsg = errorData.error?.message || "Error desconocido";
                    console.log(`❌ ${modelo} falló: ${errorMsg}`);
                    
                    // Si es 429 (rate limit), esperar
                    if (response.status === 429) {
                        const waitTime = 3000;
                        console.log(`⏳ Esperando ${waitTime/1000}s...`);
                        await new Promise(r => setTimeout(r, waitTime));
                        continue;
                    }
                }
            } catch (error) {
                console.log(`⚠️ Error con ${modelo}:`, error);
                continue;
            }
        }

        // === SI NINGUNO FUNCIONÓ ===
        if (!respuesta) {
            console.error("❌ Todos los modelos fallaron");
            return Response.json(fallbackResponse);
        }

        // === PARSEAR JSON ===
        try {
            const clean = respuesta.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
            const parsed = JSON.parse(clean);
            
            // Validar estructura
            if (!parsed.categoria || !parsed.color || !parsed.explicacion_corta) {
                throw new Error("Estructura JSON inválida");
            }
            
            console.log("✅ JSON parseado correctamente:", parsed);
            return Response.json(parsed);
            
        } catch (error) {
            console.error("❌ Error parseando JSON:", error);
            console.log("📄 Respuesta cruda:", respuesta);
            return Response.json(fallbackResponse);
        }

    } catch (error: unknown) {
        console.error("🔥 ERROR REAL:", error);
        return Response.json(fallbackResponse);
    }
}

const fallbackResponse = {
    categoria: "hoja",
    color: "#A8D5A2",
    explicacion_corta: "Cada pensamiento es una semilla que crece.",
};