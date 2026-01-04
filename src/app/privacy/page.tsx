import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <h1 className="text-xl font-semibold text-neutral-900">
        プライバシーポリシー
      </h1>

      <div className="mt-6 space-y-4 text-sm text-neutral-700 leading-relaxed">
        <p>
          Hanami Check（以下「本サービス」）は、利用者のプライバシーを尊重し、
          個人情報の適切な取り扱いと保護に努めます。
        </p>

        <h2 className="mt-6 font-semibold text-neutral-900">1. 取得する情報</h2>
        <p>本サービスでは、以下の情報を取得する場合があります。</p>
        <ul className="list-disc pl-5">
          <li>投稿された内容（場所名、開花状況、天気、コメント、画像）</li>
          <li>アクセスログ（IPアドレス、ブラウザ情報等）</li>
        </ul>

        <h2 className="mt-6 font-semibold text-neutral-900">2. 個人情報について</h2>
        <p className="font-semibold text-pink-700">
          氏名、住所、電話番号、メールアドレスなどの個人情報、
          ならびに人物・車のナンバー・住所等が特定できる画像の投稿は禁止しています。
        </p>
        <p>
          利用者が誤って個人情報を投稿した場合、運営者は予告なく当該投稿を削除することがあります。
        </p>

        <h2 className="mt-6 font-semibold text-neutral-900">3. 利用目的</h2>
        <p>取得した情報は、以下の目的のために利用します。</p>
        <ul className="list-disc pl-5">
          <li>本サービスの提供・運営</li>
          <li>不正利用の防止・セキュリティ向上</li>
          <li>サービス改善のための分析</li>
        </ul>

        <h2 className="mt-6 font-semibold text-neutral-900">4. 第三者提供</h2>
        <p>
          法令に基づく場合を除き、取得した情報を第三者に提供することはありません。
        </p>

        <h2 className="mt-6 font-semibold text-neutral-900">5. 画像データの取り扱い</h2>
        <p>
          投稿された画像は、表示およびサービス運営の目的で保存されます。
          不適切と判断した画像（個人情報を含むもの、QRコードを含むもの等）は削除される場合があります。
        </p>

        <h2 className="mt-6 font-semibold text-neutral-900">6. 免責事項</h2>
        <p>
          本サービスは、投稿内容の正確性・安全性を保証するものではありません。
          利用者間、または第三者との間で生じたトラブルについて、運営者は責任を負いません。
        </p>

        <h2 className="mt-6 font-semibold text-neutral-900">7. ポリシーの変更</h2>
        <p>本ポリシーは、必要に応じて予告なく変更されることがあります。</p>

        <p className="mt-6 text-xs text-neutral-500">制定日：2026年1月</p>
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