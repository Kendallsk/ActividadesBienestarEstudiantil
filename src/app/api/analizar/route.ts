import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("BODY:", body);

        const { pensamiento, situacion } = body;

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error("API KEY no definida");
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
        });

        const prompt = `
Pensamiento: ${pensamiento}
Situación: ${situacion}

Responde en JSON:
{
  "distorsion": "",
  "sugerencia": ""
}
`;

        // Intentos con backoff en el servidor (mejor lugar para controlar reintentos)
        const maxAttempts = 3;
        let attempt = 0;
        let lastErr: unknown = null;
        let text: string | null = null;

        while (attempt < maxAttempts) {
            attempt += 1;
            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                text = response.text();
                console.log(`IA RESPONSE (attempt ${attempt}):`, text);
                lastErr = null;
                break;
            } catch (err) {
                lastErr = err;
                console.warn(`[analizar] intento ${attempt} fallo:`, err);
                // Backoff exponencial antes del siguiente intento
                if (attempt < maxAttempts) {
                    const waitMs = 500 * Math.pow(2, attempt - 1); // 500, 1000, 2000
                    await new Promise((r) => setTimeout(r, waitMs));
                }
            }
        }

        if (!text) {
            // Si no se obtuvo respuesta de la IA, devolver un fallback útil al cliente
            console.error("IA no disponible tras reintentos:", lastErr);
            const fallback = {
                distorsion: "No se pudo obtener un análisis automático en este momento.",
                sugerencia:
                    "El servicio de IA está temporalmente ocupado. Intenta describir tu pensamiento con más detalle o reintenta en unos minutos.",
            };
            return Response.json(fallback);
        }

        let parsed;
        try {
            const clean = text.replace(/```json|```/g, "").trim();
            parsed = JSON.parse(clean);
        } catch (e) {
            console.error("Error parseando JSON:", e);
            parsed = {
                distorsion: "Error al interpretar",
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
