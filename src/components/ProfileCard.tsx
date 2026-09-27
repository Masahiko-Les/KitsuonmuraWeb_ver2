import type { Profile } from "@/types/database";

function LabeledText({ label, text }: { label: string; text: string }) {
  return (
    <div className="mt-4">
      <p className="mb-1 text-xs text-village-ink/50">{label}</p>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-village-ink/80">
        {text}
      </p>
    </div>
  );
}

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <div className="rounded-2xl border border-village-border bg-village-paper p-6 shadow-sm">
      <h2 className="font-serif text-xl text-village-ink">{profile.nickname}</h2>
      {profile.stutter_types.length > 0 ? (
        <p className="text-sm text-village-ink/60">
          {profile.stutter_types.join("・")}
        </p>
      ) : null}

      {profile.bio ? <LabeledText label="自己紹介" text={profile.bio} /> : null}

      {profile.favorite_things ? (
        <LabeledText
          label="好きなこと・大切にしていること"
          text={profile.favorite_things}
        />
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

      {profile.difficult_situations ? (
        <LabeledText
          label="吃音が出やすい場面"
          text={profile.difficult_situations}
        />
      ) : null}

      {profile.easy_situations ? (
        <LabeledText label="吃音が出にくい場面" text={profile.easy_situations} />
      ) : null}

      {profile.first_noticed_stutter ? (
        <LabeledText
          label="初めて吃音に気づいた時のこと"
          text={profile.first_noticed_stutter}
        />
      ) : null}
    </div>
  );
}
