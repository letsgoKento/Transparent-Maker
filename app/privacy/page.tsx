import type { Metadata } from "next";
import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy | Transparent Maker",
  description: "Transparent Makerのプライバシーポリシー"
};

export default function PrivacyPage() {
  return (
    <StaticPageShell
      title="Privacy Policy"
      description="Transparent Makerで扱う画像、ログイン情報、決済情報の取り扱いについてまとめています。"
    >
      <section>
        <h2 className="text-lg font-semibold text-white">1. 画像データの扱い</h2>
        <p className="mt-2">
          無料処理は原則としてブラウザ上で実行され、画像はサーバーに保存しません。HD処理では、課金状態を確認するためAPIを経由しますが、HD画像URLを直接公開せず、必要な処理のためだけに利用します。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">2. ログイン情報</h2>
        <p className="mt-2">
          ログインにはSupabase Authを利用します。メールアドレスはログイン、アカウント確認、Proプランの状態確認に利用します。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">3. 決済情報</h2>
        <p className="mt-2">
          決済はStripe Checkoutで処理されます。クレジットカード番号などの決済情報はTransparent Makerのサーバーには保存されません。アプリ側ではStripe Customer ID、Subscription ID、プラン状態を保存します。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">4. 利用目的</h2>
        <p className="mt-2">
          取得した情報は、ログイン管理、Proプラン判定、HD PNGの提供、不正利用防止、問い合わせ対応、サービス改善のために利用します。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">5. 第三者サービス</h2>
        <p className="mt-2">
          本サービスではSupabase、Stripe、Vercelなどの外部サービスを利用します。各サービスで処理される情報は、それぞれのプライバシーポリシーに従って扱われます。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">6. お問い合わせ</h2>
        <p className="mt-2">
          個人情報の取り扱いに関するご質問は、Contactページからお問い合わせください。
        </p>
      </section>

      <p className="border-t border-slate-800 pt-5 text-xs text-slate-500">
        最終更新日: 2026-04-28
      </p>
    </StaticPageShell>
  );
}
