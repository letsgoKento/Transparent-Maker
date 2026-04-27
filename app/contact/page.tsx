import type { Metadata } from "next";
import { Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata: Metadata = {
  title: "Contact | Transparent Maker",
  description: "Transparent Makerへのお問い合わせ"
};

export default function ContactPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@example.com";
  const subject = encodeURIComponent("Transparent Maker inquiry");

  return (
    <StaticPageShell
      title="Contact"
      description="不具合、課金、Proプラン、画像処理についてのお問い合わせはこちらからお願いします。"
    >
      <section className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-5">
        <div className="flex items-start gap-3">
          <Mail className="mt-1 h-5 w-5 shrink-0 text-cyan-200" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold text-white">メールで問い合わせる</h2>
            <p className="mt-2">
              画像処理の不具合、ログイン、Stripe決済、Proプランについての相談を受け付けています。
            </p>
            <a
              href={`mailto:${contactEmail}?subject=${subject}`}
              className="shine-button mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-300 px-5 py-2 text-sm font-bold text-slate-950 shadow-glow transition hover:bg-cyan-200"
            >
              {contactEmail}
            </a>
          </div>
        </div>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <MessageCircle className="h-5 w-5 text-cyan-200" aria-hidden="true" />
          送ってほしい内容
        </h2>
        <ul className="mt-3 grid gap-2">
          <li>利用している端末とブラウザ</li>
          <li>発生したエラーメッセージ</li>
          <li>Free Download / HD Download のどちらで起きたか</li>
          <li>課金に関する場合はStripe Checkout後の状態</li>
        </ul>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <ShieldCheck className="h-5 w-5 text-cyan-200" aria-hidden="true" />
          画像について
        </h2>
        <p className="mt-2">
          問い合わせ時に画像を添付する場合は、個人情報や機密情報が含まれていないことを確認してください。必要な範囲のスクリーンショットだけで十分です。
        </p>
      </section>
    </StaticPageShell>
  );
}
