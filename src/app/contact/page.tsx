import Link from "next/link";

const CONTACT_EMAIL = "komiru.app@gmail.com";

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <h1 className="text-xl font-semibold text-neutral-900">お問い合わせ</h1>

      <p className="mt-4 text-sm text-neutral-700">
        ご意見・不具合のご報告は、以下のメールアドレスまでご連絡ください。
      </p>

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-sm font-semibold text-neutral-900 underline underline-offset-4 hover:text-neutral-700"
        >
          {CONTACT_EMAIL}
        </a>
        <p className="mt-2 text-xs text-neutral-500">
          ※クリックするとメールアプリが起動します
        </p>
      </div>

      {/* TOPへ戻る */}
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
        >
          TOPに戻る
        </Link>
      </div>
    </main>
  );
}