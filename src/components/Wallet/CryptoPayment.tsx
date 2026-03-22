'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseUnits } from 'viem'
import { ERC20_ABI, USDC_ADDRESSES, USDC_DECIMALS, TREASURY_ADDRESSES } from '@/lib/wagmi-config'
import { formatPrice } from '@/lib/pricing'
import { Side } from '@/lib/types'

interface CryptoPaymentProps {
  side: Side
  amountUsdc: number
  argumentContent: string
  userName: string
  isTreasury: boolean
  onSuccess: (txHash: string, amount: number) => void
}

type PaymentStatus = 'idle' | 'confirming' | 'waiting' | 'success' | 'error'

export default function CryptoPayment({
  side,
  amountUsdc,
  argumentContent,
  userName,
  isTreasury,
  onSuccess,
}: CryptoPaymentProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const usdcAddress = USDC_ADDRESSES[chainId]
  const treasuryAddress = TREASURY_ADDRESSES[side]

  const { writeContract, data: txHash } = useWriteContract()

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    onReplaced: () => setStatus('waiting'),
  })

  // When transaction is confirmed on-chain, notify parent + save to DB
  const handleTxConfirmed = async (hash: string) => {
    setStatus('waiting')
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          side,
          content: argumentContent,
          userAddress: address,
          userName: userName || 'anonymous',
          amountUsdc,
          isTreasury,
          txHash: hash,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save message')
      }

      setStatus('success')
      onSuccess(hash, amountUsdc)
    } catch (e) {
      console.error(e)
      setStatus('error')
      setErrorMsg('Payment sent but failed to save. Contact support with your tx hash.')
    }
  }

  // Watch for confirmation
  if (txHash && txConfirmed && status === 'confirming') {
    handleTxConfirmed(txHash)
  }

  const handlePay = async () => {
    if (!isConnected || !address) return
    if (!usdcAddress) {
      setErrorMsg('Switch to Base or Base Sepolia network')
      setStatus('error')
      return
    }

    setStatus('confirming')
    setErrorMsg('')

    try {
      const rawAmount = parseUnits(amountUsdc.toFixed(4), USDC_DECIMALS)

      writeContract({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [treasuryAddress, rawAmount],
      })
    } catch (e) {
      console.error(e)
      setStatus('error')
      setErrorMsg('Transaction rejected or failed.')
    }
  }

  if (!isConnected) return null

  const isDisabled = status !== 'idle' || amountUsdc <= 0

  return (
    <div className="crypto-payment">
      {status === 'error' && (
        <div className="payment-error">
          <span>{errorMsg}</span>
          <button onClick={() => setStatus('idle')} className="payment-retry">Retry</button>
        </div>
      )}

      {txHash && (status === 'confirming' || status === 'waiting') && (
        <div className="payment-pending">
          <span className="payment-pending-dot" />
          Waiting for confirmation...
          <a
            className="payment-tx-link"
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View tx ↗
          </a>
        </div>
      )}

      {status === 'success' && (
        <div className="payment-success">
          ✓ {isTreasury ? 'Treasury funded' : 'Argument sent to agent'} — {formatPrice(amountUsdc)} USDC
        </div>
      )}

      {(status === 'idle' || status === 'error') && (
        <button
          className={`submit-btn ${side}`}
          onClick={handlePay}
          disabled={isDisabled}
        >
          {isTreasury
            ? `Fund treasury — ${formatPrice(amountUsdc)} USDC`
            : `Pay & submit — ${formatPrice(amountUsdc)} USDC`}
        </button>
      )}
    </div>
  )
}
