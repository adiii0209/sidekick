import { useState } from 'react'

interface ContextCardProps {
  sellerAddress: string
  price: number // Price in ALGO
  onPurchase: (sellerAddress: string, price: number) => void
}

const ContextCard = ({ sellerAddress, price, onPurchase }: ContextCardProps) => {
  const [loading, setLoading] = useState<boolean>(false)

  // Format address for display (show first 6 and last 4 characters)
  const formatAddress = (address: string) => {
    if (address.length <= 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handlePurchase = async () => {
    setLoading(true)
    try {
      await onPurchase(sellerAddress, price)
    } catch (error) {
      console.error('Error during purchase:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card w-full bg-base-100 shadow-xl border border-gray-200">
      <div className="card-body">
        <h2 className="card-title text-lg">AI Context for Sale</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Seller:</span>
            <span 
              className="text-sm font-mono bg-gray-100 px-2 py-1 rounded"
              title={sellerAddress}
            >
              {formatAddress(sellerAddress)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Price:</span>
            <span className="text-lg font-bold text-primary">
              {price.toFixed(2)} ALGO
            </span>
          </div>
        </div>

        <div className="card-actions justify-end mt-4">
          <button 
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
            onClick={handlePurchase}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Processing...
              </>
            ) : (
              'Buy Context'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContextCard
