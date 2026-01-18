// src/components/CategoryTabs.tsx
import Link from "next/link";

const CATEGORIES = [
  { key: "", label: "すべて" },
  { key: "MALL", label: "商業施設" },
  { key: "PARK", label: "公園・テーマパーク" },
  { key: "FOOD", label: "飲食" },
  { key: "EVENT", label: "イベント" },
  { key: "PARKING", label: "駐車場" },
  { key: "HANAMI", label: "花見" },
  { key: "SCENIC", label: "景勝地" },
  { key: "PUBLIC", label: "公共施設" },
] as const;

function cx(active: boolean) {
  return [
    "rounded-xl border px-3 py-2 text-xs font-semibold",
    active
      ? "border-neutral-900 bg-neutral-900 text-white"
      : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
  ].join(" ");
}

export function CategoryTabs({
  place,
  selected,
}: {
  place: string;
  selected: string;
}) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200">
      <p className="text-xs font-semibold text-neutral-600">カテゴリで探す</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const p = new URLSearchParams();
          if (place.trim()) p.set("place", place.trim());
          if (c.key) p.set("category", c.key);
          const href = `/?${p.toString()}`;

          return (
            <Link key={c.label} href={href} className={cx(selected === c.key)}>
              {c.label}
            </Link>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-neutral-500">
        ※カテゴリ選択中は、そのカテゴリで検索します
      </p>
    </section>
  );
}