"use client";

import {
  X,
  Banknote,
  Tags,
  Users,
  CloudSun,
  Scale,
  Link2,
  MessageSquareWarning,
  FileText,
  FolderOpen,
  Columns2,
  Sparkles,
  HardHat,
} from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Soluciones múltiples",
    desc: "Cada consulta genera entre 4 y 6 soluciones diferentes, desde las más económicas hasta las premium, de lo tradicional a lo innovador.",
    color: "text-amber-500 bg-amber-50",
  },
  {
    icon: Banknote,
    title: "Precios por m² en ARS",
    desc: "Cada solución incluye un rango de precio estimado por metro cuadrado en pesos argentinos, útil para presupuestar rápido.",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: Tags,
    title: "Marcas y productos reales",
    desc: "Te recomienda productos específicos del mercado argentino: Sika, Weber, Klaukol, Megaflex, Sherwin Williams, Plavicon, etc.",
    color: "text-violet-600 bg-violet-50",
  },
  {
    icon: Users,
    title: "Mano de obra detallada",
    desc: "Cuántos oficiales y ayudantes necesitás, horas-hombre estimadas, y si requiere un especialista certificado.",
    color: "text-indigo-600 bg-indigo-50",
  },
  {
    icon: CloudSun,
    title: "Clima y estacionalidad",
    desc: "Restricciones de temperatura, humedad, lluvia y la mejor época del año para cada solución.",
    color: "text-sky-600 bg-sky-50",
  },
  {
    icon: Scale,
    title: "Normativa aplicable",
    desc: "Normas IRAM, código de edificación, habilitaciones necesarias y si requiere intervención de profesional matriculado.",
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: Link2,
    title: "Compatibilidad entre soluciones",
    desc: "Te indica si podés combinar soluciones entre sí como refuerzo, o si son mutuamente excluyentes.",
    color: "text-teal-600 bg-teal-50",
  },
  {
    icon: Columns2,
    title: "Comparador lado a lado",
    desc: "Pedile al chat que te compare 2 o 3 opciones específicas y te arma una comparativa detallada.",
    how: "Escribí: \"Compará la opción 1 y la 3 lado a lado\"",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: MessageSquareWarning,
    title: "Segunda opinión",
    desc: "Botón en el header que le pide al agente que critique sus propias soluciones con honestidad: riesgos ocultos, errores comunes y cuál elegiría para su propia casa.",
    how: "Usá el botón \"Segunda opinión\" en el header",
    color: "text-orange-600 bg-orange-50",
  },
  {
    icon: FileText,
    title: "Exportar reporte PDF",
    desc: "Genera un PDF profesional con tabla comparativa y detalle de cada solución, listo para presentar al cliente.",
    how: "Usá el botón \"Exportar PDF\" en el header",
    color: "text-zinc-600 bg-zinc-100",
  },
  {
    icon: FolderOpen,
    title: "Chats guardados por categoría",
    desc: "Cada investigación se guarda organizada por categoría (Impermeabilización, Pisos, Estructura, etc.) para que no pierdas nada.",
    how: "Usá el sidebar izquierdo para navegar tus chats",
    color: "text-rose-600 bg-rose-50",
  },
];

interface HelpPanelProps {
  open: boolean;
  onClose: () => void;
}

export function HelpPanel({ open, onClose }: HelpPanelProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-amber-500 rounded-lg">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Qué puede hacer EVOLV Solv
              </h2>
              <p className="text-[11px] text-zinc-400">
                Todas las herramientas disponibles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <p className="text-xs text-zinc-500 mb-4">
            Describí cualquier problema constructivo y el agente te va a
            responder con toda esta información integrada en cada solución:
          </p>

          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="border border-zinc-100 rounded-xl p-4 hover:border-zinc-200 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${f.color}`}>
                  <f.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-900">
                    {f.title}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{f.desc}</p>
                  {f.how && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded-md mt-2 inline-block">
                      {f.how}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="border-t border-zinc-100 pt-4 mt-4">
            <h3 className="text-xs font-semibold text-zinc-900 mb-2">
              Tips para mejores resultados
            </h3>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">1.</span>
                <span>
                  Sé específico con el problema: &quot;filtraciones en terraza de
                  losa de hormigón de 40m²&quot; es mejor que &quot;terraza con
                  humedad&quot;.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">2.</span>
                <span>
                  Podés pedir que profundice: &quot;Dame más detalle de la opción
                  2, especialmente los pasos y materiales&quot;.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">3.</span>
                <span>
                  Usá &quot;Segunda opinión&quot; después de la primera respuesta
                  para encontrar riesgos que no viste.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">4.</span>
                <span>
                  Exportá a PDF antes de ir a la obra o al cliente para tener
                  todo documentado.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
