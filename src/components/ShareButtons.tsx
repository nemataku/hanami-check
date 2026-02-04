"use client";

import { useMemo, useState } from "react";

type Props = {
  shareUrl: string;
  shareText?: string;
};

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

export default function ShareButtons({ shareUrl, shareText = "" }: Props) {
  const [open, setOpen] = useState(false);

  const urls = useMemo(() => {
    const url = shareUrl;

    const xUrl =
      "https://twitter.com/intent/tweet?" +
      new URLSearchParams({
        text: shareText,
        url,
      }).toString();

    const lineUrl =
      "https://social-plugins.line.me/lineit/share?" +
      new URLSearchParams({ url }).toString();

    const fbUrl =
      "https://www.facebook.com/sharer/sharer.php?" +
      new URLSearchParams({ u: url }).toString();

    // InstagramはWebでの「直接投稿」不可なので、アプリ/サイトを開く導線
    const igUrl = "https://www.instagram.com/";

    return { xUrl, lineUrl, fbUrl, igUrl };
  }, [shareUrl, shareText]);

  const baseBtn =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold " +
    "transition-all duration-150 " +
    "shadow-sm shadow-black/5 " +
    "focus:outline-none"; // ←青い外枠の原因になる focus ring を出さない

  // ✅「彩度落とし」＝ 少しだけ薄め（/85）にして、hoverで濃くする
  // ✅ 透明度を下げすぎない（見失わない）
  const toneDown = "opacity-90"; // これ以上下げない
  const hoverUp = "hover:opacity-100 hover:shadow-md hover:shadow-black/10";

  return (
    <div className="mt-4">
      {/* 投稿カード上は「共有」1つだけ */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900",
          "transition-all duration-150",
          "hover:bg-neutral-50 hover:border-neutral-300",
          "focus:outline-none" // 青枠なし
        )}
      >
        共有
      </button>

      {/* 押したら 4ボタン表示 */}
      {open ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={urls.xUrl}
            target="_blank"
            rel="noreferrer"
            className={cx(
              baseBtn,
              "bg-black text-white",
              toneDown,
              hoverUp
            )}
          >
            X
          </a>

          <a
            href={urls.lineUrl}
            target="_blank"
            rel="noreferrer"
            className={cx(
              baseBtn,
              "bg-emerald-600 text-white", // LINE寄り
              toneDown,
              hoverUp
            )}
          >
            LINE
          </a>

          <a
            href={urls.fbUrl}
            target="_blank"
            rel="noreferrer"
            className={cx(
              baseBtn,
              "bg-blue-600 text-white", // Facebook寄り
              toneDown,
              hoverUp
            )}
          >
            Facebook
          </a>

          <a
            href={urls.igUrl}
            target="_blank"
            rel="noreferrer"
            className={cx(
              baseBtn,
              "bg-orange-500 text-white", // Instagramをオレンジ寄せ
              toneDown,
              hoverUp
            )}
          >
            Instagram
          </a>
        </div>
      ) : null}
    </div>
  );
}