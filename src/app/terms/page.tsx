import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <h1 className="text-xl font-semibold text-neutral-900">利用規約</h1>

      <div className="mt-6 space-y-4 text-sm text-neutral-700 leading-relaxed">
        <p>
          本サービス「Hanami Check」（以下「本サービス」）をご利用いただく前に、
          以下の内容をご確認ください。
        </p>

        <h2 className="mt-6 font-semibold text-neutral-900">1. 投稿内容について</h2>
        <p>
          投稿される内容（文章・画像・その他データ）は、投稿者ご自身の責任において行ってください。
          個人情報（氏名、連絡先、住所等）や、人物・車のナンバー・住所が推測できるものなど、
          個人が特定される可能性のある内容・画像の投稿は禁止します。
        </p>

        <h2 className="mt-6 font-semibold text-neutral-900">2. 投稿内容の取り扱い</h2>
        <p>
          投稿された内容は本サービス上で公開され、他の利用者が閲覧できます。
          運営に必要な範囲で、投稿内容を表示・保存・削除する場合があります。
        </p>

        <h2 className="mt-6 font-semibold text-neutral-900">3. 免責事項</h2>
        <p>
          本サービスに掲載される情報の正確性・完全性・最新性について、運営者は保証しません。
          本サービスの利用により生じたいかなる損害についても、運営者は責任を負いません。
        </p>

        <h2 className="mt-6 font-semibold text-neutral-900">4. 投稿の削除・制限</h2>
        <p>
          利用規約に違反している、または運営者が不適切と判断した投稿は、
          事前の通知なく削除する場合があります。必要に応じて利用を制限することがあります。
        </p>

        <h2 className="mt-6 font-semibold text-neutral-900">5. 規約の変更</h2>
        <p>
          本規約は、必要に応じて予告なく変更されることがあります。
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