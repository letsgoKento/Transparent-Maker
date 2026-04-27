import type { Metadata } from "next";
import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata: Metadata = {
  title: "Terms | Transparent Maker",
  description: "Transparent Makerの利用規約"
};

export default function TermsPage() {
  return (
    <StaticPageShell
      title="Terms"
      description="Transparent Makerを安心して使うための基本ルールです。"
    >
      <section>
        <h2 className="text-lg font-semibold text-white">1. サービス内容</h2>
        <p className="mt-2">
          Transparent Makerは、アップロードした画像の背景を削除し、透過PNGとして保存できるWebツールです。無料版は最大1024px程度、Pro版は課金状態を確認したうえで元解像度のHD PNGを提供します。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">2. 禁止事項</h2>
        <p className="mt-2">
          他者の権利を侵害する画像、違法な画像、許可なく取得した画像、サービスに過度な負荷をかける利用は禁止します。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">3. Proプラン</h2>
        <p className="mt-2">
          Proプランは月額サブスクリプションです。決済、請求、解約状態はStripeを通じて管理されます。課金済みユーザーのみHD Downloadを利用できます。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">4. 免責事項</h2>
        <p className="mt-2">
          背景削除の品質は画像内容や処理環境により変わります。生成結果が常に完全であることは保証しません。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">5. 規約の変更</h2>
        <p className="mt-2">
          本規約は必要に応じて変更される場合があります。重要な変更がある場合は、サービス上で分かりやすく案内します。
        </p>
      </section>

      <p className="border-t border-slate-800 pt-5 text-xs text-slate-500">
        最終更新日: 2026-04-28
      </p>
    </StaticPageShell>
  );
}
