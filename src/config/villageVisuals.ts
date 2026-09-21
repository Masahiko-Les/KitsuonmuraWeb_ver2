import type { VillageVitalityTier } from "@/types/database";

// Purely presentational: maps the village's hidden vitality tier to a look
// for the single village-map.png image. When dedicated artwork exists for
// each tier later, swap `image` in here instead of touching page code.
export interface VillageTierVisual {
  image: string;
  imageClassName: string;
  overlayClassName?: string;
}

export const VILLAGE_TIER_VISUALS: Record<VillageVitalityTier, VillageTierVisual> = {
  1: {
    image: "/village-map.png",
    imageClassName: "saturate-110 brightness-105",
  },
  2: {
    image: "/village-map.png",
    imageClassName: "saturate-90 brightness-100",
  },
  3: {
    image: "/village-map.png",
    imageClassName: "saturate-60 brightness-90 contrast-95",
    overlayClassName: "bg-slate-500/10",
  },
  4: {
    image: "/village-map.png",
    imageClassName: "saturate-25 brightness-75 contrast-90 sepia-[0.15]",
    overlayClassName: "bg-slate-700/25",
  },
};
