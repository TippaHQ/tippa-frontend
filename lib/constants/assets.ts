export interface SupportedAsset {
  id: string
  name: string
  symbol: string
  decimals: number
  contractId: string
}

export const TESTNET_ASSETS: SupportedAsset[] = [
  {
    id: "USDC",
    name: "USD Coin",
    symbol: "USDC",
    decimals: 7,
    contractId: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  },
  {
    id: "XLM",
    name: "Stellar Lumens",
    symbol: "XLM",
    decimals: 7,
    contractId: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  },
]

export const DEFAULT_ASSET_ID = "USDC"
