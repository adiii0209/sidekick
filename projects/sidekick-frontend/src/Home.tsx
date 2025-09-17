import { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import algosdk from 'algosdk'
import { Context7MarketplaceFactory } from './contracts/Context7Marketplace'
import './styles/pixel-arcade.css'

import ConnectWallet from './components/ConnectWallet'
import AppCalls from './components/AppCalls'
import UploadForm from './components/UploadForm'

interface HomeProps {
  openWalletModal: boolean
  setOpenWalletModal: (open: boolean) => void
  openDemoModal: () => void
  setIsConnected: (isConnected: boolean) => void
}

export default function Home({ openWalletModal, setOpenWalletModal, openDemoModal, setIsConnected }: HomeProps) {
  const { activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [currentView, setCurrentView] = useState<'marketplace' | 'workshop'>('marketplace')
  const [openPurchaseModal, setOpenPurchaseModal] = useState(false)
  const [selectedContext, setSelectedContext] = useState<any>(null)
  const [openAppCallsModal, setOpenAppCallsModal] = useState(false)
  const [contexts, setContexts] = useState<Array<{
    id: string
    name: string
    description: string
    price: number
    seller: string
    ipfsHash: string
  }>>([])

  const algorand = AlgorandClient.testNet()

  // Load contexts from deployed contract
  const loadContexts = async () => {
    if (!activeAddress) {
      setContexts([])
      return
    }

    try {
      const factory = new Context7MarketplaceFactory({
        defaultSender: activeAddress,
        algorand,
      })
      
      const appClient = await factory.getAppClientByCreatorAndName({
        creatorAddress: activeAddress,
        appName: 'Context7Marketplace',
      })

      // TODO: Implement reading contexts from contract global state
      // For now, start with empty array until contract is deployed and contexts are created
      setContexts([])
      
    } catch (error) {
      console.error('Error loading contexts:', error)
      // If contract doesn't exist yet, show empty state
      setContexts([])
    }
  }

  useEffect(() => {
    loadContexts()
  }, [activeAddress])

  // Handle Context7 marketplace context creation
  const handleCreateContext = async (ipfsHash: string, price: number) => {
    if (!activeAddress) {
      enqueueSnackbar('Please connect your wallet first', { variant: 'error' })
      return
    }

    try {
      const priceInMicroAlgos = Math.round(price * 1_000_000)
      
      const factory = new Context7MarketplaceFactory({
        defaultSender: activeAddress,
        algorand,
      })
      
      const appClient = await factory.getAppClientByCreatorAndName({
        creatorAddress: activeAddress,
        appName: 'Context7Marketplace',
      })

      await appClient.send.createContext({
        args: { ipfsHash, price: BigInt(priceInMicroAlgos) }
      })

      enqueueSnackbar(`Context listed successfully! IPFS: ${ipfsHash.substring(0, 10)}... Price: ${price} ALGO`, { 
        variant: 'success' 
      })
      
      await loadContexts()
    } catch (error) {
      console.error('Error creating context:', error)
      
      if (error instanceof Error && error.message.includes('has not opted in')) {
        try {
          enqueueSnackbar('First-time setup: Opting into marketplace...', { variant: 'info' })
          
          const factory2 = new Context7MarketplaceFactory({
            defaultSender: activeAddress,
            algorand,
          })
          
          const appClient2 = await factory2.getAppClientByCreatorAndName({
            creatorAddress: activeAddress,
            appName: 'Context7Marketplace',
          })
          
          await appClient2.send.optIn.bare()
          
          await appClient2.send.createContext({
            args: { ipfsHash, price: BigInt(Math.round(price * 1_000_000)) }
          })
          
          enqueueSnackbar(`Context listed successfully! IPFS: ${ipfsHash.substring(0, 10)}... Price: ${price} ALGO`, { 
            variant: 'success' 
          })
          
          await loadContexts()
          return
        } catch (optInError) {
          console.error('Error during opt-in and retry:', optInError)
          enqueueSnackbar('Failed to set up marketplace access. Please try again.', { 
            variant: 'error' 
          })
          return
        }
      }
      
      enqueueSnackbar(`Error creating context: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
        variant: 'error' 
      })
    }
  }

  // Handle Context7 marketplace context purchase
  const handlePurchase = async (sellerAddress: string, price: number) => {
    if (!activeAddress) {
      enqueueSnackbar('Please connect your wallet first', { variant: 'error' })
      return
    }

    try {
      const priceInMicroAlgos = Math.round(price * 1_000_000)
      
      const factory = new Context7MarketplaceFactory({
        defaultSender: activeAddress,
        algorand,
      })
      
      const appClient = await factory.getAppClientByCreatorAndName({
        creatorAddress: activeAddress,
        appName: 'Context7Marketplace',
      })

      const suggestedParams = await algorand.client.algod.getTransactionParams().do()
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: activeAddress,
        receiver: appClient.appAddress,
        amount: priceInMicroAlgos,
        suggestedParams,
      })

      await appClient.send.purchaseContext({
        args: { 
          seller: sellerAddress, 
          payment: paymentTxn 
        }
      })

      enqueueSnackbar(`Context purchased from ${sellerAddress.substring(0, 10)}... for ${price} ALGO`, { 
        variant: 'success' 
      })
    } catch (error) {
      console.error('Error purchasing context:', error)
      enqueueSnackbar(`Error purchasing context: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
        variant: 'error' 
      })
    }
  }

  return (
    <div className="min-h-screen">
      {/* Retro scanline effect */}
      <div className="scanline"></div>
      
      {/* Header */}
      <header className="header">
        <div className="logo">CONTEXT7</div>
        <div>
          {activeAddress ? (
            <span className="connect-wallet connected-wallet">
              {activeAddress.substring(0, 8)}...
            </span>
          ) : (
            <button className="connect-wallet neon-glow" onClick={() => setOpenWalletModal(true)}>
              CONNECT WALLET
            </button>
          )}
          <button className="deploy-btn neon-glow" onClick={() => setOpenAppCallsModal(true)}>
            DEPLOY CONTRACT
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${currentView === 'marketplace' ? 'active' : ''}`} 
          onClick={() => setCurrentView('marketplace')}
        >
          MARKETPLACE
        </button>
        <button 
          className={`nav-tab ${currentView === 'workshop' ? 'active' : ''}`} 
          onClick={() => setCurrentView('workshop')}
        >
          DEVELOPER WORKSHOP
        </button>
      </div>

      {/* Main Marketplace View */}
      {currentView === 'marketplace' && (
        <main className="marketplace">
          <h1 className="section-title">AI CARTRIDGES ARCADE</h1>
          
          <div className="cartridges-grid">
            {contexts.length > 0 ? (
              contexts.map((context) => (
                <div 
                  key={context.id} 
                  className="cartridge pixel-border" 
                  onClick={() => {
                    setSelectedContext(context)
                    setOpenPurchaseModal(true)
                  }}
                >
                  <div className="cartridge-art"></div>
                  <div className="cartridge-info">
                    <div className="developer-avatar"></div>
                    <span className="developer-name">@{context.seller.substring(0, 8)}...</span>
                  </div>
                  <div className="cartridge-name">{context.name}</div>
                  <div className="cartridge-price">{context.price} ALGO</div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-message">
                  <h3>NO CARTRIDGES FOUND</h3>
                  <p>Deploy the contract and create your first AI cartridge to get started!</p>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* Developer Workshop View */}
      {currentView === 'workshop' && (
        <div className="workshop">
          <h1 className="section-title">DEVELOPER WORKSHOP</h1>
          
          <div className="workshop-form pixel-border">
            <h2 style={{color: '#ff00ff', marginBottom: '30px', fontSize: '16px'}}>CREATE NEW AI CARTRIDGE</h2>
            
            <UploadForm onSubmit={handleCreateContext} />
          </div>
          
          <div className="my-cartridges pixel-border">
            <h3 style={{color: '#00ffff', marginBottom: '20px', fontSize: '14px'}}>MY CARTRIDGES</h3>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px'}}>
              {contexts.filter(c => c.seller === activeAddress).map((context) => (
                <div key={context.id} className="cartridge" style={{margin: 0}}>
                  <div className="cartridge-art" style={{height: '80px', background: 'linear-gradient(45deg, #ff00ff, #00ffff)'}}></div>
                  <div className="cartridge-name" style={{fontSize: '10px'}}>{context.name}</div>
                  <div className="cartridge-price" style={{fontSize: '12px'}}>{context.price} ALGO</div>
                </div>
              ))}
              
              {contexts.filter(c => c.seller === activeAddress).length === 0 && (
                <div style={{color: '#00ffff', fontSize: '12px', textAlign: 'center', gridColumn: '1 / -1'}}>
                  No cartridges created yet. Use the form above to create your first AI cartridge!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {openPurchaseModal && selectedContext && (
        <div className="modal" onClick={() => setOpenPurchaseModal(false)}>
          <div className="modal-content pixel-border" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setOpenPurchaseModal(false)}>&times;</button>
            
            <div className="modal-art" style={{
              background: `linear-gradient(45deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)})`
            }}></div>
            
            <h2 style={{color: '#ff00ff', marginBottom: '20px', fontSize: '16px'}}>
              {selectedContext.name}
            </h2>
            
            <div className="terminal-description">
              {selectedContext.description}
            </div>
            
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0'}}>
              <span style={{color: '#00ffff', fontSize: '12px'}}>DEVELOPER: @{selectedContext.seller}</span>
              <span style={{color: '#00ff41', fontSize: '16px'}}>{selectedContext.price} ALGO</span>
            </div>
            
            <button 
              className="insert-coin-btn neon-glow"
              onClick={() => {
                handlePurchase(selectedContext.seller, selectedContext.price)
                setOpenPurchaseModal(false)
              }}
            >
              INSERT COIN
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConnectWallet openModal={openWalletModal} closeModal={() => setOpenWalletModal(false)} />
      <AppCalls openModal={openAppCallsModal} setModalState={setOpenAppCallsModal} />
    </div>
  )
}
