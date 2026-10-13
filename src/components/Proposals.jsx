import Identicon from 'react-identicons'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { truncate, useGlobalState, daysRemaining } from '../store'
import { payoutBeneficiary } from "../Blockchain.services"
import { toast } from 'react-toastify'
import { FiEye, FiClock, FiCheckCircle, FiXCircle, FiDollarSign } from 'react-icons/fi'

const Proposals = () => {
  const [data] = useGlobalState('proposals')
  const [proposals, setProposals] = useState(data)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    setProposals(data)
  }, [data])

  const getAll = () => {
    setActiveTab('all')
    setProposals(data)
  }

  const getOpened = () => {
    setActiveTab('opened')
    setProposals(
      data.filter((p) => new Date().getTime() < Number(p.duration + '000')),
    )
  }

  const getClosed = () => {
    setActiveTab('closed')
    setProposals(
      data.filter((p) => new Date().getTime() > Number(p.duration + '000')),
    )
  }

  const handlePayout = async (id) => {
    await payoutBeneficiary(id)
    toast.success('Thanh toán thành công!')
  }

  const isExpired = (duration) =>
    new Date().getTime() > Number(duration + '000')

  const tabStyle = (tab) =>
    activeTab === tab
      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold border-cyan-400 shadow-lg shadow-cyan-500/20'
      : 'bg-transparent text-gray-400 border-dao-border hover:border-cyan-500/50 hover:text-cyan-400'

  return (
    <div className="max-w-7xl mx-auto px-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Danh sách đề xuất</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {data.length} đề xuất tổng cộng
          </p>
        </div>

        {/* Tab filter */}
        <div className="flex rounded-xl overflow-hidden border border-dao-border">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'opened', label: 'Đang mở' },
            { key: 'closed', label: 'Đã đóng' },
          ].map(({ key, label }, i) => (
            <button
              key={key}
              onClick={key === 'all' ? getAll : key === 'opened' ? getOpened : getClosed}
              className={`px-4 py-2 text-xs font-semibold border transition-all duration-200 ${
                i === 0 ? '' : 'border-l-0'
              } ${tabStyle(key)}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {proposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-dao-border flex items-center justify-center mb-4">
              <FiFileText className="text-gray-500" size={24} />
            </div>
            <p className="text-gray-400 font-medium">Chưa có đề xuất nào</p>
            <p className="text-gray-600 text-sm mt-1">
              Hãy là người đầu tiên tạo đề xuất cho DAO!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-dao-border">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Người đề xuất
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Phiếu
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => {
                  const expired = isExpired(proposal.duration)
                  const passed = proposal.upvotes > proposal.downvotes
                  return (
                    <tr key={proposal.id} className="proposal-row">
                      {/* Proposer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-dao-border">
                            <Identicon
                              string={proposal.proposer.toLowerCase()}
                              size={32}
                            />
                          </div>
                          <span className="text-gray-300 font-mono text-sm">
                            {truncate(proposal.proposer, 4, 4, 11)}
                          </span>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-6 py-4">
                        <p className="text-white font-medium text-sm max-w-xs truncate">
                          {proposal.title}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5">
                          <FiDollarSign className="text-blue-400" size={14} />
                          <span className="text-blue-400 font-semibold font-mono text-sm">
                            {parseFloat(proposal.amount).toFixed(4)} ETH
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {proposal.paid ? (
                          <span className="badge badge-paid">✓ Đã trả</span>
                        ) : expired ? (
                          <span className="badge badge-closed">
                            <FiXCircle size={10} /> Đã đóng
                          </span>
                        ) : (
                          <span className="badge badge-open">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block"></span>
                            &nbsp;Đang mở · {daysRemaining(proposal.duration)}
                          </span>
                        )}
                      </td>

                      {/* Votes */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="flex items-center space-x-1 text-green-400">
                            <FiCheckCircle size={12} />
                            <span className="font-bold">{proposal.upvotes}</span>
                          </span>
                          <span className="text-gray-600">/</span>
                          <span className="flex items-center space-x-1 text-red-400">
                            <FiXCircle size={12} />
                            <span className="font-bold">{proposal.downvotes}</span>
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/proposal/${proposal.id}`}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all text-xs font-semibold"
                          >
                            <FiEye size={12} />
                            <span>Xem</span>
                          </Link>

                          {expired && passed && !proposal.paid ? (
                            <button
                              onClick={() => handlePayout(proposal.id)}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/40 transition-all text-xs font-semibold"
                            >
                              <FiDollarSign size={12} />
                              <span>Trả tiền</span>
                            </button>
                          ) : expired && proposal.paid ? (
                            <span className="badge badge-paid">Đã trả</span>
                          ) : expired && !passed ? (
                            <span className="badge badge-closed">Bị từ chối</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// eslint-disable-next-line
const FiFileText = ({ size, className }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)

export default Proposals
