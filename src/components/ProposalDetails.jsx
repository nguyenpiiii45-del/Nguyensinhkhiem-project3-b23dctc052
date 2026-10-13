import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getProposal, voteOnProposal } from '../Blockchain.services'
import { useGlobalState, daysRemaining, truncate } from '../store'
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiClock, FiDollarSign, FiUser } from 'react-icons/fi'
import Identicon from 'react-identicons'

const ProposalDetails = () => {
  const { id } = useParams()
  const [proposal, setProposal] = useState(null)
  const [data, setData] = useState([])
  const [isStakeholder] = useGlobalState('isStakeholder')
  const [voting, setVoting] = useState(false)

  useEffect(() => {
    retrieveProposal()
  }, [id])

  const retrieveProposal = async () => {
    await getProposal(id).then((res) => {
      setProposal(res)
      setData([
        {
          name: 'Biểu quyết',
          'Đồng ý': res?.upvotes,
          'Từ chối': res?.downvotes,
        },
      ])
    })
  }

  const onVote = async (choice) => {
    if (!proposal) return
    if (new Date().getTime() > Number(proposal.duration + '000')) {
      toast.warning('Thời gian biểu quyết của Proposal này đã kết thúc!')
      return
    }
    try {
      setVoting(true)
      await voteOnProposal(id, choice)
      toast.success('Bình chọn thành công!')
    } catch (error) {
      if (error?.message?.includes('Double voting')) {
        toast.error('Bạn đã từng biểu quyết cho đề xuất này rồi!')
      } else if (error?.message?.includes('Unauthorized')) {
        toast.error('Chỉ Stakeholder mới có quyền biểu quyết!')
      } else {
        toast.error(error?.message || 'Biểu quyết thất bại!')
      }
    } finally {
      setVoting(false)
    }
  }

  const isExpired = proposal && new Date().getTime() > Number(proposal.duration + '000')
  const totalVotes = Number(proposal?.upvotes || 0) + Number(proposal?.downvotes || 0)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="glass-card px-4 py-3 text-sm">
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center space-x-2">
              <span style={{ color: entry.color }} className="font-bold">{entry.name}:</span>
              <span className="text-white font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-gray-400 hover:text-cyan-400 text-sm mb-6 transition-colors group"
      >
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        <span>Quay lại danh sách</span>
      </Link>

      {!proposal ? (
        <div className="glass-card p-12 text-center">
          <div className="shimmer w-32 h-8 rounded mx-auto mb-4"></div>
          <div className="shimmer w-64 h-4 rounded mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-up">
          {/* Title card */}
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  {isExpired ? (
                    <span className="badge badge-closed">Đã đóng</span>
                  ) : (
                    <span className="badge badge-open">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block"></span>
                      &nbsp;Đang mở
                    </span>
                  )}
                  {proposal.paid && <span className="badge badge-paid">Đã thanh toán</span>}
                  <span className="badge" style={{ background: 'rgba(6,182,212,0.15)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.35)' }}>
                    Proposal #{id}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{proposal.title}</h1>
                <p className="text-gray-400 leading-relaxed">{proposal.description}</p>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <div className="stat-card text-right">
                  <div className="flex items-center justify-end space-x-1 mb-1">
                    <FiDollarSign className="text-cyan-400" size={14} />
                    <span className="text-xs text-gray-500">Số tiền đề xuất</span>
                  </div>
                  <p className="text-2xl font-bold gradient-text">
                    {parseFloat(proposal.amount).toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-500">ETH</p>
                </div>
                {!isExpired && (
                  <div className="flex items-center space-x-1.5 text-xs text-amber-400">
                    <FiClock size={12} />
                    <span>Còn {daysRemaining(proposal.duration)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Meta info */}
            <div className="mt-4 pt-4 border-t border-dao-border flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-dao-border">
                  <Identicon string={proposal.proposer?.toLowerCase() || '0x'} size={28} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Người đề xuất</p>
                  <p className="text-gray-300 font-mono text-xs">{truncate(proposal.proposer, 6, 4, 13)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-dao-border">
                  <Identicon string={proposal.beneficiary?.toLowerCase() || '0x'} size={28} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Người nhận</p>
                  <p className="text-gray-300 font-mono text-xs">{truncate(proposal.beneficiary, 6, 4, 13)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Votes chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-1">Kết quả biểu quyết</h3>
            <p className="text-gray-500 text-sm mb-6">{totalVotes} phiếu bầu</p>

            {/* Vote bar visual */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span className="flex items-center space-x-1"><FiCheckCircle className="text-emerald-400" /><span>Đồng ý: {proposal.upvotes}</span></span>
                <span className="flex items-center space-x-1"><FiXCircle className="text-rose-400" /><span>Từ chối: {proposal.downvotes}</span></span>
              </div>
              <div className="w-full h-3 bg-dao-border rounded-full overflow-hidden">
                {totalVotes > 0 && (
                  <div
                    className="h-full bg-accent-gradient rounded-full transition-all duration-700"
                    style={{ width: `${(proposal.upvotes / totalVotes) * 100}%` }}
                  />
                )}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,46,77,0.8)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                <Bar dataKey="Đồng ý" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Từ chối" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Vote actions */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-1">Biểu quyết của bạn</h3>
            {isExpired ? (
              <p className="text-gray-500 text-sm">Thời gian biểu quyết đã kết thúc.</p>
            ) : isStakeholder ? (
              <>
                <p className="text-gray-400 text-sm mb-4">Bạn là Stakeholder — hãy biểu quyết cho đề xuất này!</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={voting}
                    onClick={() => onVote(true)}
                    className="flex-1 min-w-0 flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold text-sm bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30 transition-all disabled:opacity-50"
                  >
                    {voting ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    ) : <FiCheckCircle size={16} />}
                    <span>{voting ? 'Đang gửi...' : '👍 Đồng ý (Accept)'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={voting}
                    onClick={() => onVote(false)}
                    className="flex-1 min-w-0 flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold text-sm bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 transition-all disabled:opacity-50"
                  >
                    {voting ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    ) : <FiXCircle size={16} />}
                    <span>{voting ? 'Đang gửi...' : '👎 Từ chối (Reject)'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-start space-x-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <span className="text-amber-400 text-xl mt-0.5">⚠️</span>
                <div>
                  <p className="text-amber-400 font-semibold text-sm">Bạn chưa có quyền biểu quyết</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Để biểu quyết, bạn cần là <strong className="text-white">Stakeholder</strong>. Hãy quay về trang chủ và đóng góp tối thiểu <strong className="text-white">0.01 ETH</strong> vào DAO.
                  </p>
                  <Link to="/" className="inline-flex items-center space-x-1 text-blue-400 text-xs mt-2 hover:underline">
                    <FiArrowLeft size={12} />
                    <span>Về trang chủ</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProposalDetails
