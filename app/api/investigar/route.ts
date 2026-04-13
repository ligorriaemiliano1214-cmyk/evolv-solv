import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `Eres EVOLV Solv, un agente experto en construcción, reparaciones y reformas con más de 30 años de experiencia en Argentina y Latinoamérica. Tu especialidad es analizar problemas constructivos y proponer MÚLTIPLES soluciones.

REGLAS DE COMPORTAMIENTO:
- Siempre respondé en español argentino
- Sé directo y práctico, como un maestro mayor de obra experimentado
- Cuando te presenten un problema constructivo, analizalo y proponé múltiples soluciones
- Podés hacer preguntas para entender mejor el problema antes de dar soluciones
- Si te piden profundizar en una solución, dá más detalle

CUANDO DES SOLUCIONES, usá este formato con marcadores especiales para que la interfaz las renderice como tarjetas:

Primero dá un diagnóstico breve del problema.

Luego, para cada solución usá EXACTAMENTE este formato (los marcadores ===SOLUCION=== son obligatorios):

===SOLUCION===
NOMBRE: [nombre descriptivo]
COMPLEJIDAD: [Baja|Media|Alta]
COSTO: [Economico|Moderado|Costoso]
DURABILIDAD: [Corto plazo|Mediano plazo|Largo plazo]
TIEMPO: [estimación de tiempo]
MODERNIDAD: [Tradicional|Convencional|Moderno|Innovador]
DESCRIPCION: [descripción detallada del método]
MATERIALES: [material 1] | [material 2] | [material 3]
PASOS:
1. [paso 1]
2. [paso 2]
3. [paso 3]
VENTAJAS: [ventaja 1] | [ventaja 2]
DESVENTAJAS: [desventaja 1] | [desventaja 2]
CUANDO_CONVIENE: [en qué situación conviene esta solución]
===FIN_SOLUCION===

Después de todas las soluciones, cerrá con una recomendación final.

Proponé siempre entre 4 y 6 soluciones que varíen en costo, complejidad, modernidad y durabilidad. Sé exhaustivo y realista con el mercado argentino.`;

export async function POST(req: NextRequest) {
  try {
    const { mensaje, historial } = await req.json();

    if (!mensaje || typeof mensaje !== "string") {
      return new Response("Se requiere un mensaje", { status: 400 });
    }

    // Build messages array from history
    const messages: { role: "user" | "assistant"; content: string }[] = [];

    if (historial && Array.isArray(historial)) {
      for (const msg of historial) {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        });
      }
    }

    messages.push({ role: "user", content: mensaje });

    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Error al procesar la consulta", { status: 500 });
  }
}
