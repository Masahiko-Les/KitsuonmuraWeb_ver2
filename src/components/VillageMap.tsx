"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { mapHotspots } from "@/config/mapHotspots";
import { VILLAGE_TIER_VISUALS } from "@/config/villageVisuals";
import type { VillageVitalityTier } from "@/types/database";

function subscribeToHoverCapability(callback: () => void) {
  const mql = window.matchMedia("(hover: none)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getHoverCapabilitySnapshot() {
  return window.matchMedia("(hover: none)").matches;
}

function getHoverCapabilityServerSnapshot() {
  return false;
}

export function VillageMap({ tier }: { tier: VillageVitalityTier }) {
  const visual = VILLAGE_TIER_VISUALS[tier];
  // React's recommended pattern for reading browser-only state (avoids the
  // SSR/hydration mismatch a useState+useEffect version would have).
  const isTouchDevice = useSyncExternalStore(
    subscribeToHoverCapability,
    getHoverCapabilitySnapshot,
    getHoverCapabilityServerSnapshot,
  );
  const [labelsRevealed, setLabelsRevealed] = useState(false);

  function handleMapClick(event: React.MouseEvent<HTMLDivElement>) {
    // Touch devices have no hover, so hotspot labels are otherwise
    // invisible until you happen to land on one. The first tap anywhere
    // on the map just reveals every label instead of navigating; a
    // second tap on a hotspot then follows it as normal.
    if (isTouchDevice && !labelsRevealed) {
      event.preventDefault();
      setLabelsRevealed(true);
    }
  }

  return (
    <div
      onClick={handleMapClick}
      className="relative -mx-4 aspect-square w-auto overflow-hidden border-village-border shadow-xl sm:mx-auto sm:w-full sm:max-w-2xl sm:rounded-2xl sm:border"
    >
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
          className={`group absolute flex items-end justify-center rounded-lg transition-colors ${
            isTouchDevice ? "" : "hover:bg-white/10"
          }`}
        >
          <span
            className={`mb-1 rounded-full bg-village-paper/95 px-2 py-0.5 text-xs whitespace-nowrap text-village-ink shadow transition-opacity ${
              isTouchDevice ? "" : "group-hover:opacity-100"
            } ${labelsRevealed ? "opacity-100" : "opacity-0"}`}
          >
            {spot.facility}
          </span>
        </Link>
      ))}
    </div>
  );
}
