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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("IA RESPONSE:", text);

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

    } catch (error: any) {
        console.error("🔥 ERROR REAL:", error);
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}