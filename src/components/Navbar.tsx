import { useState, useEffect } from "react";
import {
  useLaserEyes,
  UNISAT,
  LEATHER,
  XVERSE,
  ORANGE,
  GLITTR,
  ProviderType,
  GLITTR_DEVNET,
} from "@glittr-sdk/lasereyes";
import { NETWORK, WALLET_API } from "../constants";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState({ btc: 0, sats: 0 });
  const { connect, paymentAddress, connected, disconnect } = useLaserEyes();

  const fetchBalance = async () => {
    if (!connected) return;

    try {
      const response = await fetch(`${WALLET_API}/address/${paymentAddress}`);
      const data = await response.json();

      const funded = data.chain_stats.funded_txo_sum;
      const spent = data.chain_stats.spent_txo_sum;
      const balanceSats = funded - spent;
      const balanceBtc = balanceSats / 100000000;

      setBalance({
        btc: balanceBtc,
        sats: balanceSats,
      });
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  useEffect(() => {
    if (paymentAddress && connected) {
      fetchBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentAddress]);

  const copyAddress = () => {
    if (paymentAddress) {
      navigator.clipboard.writeText(paymentAddress);
    }
  };

  const connectWallet = (wallet: ProviderType) => {
    connect(wallet);
    setIsModalOpen(false);
  };

  return (
    <div className="overflow-x-hidden">
      <div className="p-0.5 items-center text-center bg-amber-500 text-black text-sm">
        TESTING APP: Please switch your wallet network to{" "}
        {NETWORK == "testnet" ? "testnet4" : NETWORK} manually.
      </div>
      <nav className="relative z-10 bg-[#0f0f11]/50 border-b border-gray-700/30 px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a href="/" className="text-white text-2xl font-bold">
            Glittr
          </a>

          {/* Address Dropdown */}
          {paymentAddress ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 bg-[#1a1a1a] hover:bg-[#252525] text-white px-4 py-2 rounded-lg transition-colors border border-gray-700"
              >
                <span className="font-mono text-sm">
                  {paymentAddress.slice(0, 6)}...{paymentAddress.slice(-4)}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#1a1a1a] backdrop-blur-md rounded-lg shadow-lg py-3 px-4 border border-gray-700">
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Balance:</p>
                      <div className="flex flex-col gap-1">
                        <p className="text-gray-300 font-medium">
                          {balance.btc.toFixed(4)} BTC
                        </p>
                        <p className="text-gray-400 text-sm">
                          {balance.sats.toLocaleString()} sats
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm mb-1">
                        Your Address:
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-gray-300 text-sm font-mono break-all">
                          {paymentAddress}
                        </p>
                        <button
                          onClick={copyAddress}
                          className="shrink-0 p-2 hover:bg-[#252525] rounded-lg transition-colors"
                          title="Copy address"
                        >
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => disconnect()}
                      className="rounded-lg bg-[#1a1a1a] hover:bg-[#383838] border border-gray-700 text-white transition-colors flex items-center justify-center text-sm px-6 h-8 min-w-[100px]"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-lg bg-[#1a1a1a] hover:bg-[#383838] border border-gray-700 text-white transition-colors flex items-center justify-center text-sm px-6 h-8 min-w-[100px]"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>

      {/* Modal for wallet selection */}
      {isModalOpen && (
        <div className="z-50 fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-[#1b1b1b] bg-opacity-80 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-300">Select Wallet</h2>
            <div className="space-y-2">
              <button
                onClick={() => connectWallet(GLITTR)}
                className="w-full rounded-lg bg-[#1a1a1a] hover:bg-[#383838] border border-gray-700 transition-colors  text-white p-2 "
              >
                GLITTR WALLET
              </button>
              {NETWORK != GLITTR_DEVNET && (
                <>
                  <button
                    onClick={() => connectWallet(UNISAT)}
                    className="w-full rounded-lg bg-[#1a1a1a] hover:bg-[#383838] border border-gray-700 transition-colors  text-white p-2 "
                  >
                    UNISAT
                  </button>
                  <button
                    onClick={() => connectWallet(LEATHER)}
                    className="w-full rounded-lg bg-[#1a1a1a] hover:bg-[#383838] border border-gray-700 text-white transition-colors p-2 "
                  >
                    LEATHER
                  </button>
                  <button
                    onClick={() => connectWallet(XVERSE)}
                    className="w-full rounded-lg bg-[#1a1a1a] hover:bg-[#383838] border border-gray-700 text-white transition-colors  p-2 "
                  >
                    XVERSE
                  </button>
                  <button
                    onClick={() => connectWallet(ORANGE)}
                    className="w-full rounded-lg bg-[#1a1a1a] hover:bg-[#383838] border border-gray-700 text-white transition-colors p-2"
                  >
                    ORANGE
                  </button>
                </>
              )}
            </div>
            <p className="mt-4 text-xs text-gray-200">
              To view and
              manage your Glittr assets. Install{" "}
              <a href="https://docs.glittr.fi/building-on-glittr/installing-glittr-wallet" target="_blank">
                <u>Glittr Wallet</u>
              </a>
              !
            </p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
