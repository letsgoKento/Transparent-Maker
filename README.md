# Transparent Maker

画像をアップロードすると背景を削除し、透過PNGとしてダウンロードできるNext.js App Router製Webアプリです。

無料ユーザーは最大1024pxのPNGのみ、有料ユーザーはStripe CheckoutでProにアップグレード後、API側の課金確認を通して元解像度HD PNGを取得できます。

## 使用技術

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Database
- Stripe Checkout
- Stripe Webhook
- Vercel Environment Variables
- @imgly/background-removal
- onnxruntime-web 1.21.0
- sharp

## ローカル起動方法

```bash
npm install
cp .env.example .env.local
npm run dev
```

`http://localhost:3000` を開きます。

## 環境変数

```txt
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRICE_ID=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CONTACT_EMAIL=support@example.com
NEXT_PUBLIC_SERVER_REMOVAL_ENABLED=false
BACKGROUND_REMOVAL_API_URL=
BACKGROUND_REMOVAL_API_KEY=
```

`NEXT_PUBLIC_PRO_PRICE_LABEL` は任意です。UI上のPro料金表示を変えたい場合だけ設定してください。

## Supabaseテーブル作成方法

Supabase SQL Editorで [supabase/users_profile.sql](supabase/users_profile.sql) を実行します。

主なカラム:

- `id`: `auth.users.id` と紐付くUUID
- `email`: ユーザーのメールアドレス
- `stripe_customer_id`: Stripe Customer ID
- `stripe_subscription_id`: Stripe Subscription ID
- `plan`: `free` / `pro`
- `subscription_status`: Stripe subscription status
- `created_at`: 作成日時
- `updated_at`: 更新日時

アプリはAPI側で `users_profile.plan === 'pro'` を確認してからHD PNGを返します。フロントエンドだけで有料判定しません。

## Stripeの商品作成方法

1. Stripe DashboardでProductsを開きます。
2. `Transparent Maker Pro` のような商品を作成します。
3. Pricingで月額サブスクリプション価格を作成します。
4. 作成したPriceのIDをコピーします。`price_...` で始まる値です。
5. Vercelと `.env.local` の `NEXT_PUBLIC_STRIPE_PRICE_ID` に設定します。

## Webhook設定方法

Stripe DashboardのDevelopers > WebhooksでEndpointを追加します。

Endpoint URL:

```txt
https://your-domain.com/api/stripe/webhook
```

購読イベント:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Webhook signing secretをコピーし、`STRIPE_WEBHOOK_SECRET` に設定します。

Webhookでは署名検証を行い、決済完了時に `users_profile.plan` を `pro` に更新します。サブスクリプション更新・解約時も `subscription_status` と `plan` を同期します。

## API

- `POST /api/create-checkout-session`
  - ログイン中ユーザーを確認
  - Stripe Customerを作成または取得
  - Stripe Checkout Sessionを作成
  - `/success` / `/cancel` をリダイレクト先に設定
  - Checkout URLを返却

- `POST /api/stripe/webhook`
  - Stripe署名を検証
  - `checkout.session.completed` でPro化
  - `customer.subscription.updated` で状態同期
  - `customer.subscription.deleted` でfreeへ戻す

- `POST /api/download/free`
  - 処理済み画像を受け取り、最大1024pxのPNGに縮小して返却

- `POST /api/download/hd`
  - ログイン確認
  - Supabaseで `plan = pro` を確認
  - Proなら元解像度の背景透過PNGをAPIレスポンスとして返却
  - Freeなら403を返却

HD画像URLは直接公開しません。必ずAPI側で課金状態を確認します。

## 背景削除処理

無料処理は初期設定ではブラウザ上の `@imgly/background-removal` で行います。Free Download時は `/api/download/free` で最大1024pxに整えます。

HD Downloadは `/api/download/hd` で有料判定後、`BACKGROUND_REMOVAL_API_URL` に設定したrembgワーカーなどへ画像を送り、元解像度PNGを返します。

背景削除ワーカーの想定インターフェース:

```txt
POST multipart/form-data
field: image
response: image/png
```

## Vercelデプロイ方法

1. GitHubにpushします。
2. VercelでNew Projectとしてインポートします。
3. Environment Variablesに上記の値を設定します。
4. Supabase SQL Editorで `supabase/users_profile.sql` を実行します。
5. Stripe Webhook URLを本番URLに設定します。
6. `BACKGROUND_REMOVAL_API_URL` に背景削除ワーカーのURLを設定します。
7. Deployします。

Vercel Functionsで重い画像処理を長時間実行すると制限に当たることがあります。rembgなどの重い処理は専用ワーカーへ分離する構成を推奨します。

## 広告スペース

広告用コンテナは `components/AdSlot.tsx` です。配置は `components/TransparentMakerApp.tsx` にあります。

Google AdSense承認後、`AdSense slot` コメントの位置を広告タグへ置き換えてください。
