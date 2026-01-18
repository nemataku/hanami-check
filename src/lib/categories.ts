export const CATEGORIES = [
  { key: "mall", label: "商業施設" },
  { key: "park", label: "公園・テーマパーク" },
  { key: "food", label: "飲食" },
  { key: "event", label: "イベント" },
  { key: "parking", label: "駐車場" },
  { key: "hanami", label: "花見" },
  { key: "scenic", label: "景勝地" },
  { key: "public", label: "公共施設" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];