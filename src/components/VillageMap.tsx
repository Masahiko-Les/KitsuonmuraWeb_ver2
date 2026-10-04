"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { mapHotspots } from "@/config/mapHotspots";
import { VILLAGE_TIER_VISUALS } from "@/config/villageVisuals";
import type { VillageVitalityTier } from "@/types/database";

// `(hover: none)` is unreliable for this on real iOS Safari (it has a long
// history of inconsistently reporting hover capability on touchscreens,
// unlike Chromium's touch emulation used in earlier testing here), which
// let the first tap fall through to navigation instead of just revealing
// labels. `(pointer: coarse)` — "the primary pointer is imprecise" — is the
// media feature actually meant for this touch-vs-mouse distinction and is
// consistently supported across iOS Safari and Chromium alike.
function subscribeToHoverCapability(callback: () => void) {
  const mql = window.matchMedia("(pointer: coarse)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getHoverCapabilitySnapshot() {
  return window.matchMedia("(pointer: coarse)").matches;
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

  // Touch devices have no hover, so hotspot labels are otherwise invisible
  // until you happen to land on one. The first tap anywhere on the map —
  // including empty areas with no hotspot — just reveals every label
  // instead of navigating; a second tap on a hotspot then follows it as
  // normal. Needs both handlers below: the wrapper one covers taps that
  // land outside any hotspot, but a hotspot tap also needs its own
  // handler because relying solely on the delegated wrapper handler's
  // preventDefault() wasn't reliably stopping that same tap's default
  // navigation on real iOS Safari.
  function handleMapClick(event: React.MouseEvent<HTMLDivElement>) {
    if (isTouchDevice && !labelsRevealed) {
      event.preventDefault();
      setLabelsRevealed(true);
    }
  }

  function handleHotspotClick(event: React.MouseEvent<HTMLAnchorElement>) {
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
          onClick={handleHotspotClick}
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
