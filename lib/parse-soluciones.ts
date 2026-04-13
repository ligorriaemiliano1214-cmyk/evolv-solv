export interface SolucionParsed {
  nombre: string;
  complejidad: string;
  costo: string;
  durabilidad: string;
  tiempo: string;
  modernidad: string;
  descripcion: string;
  materiales: string[];
  pasos: string[];
  ventajas: string[];
  desventajas: string[];
  cuando_conviene: string;
}

export function parseSoluciones(text: string): {
  antes: string;
  soluciones: SolucionParsed[];
  despues: string;
} {
  const parts = text.split("===SOLUCION===");
  const antes = parts[0].trim();
  const soluciones: SolucionParsed[] = [];
  let despues = "";

  for (let i = 1; i < parts.length; i++) {
    const [solucionBlock, ...rest] = parts[i].split("===FIN_SOLUCION===");

    if (rest.length > 0 && i === parts.length - 1) {
      despues = rest.join("").trim();
    } else if (rest.length > 0) {
      // Text between solutions - append to antes or ignore
    }

    const lines = solucionBlock.trim().split("\n");
    const sol: SolucionParsed = {
      nombre: "",
      complejidad: "",
      costo: "",
      durabilidad: "",
      tiempo: "",
      modernidad: "",
      descripcion: "",
      materiales: [],
      pasos: [],
      ventajas: [],
      desventajas: [],
      cuando_conviene: "",
    };

    let currentField = "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("NOMBRE:")) {
        sol.nombre = trimmed.replace("NOMBRE:", "").trim();
        currentField = "";
      } else if (trimmed.startsWith("COMPLEJIDAD:")) {
        sol.complejidad = trimmed.replace("COMPLEJIDAD:", "").trim();
        currentField = "";
      } else if (trimmed.startsWith("COSTO:")) {
        sol.costo = trimmed.replace("COSTO:", "").trim();
        currentField = "";
      } else if (trimmed.startsWith("DURABILIDAD:")) {
        sol.durabilidad = trimmed.replace("DURABILIDAD:", "").trim();
        currentField = "";
      } else if (trimmed.startsWith("TIEMPO:")) {
        sol.tiempo = trimmed.replace("TIEMPO:", "").trim();
        currentField = "";
      } else if (trimmed.startsWith("MODERNIDAD:")) {
        sol.modernidad = trimmed.replace("MODERNIDAD:", "").trim();
        currentField = "";
      } else if (trimmed.startsWith("DESCRIPCION:")) {
        sol.descripcion = trimmed.replace("DESCRIPCION:", "").trim();
        currentField = "descripcion";
      } else if (trimmed.startsWith("MATERIALES:")) {
        sol.materiales = trimmed
          .replace("MATERIALES:", "")
          .split("|")
          .map((m) => m.trim())
          .filter(Boolean);
        currentField = "";
      } else if (trimmed.startsWith("PASOS:")) {
        currentField = "pasos";
      } else if (trimmed.startsWith("VENTAJAS:")) {
        sol.ventajas = trimmed
          .replace("VENTAJAS:", "")
          .split("|")
          .map((v) => v.trim())
          .filter(Boolean);
        currentField = "";
      } else if (trimmed.startsWith("DESVENTAJAS:")) {
        sol.desventajas = trimmed
          .replace("DESVENTAJAS:", "")
          .split("|")
          .map((d) => d.trim())
          .filter(Boolean);
        currentField = "";
      } else if (trimmed.startsWith("CUANDO_CONVIENE:")) {
        sol.cuando_conviene = trimmed.replace("CUANDO_CONVIENE:", "").trim();
        currentField = "";
      } else if (currentField === "pasos" && /^\d+\./.test(trimmed)) {
        sol.pasos.push(trimmed.replace(/^\d+\.\s*/, ""));
      } else if (currentField === "descripcion" && trimmed) {
        sol.descripcion += " " + trimmed;
      }
    }

    if (sol.nombre) {
      soluciones.push(sol);
    }
  }

  return { antes, soluciones, despues };
}

export function hasSoluciones(text: string): boolean {
  return text.includes("===SOLUCION===") && text.includes("===FIN_SOLUCION===");
}
