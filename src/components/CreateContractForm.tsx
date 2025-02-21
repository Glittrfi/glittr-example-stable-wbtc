import { useState } from "react";
import {
  BurnMechanism,
  MBAMintMechanism,
} from "@glittr-sdk/sdk/dist/transaction/contract/mba";
import { GlittrSDK, txBuilder } from "@glittr-sdk/sdk";
import { TxResultModal } from "./TxResultModal.tsx";
import { Psbt } from "bitcoinjs-lib";
import { useLaserEyes } from "@glittr-sdk/lasereyes";

export function CreateContractForm({
  client,
}: {
  client: GlittrSDK;
}) {
  const {paymentAddress,  signPsbt, paymentPublicKey} = useLaserEyes();
  const [txid, setTxid] = useState<string | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);
  const [formData, setFormData] = useState({
    ticker: undefined,
    supply_cap: "100000",
    divisibility: 0,
    live_time: 0,
    mint_mechanism: {
      free_mint: {
        amount_per_mint: "10",
      },
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        mint_mechanism: {
          ...prev.mint_mechanism,
          [parent]: {
            // @ts-expect-error hacky way to insert previous value
            ...prev.mint_mechanism[parent],
            [child]: value,
          },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "divisibility" || name === "live_time"
            ? parseInt(value) || 0
            : value,
      }));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await createContract(formData);
  };

  const createContract = async (formData: {
    ticker: string | undefined;
    supply_cap: string | undefined;
    divisibility: number;
    live_time: number;
    mint_mechanism:
      | { free_mint: { amount_per_mint: string } }
      | MBAMintMechanism;
    amount_per_mint?: string | undefined;
    burn_mechanism?: BurnMechanism | undefined;
  }) => {
    const tx = txBuilder.contractInstantiate({
      ticker: formData.ticker,
      divisibility: formData.divisibility,
      live_time: formData.live_time,
      supply_cap: formData.supply_cap,
      mint_mechanism: {
        free_mint: {
          // @ts-expect-error amount_per_mint exist
          amount_per_mint: formData.mint_mechanism.free_mint.amount_per_mint
        }
      }
    });

    const psbt = await client.createTx({
      address: paymentAddress,
      tx,
      outputs: [],
      publicKey: paymentPublicKey,
    });

    const result = await signPsbt(psbt.toHex(), false, false);
    if (result !== undefined && !!result?.signedPsbtHex) {
      const newPsbt = Psbt.fromHex(result?.signedPsbtHex);
      newPsbt.finalizeAllInputs();
      const newHex = newPsbt.extractTransaction(true).toHex();

      try {
        const txId = await client.broadcastTx(newHex);
        setTxid(txId);
        setTxSuccess(true);
        setShowModal(true);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) {
        setTxid(undefined);
        setTxSuccess(false);
        setShowModal(true);
      }
    }
  };

   return (
    <section>
      <h1 className="text-2xl font-bold text-gray-300">Create your Token Contract</h1>
      <div className="mt-1 bg-[#0f0f11] border border-gray-700 border-rounded-md rounded-xl px-6 py-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="ticker" className="text-gray-500 block font-medium mb-2">
                Ticker
              </label>
              <input
                type="text"
                id="ticker"
                name="ticker"
                value={formData.ticker}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700/30 rounded-lg bg-[#1a1a1a] text-white focus:border-gray-700/70 outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="supply_cap" className="text-gray-500 block font-medium mb-2">
                Supply Cap
              </label>
              <input
                type="text"
                id="supply_cap"
                name="supply_cap"
                value={formData.supply_cap}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700/30 rounded-lg bg-[#1a1a1a] text-white focus:border-gray-700/70 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="divisibility" className="text-gray-500 block font-medium mb-2">
                Divisibility
              </label>
              <input
                type="number"
                id="divisibility"
                name="divisibility"
                value={formData.divisibility}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700/30 rounded-lg bg-[#1a1a1a] text-white focus:border-gray-700/70 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="live_time" className="text-gray-500 block font-medium mb-2">
                Block height at live time (default: 0)
              </label>
              <input
                type="number"
                id="live_time"
                name="live_time"
                value={formData.live_time}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700/30 rounded-lg bg-[#1a1a1a] text-white focus:border-gray-700/70 outline-none transition-colors"
                required
              />
            </div>

            <fieldset className="border border-gray-700/30 rounded-lg p-4">
              <legend className="text-sm text-gray-500 font-medium px-2">
                Mint Mechanism - Free Mint
              </legend>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="amount_per_mint"
                    className="text-gray-500 block font-medium mb-2"
                  >
                    Amount Per Mint
                  </label>
                  <input
                    type="text"
                    id="amount_per_mint"
                    name="free_mint.amount_per_mint"
                    value={formData.mint_mechanism.free_mint.amount_per_mint}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-700/30 rounded-lg bg-[#1a1a1a] text-white focus:border-gray-700/70 outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            </fieldset>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-[#1a1a1a] hover:bg-[#383838] border border-gray-700 text-white transition-colors flex items-center justify-center px-6 h-8 min-w-[100px]"
          >
            Submit
          </button>
        </form>
      </div>
      {showModal &&
        TxResultModal(
          txSuccess,
          setShowModal,
          txSuccess
            ? "Contract Creation Successful!"
            : "Contract Creation Failed",
          txSuccess
            ? "Your contract has been successfully created."
            : "There was an error while minting your token. Please try again.",
          txid
        )}
    </section>
  );
}
