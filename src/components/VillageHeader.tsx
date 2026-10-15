import Link from "next/link";

function VineOrnament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 60"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 2c10 10 -4 20 6 30s-4 20 6 26" />
      <path d="M8 14c4-2 8 0 9 3" />
      <path d="M11 28c4-2 8 0 9 3" />
      <path d="M13 42c4-2 8 0 9 3" />
    </svg>
  );
}

export function VillageHeader({ nickname }: { nickname: string }) {
  return (
    <div className="relative bg-village-parchment px-4 pt-5 pb-8 sm:rounded-t-2xl">
      <VineOrnament className="absolute left-3 top-1/2 h-12 w-6 -translate-y-1/2 text-village-leaf/70" />
      <VineOrnament className="absolute right-3 top-1/2 h-12 w-6 -translate-y-1/2 scale-x-[-1] text-village-leaf/70" />

      <Link
        href="/my-house"
        className="absolute right-3 top-3 flex items-center gap-2"
      >
        <span className="font-serif text-sm text-village-ink">
          {nickname} さん
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-village-gold bg-village-gold/20">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 text-village-ink/70"
          >
            <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-9 2.2-9 5v2h18v-2c0-2.8-4.6-5-9-5Z" />
          </svg>
        </span>
      </Link>

      <div className="flex flex-col items-center gap-1 pt-2">
        <svg
          viewBox="0 0 64 24"
          fill="currentColor"
          aria-hidden="true"
          className="h-6 w-16 text-village-ink/70"
        >
          <path d="M2 24V14l8-7 6 5V8l8-6 8 6v4l6-5 8 7v10H2Z" />
        </svg>
        <h1 className="font-serif text-3xl text-village-ink sm:text-4xl">
          吃音村
        </h1>
      </div>

      <svg
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-6 w-full sm:h-8"
      >
        <path d="M0,0 Q50,10 100,0 L100,10 L0,10 Z" fill="var(--village-parchment)" />
      </svg>
    </div>
  );
}
