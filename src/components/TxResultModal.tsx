import { Dispatch, SetStateAction } from "react";
import { EXPLORER } from "../constants";

export const TxResultModal = (
    isSuccess: boolean,
    setShowModal: Dispatch<SetStateAction<boolean>>,
    title: string,
    subtitle: string,
    txid: string | undefined
  ) => {
     return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-[#0f0f11] border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-xl transform transition-all">
          <div className="flex flex-col items-center text-center">
            {isSuccess ? (
              <>
                <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-300">{title}</h3>
                <p className="text-gray-400 mb-4">{subtitle}</p>
                <a
                  href={`${EXPLORER}/tx/${txid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 underline mb-4"
                >
                  View on Explorer
                </a>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-300">{title}</h3>
                <p className="text-gray-400 mb-4">{subtitle}</p>
              </>
            )}
            <button
              onClick={() => setShowModal(false)}
              className="rounded-lg bg-[#1a1a1a] hover:bg-[#383838] border border-gray-700 text-white transition-colors flex items-center justify-center text-sm px-6 h-8 min-w-[100px]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };