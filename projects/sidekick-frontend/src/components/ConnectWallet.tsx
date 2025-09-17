import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import Account from './Account'

interface ConnectWalletInterface {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet = ({ openModal, closeModal }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  return (
    <div className={`arcade-modal ${openModal ? 'modal-open' : ''}`} style={{ display: openModal ? 'flex' : 'none' }}>
      <div className="arcade-modal-content pixel-border">
        <h3 className="arcade-modal-title">SELECT WALLET PROVIDER</h3>

        <div className="wallet-grid">
          {activeAddress && (
            <>
              <Account />
              <div className="arcade-divider" />
            </>
          )}

          {!activeAddress &&
            wallets?.map((wallet) => (
              <button
                data-test-id={`${wallet.id}-connect`}
                className="wallet-button pixel-border neon-glow"
                key={`provider-${wallet.id}`}
                onClick={() => {
                  return wallet.connect()
                }}
              >
                {!isKmd(wallet) && (
                  <div className="wallet-icon">
                    <img
                      alt={`wallet_icon_${wallet.id}`}
                      src={wallet.metadata.icon}
                      className="wallet-logo"
                    />
                  </div>
                )}
                <span className="wallet-name">{isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}</span>
              </button>
            ))}
        </div>

        <div className="arcade-modal-actions">
          <button
            data-test-id="close-wallet-modal"
            className="arcade-button close-button neon-glow"
            onClick={() => {
              closeModal()
            }}
          >
            CLOSE
          </button>
          {activeAddress && (
            <button
              className="arcade-button logout-button neon-glow"
              data-test-id="logout"
              onClick={async () => {
                if (wallets) {
                  const activeWallet = wallets.find((w) => w.isActive)
                  if (activeWallet) {
                    await activeWallet.disconnect()
                  } else {
                    // Required for logout/cleanup of inactive providers
                    // For instance, when you login to localnet wallet and switch network
                    // to testnet/mainnet or vice verse.
                    localStorage.removeItem('@txnlab/use-wallet:v3')
                    window.location.reload()
                  }
                }
              }}
            >
              LOGOUT
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
export default ConnectWallet
