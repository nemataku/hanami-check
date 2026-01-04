import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-md px-4 py-6">
        <div className="flex items-center justify-center gap-6 text-sm text-neutral-500">
          <Link
            href="/terms"
            className="hover:text-neutral-900 hover:underline"
          >
            利用規約
          </Link>

          <Link
            href="/contact"
            className="hover:text-neutral-900 hover:underline"
          >
            お問い合わせ
          </Link>
        </div>

        <p className="mt-3 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} Hanami Check
        </p>
      </div>
    </footer>
  );
}