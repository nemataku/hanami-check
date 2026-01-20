// src/components/SpotForm.tsx
"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

const CATEGORIES = [
  { key: "SHOPPING", label: "商業施設" },
  { key: "PARK", label: "公園・テーマパーク" },
  { key: "FOOD", label: "飲食" },
  { key: "EVENT", label: "イベント" },
  { key: "PARKING", label: "駐車場" },
  { key: "HANAMI", label: "花見" },
  { key: "SCENIC", label: "観光地・景勝地" },
  { key: "PUBLIC", label: "公共施設" },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];

const BLOOM_LABELS = ["つぼみ", "咲始め", "3分咲き", "5分咲き", "7分咲き", "満開", "散る"] as const;
const WEATHER_OPTIONS = ["晴れ", "曇り", "小雨", "雨", "雪"] as const;

const CROWD_5 = ["空いている", "やや混雑", "混雑", "満員", "入場規制"] as const;
const PARKING_4 = ["空きあり", "やや混雑", "混雑", "満車"] as const;

const BUSINESS_STATUS = ["営業中", "休憩中", "営業時間外", "休業"] as const;
const PARK_STATUS = ["営業中", "営業時間外", "休業"] as const;

type UploadResult =
  | { ok: true; imageUrl: string; imageHash: string; bytes: number }
  | { ok: false; error: string };

type PostResult =
  | { ok: true; item: unknown }
  | { ok: false; error: string };

function pill(active: boolean) {
  return [
    "rounded-xl border px-3 py-2 text-xs font-semibold",
    active
      ? "border-neutral-900 bg-neutral-900 text-white"
      : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
  ].join(" ");
}

function badgeTone() {
  return "bg-neutral-100 text-neutral-700 ring-neutral-200";
}

