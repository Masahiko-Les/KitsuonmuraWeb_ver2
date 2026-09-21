# 吃音村 2.0

吃音を持つ人たちが暮らす、小さなオンラインの村。競争・ランキングを持たず、
弱さや苦労を分かち合うことを中心に置いた MVP です。

既存の「吃音村」DB とは完全に独立した、新しい Supabase プロジェクトを前提としています。

## 必要環境

- Node.js 20 以上
- npm
- Supabase アカウント（新規プロジェクトを1つ作成してください。既存の吃音村プロジェクトとは共有しないこと）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabase プロジェクトの作成

1. https://supabase.com でプロジェクトを新規作成。作成時の詳細設定は以下を選択:
   - **Enable Data API**: ON（supabase-js から叩くのに必須）
   - **Enable automatic RLS**: ON（新規テーブルへの安全装置。うちは全テーブルで手動RLSも行うので実質重複するが害はない）
   - **Automatically expose new tables**: OFF（Supabase推奨のセキュリティ設定。この場合でも動くよう、各 migration に明示的な `grant select/insert/...` を入れてあるので、ONでもOFFでもどちらでも問題ない）
2. Project Settings → API から以下を控える
   - Project URL
   - `anon` `public` キー
   - （必要になった時点で）`service_role` キー — **絶対にブラウザに公開しないこと**

### 3. 環境変数の設定

`.env.local.example` を `.env.local` にコピーし、値を埋めてください。

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # 今回のMVPでは未使用。将来のサーバー専用処理向け
```

### 4. マイグレーションの適用

`supabase/migrations/` 以下の SQL を、Supabase 管理画面の SQL Editor に
**ファイル名の順番通り**貼り付けて実行してください（`supabase` CLI がある場合は
`supabase db push` でも可）。

| ファイル | 内容 |
| --- | --- |
| `20250101000001_extensions.sql` | 拡張機能・共通トリガー関数 |
| `20250101000002_profiles.sql` | 住民票（profiles） |
| `20250101000003_bonfire.sql` | 焚き火（bonfire_posts） |
| `20250101000004_garden.sql` | 農園（種・水やり・収穫・作物配布・`water_seed` RPC） |
| `20250101000005_shrine.sql` | 祠（村の生命力・お供え・`make_offering` / `get_village_status` RPC） |
| `20250101000006_desert.sql` | 砂漠（desert_stories） |

### 5. Auth のメール確認設定（推奨）

Supabase 管理画面 → Authentication → Email Templates → **Confirm signup** の
リンクを以下の形式に変更してください（`@supabase/ssr` を使った Next.js の
標準的な確認フローです）。

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/onboarding
```

開発中にメール確認をスキップしたい場合は、Authentication → Providers → Email
の "Confirm email" をオフにしても構いません。

### 6. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 を開いてください。

## DB 構造概要

- **profiles** — 住民票。`user_id` は `auth.users` に 1:1。ログイン済みユーザーのみ閲覧可、編集は本人のみ。
- **bonfire_posts** — 日常の気持ちの投稿。論理削除（`deleted_at`）。
- **garden_seeds** — 苦労を植えた「種」。`status`: `seed` → `growing` → `harvested`。
- **waterings** — 水やり記録。`unique(seed_id, user_id)` で二重水やりを禁止。直接 INSERT する
  RLS ポリシーは存在せず、`water_seed()` RPC 経由でのみ作成される。
- **crop_catalog** — 収穫される作物のマスタ。`is_active` を切り替えることで後から増減可能。
- **harvests** — 収穫そのもの。`seed_id` は unique（1つの種につき1回だけ収穫）。
- **user_crops** — 収穫物の個人在庫。`unique(user_id, harvest_id)` で二重配布を禁止。`offered_at` が
  埋まっていればお供え済み。
- **game_settings** — 水やり必要回数・お供え回復量・生命力の自然減少量・状態しきい値などの
  バランス数値。1行だけのシングルトンテーブルで、コードを書き換えずに調整可能。
- **village_state** — 村の生命力の基準値と最終計算日。日々の Cron は不要で、
  `経過日数 × daily_vitality_decay` を都度計算する方式。
- **offerings** — お供え履歴。`unique(user_crop_id)` で同じ作物の二重奉納を禁止。
- **desert_stories** — 苦難の記録（何に苦しんだか / 何をしたか / その結果）。論理削除。

すべてのテーブルで RLS を有効化しています。特にゲームの根幹となる処理
（水やり3回での収穫判定・作物のランダム決定・複数人への配布・お供えによる
生命力更新）はフロントエンドに任せず、SECURITY DEFINER の Postgres 関数内で
行 (row) ロックを使い、トランザクションとして原子的に処理しています。

## 主要 RPC 一覧

| 関数 | 説明 |
| --- | --- |
| `water_seed(p_seed_id uuid)` | 指定した種に水をやる。自分の種には不可、二重水やりも DB 制約で禁止。水やりが `harvest_water_count` 回に達すると、その場でランダムな作物を収穫し、種を植えた人＋水をやった全員に配布する。 |
| `get_current_vitality()` | 村の現在の生命力（0〜100）を計算して返す。書き込みはしない。 |
| `get_village_status()` | 生命力を4段階の状態（tier 1〜4）とメッセージに変換して返す。数値自体はクライアントに公開しない。 |
| `make_offering(p_user_crop_id uuid)` | 自分の未奉納の作物を祠にお供えする。現在の生命力を再計算し、`offering_recovery` を加算して `max_vitality` でクランプ、その値を新しい基準値として保存する。 |
| `get_offering_history()` | 祠の裏で表示する、全村人のお供え履歴（誰が・何を・いつ）を返す。`user_crops` は本人しか SELECT できないため、この関数を介さず直接テーブルを結合すると他人の記録が見えなくなる。 |

## 画面構成

```
/                 ログイン前トップ
/login            ログイン
/signup           新規登録
/onboarding       初回村人登録
/village          村マップ
/town-hall        村役場（自分の住民票・編集リンク・村人一覧リンク）
/town-hall/edit   住民票の編集
/residents        村人一覧
/residents/[id]   住民票（他の村人）
/bonfire          焚き火
/garden           農園
/shrine           祠
/shrine/back      祠の裏（お供え履歴）
/desert           砂漠
/library          図書館（準備中）
```

## MVP でやらないこと

研究所・掲示板・フォロー・DM・ランキング・いいね・複雑な通知・課金・
Google ログイン・Realtime・高度なアニメーション・管理者画面・AI 機能は
今回のスコープ外です（後から追加できる設計にはしています）。
