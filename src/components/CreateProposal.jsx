import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { FiFileText, FiDollarSign, FiUser, FiAlignLeft } from 'react-icons/fi'
import { setGlobalState, useGlobalState } from '../store'
import { raiseProposal } from '../Blockchain.services'
import { toast } from 'react-toastify'

const CreateProposal = () => {
  const [createModal] = useGlobalState('createModal')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [beneficiary, setBeneficiary] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !description || !beneficiary || !amount) {
      toast.warn('Vui lòng điền đầy đủ các trường!')
      return
    }
    try {
      setLoading(true)
      await raiseProposal({ title, description, beneficiary, amount })
      toast.success('Đã tạo Proposal thành công!')
      closeModal()
    } catch (error) {
      toast.error(error?.message || 'Tạo proposal thất bại!')
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    if (loading) return
    setGlobalState('createModal', 'scale-0')
    resetForm()
  }

  const resetForm = () => {
    setTitle('')
    setAmount('')
    setBeneficiary('')
    setDescription('')
  }

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-transform duration-300 ${createModal}`}
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div className="glass-card w-full max-w-lg mx-4 p-6 animate-fade-up relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Tạo Đề xuất mới</h2>
            <p className="text-gray-500 text-xs mt-0.5">Giao dịch sẽ được ghi lên Sepolia Testnet</p>
          </div>
          <button
            onClick={closeModal}
            disabled={loading}
            className="w-8 h-8 rounded-full border border-dao-border flex items-center justify-center text-gray-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <FaTimes size={12} />
          </button>
        </div>

        <form className="space-y-4">
          {/* Title */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70">
              <FiFileText size={16} />
            </div>
            <input
              className="w-full bg-dao-bg/80 border border-dao-border focus:border-cyan-500/70 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 text-sm outline-none transition-all"
              type="text"
              placeholder="Tiêu đề đề xuất"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              required
            />
          </div>

          {/* Amount */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70">
              <FiDollarSign size={16} />
            </div>
            <input
              className="w-full bg-dao-bg/80 border border-dao-border focus:border-cyan-500/70 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 text-sm outline-none transition-all pr-16"
              type="text"
              placeholder="Số tiền (vd: 0.005)"
              onChange={(e) => setAmount(e.target.value)}
              value={amount}
              required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400/80 text-xs font-mono">ETH</span>
          </div>

          {/* Beneficiary */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70">
              <FiUser size={16} />
            </div>
            <input
              className="w-full bg-dao-bg/80 border border-dao-border focus:border-cyan-500/70 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 text-sm outline-none transition-all font-mono"
              type="text"
              placeholder="Địa chỉ ví người nhận (0x...)"
              onChange={(e) => setBeneficiary(e.target.value)}
              value={beneficiary}
              required
            />
          </div>

          {/* Description */}
          <div className="relative">
            <div className="absolute left-3 top-3 text-cyan-400/70">
              <FiAlignLeft size={16} />
            </div>
            <textarea
              className="w-full bg-dao-bg/80 border border-dao-border focus:border-cyan-500/70 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 text-sm outline-none transition-all resize-none h-24"
              placeholder="Mô tả chi tiết đề xuất của bạn..."
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              required
            />
          </div>

          {/* Info banner */}
          <div className="flex items-start space-x-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3">
            <span className="text-cyan-300 text-xs leading-relaxed">
              ℹ️ Số tiền đề xuất phải ≤ số dư hiện tại của DAO. Sau khi tạo, đề xuất sẽ mở biểu quyết trong <strong>5 phút</strong>.
            </span>
          </div>

          {/* Submit */}
          <button
            type="button"
            disabled={loading}
            className={`w-full btn-glow py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center space-x-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleSubmit}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <span>Đang xác nhận giao dịch...</span>
              </>
            ) : (
              <span>🚀 Tạo Đề xuất</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateProposal
