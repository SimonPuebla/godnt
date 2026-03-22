import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base, baseSepolia } from 'wagmi/chains'

/**
 * Wagmi v2 + RainbowKit v2 configuration
 *
 * Chains: Base (low fees L2) + Base Sepolia (testnet)
 * WalletConnect Project ID: free from https://cloud.walletconnect.com
 *
 * TODO: Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local
 */

export const wagmiConfig = getDefaultConfig({
  appName: 'God Debate Arena',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'YOUR_PROJECT_ID',
  chains: [base, baseSepolia],
  ssr: true,
})

// ─── USDC contract addresses per chain ───────────────────────────

export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',       // Base Mainnet USDC
  [baseSepolia.id]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia USDC
}

// Minimal ERC-20 ABI — just transfer
export const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const

// USDC has 6 decimals
export const USDC_DECIMALS = 6

// ─── Treasury wallet addresses ────────────────────────────────────
// TODO: Replace with your actual treasury wallet addresses
// These receive USDC from supporters

export const TREASURY_ADDRESSES: Record<'believer' | 'skeptic', `0x${string}`> = {
  believer: (process.env.NEXT_PUBLIC_BELIEVER_TREASURY_ADDRESS as `0x${string}`) ??
    '0x0000000000000000000000000000000000000001',
  skeptic:  (process.env.NEXT_PUBLIC_SKEPTIC_TREASURY_ADDRESS as `0x${string}`) ??
    '0x0000000000000000000000000000000000000002',
}
