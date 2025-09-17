import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { Context7MarketplaceFactory } from '../contracts/Context7Marketplace'
import { OnSchemaBreak, OnUpdate } from '@algorandfoundation/algokit-utils/types/app'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

interface AppCallsInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const AppCalls = ({ openModal, setModalState }: AppCallsInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [contractInput, setContractInput] = useState<string>('')
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({
    algodConfig,
    indexerConfig,
  })
  algorand.setDefaultSigner(transactionSigner)

  const sendAppCall = async () => {
    setLoading(true)
    if (activeAddress) {
      try {
        const factory = new Context7MarketplaceFactory({
          defaultSender: activeAddress,
          algorand,
        })

        const { result, appClient } = await factory.deploy({
          createParams: {},
          deployTimeParams: {},
          onUpdate: 'update' as any,
        })

        console.log('Deployment result:', result)
        enqueueSnackbar(`Context7 Marketplace deployed with ID: ${result.appId}`, { variant: 'success' })
        enqueueSnackbar(`Contract Address: ${appClient.appAddress}`, { variant: 'info' })
      } catch (e) {
        enqueueSnackbar('Failed to deploy marketplace', { variant: 'error' })
        console.error(e)
      }
    }
    setLoading(false)
  }

  return (
    <div className={`arcade-modal ${openModal ? 'modal-open' : ''} ${openModal ? 'modal-visible' : 'modal-hidden'}`}>
      <div className="arcade-modal-content pixel-border">
        <h3 className="arcade-modal-title">DEPLOY CONTRACT</h3>
        
        <div className="deploy-info">
          <div className="terminal-text">
            {'>'}  INITIALIZING CONTEXT7 MARKETPLACE...
          </div>
          <div className="deploy-description">
            Deploy the Context7 Marketplace smart contract to Algorand TestNet. 
            This will create a new contract instance for your AI marketplace.
          </div>
        </div>
        
        <div className="arcade-modal-actions">
          <button 
            className="arcade-button close-button neon-glow" 
            onClick={() => setModalState(!openModal)}
          >
            CANCEL
          </button>
          <button 
            className={`arcade-button deploy-button neon-glow ${loading ? 'loading' : ''}`} 
            onClick={sendAppCall}
            disabled={loading}
          >
            {loading ? 'DEPLOYING...' : 'DEPLOY CONTRACT'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppCalls
