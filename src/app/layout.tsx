import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Hanami Check",
  description: "いま行くべき花見スポットを、投稿ベースで判断。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        {/* ===== メインコンテンツ ===== */}
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>

          {/* ===== フッター ===== */}
          <footer className="border-t border-neutral-200 bg-white">
            <div className="mx-auto w-full max-w-md px-4 py-6">
              <nav className="flex justify-center gap-6 text-xs text-neutral-600">
                <Link
                  href="/terms"
                  className="hover:text-neutral-900 hover:underline"
                >
                  利用規約
                </Link>
                <Link
                  href="/privacy"
                  className="hover:text-neutral-900 hover:underline"
                >
                  プライバシーポリシー
                </Link>
                <Link
                  href="/contact"
                  className="hover:text-neutral-900 hover:underline"
                >
                  お問い合わせ
                </Link>
              </nav>

              <p className="mt-4 text-center text-xs text-neutral-400">
                © {new Date().getFullYear()} Hanami Check
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}