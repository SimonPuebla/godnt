'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
            })}
          >
            {!connected ? (
              <button className="wallet-btn" onClick={openConnectModal} type="button">
                Connect Wallet
              </button>
            ) : chain.unsupported ? (
              <button className="wallet-btn wallet-btn-error" onClick={openChainModal} type="button">
                Wrong network
              </button>
            ) : (
              <div className="wallet-connected">
                <button className="wallet-chain-btn" onClick={openChainModal} type="button">
                  {chain.hasIcon && chain.iconUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={chain.iconUrl} alt={chain.name} className="chain-icon" />
                  )}
                  {chain.name}
                </button>
                <button className="wallet-account-btn" onClick={openAccountModal} type="button">
                  {account.displayName}
                </button>
              </div>
            )}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
