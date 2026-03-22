/**
 * Server-side on-chain verification of USDC Transfer transactions.
 * Uses viem public clients for Base Mainnet and Base Sepolia.
 * Called by /api/messages before saving any user message.
 */

import { createPublicClient, http, parseUnits, decodeEventLog } from 'viem'
import { base, baseSepolia } from 'viem/chains'

const USDC_MAINNET = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const
const USDC_SEPOLIA = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const
const USDC_DECIMALS = 6

// Allow ±2% tolerance on amount (handles rounding in parseUnits)
const AMOUNT_TOLERANCE = 0.02

const TRANSFER_ABI = [
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
  },
] as const

function getClient(chainId: number) {
  if (chainId === base.id) {
    return {
      client: createPublicClient({ chain: base, transport: http() }),
      usdcAddress: USDC_MAINNET,
    }
  }
  if (chainId === baseSepolia.id) {
    return {
      client: createPublicClient({ chain: baseSepolia, transport: http() }),
      usdcAddress: USDC_SEPOLIA,
    }
  }
  return null
}

export interface VerifyResult {
  ok: boolean
  error?: string
}

/**
 * Verify that txHash is a confirmed USDC transfer:
 *   from: senderAddress  →  to: recipientAddress  ~= expectedUsdc
 */
export async function verifyUSDCTransfer(
  txHash: string,
  chainId: number,
  senderAddress: string,
  recipientAddress: string,
  expectedUsdc: number
): Promise<VerifyResult> {
  const network = getClient(chainId)
  if (!network) return { ok: false, error: `Unsupported chainId: ${chainId}` }

  const { client, usdcAddress } = network

  let receipt
  try {
    receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` })
  } catch {
    return { ok: false, error: 'Transaction not found or not yet confirmed' }
  }

  if (receipt.status !== 'success') {
    return { ok: false, error: 'Transaction reverted' }
  }

  // Scan logs for a Transfer event matching our criteria
  const expectedRaw = parseUnits(expectedUsdc.toFixed(USDC_DECIMALS), USDC_DECIMALS)
  const tolerance = (expectedRaw * BigInt(Math.floor(AMOUNT_TOLERANCE * 10000))) / BigInt(10000)

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== usdcAddress.toLowerCase()) continue

    try {
      const decoded = decodeEventLog({ abi: TRANSFER_ABI, data: log.data, topics: log.topics })
      if (decoded.eventName !== 'Transfer') continue

      const { from, to, value } = decoded.args as { from: string; to: string; value: bigint }

      if (from.toLowerCase() !== senderAddress.toLowerCase()) continue
      if (to.toLowerCase() !== recipientAddress.toLowerCase()) continue

      const diff = value > expectedRaw ? value - expectedRaw : expectedRaw - value
      if (diff > tolerance) continue

      return { ok: true }
    } catch {
      // log is not a Transfer event — skip
    }
  }

  return { ok: false, error: 'No matching USDC Transfer found in transaction logs' }
}
