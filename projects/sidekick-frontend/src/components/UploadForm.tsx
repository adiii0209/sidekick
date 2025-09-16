import { useState, ChangeEvent, FormEvent } from 'react'

interface UploadFormProps {
  onSubmit: (ipfsHash: string, price: number) => void
}

interface FormData {
  ipfsHash: string
  price: string
}

const UploadForm = ({ onSubmit }: UploadFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    ipfsHash: '',
    price: ''
  })
  const [loading, setLoading] = useState<boolean>(false)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!formData.ipfsHash.trim()) {
      alert('Please enter an IPFS hash')
      return
    }
    
    const priceValue = parseFloat(formData.price)
    if (isNaN(priceValue) || priceValue <= 0) {
      alert('Please enter a valid price greater than 0')
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData.ipfsHash.trim(), priceValue)
      // Reset form after successful submission
      setFormData({
        ipfsHash: '',
        price: ''
      })
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card w-full max-w-md bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-center">List AI Context for Sale</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">IPFS Hash</span>
            </label>
            <textarea
              name="ipfsHash"
              className="textarea textarea-bordered h-24 resize-none"
              placeholder="Enter the IPFS hash of your AI context..."
              value={formData.ipfsHash}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Price (ALGO)</span>
            </label>
            <input
              type="number"
              name="price"
              className="input input-bordered"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-control mt-6">
            <button 
              type="submit" 
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Listing Context...
                </>
              ) : (
                'List Context'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadForm
