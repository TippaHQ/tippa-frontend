"use client";

import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule,
  AlbedoModule,
  xBullModule,
  LobstrModule,
  HanaModule,
  RabetModule,
} from "@creit.tech/stellar-wallets-kit";

export const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: [
    new FreighterModule(),
    new AlbedoModule(),
    new xBullModule(),
    new LobstrModule(),
    new HanaModule(),
    new RabetModule(),
  ],
});
