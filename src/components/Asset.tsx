"use client";

import { useEffect, useState } from "react";
import { useLaserEyes } from "@glittr-sdk/lasereyes";
import { GLITTR_API } from "../constants";

interface Asset {
  contract_id: string;
  balance: string;
  ticker: string;
  divisibility: number;
}

export default function Asset() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const { paymentAddress, connected } = useLaserEyes();

  const fetchAssets = async () => {
    if (!connected || !paymentAddress) {
      return;
    }
    
    setLoading(true);
    try {
      const assetResponse = await fetch(
        `${GLITTR_API}/helper/address/${paymentAddress}/balance-summary`
      );
      const assetResponseData = await assetResponse.json();
      setAssets(assetResponseData.data?.length > 0 ? assetResponseData.data : []);
    } catch (error) {
      console.log(error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!connected || !paymentAddress) {
      setAssets([]);
    } else {
      fetchAssets();
    }
  }, [connected, paymentAddress]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 w-full max-w-sm mx-auto">
        <div className="flex items-center justify-between px-6 py-2">
          <h2 className="text-lg font-bold text-gray-300">Your Assets</h2>
          <button
            onClick={fetchAssets}
            disabled={loading}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        <div className="h-px w-full bg-gray-700/30 my-2"  />

        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-400"></div>
        </div>
      </div>
    );
  } else {
    return (
    <div className="flex flex-col gap-2 w-full max-w-sm mx-auto">
      <div className="flex flex-col px-4 py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-300">Your Assets</h2>

          <button
            onClick={fetchAssets}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        <div className="h-px w-full bg-gray-700/30 my-2"  />

        <div className="flex flex-wrap gap-4 mt-2">
          {assets.length > 0 ? (
            assets.map((asset, index) => (
              <div
                key={index}
                className="flex-1 min-w-[200px] bg-[#0f0f11] backdrop-blur-sm rounded-xl border border-gray-700 p-3"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-300">
                      {asset.ticker || "Unknown Token"}
                    </span>
                    <span className="px-2 py-1 text-sm font-medium text-green-100 bg-green-900/20 border-2 border-green-600/50 rounded-lg">
                      {asset.balance}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono break-all">
                    {asset.contract_id}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">
                No assets found in your wallet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
}