"use client";

import { useState, useEffect, useCallback } from "react";

interface OfflineDownloadProps {
  masechtaId: string;
  masechtaName: string;
  imageFolder: string;
  totalDafim: number;
  /** First daf number (usually 2) */
  firstDaf?: number;
}

export default function OfflineDownload({
  masechtaId,
  masechtaName,
  imageFolder,
  totalDafim,
  firstDaf = 2,
}: OfflineDownloadProps) {
  const [swReady, setSwReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [cached, setCached] = useState<number | null>(null);
  const [total, setTotal] = useState(0);

  // Build image URL list
  const imageUrls = Array.from(
    { length: totalDafim },
    (_, i) => `/images/${imageFolder}/daf-${firstDaf + i}.jpg`
  );

  useEffect(() => {
    setTotal(imageUrls.length);
  }, [imageUrls.length]);

  // Register service worker + check cached state
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").then(() => {
      setSwReady(true);
    });

    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (data.masechta !== masechtaId) return;

      if (data.type === "DOWNLOAD_PROGRESS") {
        setProgress({ done: data.done, total: data.total });
      }
      if (data.type === "DOWNLOAD_COMPLETE") {
        setDownloading(false);
        setCached(data.total ?? imageUrls.length);
      }
      if (data.type === "CHECK_IMAGES_RESULT") {
        setCached(data.cached);
      }
      if (data.type === "DELETE_COMPLETE") {
        setCached(0);
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);

    // Check current cache status
    navigator.serviceWorker.ready.then((reg) => {
      reg.active?.postMessage({
        type: "CHECK_IMAGES",
        masechta: masechtaId,
        imageUrls,
      });
    });

    return () => {
      navigator.serviceWorker.removeEventListener("message", handler);
    };
  }, [masechtaId, imageUrls]);

  const handleDownload = useCallback(() => {
    if (!swReady) return;
    setDownloading(true);
    setProgress({ done: 0, total: imageUrls.length });
    navigator.serviceWorker.ready.then((reg) => {
      reg.active?.postMessage({
        type: "DOWNLOAD_IMAGES",
        masechta: masechtaId,
        imageUrls,
      });
    });
  }, [swReady, masechtaId, imageUrls]);

  const handleDelete = useCallback(() => {
    if (!swReady) return;
    navigator.serviceWorker.ready.then((reg) => {
      reg.active?.postMessage({
        type: "DELETE_IMAGES",
        masechta: masechtaId,
      });
    });
  }, [swReady, masechtaId]);

  if (!swReady) return null;

  const isFullyCached = cached !== null && cached >= total;
  const estimateMB = Math.round(total * 0.85); // ~850KB per image avg

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
          <span>{isFullyCached ? "✅" : "📥"}</span>
          Offline Images
        </h3>
        {cached !== null && !downloading && (
          <span className="text-xs text-gray-400">
            {cached}/{total} cached
          </span>
        )}
      </div>

      {downloading ? (
        <div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-duo-green rounded-full transition-all duration-300"
              style={{
                width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            Downloading {progress.done}/{progress.total} images...
          </p>
        </div>
      ) : isFullyCached ? (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            All {total} images saved for offline use
          </p>
          <button
            onClick={handleDelete}
            className="text-xs text-gray-400 hover:text-duo-red transition-colors"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          onClick={handleDownload}
          className="w-full py-2.5 rounded-lg border-2 border-b-4 border-duo-blue bg-blue-50 text-duo-blue font-bold text-sm active:border-b-2 active:mt-[2px] transition-all"
        >
          Download {masechtaName} Images (~{estimateMB}MB)
        </button>
      )}
    </div>
  );
}
