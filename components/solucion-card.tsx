"use client";

import {
  DollarSign,
  Clock,
  Wrench,
  Shield,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Hammer,
  Cog,
  Lightbulb,
  Zap,
  Sparkles,
  CloudSun,
  Scale,
  Link2,
  Users,
  Banknote,
} from "lucide-react";
import { useState } from "react";
import { SolucionParsed } from "@/lib/parse-soluciones";

const COMPLEJIDAD_STYLE: Record<string, string> = {
  Baja: "bg-green-100 text-green-700",
  Media: "bg-yellow-100 text-yellow-700",
  Alta: "bg-red-100 text-red-700",
};

const COSTO_STYLE: Record<string, string> = {
  Economico: "bg-green-100 text-green-700",
  Moderado: "bg-yellow-100 text-yellow-700",
  Costoso: "bg-red-100 text-red-700",
};

const DURABILIDAD_STYLE: Record<string, string> = {
  "Corto plazo": "bg-orange-100 text-orange-700",
  "Mediano plazo": "bg-blue-100 text-blue-700",
  "Largo plazo": "bg-emerald-100 text-emerald-700",
};

const MODERNIDAD_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Tradicional: Hammer,
  Convencional: Cog,
  Moderno: Lightbulb,
  Innovador: Zap,
};

const MODERNIDAD_STYLE: Record<string, string> = {
  Tradicional: "bg-stone-100 text-stone-700",
  Convencional: "bg-zinc-100 text-zinc-700",
  Moderno: "bg-violet-100 text-violet-700",
  Innovador: "bg-fuchsia-100 text-fuchsia-700",
};

interface SolucionCardProps {
  solucion: SolucionParsed;
  index: number;
}

export function SolucionCard({ solucion, index }: SolucionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = MODERNIDAD_ICON[solucion.modernidad] || Cog;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-xs">
              {index + 1}
            </span>
            <h4 className="font-bold text-zinc-900 text-sm">
              {solucion.nombre}
            </h4>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${MODERNIDAD_STYLE[solucion.modernidad] || "bg-zinc-100 text-zinc-600"}`}
          >
            <Icon className="w-3 h-3" />
            {solucion.modernidad}
          </div>
        </div>

        <p className="text-zinc-600 text-sm mb-3">{solucion.descripcion}</p>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${COMPLEJIDAD_STYLE[solucion.complejidad] || "bg-zinc-100 text-zinc-600"}`}>
            <Wrench className="w-3 h-3" />
            {solucion.complejidad}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${COSTO_STYLE[solucion.costo] || "bg-zinc-100 text-zinc-600"}`}>
            <DollarSign className="w-3 h-3" />
            {solucion.costo}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${DURABILIDAD_STYLE[solucion.durabilidad] || "bg-zinc-100 text-zinc-600"}`}>
            <Shield className="w-3 h-3" />
            {solucion.durabilidad}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-100 text-sky-700">
            <Clock className="w-3 h-3" />
            {solucion.tiempo}
          </span>
        </div>

        {/* Precio por m² */}
        {solucion.costo_m2 && (
          <div className="flex items-center gap-2 mb-3 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
            <Banknote className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="text-xs font-medium text-emerald-800">{solucion.costo_m2}</span>
          </div>
        )}

        {/* Mano de obra */}
        {solucion.mano_de_obra && (
          <div className="flex items-start gap-2 mb-3 px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg">
            <Users className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-indigo-800">{solucion.mano_de_obra}</span>
          </div>
        )}

        {solucion.cuando_conviene && (
          <div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800">{solucion.cuando_conviene}</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 py-2 bg-zinc-50 hover:bg-zinc-100 transition-colors text-xs font-medium text-zinc-500 border-t border-zinc-100"
      >
        {expanded ? (
          <>Ocultar detalles <ChevronUp className="w-3.5 h-3.5" /></>
        ) : (
          <>Ver detalles <ChevronDown className="w-3.5 h-3.5" /></>
        )}
      </button>

      {expanded && (
        <div className="p-4 border-t border-zinc-100 space-y-4">
          {/* Materiales */}
          {solucion.materiales.length > 0 && (
            <div>
              <h5 className="font-semibold text-zinc-900 text-xs mb-1.5">Materiales y productos</h5>
              <div className="flex flex-wrap gap-1.5">
                {solucion.materiales.map((mat, i) => (
                  <span key={i} className="px-2 py-0.5 bg-zinc-100 text-zinc-700 text-xs rounded-md">
                    {mat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pasos */}
          {solucion.pasos.length > 0 && (
            <div>
              <h5 className="font-semibold text-zinc-900 text-xs mb-1.5">Pasos de ejecución</h5>
              <ol className="space-y-1.5">
                {solucion.pasos.map((paso, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-semibold">
                      {i + 1}
                    </span>
                    <span className="text-zinc-600 pt-0.5">{paso}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Ventajas / Desventajas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {solucion.ventajas.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-semibold text-green-800 text-xs mb-1.5">Ventajas</h5>
                <ul className="space-y-1">
                  {solucion.ventajas.map((v, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-green-700">
                      <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      {v}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {solucion.desventajas.length > 0 && (
              <div className="p-3 bg-red-50 rounded-lg">
                <h5 className="font-semibold text-red-800 text-xs mb-1.5">Desventajas</h5>
                <ul className="space-y-1">
                  {solucion.desventajas.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-red-700">
                      <X className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Info cards: clima, normativa, compatibilidad */}
          <div className="grid grid-cols-1 gap-2">
            {solucion.clima && (
              <div className="flex items-start gap-2 p-2.5 bg-sky-50 border border-sky-100 rounded-lg">
                <CloudSun className="w-3.5 h-3.5 text-sky-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[11px] font-semibold text-sky-800">Clima y estacionalidad</span>
                  <p className="text-xs text-sky-700">{solucion.clima}</p>
                </div>
              </div>
            )}
            {solucion.normativa && (
              <div className="flex items-start gap-2 p-2.5 bg-purple-50 border border-purple-100 rounded-lg">
                <Scale className="w-3.5 h-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[11px] font-semibold text-purple-800">Normativa</span>
                  <p className="text-xs text-purple-700">{solucion.normativa}</p>
                </div>
              </div>
            )}
            {solucion.compatibilidad && (
              <div className="flex items-start gap-2 p-2.5 bg-teal-50 border border-teal-100 rounded-lg">
                <Link2 className="w-3.5 h-3.5 text-teal-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[11px] font-semibold text-teal-800">Compatibilidad</span>
                  <p className="text-xs text-teal-700">{solucion.compatibilidad}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
