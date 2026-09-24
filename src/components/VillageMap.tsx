import Image from "next/image";
import Link from "next/link";
import { mapHotspots } from "@/config/mapHotspots";
import { VILLAGE_TIER_VISUALS } from "@/config/villageVisuals";
import type { VillageVitalityTier } from "@/types/database";

export function VillageMap({ tier }: { tier: VillageVitalityTier }) {
  const visual = VILLAGE_TIER_VISUALS[tier];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-2xl overflow-hidden rounded-2xl border border-village-border shadow-xl">
      <Image
        src={visual.image}
        alt="村の地図"
        fill
        priority
        sizes="(min-width: 768px) 42rem, 100vw"
        className={`object-cover transition-[filter] duration-700 ${visual.imageClassName}`}
      />
      {visual.overlayClassName ? (
        <div
          className={`pointer-events-none absolute inset-0 ${visual.overlayClassName}`}
        />
      ) : null}

      {mapHotspots.map((spot) => (
        <Link
          key={spot.id}
          href={spot.route}
          aria-label={spot.facility}
          style={{
            left: `${spot.x}%`,
            top: `${spot.y}%`,
            width: `${spot.width}%`,
            height: `${spot.height}%`,
          }}
          className="group absolute flex items-end justify-center rounded-lg transition-colors hover:bg-white/10"
        >
          <span className="mb-1 rounded-full bg-village-paper/95 px-2 py-0.5 text-xs whitespace-nowrap text-village-ink opacity-0 shadow transition-opacity group-hover:opacity-100">
            {spot.facility}
          </span>
        </Link>
      ))}
    </div>
  );
}
