import { useEffect, useState } from "react";
import { txBuilder, GlittrSDK, OpReturnMessage, BlockTxTuple, electrumFetchNonGlittrUtxos, BitcoinUTXO, Output, addFeeToTx } from "@glittr-sdk/sdk";
import { Psbt } from "bitcoinjs-lib";
import { TxResultModal } from "./components/TxResultModal";
import { GLITTR_API, NETWORK, WALLET_API } from "./constants";
import { useLaserEyes } from "@glittr-sdk/lasereyes";
import { networks } from "bitcoinjs-lib";
import { p2pkh } from "bitcoinjs-lib/src/payments";

const client = new GlittrSDK({
  network: NETWORK!,
  electrumApi: WALLET_API!,
  glittrApi: GLITTR_API!,
  apiKey: "",
});

type BalanceResponse = {
  balance: {
    summarized: {
      [key: string]: string;
    };
  };
  contract_info: {
    [key: string]: {
      ticker: string;
      divisibility: number;
      total_supply: string;
    };
  };
};

export default function Mint() {
  const { paymentAddress, connected, signPsbt, paymentPublicKey } =
    useLaserEyes();
  const [mintingContractId, setMintingContractId] = useState<string | null>(
    null
  );
  const [mintingBtcContractId, setMintingBtcContractId] = useState<string | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [mintStatus, setMintStatus] = useState<{
    success: boolean;
    txid?: string;
  }>({ success: false });
  const [balance, setBalance] = useState<string>("0");
  const [btcBalance, setBtcBalance] = useState<string>("0");
  const [metadata, setMetadata] = useState<{ticker: string, divisibility: number} | null>(null);
  const [btcMetadata, setBtcMetadata] = useState<{ticker: string, divisibility: number}>({
    ticker: "gBTC",
    divisibility: 8
  });

  useEffect(() => {
    const fetchBalance = async () => {
      if (paymentAddress) {
        try {
          const response = await fetch(`https://testnet-core-api.glittr.fi/helper/address/${paymentAddress}/balance`);
          const data: BalanceResponse = await response.json();
          
          // Look for asset 70868:166
          const targetAsset = "70868:166";
          const assetBalance = data.balance.summarized[targetAsset] || "0";
          const assetMetadata = data.contract_info[targetAsset];
          
          // Look for gBTC asset 70929:166
          const btcAsset = "70929:166";
          const btcAssetBalance = data.balance.summarized[btcAsset] || "0";
          const btcAssetMetadata = data.contract_info[btcAsset];
          
          if (assetMetadata) {
            setBalance(assetBalance);
            setMetadata({
              ticker: assetMetadata.ticker,
              divisibility: assetMetadata.divisibility
            });
          }

          if (btcAssetMetadata) {
            setBtcBalance(btcAssetBalance);
            setBtcMetadata({
              ticker: btcAssetMetadata.ticker,
              divisibility: btcAssetMetadata.divisibility
            });
          }
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };

    fetchBalance();
  }, [paymentAddress]);

  const handleMint = async () => {
    if (!paymentAddress || !paymentPublicKey) return;

    try {
      setMintingContractId("minting");
      const contract: BlockTxTuple = [70868, 166];

      // Get contract details
      const contractMessage = await client.getGlittrMessage(contract[0], contract[1]);
      const paytoPubkey = contractMessage.message.message.contract_creation.contract_type.mba.mint_mechanism.purchase.pay_to_key;
      const p2pkhTargetAddress = p2pkh({pubkey: Buffer.from(paytoPubkey), network: networks.testnet}).address;

      // Create mint transaction
      const tx = txBuilder.contractCall({
        contract: [contract[0], contract[1]],
        call_type: {
          mint: { pointer: 0 }
        }
      })

      const psbt = await client.createTx({
        address: paymentAddress,
        tx,
        outputs: [
          { address: paymentAddress, value: 546 },
          { address: p2pkhTargetAddress, value: 600 },
        ],
        publicKey: paymentPublicKey,
      });

      const result = await signPsbt(psbt.toHex(), false, false);
      
      if (result && result.signedPsbtHex) {
        const signedPsbt = Psbt.fromHex(result.signedPsbtHex);
        signedPsbt.finalizeAllInputs();
        const txHex = signedPsbt.extractTransaction(true).toHex();
        
        const txid = await client.broadcastTx(txHex);
        setMintStatus({ success: true, txid });
        setShowModal(true);
      }
    } catch (error) {
      console.error("Mint error:", error);
      setMintStatus({ success: false });
      setShowModal(true);
    } finally {
      setMintingContractId(null);
    }
  };

  const handleMintBtc = async () => {
    if (!paymentAddress || !paymentPublicKey) return;

    try {
      setMintingBtcContractId("minting");
      const contract: BlockTxTuple = [70929, 166];

      // Create mint transaction
      const tx = txBuilder.contractCall({
        contract: [contract[0], contract[1]],
        call_type: {
          mint: { pointer: 0 }
        }
      })

      const psbt = await client.createTx({
        address: paymentAddress,
        tx,
        outputs: [ 
          { address: paymentAddress, value: 1000 }, 
          { address: 'tb1p53z0gyfwjp5gxu4776dghkjw7hcrwznw9j8ggmz889ku2kftzhgqhvmxkd', value: 1000 } 
        ],
        publicKey: paymentPublicKey,
      });

      const result = await signPsbt(psbt.toHex(), false, false);
      
      if (result && result.signedPsbtHex) {
        const signedPsbt = Psbt.fromHex(result.signedPsbtHex);
        signedPsbt.finalizeAllInputs();
        const txHex = signedPsbt.extractTransaction(true).toHex();
        
        const txid = await client.broadcastTx(txHex);
        setMintStatus({ success: true, txid });
        setShowModal(true);
      }
    } catch (error) {
      console.error("Mint error:", error);
      setMintStatus({ success: false });
      setShowModal(true);
    } finally {
      setMintingBtcContractId(null);
    }
  };
  return (
    <div className="flex flex-col items-center min-h-screen p-8 max-w-screen overflow-x-hidden">
      {/* Containers Wrapper */}
      <div className="flex flex-row gap-4 w-full justify-center">
        {/* USDG Container */}
        <div className="w-full max-w-md bg-[#0f0f11] border border-gray-700 rounded-xl p-6">
          <div className="flex flex-col items-center space-y-6 h-full">
            <h1 className="text-2xl font-bold text-white">Buy $USDG</h1>
            <p className="text-gray-400 text-center text-sm">
              This example application demonstrates stablecoin creation using an MBA Purchase contract. While the stablecoin ratio is currently hardcoded, it can be dynamically updated using an oracle in future examples.</p>
            
            <div className="flex-grow"></div>
            
            {connected && (
              <button
                onClick={handleMint}
                disabled={!!mintingContractId}
                className="rounded-lg bg-[#1a1a1a] hover:bg-[#383838] border border-gray-700 text-white transition-colors flex items-center justify-center text-sm px-8 py-3 min-w-[200px]"
              >
                {mintingContractId
                  ? "Buying..."
                  : "Buy Stablecoin"}
              </button>
            )}

            {/* Asset Component Inside Container */}
            <div>
              <p className="font-bold text-gray-400 text-center text-sm">
                Your ${metadata?.ticker || "USDG"} balance: {balance && metadata?.divisibility 
                  ? (Number(balance) / Math.pow(10, 8)).toLocaleString('en-US', {
                      useGrouping: true
                    })
                  : "0.00"} 
              </p>
            </div>
          </div>
        </div>

        {/* gBTC Container */}
        <div className="w-full max-w-md bg-[#0f0f11] border border-gray-700 rounded-xl p-6">
          <div className="flex flex-col items-center space-y-6 h-full">
            <h1 className="text-2xl font-bold text-white">Buy $gBTC</h1>
            <p className="text-gray-400 text-center text-sm">
              Mint gBTC tokens using an MBA Purchase contract. This represents a wrapped version of Bitcoin on the Glittr network with 1:1 ratio.</p>
            
            <div className="flex-grow"></div>

            {connected && (
              <button
                onClick={handleMintBtc}
                disabled={!!mintingBtcContractId}
                className="rounded-lg bg-[#1a1a1a] hover:bg-[#383838] border border-gray-700 text-white transition-colors flex items-center justify-center text-sm px-8 py-3 min-w-[200px]"
              >
                {mintingBtcContractId
                  ? "Buying..."
                  : "Buy gBTC"}
              </button>
            )}

            {/* Asset Component Inside Container */}
            <div>
              <p className="font-bold text-gray-400 text-center text-sm">
                Your ${btcMetadata.ticker} balance: {btcBalance && btcMetadata.divisibility 
                  ? (Number(btcBalance) / Math.pow(10, 8)).toLocaleString('en-US', {
                      useGrouping: true
                    })
                  : "0.00"} 
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal &&
        TxResultModal(
          mintStatus.success,
          setShowModal,
          mintStatus.success ? "Purchase Successful!" : "Purchase Failed",
          mintStatus.success
            ? "Your token has been successfully purchased."
            : "There was an error while purchasing your token. Please try again.",
          mintStatus.txid
        )}
    </div>
  );
}
