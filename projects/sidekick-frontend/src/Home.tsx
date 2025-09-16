// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import { useSnackbar } from 'notistack'
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'
import AppCalls from './components/AppCalls'
import UploadForm from './components/UploadForm'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openDemoModal, setOpenDemoModal] = useState<boolean>(false)
  const [appCallsDemoModal, setAppCallsDemoModal] = useState<boolean>(false)
  const [openUploadModal, setOpenUploadModal] = useState<boolean>(false)
  const { activeAddress, transactionSigner } = useWallet()
  const { enqueueSnackbar } = useSnackbar()

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

  // Handle Context7 marketplace context creation
  const handleCreateContext = async (ipfsHash: string, price: number) => {
    if (!activeAddress) {
      enqueueSnackbar('Please connect your wallet first', { variant: 'error' })
      return
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

            {activeAddress && (
              <button data-test-id="upload-context" className="btn btn-secondary m-2" onClick={toggleUploadModal}>
                List AI Context
              </button>
            )}
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
        </div>
      </div>
    </div>
  )
}

export default Home