export default function SpotForm() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ カテゴリ
  const [category, setCategory] = useState<CategoryKey | null>(null);

  // 共通
  const [place, setPlace] = useState("");
  const [comment, setComment] = useState("");

  // 画像
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageHash, setImageHash] = useState<string | null>(null);

  // 花見用
  const [bloom, setBloom] = useState<number>(3);
  const [weather, setWeather] = useState<(typeof WEATHER_OPTIONS)[number] | "">("");

  // 花の種類（HANAMI）
  const FLOWER_PRESET_LABELS = ["桜", "梅", "その他"] as const;
  type FlowerPresetLabel = (typeof FLOWER_PRESET_LABELS)[number];

  const FLOWER_CODE: Record<FlowerPresetLabel, "SAKURA" | "UME" | "OTHER"> = {
    桜: "SAKURA",
    梅: "UME",
    その他: "OTHER",
  };

  const [flowerPresetLabel, setFlowerPresetLabel] = useState<FlowerPresetLabel | "">("");
  const [flowerOther, setFlowerOther] = useState("");

  // ✅ 1回だけ定義
  const flowerPreset = flowerPresetLabel ? FLOWER_CODE[flowerPresetLabel] : null;

  // ✅ “その他”選択時のみ有効
  const flowerOtherValue =
    flowerPresetLabel === "その他" && flowerOther.trim() !== ""
      ? flowerOther.trim()
      : null;

  // 混雑（多カテゴリで使う）
  const [crowd5, setCrowd5] = useState<(typeof CROWD_5)[number] | "">("");

  // 駐車場用
  const [parking4, setParking4] = useState<(typeof PARKING_4)[number] | "">("");

  // 商業施設
  const [shopName, setShopName] = useState("");
  const [businessStatus, setBusinessStatus] = useState<(typeof BUSINESS_STATUS)[number] | "">("");
  const [openTime, setOpenTime] = useState(""); // "09:00"
  const [closeTime, setCloseTime] = useState(""); // "18:00"

  // 公園・テーマパーク
  const [attractionName, setAttractionName] = useState("");
  const [waitMinutes, setWaitMinutes] = useState(""); // number string
  const [parkStatus, setParkStatus] = useState<(typeof PARK_STATUS)[number] | "">("");

  // 飲食
  const [foodStatus, setFoodStatus] = useState<(typeof BUSINESS_STATUS)[number] | "">("");
  const [foodOpen, setFoodOpen] = useState("");
  const [foodClose, setFoodClose] = useState("");

  // イベント
  const [eventName, setEventName] = useState("");
  const [eventStart, setEventStart] = useState(""); // "HH:mm"
  const [eventEnd, setEventEnd] = useState("");

  // 公共施設
  const [publicOpen, setPublicOpen] = useState("");
  const [publicClose, setPublicClose] = useState("");
  const [publicWait, setPublicWait] = useState("");

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  function clearFileSelection() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setImageUrl(null);
    setImageHash(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadImage(selected: File) {
    setUploading(true);
    setUploadError(null);

    try {
      const fd = new FormData();
      fd.append("file", selected);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as UploadResult;

      if (!res.ok) {
        setImageUrl(null);
        setImageHash(null);
        setUploadError(`アップロードに失敗しました（${res.status}）`);
        return;
      }
      if (!data.ok) {
        setImageUrl(null);
        setImageHash(null);
        setUploadError(data.error);
        return;
      }

      setImageUrl(data.imageUrl);
      setImageHash(data.imageHash);
      setUploadError(null);
    } catch (e) {
      console.error(e);
      setImageUrl(null);
      setImageHash(null);
      setUploadError("アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  }

  async function onPickFile(f: File | null) {
    setOkMsg(null);
    setFormError(null);

    if (!f) {
      clearFileSelection();
      return;
    }

    clearFileSelection();
    setFile(f);

    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    await uploadImage(f);
  }

  // ✅ 場所名 placeholder（カテゴリ別）
  const placePlaceholder = useMemo(() => {
    switch (category) {
      case "SHOPPING":
        return "例：ららぽーと";
      case "PARK":
        return "例：上野公園";
      case "FOOD":
        return "例：◯◯◯東京駅店";
      case "EVENT":
        return "例：上野公園 / 武道館";
      case "PARKING":
        return "例：ららぽーと / 羽田空港";
      case "HANAMI":
        return "例：上野公園";
      case "SCENIC":
        return "例：浅草寺 / 東京スカイツリー";
      case "PUBLIC":
        return "例：◯◯区役所 / ◯◯大学";
      default:
        return "例：上野公園 / ららぽーと / ◯◯駐車場";
    }
  }, [category]);

  const canSubmit = useMemo(() => {
    if (!category) return false;
    if (!place.trim()) return false;
    if (uploading || submitting) return false;
    if (file && !imageUrl) return false;

    // カテゴリ別必須
    if (category === "SHOPPING") {
      if (businessStatus === "") return false;
      if (crowd5 === "") return false;
    }
    if (category === "PARK") {
      if (crowd5 === "") return false;
      if (parkStatus === "") return false;
    }
    if (category === "FOOD") {
      if (crowd5 === "") return false;
      if (foodStatus === "") return false;
    }
    if (category === "EVENT") {
      if (!eventName.trim()) return false;
      if (crowd5 === "") return false;
    }
    if (category === "PARKING") {
      if (parking4 === "") return false;
    }
    if (category === "HANAMI") {
      if (!Number.isInteger(bloom) || bloom < 0 || bloom > 6) return false;
      if (crowd5 === "") return false;
      if (!flowerPreset && !flowerOtherValue) return false;
      if (flowerPresetLabel === "その他" && !flowerOtherValue) return false;
    }
    if (category === "SCENIC") {
      if (crowd5 === "") return false;
    }
    if (category === "PUBLIC") {
      if (crowd5 === "") return false;
    }

    return true;
  }, [
    category,
    place,
    uploading,
    submitting,
    file,
    imageUrl,
    businessStatus,
    crowd5,
    parkStatus,
    foodStatus,
    eventName,
    parking4,
    bloom,
    flowerPreset,
    flowerOtherValue,
    flowerPresetLabel,
  ]);

  async function onSubmit() {
    setOkMsg(null);
    setFormError(null);

    if (!category) {
      setFormError("カテゴリを選択してください");
      return;
    }
    const placeTrim = place.trim();
    if (!placeTrim) {
      setFormError("場所名を入力してください");
      return;
    }
    if (file && !imageUrl) {
      setFormError("画像アップロードが完了していません");
      return;
    }

    if (category === "HANAMI") {
      if (!flowerPreset && !flowerOtherValue) {
        setFormError("花の種類（桜/梅/その他 or 自由記入）が必須です");
        return;
      }
      if (flowerPresetLabel === "その他" && !flowerOtherValue) {
        setFormError("「その他」を選んだ場合は花の種類を入力してください");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        category,
        place: placeTrim,
        comment: comment.trim() === "" ? null : comment.trim(),
        imageUrl,
        imageHash,
      };

      if (category === "SHOPPING") {
        payload.shopName = shopName.trim() === "" ? null : shopName.trim();
        payload.businessStatus = businessStatus;
        payload.openTime = openTime || null;
        payload.closeTime = closeTime || null;
        payload.crowd = crowd5;
      }

      if (category === "PARK") {
        payload.attractionName = attractionName.trim() === "" ? null : attractionName.trim();
        payload.crowd = crowd5;
        payload.waitMinutes = waitMinutes.trim() === "" ? null : Number(waitMinutes);
        payload.businessStatus = parkStatus; // parkも businessStatus として送る
        payload.openTime = openTime || null;
        payload.closeTime = closeTime || null;
        payload.weather = weather === "" ? null : weather;
      }

      if (category === "FOOD") {
        payload.crowd = crowd5;
        payload.businessStatus = foodStatus;
        payload.openTime = foodOpen || null;
        payload.closeTime = foodClose || null;
      }

      if (category === "EVENT") {
        payload.eventName = eventName.trim();
        payload.crowd = crowd5;
        payload.eventStart = eventStart || null;
        payload.eventEnd = eventEnd || null;
      }

      if (category === "PARKING") {
        payload.parkingName = shopName.trim() === "" ? null : shopName.trim();
        payload.parkingLevel = parking4;
      }

      if (category === "HANAMI") {
        payload.bloom = bloom;
        payload.weather = weather === "" ? null : weather;
        payload.crowd = crowd5;
        payload.flowerPreset = flowerPreset;
        payload.flowerOther = flowerOtherValue;
      }

      if (category === "SCENIC") {
        payload.crowd = crowd5;
        payload.weather = weather === "" ? null : weather;
      }

      if (category === "PUBLIC") {
        payload.crowd = crowd5;
        payload.openTime = publicOpen || null;
        payload.closeTime = publicClose || null;
        payload.waitMinutes = publicWait.trim() === "" ? null : Number(publicWait);
      }

      const res = await fetch("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as PostResult;

      if (!res.ok) {
        setFormError(`投稿に失敗しました（${res.status}）`);
        return;
      }
      if (!data.ok) {
        setFormError(data.error);
        return;
      }

      setOkMsg("投稿しました");
      setComment("");
      setPlace("");
      setCategory(null);
      setCrowd5("");
      setParking4("");
      setShopName("");
      setBusinessStatus("");
      setOpenTime("");
      setCloseTime("");
      setAttractionName("");
      setWaitMinutes("");
      setParkStatus("");
      setFoodStatus("");
      setFoodOpen("");
      setFoodClose("");
      setEventName("");
      setEventStart("");
      setEventEnd("");
      setPublicOpen("");
      setPublicClose("");
      setPublicWait("");
      setBloom(3);
      setWeather("");
      setFlowerPresetLabel("");
      setFlowerOther("");
      clearFileSelection();
    } catch (e) {
      console.error(e);
      setFormError("投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <div className="rounded-2xl bg-pink-50 p-4 ring-1 ring-pink-100">
        <p className="text-xs font-medium text-pink-700">投稿</p>
        <h1 className="mt-1 text-xl font-semibold text-neutral-900">いまの状況を投稿</h1>
        <p className="mt-1 text-xs text-neutral-600">カテゴリを選んで、必要事項を入力してください</p>
      </div>

      {/* ✅ カテゴリ選択 */}
      <section className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4">
        <label className="text-sm font-semibold text-neutral-900">カテゴリ（必須）</label>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={pill(category === c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* 場所名（共通必須） */}
      <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <label className="text-sm font-semibold text-neutral-900">場所名（必須）</label>
        <input
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder={placePlaceholder}
          className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />
      </section>

      {/* --- カテゴリ別 UI --- */}

      {/* 商業施設 */}
      {category === "SHOPPING" ? (
        <div className="mt-4 space-y-4">
          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">店舗名（任意）</label>
            <input
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
              placeholder="例：フードコート / 無印良品"
            />
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">営業状況（必須）</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {BUSINESS_STATUS.map((v) => (
                <button key={v} type="button" onClick={() => setBusinessStatus(v)} className={pill(businessStatus === v)}>
                  {v}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">営業時間（任意）</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} className="rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
              <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className="rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-neutral-900">混雑状況（必須）</label>
              <span className={["rounded-full px-2.5 py-1 text-xs font-medium ring-1", badgeTone()].join(" ")}>
                {crowd5 === "" ? "-" : crowd5}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {CROWD_5.map((v) => (
                <button key={v} type="button" onClick={() => setCrowd5(v)} className={pill(crowd5 === v)}>
                  {v}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {/* 公園・テーマパーク */}
      {category === "PARK" ? (
        <div className="mt-4 space-y-4">
          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">アトラクション名（任意）</label>
            <input
              value={attractionName}
              onChange={(e) => setAttractionName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
              placeholder="例：◯◯ライド"
            />
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">待ち時間（任意）</label>
            <input
              inputMode="numeric"
              value={waitMinutes}
              onChange={(e) => setWaitMinutes(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
              placeholder="例：30（分）"
            />
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">営業状況（必須）</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {PARK_STATUS.map((v) => (
                <button key={v} type="button" onClick={() => setParkStatus(v)} className={pill(parkStatus === v)}>
                  {v}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">営業時間（任意）</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} className="rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
              <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className="rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-neutral-900">天気（任意）</label>
              <span className={["rounded-full px-2.5 py-1 text-xs font-medium ring-1", badgeTone()].join(" ")}>
                {weather === "" ? "-" : weather}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => setWeather("")} className={pill(weather === "")}>
                未選択
              </button>
              {WEATHER_OPTIONS.map((w) => (
                <button key={w} type="button" onClick={() => setWeather(w)} className={pill(weather === w)}>
                  {w}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-neutral-900">混雑状況（必須）</label>
              <span className={["rounded-full px-2.5 py-1 text-xs font-medium ring-1", badgeTone()].join(" ")}>
                {crowd5 === "" ? "-" : crowd5}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {CROWD_5.map((v) => (
                <button key={v} type="button" onClick={() => setCrowd5(v)} className={pill(crowd5 === v)}>
                  {v}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {/* 飲食 */}
      {category === "FOOD" ? (
        <div className="mt-4 space-y-4">
          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">営業状況（必須）</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {BUSINESS_STATUS.map((v) => (
                <button key={v} type="button" onClick={() => setFoodStatus(v)} className={pill(foodStatus === v)}>
                  {v}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">営業時間（任意）</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input type="time" value={foodOpen} onChange={(e) => setFoodOpen(e.target.value)} className="rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
              <input type="time" value={foodClose} onChange={(e) => setFoodClose(e.target.value)} className="rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-neutral-900">混雑状況（必須）</label>
              <span className={["rounded-full px-2.5 py-1 text-xs font-medium ring-1", badgeTone()].join(" ")}>
                {crowd5 === "" ? "-" : crowd5}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {CROWD_5.map((v) => (
                <button key={v} type="button" onClick={() => setCrowd5(v)} className={pill(crowd5 === v)}>
                  {v}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {/* イベント */}
      {category === "EVENT" ? (
        <div className="mt-4 space-y-4">
          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">イベント名（必須）</label>
            <input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
              placeholder="例：花火大会"
            />
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">イベント時間（任意）</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input type="time" value={eventStart} onChange={(e) => setEventStart(e.target.value)} className="rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
              <input type="time" value={eventEnd} onChange={(e) => setEventEnd(e.target.value)} className="rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-neutral-900">混雑状況（必須）</label>
              <span className={["rounded-full px-2.5 py-1 text-xs font-medium ring-1", badgeTone()].join(" ")}>
                {crowd5 === "" ? "-" : crowd5}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {CROWD_5.map((v) => (
                <button key={v} type="button" onClick={() => setCrowd5(v)} className={pill(crowd5 === v)}>
                  {v}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {/* 駐車場 */}
      {category === "PARKING" ? (
        <div className="mt-4 space-y-4">
          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">駐車場名（任意）</label>
            <input
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
              placeholder="例：第1駐車場"
            />
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-neutral-900">混雑具合（必須）</label>
              <span className={["rounded-full px-2.5 py-1 text-xs font-medium ring-1", badgeTone()].join(" ")}>
                {parking4 === "" ? "-" : parking4}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {PARKING_4.map((v) => (
                <button key={v} type="button" onClick={() => setParking4(v)} className={pill(parking4 === v)}>
                  {v}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {/* 花見 */}
      {category === "HANAMI" ? (
        <div className="mt-4 space-y-4">
          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">花の種類（必須）</label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => setFlowerPresetLabel("桜")} className={pill(flowerPresetLabel === "桜")}>
                桜
              </button>
              <button type="button" onClick={() => setFlowerPresetLabel("梅")} className={pill(flowerPresetLabel === "梅")}>
                梅
              </button>
              <button type="button" onClick={() => setFlowerPresetLabel("その他")} className={pill(flowerPresetLabel === "その他")}>
                その他
              </button>
            </div>

            {flowerPresetLabel === "その他" ? (
              <input
                value={flowerOther}
                onChange={(e) => setFlowerOther(e.target.value)}
                className="mt-3 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                placeholder="例：菜の花 / 桃 など"
              />
            ) : null}

            <p className="mt-2 text-xs text-neutral-500">
              ※「桜」「梅」ボタン、または「その他」を選んで入力してください
            </p>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">開花状況（必須）</label>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {BLOOM_LABELS.map((label, idx) => (
                <button key={label} type="button" onClick={() => setBloom(idx)} className={pill(idx === bloom)}>
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">天気（任意）</label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => setWeather("")} className={pill(weather === "")}>
                未選択
              </button>
              {WEATHER_OPTIONS.map((w) => (
                <button key={w} type="button" onClick={() => setWeather(w)} className={pill(weather === w)}>
                  {w}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">混雑状況（必須）</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {CROWD_5.map((v) => (
                <button key={v} type="button" onClick={() => setCrowd5(v)} className={pill(crowd5 === v)}>
                  {v}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {/* 観光地・景勝地 */}
      {category === "SCENIC" ? (
        <div className="mt-4 space-y-4">
          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">天気（任意）</label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => setWeather("")} className={pill(weather === "")}>
                未選択
              </button>
              {WEATHER_OPTIONS.map((w) => (
                <button key={w} type="button" onClick={() => setWeather(w)} className={pill(weather === w)}>
                  {w}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">混雑状況（必須）</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {CROWD_5.map((v) => (
                <button key={v} type="button" onClick={() => setCrowd5(v)} className={pill(crowd5 === v)}>
                  {v}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {/* 公共施設 */}
      {category === "PUBLIC" ? (
        <div className="mt-4 space-y-4">
          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">営業時間（任意）</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input type="time" value={publicOpen} onChange={(e) => setPublicOpen(e.target.value)} className="rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
              <input type="time" value={publicClose} onChange={(e) => setPublicClose(e.target.value)} className="rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">待ち時間（任意）</label>
            <input
              inputMode="numeric"
              value={publicWait}
              onChange={(e) => setPublicWait(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
              placeholder="例：15（分）"
            />
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-sm font-semibold text-neutral-900">混雑状況（必須）</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {CROWD_5.map((v) => (
                <button key={v} type="button" onClick={() => setCrowd5(v)} className={pill(crowd5 === v)}>
                  {v}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {/* コメント（共通・任意） */}
      <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <label className="text-sm font-semibold text-neutral-900">コメント（任意）</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="例：かなり混雑、待ち時間30分 など"
          className="mt-2 min-h-[96px] w-full resize-y rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />
      </section>

      {/* 画像（共通・任意） */}
      <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-neutral-900">写真（任意）</label>
          <p className="text-xs text-neutral-500">JPEG / PNG / WebP（10MBまで）</p>
        </div>

        <div className="mt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-neutral-800"
          />
        </div>

        {previewUrl ? (
          <div className="mt-3 rounded-xl border border-neutral-200 p-3">
            <div className="overflow-hidden rounded-lg ring-1 ring-neutral-200">
              <img src={previewUrl} alt="選択画像" className="h-auto w-full object-cover" />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <button type="button" onClick={clearFileSelection} className="text-sm font-semibold text-rose-600 hover:text-rose-700">
                画像をキャンセル
              </button>

              <div className="text-xs text-neutral-500">
                {uploading ? "アップロード中..." : imageUrl ? "アップロード済み" : "未アップロード"}
              </div>
            </div>

            {uploadError ? <p className="mt-2 text-sm font-medium text-rose-600">画像アップロード失敗：{uploadError}</p> : null}
          </div>
        ) : null}
      </section>

      {/* メッセージ */}
      {formError ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-semibold text-rose-700">{formError}</p>
        </div>
      ) : null}

      {okMsg ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-700">{okMsg}</p>
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className={[
            "inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold shadow-sm",
            canSubmit ? "bg-neutral-900 text-white hover:bg-neutral-800" : "bg-neutral-200 text-neutral-500",
          ].join(" ")}
        >
          {submitting ? "投稿中..." : "投稿する"}
        </button>

        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
        >
          TOPに戻る
        </Link>
      </div>
    </main>
  );
}