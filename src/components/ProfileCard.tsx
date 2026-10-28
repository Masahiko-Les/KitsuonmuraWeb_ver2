import { DIFFICULT_SOUND_ROWS, type Profile } from "@/types/database";

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
          <div className="flex flex-col gap-1.5 rounded-lg border border-village-border bg-white p-4">
            {DIFFICULT_SOUND_ROWS.map((row) => (
              <div key={row.join("")} className="flex gap-1.5">
                {row.map((kana) => (
                  <span
                    key={kana}
                    className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm ${
                      profile.difficult_sounds.includes(kana)
                        ? "border-village-ember bg-village-ember/10 text-village-ember"
                        : "border-village-border text-village-ink/30"
                    }`}
                  >
                    {kana}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {profile.difficult_words.length > 0 ? (
        <div className="mt-4">
          <p className="mb-1 text-xs text-village-ink/50">言いにくい言葉</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.difficult_words.map((word) => (
              <span
                key={word}
                className="rounded-full bg-village-ember/10 px-3 py-1 text-xs text-village-ember"
              >
                {word}
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

      {profile.coping_strategies ? (
        <LabeledText label="自分の対処法" text={profile.coping_strategies} />
      ) : null}

      {profile.first_noticed_stutter ? (
        <LabeledText
          label="自分の吃音史"
          text={profile.first_noticed_stutter}
        />
      ) : null}
    </div>
  );
}
