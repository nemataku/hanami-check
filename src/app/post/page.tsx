// src/app/post/page.tsx
import Link from "next/link";
import SpotForm from "../../components/SpotForm";

export default function PostPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <div className="mb-5">
        <p className="text-xs text-neutral-500">投稿</p>
        <h1 className="mt-1 text-xl font-semibold text-neutral-900">開花状況を投稿</h1>
        <p className="mt-1 text-xs text-neutral-500">場所・開花・天気を選んで投稿できます</p>
      </div>

      <SpotForm />

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