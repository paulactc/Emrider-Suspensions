// Sistema de incentivos para operarios EmRider
// Los niveles se calculan por horas acumuladas en el mes.
// Al cerrar el mes, el nivel queda fijado donde llegó el operario.

export const NIVELES_INCENTIVOS = [
  {
    id: 1,
    nombre: "Pit Lane",
    emoji: "🏍️",
    felicitacion: "¡Arrancamos! Has desbloqueado el primer incentivo del mes.",
    rene:    { min: 88,   max: 98,   incentivo: 150 },
    samuele: { min: 52.8, max: 59,   incentivo: 90  },
  },
  {
    id: 2,
    nombre: "Warm Up",
    emoji: "🏁",
    felicitacion: "¡Motor caliente! El ritmo sube y el incentivo también.",
    rene:    { min: 99,   max: 109,  incentivo: 280 },
    samuele: { min: 60,   max: 65.5, incentivo: 168 },
  },
  {
    id: 3,
    nombre: "Pole Position",
    emoji: "🔥",
    felicitacion: "¡Estás en la parrilla de salida! Nivel de élite alcanzado.",
    rene:    { min: 110,  max: 119,  incentivo: 400 },
    samuele: { min: 65.6, max: 71.4, incentivo: 240 },
  },
  {
    id: 4,
    nombre: "Fast Lap",
    emoji: "💨",
    felicitacion: "¡Vuelta rápida! Estás entre los mejores del mes.",
    rene:    { min: 120,  max: 131,  incentivo: 600 },
    samuele: { min: 71.5, max: 78.6, incentivo: 360 },
  },
  {
    id: 5,
    nombre: "Lap Record",
    emoji: "👑",
    felicitacion: "¡Récord del circuito! Has alcanzado el nivel máximo. Chapeau.",
    rene:    { min: 132,  max: null, incentivo: 900 },
    samuele: { min: 78.7, max: null, incentivo: 540 },
  },
];

/** Detecta si el nombre corresponde a René o Samuele */
export function detectarPerfil(nombre) {
  const n = (nombre || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (n.includes("ren")) return "rene";
  if (n.includes("sam")) return "samuele";
  return null;
}

/**
 * Calcula el incentivo de un operario dado su nombre y horas totales del mes.
 * Devuelve null si el operario no tiene perfil definido.
 */
export function calcularIncentivo(nombre, totalHoras) {
  const perfil = detectarPerfil(nombre);
  if (!perfil) return null;

  // Nivel más alto alcanzado
  let nivelActual = null;
  for (let i = NIVELES_INCENTIVOS.length - 1; i >= 0; i--) {
    const umbral = NIVELES_INCENTIVOS[i][perfil];
    if (totalHoras >= umbral.min) {
      nivelActual = { ...NIVELES_INCENTIVOS[i], umbral };
      break;
    }
  }

  // Nivel siguiente y progreso
  let nivelSiguiente = null;
  let horasHastaProximo = null;
  let progreso = 0;

  if (nivelActual) {
    const next = NIVELES_INCENTIVOS.find((n) => n.id === nivelActual.id + 1);
    if (next) {
      const nextUmbral = next[perfil];
      horasHastaProximo = Math.max(0, nextUmbral.min - totalHoras);
      nivelSiguiente = { ...next, umbral: nextUmbral };
      const rango = nextUmbral.min - nivelActual.umbral.min;
      progreso = Math.min(100, ((totalHoras - nivelActual.umbral.min) / rango) * 100);
    } else {
      progreso = 100;
    }
  } else {
    // Por debajo del nivel 1 — mostrar progreso hacia él
    const primer = NIVELES_INCENTIVOS[0];
    const umbral1 = primer[perfil];
    horasHastaProximo = Math.max(0, umbral1.min - totalHoras);
    nivelSiguiente = { ...primer, umbral: umbral1 };
    progreso = Math.min(100, (totalHoras / umbral1.min) * 100);
  }

  return {
    perfil,
    nivelActual,          // null si no ha llegado al nivel 1
    nivelSiguiente,       // null si está en el nivel máximo
    horasHastaProximo,
    progreso,
    todosLosNiveles: NIVELES_INCENTIVOS.map((n) => ({ ...n, umbral: n[perfil] })),
  };
}
