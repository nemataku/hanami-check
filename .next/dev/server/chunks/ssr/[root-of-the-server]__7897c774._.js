module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/components/SpotForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SpotForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$browser$2d$image$2d$compression$2f$dist$2f$browser$2d$image$2d$compression$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/browser-image-compression/dist/browser-image-compression.mjs [app-ssr] (ecmascript)");
"use client";
;
;
;
const BLOOM_LABELS = [
    "つぼみ",
    "咲始め",
    "3分咲き",
    "5分咲き",
    "7分咲き",
    "満開",
    "散る"
];
const WEATHER_OPTIONS = [
    "晴れ",
    "曇り",
    "小雨",
    "雨",
    "雪"
];
// ✅ 目標は 1MB、最終ガードは 2MB
const TARGET_MB = 1;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_LABEL = "2MB";
const ALLOWED_MIME = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif"
]);
function isAllowedFile(file) {
    const t = (file.type || "").toLowerCase();
    const name = (file.name || "").toLowerCase();
    if (t && ALLOWED_MIME.has(t)) return true;
    if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return true;
    if (name.endsWith(".png")) return true;
    if (name.endsWith(".webp")) return true;
    if (name.endsWith(".heic") || name.endsWith(".heif")) return true;
    return false;
}
// URL / メール検出（ゆるめに弾く）
const URL_LIKE = /(https?:\/\/|www\.)/i;
const EMAIL_LIKE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
function commentHasForbidden(content) {
    const s = content.trim();
    if (!s) return false;
    return URL_LIKE.test(s) || EMAIL_LIKE.test(s);
}
function SpotForm() {
    const [place, setPlace] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [bloom, setBloom] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(3);
    const [weather, setWeather] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("晴れ");
    const [comment, setComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [file, setFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [previewUrl, setPreviewUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [uploadedUrl, setUploadedUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [uploadedHash, setUploadedHash] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return ()=>URL.revokeObjectURL(url);
    }, [
        file
    ]);
    const commentForbidden = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>commentHasForbidden(comment), [
        comment
    ]);
    const canSubmit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!place.trim()) return false;
        if (!Number.isInteger(bloom) || bloom < 0 || bloom > 6) return false;
        if (!WEATHER_OPTIONS.includes(weather)) return false;
        if (uploading) return false;
        // コメントの防犯（URL/メール不可）
        if (commentForbidden) return false;
        // 画像は任意。選択した場合はアップロード完了が必要
        if (file && (!uploadedUrl || !uploadedHash)) return false;
        return true;
    }, [
        place,
        bloom,
        weather,
        file,
        uploadedUrl,
        uploadedHash,
        uploading,
        commentForbidden
    ]);
    async function uploadSelectedFile(selected) {
        setUploading(true);
        setError(null);
        setUploadedUrl(null);
        setUploadedHash(null);
        try {
            const fd = new FormData();
            fd.append("file", selected);
            const res = await fetch("/api/upload", {
                method: "POST",
                body: fd
            });
            const data = await res.json().catch(()=>null);
            if (!res.ok || !data?.ok) {
                setError(data?.error ?? "upload failed");
                return;
            }
            setUploadedUrl(String(data.url));
            setUploadedHash(String(data.hash));
        } catch  {
            setError("upload failed");
        } finally{
            setUploading(false);
        }
    }
    async function compressIfNeeded(selected) {
        if (selected.size <= TARGET_MB * 1024 * 1024) return selected;
        const options = {
            maxSizeMB: TARGET_MB,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: "image/jpeg",
            initialQuality: 0.82
        };
        const compressed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$browser$2d$image$2d$compression$2f$dist$2f$browser$2d$image$2d$compression$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(selected, options);
        if (compressed.size > MAX_IMAGE_BYTES) {
            throw new Error(`圧縮後もサイズが大きすぎます（上限 ${MAX_IMAGE_LABEL}）`);
        }
        return compressed;
    }
    async function onFileChange(e) {
        const selected = e.target.files?.[0] ?? null;
        setError(null);
        setUploadedUrl(null);
        setUploadedHash(null);
        setFile(null);
        if (!selected) return;
        if (!isAllowedFile(selected)) {
            setError("対応していない画像形式です（JPEG/PNG/WebP/HEIC）");
            return;
        }
        try {
            const processed = await compressIfNeeded(selected);
            setFile(processed);
            await uploadSelectedFile(processed);
        } catch (err) {
            setError(err instanceof Error ? err.message : "画像処理に失敗しました");
        }
    }
    async function onSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            if (commentHasForbidden(comment)) {
                setError("コメントにURLやメールアドレスは入力できません");
                return;
            }
            if (file && (!uploadedUrl || !uploadedHash)) {
                setError("画像アップロードが完了していません");
                return;
            }
            const res = await fetch("/api/spots", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    place: place.trim(),
                    bloom,
                    weather,
                    comment: comment.trim() ? comment.trim() : null,
                    imageUrl: uploadedUrl,
                    imageHash: uploadedHash
                })
            });
            const data = await res.json().catch(()=>null);
            if (!res.ok || !data?.ok) {
                setError(data?.error ?? "投稿に失敗しました");
                return;
            }
            setPlace("");
            setBloom(3);
            setWeather("晴れ");
            setComment("");
            setFile(null);
            setUploadedUrl(null);
            setUploadedHash(null);
            setError(null);
        } catch  {
            setError("投稿に失敗しました");
        } finally{
            setSubmitting(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: onSubmit,
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block text-sm font-medium text-neutral-700",
                        children: "場所"
                    }, void 0, false, {
                        fileName: "[project]/src/components/SpotForm.tsx",
                        lineNumber: 224,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        value: place,
                        onChange: (e)=>setPlace(e.target.value),
                        className: "mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none",
                        placeholder: "例：上野公園"
                    }, void 0, false, {
                        fileName: "[project]/src/components/SpotForm.tsx",
                        lineNumber: 225,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/SpotForm.tsx",
                lineNumber: 223,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block text-sm font-medium text-neutral-700",
                        children: "開花状況"
                    }, void 0, false, {
                        fileName: "[project]/src/components/SpotForm.tsx",
                        lineNumber: 234,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: bloom,
                        onChange: (e)=>setBloom(Number(e.target.value)),
                        className: "mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none",
                        children: BLOOM_LABELS.map((label, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: idx,
                                children: label
                            }, label, false, {
                                fileName: "[project]/src/components/SpotForm.tsx",
                                lineNumber: 241,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/SpotForm.tsx",
                        lineNumber: 235,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/SpotForm.tsx",
                lineNumber: 233,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block text-sm font-medium text-neutral-700",
                        children: "天気"
                    }, void 0, false, {
                        fileName: "[project]/src/components/SpotForm.tsx",
                        lineNumber: 249,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: weather,
                        onChange: (e)=>setWeather(e.target.value),
                        className: "mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none",
                        children: WEATHER_OPTIONS.map((w)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: w,
                                children: w
                            }, w, false, {
                                fileName: "[project]/src/components/SpotForm.tsx",
                                lineNumber: 256,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/SpotForm.tsx",
                        lineNumber: 250,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/SpotForm.tsx",
                lineNumber: 248,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block text-sm font-medium text-neutral-700",
                        children: "コメント（任意）"
                    }, void 0, false, {
                        fileName: "[project]/src/components/SpotForm.tsx",
                        lineNumber: 264,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        value: comment,
                        onChange: (e)=>setComment(e.target.value),
                        className: "mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none",
                        rows: 3,
                        placeholder: "例：人が多いです"
                    }, void 0, false, {
                        fileName: "[project]/src/components/SpotForm.tsx",
                        lineNumber: 265,
                        columnNumber: 9
                    }, this),
                    commentForbidden ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-sm text-red-600",
                        children: "コメントにURLやメールアドレスは入力できません"
                    }, void 0, false, {
                        fileName: "[project]/src/components/SpotForm.tsx",
                        lineNumber: 273,
                        columnNumber: 11
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/SpotForm.tsx",
                lineNumber: 263,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block text-sm font-medium text-neutral-700",
                        children: "写真（任意）"
                    }, void 0, false, {
                        fileName: "[project]/src/components/SpotForm.tsx",
                        lineNumber: 280,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-xs text-neutral-500",
                        children: [
                            "JPEG / PNG / WebP / HEIC（推奨 1MB、上限 ",
                            MAX_IMAGE_LABEL,
                            "）"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/SpotForm.tsx",
                        lineNumber: 281,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "file",
                        accept: "image/*,.heic,.heif",
                        onChange: onFileChange,
                        className: "mt-2 block w-full text-sm"
                    }, void 0, false, {
                        fileName: "[project]/src/components/SpotForm.tsx",
                        lineNumber: 285,
                        columnNumber: 9
                    }, this),
                    uploading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-xs text-neutral-500",
                        children: "アップロード中..."
                    }, void 0, false, {
                        fileName: "[project]/src/components/SpotForm.tsx",
                        lineNumber: 292,
                        columnNumber: 22
                    }, this) : null,
                    !uploading && file && uploadedUrl && uploadedHash ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-xs text-neutral-500",
                        children: "アップロード完了"
                    }, void 0, false, {
                        fileName: "[project]/src/components/SpotForm.tsx",
                        lineNumber: 294,
                        columnNumber: 11
                    }, this) : null,
                    previewUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 overflow-hidden rounded-xl ring-1 ring-neutral-200",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: previewUrl,
                            alt: "プレビュー",
                            className: "h-auto w-full object-cover"
                        }, void 0, false, {
                            fileName: "[project]/src/components/SpotForm.tsx",
                            lineNumber: 299,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/SpotForm.tsx",
                        lineNumber: 298,
                        columnNumber: 11
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/SpotForm.tsx",
                lineNumber: 279,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-2xl border border-pink-200 bg-pink-50 p-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-semibold text-pink-700",
                        children: "投稿にあたっての注意"
                    }, void 0, false, {
                        fileName: "[project]/src/components/SpotForm.tsx",
                        lineNumber: 306,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-xs text-pink-700 leading-relaxed",
                        children: [
                            "本サービスでは、個人情報（氏名・連絡先等）や、人物・車のナンバー・住所が推測できるものなど",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold",
                                children: "個人が特定される可能性のある内容・画像の投稿を禁止"
                            }, void 0, false, {
                                fileName: "[project]/src/components/SpotForm.tsx",
                                lineNumber: 309,
                                columnNumber: 11
                            }, this),
                            "しています。"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/SpotForm.tsx",
                        lineNumber: 307,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/SpotForm.tsx",
                lineNumber: 305,
                columnNumber: 7
            }, this),
            error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-red-600",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/components/SpotForm.tsx",
                lineNumber: 314,
                columnNumber: 16
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "submit",
                disabled: !canSubmit || submitting,
                className: "inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50",
                children: submitting ? "投稿中..." : "投稿する"
            }, void 0, false, {
                fileName: "[project]/src/components/SpotForm.tsx",
                lineNumber: 316,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/SpotForm.tsx",
        lineNumber: 222,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7897c774._.js.map