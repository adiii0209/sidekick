import React, { useState, ChangeEvent, FormEvent } from 'react'

interface FormData {
  contextContent: string
  price: string
}

interface UploadFormProps {
  onSubmit: (ipfsHash: string, price: number) => Promise<void>
}

const UploadForm: React.FC<UploadFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    contextContent: '',
    price: ''
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [ipfsHash, setIpfsHash] = useState<string>('')

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value
    }))
  }

  const uploadToIPFS = async (content: string): Promise<string> => {
    // Simulate IPFS upload for demo purposes
    // In production, you would use a real IPFS service like Pinata, Infura, or Web3.Storage
    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return mockHash
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!formData.contextContent.trim()) {
      alert('Please enter AI context content')
      return
    }
    
    const priceValue = parseFloat(formData.price)
    if (isNaN(priceValue) || priceValue <= 0) {
      alert('Please enter a valid price greater than 0')
      return
    }

    setLoading(true)
    try {
      // Upload content to IPFS
      const hash = await uploadToIPFS(formData.contextContent.trim())
      setIpfsHash(hash)
      
      // Submit to marketplace
      await onSubmit(hash, priceValue)
      
      // Reset form after successful submission
      setFormData({
        contextContent: '',
        price: ''
      })
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="upload-form-container">
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label className="form-label">
            AI Context Content
          </label>
          <textarea
            name="contextContent"
            className="form-textarea pixel-border"
            placeholder="Enter your AI context/prompt content here..."
            value={formData.contextContent}
            onChange={handleInputChange}
            required
          />
          {ipfsHash && (
            <div className="ipfs-success">
              ✅ Uploaded to IPFS: {ipfsHash}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Price (ALGO)
          </label>
          <input
            type="number"
            name="price"
            className="form-input pixel-border"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-submit">
          <button 
            type="submit" 
            className={`arcade-button ship-button neon-glow ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'UPLOADING...' : 'SHIP IT!'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UploadForm
