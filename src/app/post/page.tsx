import Link from "next/link";
import SpotForm from "@/components/SpotForm";

export const dynamic = "force-dynamic";

export default function PostPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <div className="rounded-2xl bg-pink-50 p-4 ring-1 ring-pink-100">
        <p className="text-xs font-medium text-pink-700">開花状況を投稿</p>
        <h1 className="mt-1 text-xl font-semibold text-neutral-900">投稿フォーム</h1>
        <p className="mt-1 text-xs text-neutral-600">場所・開花・天気を選んで投稿できます</p>
      </div>

      <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4">
        <SpotForm />
      </div>

      <div className="mt-6">
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