import type { Profile } from "@/types/database";

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <div className="rounded-2xl border border-village-border bg-village-paper p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-village-border bg-white text-2xl">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            "🌾"
          )}
        </div>
        <div>
          <h2 className="font-serif text-xl text-village-ink">
            {profile.village_name}
          </h2>
          {profile.stutter_types.length > 0 ? (
            <p className="text-sm text-village-ink/60">
              {profile.stutter_types.join("・")}
            </p>
          ) : null}
        </div>
      </div>

      {profile.bio ? (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-village-ink/80">
          {profile.bio}
        </p>
      ) : null}

      {profile.difficult_sounds.length > 0 ? (
        <div className="mt-4">
          <p className="mb-1 text-xs text-village-ink/50">言いにくい音</p>
          <div className="flex flex-wrap gap-1">
            {profile.difficult_sounds.map((kana) => (
              <span
                key={kana}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-village-border bg-white text-sm text-village-ink"
              >
                {kana}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
