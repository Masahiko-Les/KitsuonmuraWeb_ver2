import Link from "next/link";

export function VillageHeader({ nickname }: { nickname?: string }) {
  return (
    <div className="village-header-texture relative px-4 pt-4 pb-6 sm:rounded-t-2xl">
      {nickname ? (
        <Link
          href="/my-house"
          className="absolute right-3 top-3 flex items-center gap-1.5 sm:right-4"
        >
          <span className="font-serif text-xs text-village-ink/70 sm:text-sm">
            {nickname} さん
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-village-gold/70 bg-village-parchment/50">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4 text-village-ink/60"
            >
              <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-9 2.2-9 5v2h18v-2c0-2.8-4.6-5-9-5Z" />
            </svg>
          </span>
        </Link>
      ) : (
        <Link
          href="/signup"
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-village-gold/70 bg-village-parchment/50 px-3 py-1.5 sm:right-4"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4 text-village-ink/60"
          >
            <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-9 2.2-9 5v2h18v-2c0-2.8-4.6-5-9-5Z" />
          </svg>
          <span className="font-serif text-xs text-village-ink/70 sm:text-sm">
            新規登録
          </span>
        </Link>
      )}

      <div className="flex flex-col items-center gap-1.5">
        <svg
          viewBox="0 0 80 24"
          fill="none"
          aria-hidden="true"
          className="h-5 w-16 text-village-ink/50"
        >
          <path
            d="M2 22 14 8l8 8 6-10 10 14"
            stroke="currentColor"
            strokeWidth={1.3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M36 22V13l8-6 6 4V9l8-5 8 5v3l6-4 8 6v9H36Z"
            fill="currentColor"
            opacity={0.85}
          />
        </svg>

        <h1 className="font-serif text-3xl tracking-wide text-village-ink sm:text-4xl">
          吃音村
        </h1>

        <div className="flex items-center gap-2 text-village-gold/70">
          <span className="h-px w-7 bg-current" />
          <span className="h-1 w-1 rotate-45 bg-current" />
          <span className="h-px w-7 bg-current" />
        </div>
      </div>

      <svg
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-4 w-full sm:h-6"
      >
        <path
          d="M0,0 Q50,10 100,0 L100,10 L0,10 Z"
          fill="var(--village-parchment)"
        />
        <path
          d="M0,0 Q50,10 100,0"
          fill="none"
          stroke="var(--village-gold)"
          strokeWidth={0.6}
          opacity={0.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
