# Agent Changelog

All notable changes made by AI agents to this project will be documented in this file.

## [2026-02-19] - Stellar Wallet Integration

### Added

- `lib/stellar-kit.ts`: Initialized `StellarWalletsKit` with 6 wallet modules (Freighter, Albedo, xBull, Lobstr, Hana, Rabet).
- `providers/wallet-provider.tsx`: Created a global `WalletProvider` to handle connection state, modal triggering, and session persistence (localStorage).

### Modified

- `app/layout.tsx`: Integrated `WalletProvider` at the root level.
- `components/app-sidebar.tsx`: Updated the wallet card to show live connection status and a "Connect Wallet" button.

### Implementation Details

- **Library**: `@creit.tech/stellar-wallets-kit`
- **Network**: Set to `TESTNET` (change to `PUBLIC` in `lib/stellar-kit.ts` for production).
- **Functionality**: Shortened wallet address display, wallet name visibility, and disconnect capability.
