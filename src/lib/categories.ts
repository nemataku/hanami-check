export const CATEGORIES = [
  { key: "SHOPPING", label: "商業施設" },
  { key: "PARK", label: "公園・テーマパーク" },
  { key: "FOOD", label: "飲食" },
  { key: "EVENT", label: "イベント" },
  { key: "PARKING", label: "駐車場" },
  { key: "HANAMI", label: "花見" },
  { key: "SCENIC", label: "景勝地" },
  { key: "PUBLIC", label: "公共施設" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];