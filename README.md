# Transparent Maker

画像を置くだけで背景透過PNGを作成できる、ダークテーマのWebアプリです。

無料ユーザーはブラウザ上で長辺約1024pxの透過PNGを作成し、有料ユーザーはAPI側でログイン状態と課金状態を確認してから元解像度PNGをダウンロードできます。

## セットアップ方法

```bash
npm install
cp .env.example .env.local
```

`.env.local` に Supabase / Stripe / 背景削除ワーカーの値を設定します。

## 起動方法

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## 使用技術

- Next.js 15 App Router
- React
- TypeScript
- Tailwind CSS
- lucide-react
- @imgly/background-removal
- onnxruntime-web
- Supabase Auth / Database / Storage
- Stripe Checkout / Webhook
- sharp

## 背景削除処理の仕組み

無料版は初期設定では `@imgly/background-removal` を使い、ブラウザ上で画像を長辺約1024pxに縮小してから背景削除します。無料処理では画像をサーバーへ保存しません。

本番で無料版もサーバー側制御に寄せたい場合は `NEXT_PUBLIC_SERVER_REMOVAL_ENABLED=true` にします。この場合、`/api/remove-background` が無料ユーザーへ縮小済みPNGだけを返します。

HD版は `/api/remove-background` に元画像を送り、API側で有料ユーザーか確認します。確認後、`BACKGROUND_REMOVAL_API_URL` に設定した rembg ワーカーなどへ画像を渡し、返ってきたPNGをSupabaseの非公開Storageへ保存します。`/api/hd-download` は再度有料判定してからファイルを返すため、高解像度画像のURLを直接公開しません。

背景削除ワーカーの想定インターフェース:

```txt
POST multipart/form-data
field: image
response: image/png
```

## Supabase設定

`profiles` テーブル例:

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free',
  is_paid boolean not null default false,
  stripe_customer_id text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = id);
```

Storageでは `transparent-results` というprivate bucketを作成してください。名前を変える場合は `SUPABASE_HD_BUCKET` を変更します。

## Stripe設定

1. Stripeでサブスクリプション商品とPriceを作成します。
2. `STRIPE_PRICE_ID` にPrice IDを設定します。
3. Webhook URLに `https://your-domain.com/api/stripe/webhook` を登録します。
4. `checkout.session.completed`、`customer.subscription.updated`、`customer.subscription.deleted` を購読します。
5. Webhook signing secretを `STRIPE_WEBHOOK_SECRET` に設定します。

決済完了後、Webhookが `profiles.is_paid` と `profiles.plan` を更新します。

## Vercelにデプロイする手順

1. このリポジトリをGitHubへpushします。
2. VercelでNew Projectとしてインポートします。
3. Environment Variablesに `.env.example` と同じキーを登録します。
4. Supabase Storage bucketをprivateで作成します。
5. 背景削除ワーカーを別サービスに用意し、`BACKGROUND_REMOVAL_API_URL` を設定します。
6. Stripe WebhookのURLをVercelの本番URLに更新します。
7. Deployします。

Vercel Functionsで大きな画像を扱う場合は、アップロードサイズと処理時間の制限に注意してください。高負荷なrembg処理は専用ワーカーに逃がす構成を推奨しています。

## 広告スペースを追加する場所

広告用コンテナは `components/AdSlot.tsx` です。配置箇所は `components/TransparentMakerApp.tsx` にあります。

コメント `AdSense slot` の位置を、Google AdSense承認後に `<ins className="adsbygoogle" />` へ置き換えてください。

## 主なファイル

- `components/TransparentMakerApp.tsx`: 画面全体と処理フロー
- `components/UploadDropzone.tsx`: ドラッグ&ドロップアップロード
- `components/ImageCompare.tsx`: Before / After 比較
- `components/DownloadActions.tsx`: Free / HD ダウンロード
- `components/AuthPanel.tsx`: SupabaseログインとUpgrade導線
- `lib/backgroundRemoval.ts`: 無料版のブラウザ背景削除
- `app/api/remove-background/route.ts`: HD背景削除ジョブ作成
- `app/api/hd-download/route.ts`: 有料判定付きHDダウンロード
- `app/api/stripe/*`: Stripe Checkout / Webhook
