// src/app/api/analizar/route.ts

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("BODY:", body);

        const { pensamiento, situacion } = body;

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            throw new Error("OPENROUTER_API_KEY no definida");
        }

        const prompt = `
Pensamiento: ${pensamiento}
Situación: ${situacion}

Responde en JSON (SOLO el JSON, sin texto adicional):
{
  "distorsion": "describe la distorsión cognitiva identificada",
  "sugerencia": "sugerencia constructiva para manejar la situación"
}
`;

        const modelosDisponibles = [
            process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001",
            "openai/gpt-4o-mini",
            "qwen/qwen-2.5-72b-instruct",
            "meta-llama/llama-3.1-8b-instruct",
        ];

        let text: string | null = null;
        let lastErr: unknown = null;

        // Intentar con cada modelo
        for (const modelo of modelosDisponibles) {
            console.log(`🔄 Probando modelo: ${modelo}`);
            
            // 2 intentos por modelo
            for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${apiKey}`,
                            "Content-Type": "application/json",
                            "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
                            "X-Title": "Bienestar ESPE",
                        },
                        body: JSON.stringify({
                            model: modelo,
                            messages: [
                                {
                                    role: "system",
                                    content: "Eres un psicólogo experto en identificar distorsiones cognitivas. Responde SIEMPRE en formato JSON válido sin texto adicional."
                                },
                                {
                                    role: "user",
                                    content: prompt
                                }
                            ],
                            max_tokens: 300,
                            temperature: 0.7
                        })
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        let errorMsg = "Error desconocido";
                        try {
                            const errorData = JSON.parse(errorText);
                            errorMsg = errorData.error?.message || errorText;
                        } catch {
                            errorMsg = errorText;
                        }
                        console.log(`❌ ${modelo} falló: ${errorMsg}`);

                        if (response.status === 429) {
                            const waitTime = 3000 * attempt;
                            console.log(`⏳ Esperando ${waitTime/1000}s...`);
                            await new Promise(r => setTimeout(r, waitTime));
                            continue;
                        }
                        continue;
                    }

                    const data = await response.json();
                    text = data.choices?.[0]?.message?.content ?? null;
                    if (text) {
                        console.log(`✅ ¡${modelo} funcionó!`);
                    } else {
                        console.log(`⚠️ ${modelo} respondió sin contenido.`);
                    }
                    break;

                } catch (err) {
                    console.log(`⚠️ Error con ${modelo}:`, err);
                    continue;
                }
            }

            if (text) break;
        }

        if (!text) {
            console.error("❌ Todos los modelos fallaron");
            // Usar Hugging Face como respaldo
            try {
                console.log("🔄 Intentando con Hugging Face como respaldo...");
                text = await usarHuggingFace(prompt, process.env.HUGGINGFACE_API_KEY);
            } catch (e) {
                console.error("❌ Hugging Face también falló");
            }
        }

        if (!text) {
            return Response.json({
                distorsion: "No se pudo obtener un análisis automático en este momento.",
                sugerencia: "El servicio de IA está temporalmente ocupado. Intenta describir tu pensamiento con más detalle o reintenta en unos minutos.",
            });
        }

        let parsed;
        try {
            const clean = text.replace(/```json|```/g, "").trim();
            parsed = JSON.parse(clean);
        } catch (e) {
            console.error("Error parseando JSON:", e);
            parsed = {
                distorsion: "Error al interpretar la respuesta",
                sugerencia: text,
            };
        }

        return Response.json(parsed);

    } catch (error: unknown) {
        console.error("🔥 ERROR REAL:", error);
        return Response.json(
            { error: error instanceof Error ? error.message : "Error desconocido" },
            { status: 500 }
        );
    }
}

// Función de respaldo con Hugging Face
async function usarHuggingFace(prompt: string, apiKey?: string): Promise<string> {
    if (!apiKey) throw new Error("HUGGINGFACE_API_KEY no definida");
    
    const response = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
        {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 300,
                    temperature: 0.7
                }
            })
        }
    );
    
    if (!response.ok) throw new Error("Hugging Face error");
    const data = await response.json();
    return data[0]?.generated_text || "";
}