// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import { useSnackbar } from 'notistack'
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'
import AppCalls from './components/AppCalls'
import UploadForm from './components/UploadForm'
import ContextCard from './components/ContextCard'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import algosdk from 'algosdk'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openDemoModal, setOpenDemoModal] = useState<boolean>(false)
  const [appCallsDemoModal, setAppCallsDemoModal] = useState<boolean>(false)
  const [openUploadModal, setOpenUploadModal] = useState<boolean>(false)
  const [openMarketplaceModal, setOpenMarketplaceModal] = useState<boolean>(false)
  const { activeAddress, transactionSigner } = useWallet()
  const { enqueueSnackbar } = useSnackbar()

  // Demo data for ContextCard components
  const demoContexts = [
    {
      sellerAddress: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLMNOPQR',
      price: 5.5
    },
    {
      sellerAddress: 'ZYXWVUTSRQPONMLKJIHGFEDCBA098765432ZYXWVUTSRQPONMLKJ',
      price: 12.0
    },
    {
      sellerAddress: 'MNBVCXZASDFGHJKLPOIUYTREWQ135792468MNBVCXZASDFGHJKL',
      price: 3.25
    }
  ]

  // Initialize Algorand client
  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({
    algodConfig,
    indexerConfig,
  })
  algorand.setDefaultSigner(transactionSigner)

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const toggleDemoModal = () => {
    setOpenDemoModal(!openDemoModal)
  }

  const toggleAppCallsModal = () => {
    setAppCallsDemoModal(!appCallsDemoModal)
  }

  const toggleUploadModal = () => {
    setOpenUploadModal(!openUploadModal)
  }

  const toggleMarketplaceModal = () => {
    setOpenMarketplaceModal(!openMarketplaceModal)
  }

  // Handle Context7 marketplace context creation
  const handleCreateContext = async (ipfsHash: string, price: number) => {
    if (!activeAddress) {
      enqueueSnackbar('Demo mode: Simulating context creation without wallet', { variant: 'info' })
    }

    try {
      // Convert ALGO to microALGOs (1 ALGO = 1,000,000 microALGOs)
      const priceInMicroAlgos = Math.round(price * 1_000_000)
      
      console.log('Creating context with:', {
        ipfsHash,
        priceInAlgo: price,
        priceInMicroAlgos,
        activeAddress
      })

      // Note: Since we don't have the generated client yet due to Beaker dependency issues,
      // this is a placeholder implementation. Once the contract is properly built and 
      // the client is generated, this would be replaced with:
      
      // const factory = new Context7MarketplaceFactory({
      //   defaultSender: activeAddress,
      //   algorand,
      // })
      
      // const deployResult = await factory.deploy({
      //   onSchemaBreak: OnSchemaBreak.AppendApp,
      //   onUpdate: OnUpdate.AppendApp,
      // })
      
      // const { appClient } = deployResult
      
      // await appClient.optIn.createContext({
      //   args: {
      //     ipfsCid: ipfsHash,
      //     price: priceInMicroAlgos
      //   }
      // })

      // For now, we'll simulate the success
      enqueueSnackbar(`Context listed successfully! IPFS: ${ipfsHash.substring(0, 10)}... Price: ${price} ALGO`, { 
        variant: 'success' 
      })
      
      console.log('Context creation result:', {
        success: true,
        ipfsHash,
        price: priceInMicroAlgos,
        timestamp: new Date().toISOString()
      })

      setOpenUploadModal(false)
      
    } catch (error) {
      console.error('Error creating context:', error)
      enqueueSnackbar(`Error creating context: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
        variant: 'error' 
      })
    }
  }

  // Handle Context7 marketplace context purchase
  const handlePurchase = async (sellerAddress: string, price: number) => {
    if (!activeAddress) {
      enqueueSnackbar('Demo mode: Simulating context purchase without wallet', { variant: 'info' })
    }

    try {
      // Convert ALGO to microALGOs (price is already in ALGO from ContextCard)
      const priceInMicroAlgos = Math.round(price * 1_000_000)
      
      console.log('Purchasing context with:', {
        sellerAddress,
        priceInAlgo: price,
        priceInMicroAlgos,
        buyer: activeAddress
      })

      // Get suggested transaction parameters
      const suggestedParams = await algorand.client.algod.getTransactionParams().do()
      
      // Note: We need the application address - this would typically come from the deployed contract
      // For now, using a placeholder address that would be replaced with the actual app address
      const applicationAddress = 'PLACEHOLDER_APP_ADDRESS' // This should be the deployed contract address
      
      // Create payment transaction from buyer to application
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: activeAddress || 'DEMO_ADDRESS',
        receiver: applicationAddress,
        amount: priceInMicroAlgos,
        suggestedParams,
        note: new Uint8Array(Buffer.from(`Context purchase from ${sellerAddress}`))
      })

      console.log('Payment transaction created:', {
        from: activeAddress,
        to: applicationAddress,
        amount: priceInMicroAlgos,
        txnId: paymentTxn.txID()
      })

      // Note: Since we don't have the generated client yet due to Beaker dependency issues,
      // this is a placeholder implementation. Once the contract is properly built and 
      // the client is generated, this would be replaced with:
      
      // const factory = new Context7MarketplaceFactory({
      //   defaultSender: activeAddress,
      //   algorand,
      // })
      
      // const appClient = factory.getAppClientById({ appId: APP_ID })
      
      // await appClient.send.purchaseContext({
      //   args: {
      //     payment: paymentTxn,
      //     seller: { address: sellerAddress }
      //   }
      // })

      // For now, we'll simulate the success
      enqueueSnackbar(`Context purchased successfully! Seller: ${sellerAddress.substring(0, 10)}... Price: ${price} ALGO`, { 
        variant: 'success' 
      })
      
      console.log('Context purchase result:', {
        success: true,
        sellerAddress,
        price: priceInMicroAlgos,
        buyer: activeAddress,
        paymentTxnId: paymentTxn.txID(),
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('Error purchasing context:', error)
      enqueueSnackbar(`Error purchasing context: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
        variant: 'error' 
      })
    }
  }

  return (
    <div className="hero min-h-screen bg-teal-400">
      <div className="hero-content text-center rounded-lg p-6 max-w-md bg-white mx-auto">
        <div className="max-w-md">
          <h1 className="text-4xl">
            Welcome to <div className="font-bold">AlgoKit 🙂</div>
          </h1>
          <p className="py-6">
            This starter has been generated using official AlgoKit React template. Refer to the resource below for next steps.
          </p>

          <div className="grid">
            <a
              data-test-id="getting-started"
              className="btn btn-primary m-2"
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/algorandfoundation/algokit-cli"
            >
              Getting started
            </a>

            <div className="divider" />
            <button data-test-id="connect-wallet" className="btn m-2" onClick={toggleWalletModal}>
              Wallet Connection
            </button>

            {activeAddress && (
              <button data-test-id="transactions-demo" className="btn m-2" onClick={toggleDemoModal}>
                Transactions Demo
              </button>
            )}

            {activeAddress && (
              <button data-test-id="appcalls-demo" className="btn m-2" onClick={toggleAppCallsModal}>
                Contract Interactions Demo
              </button>
            )}

            <button data-test-id="upload-context" className="btn btn-secondary m-2" onClick={toggleUploadModal}>
              List AI Context {!activeAddress && '(Demo)'}
            </button>

            <button data-test-id="marketplace" className="btn btn-accent m-2" onClick={toggleMarketplaceModal}>
              Browse Marketplace {!activeAddress && '(Demo)'}
            </button>
          </div>

          <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
          <Transact openModal={openDemoModal} setModalState={setOpenDemoModal} />
          <AppCalls openModal={appCallsDemoModal} setModalState={setAppCallsDemoModal} />
          
          {/* Context Upload Modal */}
          <dialog id="upload_context_modal" className={`modal ${openUploadModal ? 'modal-open' : ''}`}>
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">List AI Context for Sale</h3>
              <UploadForm onSubmit={handleCreateContext} />
              <div className="modal-action">
                <button className="btn" onClick={toggleUploadModal}>
                  Close
                </button>
              </div>
            </div>
          </dialog>

          {/* Marketplace Modal */}
          <dialog id="marketplace_modal" className={`modal ${openMarketplaceModal ? 'modal-open' : ''}`}>
            <div className="modal-box max-w-4xl">
              <h3 className="font-bold text-lg mb-4">Context7 Marketplace</h3>
              <p className="text-sm text-gray-600 mb-6">Browse and purchase AI contexts from other developers</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {demoContexts.map((context, index) => (
                  <ContextCard
                    key={index}
                    sellerAddress={context.sellerAddress}
                    price={context.price}
                    onPurchase={handlePurchase}
                  />
                ))}
              </div>
              
              <div className="modal-action">
                <button className="btn" onClick={toggleMarketplaceModal}>
                  Close
                </button>
              </div>
            </div>
          </dialog>
        </div>
      </div>
    </div>
  )
}

export default Home
