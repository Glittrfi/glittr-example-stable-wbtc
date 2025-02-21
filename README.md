# Glittr Freemint Minting App

This is an example application that demonstrates how to deploy and mint NFT contracts using Glittr Message. Built with React, TypeScript and Vite.

## Features

- Deploy FT Freemint smart contracts
- Mint using Glittr Message
- Show minted assets
- Connect Wallet (Glittr Wallet, Unisat, Xverse, Leather, and Orange)
- Fast development with Vite
- Modern React + TypeScript setup

## Getting Started

### Prerequisites

- Node.js
- Yarn package manager

### Installation & Running

1. Clone this repository

2. Create a .env file and add the following environment variables:

```
# testnet
VITE_PUBLIC_NETWORK=testnet
VITE_PUBLIC_GLITTR_API=https://testnet-core-api.glittr.fi
VITE_PUBLIC_WALLET_API=https://testnet-electrum.glittr.fi
VITE_PUBLIC_EXPLORER=https://testnet-explorer.glittr.fi
```

3. Install dependencies:
```bash
yarn install
```

4. Build the project:
```bash
yarn build
```

5. Start the development server:
```bash
yarn dev
```

6. Open your browser and navigate to:
```
http://localhost:5173/
```

## Usage

Use this application to:
- Deploy your own Freemint smart contracts
- Mint assets using Glittr Message
- View minted assets in your wallet address

## Development

This project uses:
- React for the frontend framework
- TypeScript for type safety
- Vite for fast development and building
- Glittr Message for NFT contract interactions

### ESLint Configuration

For production applications, we recommend enabling type-aware lint rules. See the configuration details in the project's eslint.config.js file.