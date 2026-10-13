import { useState } from 'react'
import { useGlobalState, setGlobalState } from '../store'
import { toast } from 'react-toastify'
import { performContribute } from '../Blockchain.services'
import { FiArrowUpRight, FiDollarSign, FiUsers, FiFileText } from 'react-icons/fi'
import { MdOutlineHowToVote } from 'react-icons/md'

const Banner = () => {
  const [isStakeholder] = useGlobalState('isStakeholder')
  const [proposals] = useGlobalState('proposals')
  const [balance] = useGlobalState('balance')
  const [mybalance] = useGlobalState('mybalance')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const onPropose = () => {
    if (!isStakeholder) return
    setGlobalState('createModal', 'scale-100')
  }

  const onContribute = async () => {
    if (!amount || amount === '') return
    try {
      setLoading(true)
      await performContribute(amount)
      toast.success('Đóng góp thành công!')
    } catch (e) {
      toast.error('Đóng góp thất bại!')
    } finally {
      setLoading(false)
    }
  }

  const openProposals = proposals.filter(
    (p) => new Date().getTime() < Number(p.duration + '000'),
  )

  return (
    <div className="relative overflow-hidden">
      {/* Hero background */}
      <div className="absolute inset-0 hero-grid pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-10 animate-fade-up">
          <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-cyan-400 text-xs font-semibold tracking-wider uppercase">
              Decentralized Autonomous Organization
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <span className="gradient-text">PTIT Dominion DAO</span>
          </h1>
          <p className="text-gray-400 text-base max-w-xl">
            Nền tảng quản trị phi tập trung trên mạng Sepolia — đóng góp, đề xuất và bỏ phiếu cùng cộng đồng.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-fade-up">
          <div className="stat-card">
            <div className="flex items-center space-x-2 mb-2">
              <FiDollarSign className="text-cyan-400" size={18} />
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">DAO Balance</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {parseFloat(balance || 0).toFixed(4)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">SepoliaETH</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center space-x-2 mb-2">
              <FiUsers className="text-emerald-400" size={18} />
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Của tôi</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {parseFloat(mybalance || 0).toFixed(4)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">SepoliaETH đã đóng góp</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center space-x-2 mb-2">
              <FiFileText className="text-cyan-400" size={18} />
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Đề xuất mở</span>
            </div>
            <p className="text-2xl font-bold text-white">{openProposals.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Đang cần biểu quyết</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center space-x-2 mb-2">
              <MdOutlineHowToVote className="text-emerald-400" size={18} />
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Quyền hạn</span>
            </div>
            {isStakeholder ? (
              <>
                <p className="text-lg font-bold text-emerald-400">Stakeholder</p>
                <p className="text-xs text-gray-500 mt-0.5">Có quyền đề xuất & vote</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-amber-400">Contributor</p>
                <p className="text-xs text-gray-500 mt-0.5">Cần ≥ 0.01 ETH để nâng cấp</p>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="glass-card p-6 animate-fade-up">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
            {isStakeholder ? '✅ Bạn là Stakeholder' : '⬇️ Đóng góp để trở thành Stakeholder (≥ 0.01 ETH)'}
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                step="any"
                min="0"
                className="w-full bg-dao-bg/80 border border-dao-border focus:border-cyan-500/60 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-all pr-16"
                placeholder="Nhập số ETH (vd: 0.01)"
                onChange={(e) => setAmount(e.target.value)}
                value={amount}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400/80 text-xs font-mono">ETH</span>
            </div>
            <button
              onClick={onContribute}
              disabled={loading}
              className="btn-glow px-6 py-3 rounded-xl text-white font-semibold text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
            >
              <FiArrowUpRight size={16} />
              <span>{loading ? 'Đang gửi...' : 'Contribute'}</span>
            </button>

            {isStakeholder && (
              <button
                onClick={onPropose}
                className="px-6 py-3 rounded-xl font-semibold text-sm flex items-center space-x-2 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-all whitespace-nowrap cursor-pointer"
              >
                <FiFileText size={16} />
                <span>+ Tạo Đề xuất</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Banner
