import Identicon from 'react-identicons'
import moment from 'moment'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { truncate } from '../store'
import { listVoters } from '../Blockchain.services'
import { FiCheckCircle, FiXCircle } from 'react-icons/fi'

const Voters = () => {
  const [voters, setVoters] = useState([])
  const [data, setData] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const { id } = useParams()
  const timeAgo = (timestamp) => moment(Number(timestamp + '000')).fromNow()

  useEffect(() => {
    const fetchVotes = async () => {
      await listVoters(id).then((res) => {
        setVoters(res || [])
        setData(res || [])
      })
    }
    fetchVotes()
  }, [id])

  const getAll = () => {
    setActiveTab('all')
    setVoters(data)
  }

  const getAccepted = () => {
    setActiveTab('accepted')
    setVoters(data.filter((vote) => vote.choosen))
  }

  const getRejected = () => {
    setActiveTab('rejected')
    setVoters(data.filter((vote) => !vote.choosen))
  }

  const tabStyle = (tab) =>
    activeTab === tab
      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
      : 'bg-transparent text-gray-400 border-dao-border hover:border-cyan-500/50 hover:text-cyan-400'

  return (
    <div className="flex flex-col p-6 glass-card mt-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Lịch sử người biểu quyết</h3>
          <p className="text-gray-500 text-xs mt-0.5">{data.length} lượt biểu quyết đã ghi nhận</p>
        </div>

        <div className="flex rounded-xl overflow-hidden border border-dao-border">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'accepted', label: 'Đồng ý' },
            { key: 'rejected', label: 'Từ chối' },
          ].map(({ key, label }, i) => (
            <button
              key={key}
              onClick={key === 'all' ? getAll : key === 'accepted' ? getAccepted : getRejected}
              className={`px-4 py-2 text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                i === 0 ? '' : 'border-l-0'
              } ${tabStyle(key)}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-dao-border">
              <th className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3 text-left">
                Người biểu quyết
              </th>
              <th className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3 text-left">
                Thời gian
              </th>
              <th className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3 text-left">
                Lựa chọn
              </th>
            </tr>
          </thead>
          <tbody>
            {voters.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-8 text-gray-500 text-sm">
                  Chưa có lượt biểu quyết nào trong mục này
                </td>
              </tr>
            ) : (
              voters.map((voter, i) => (
                <tr
                  key={i}
                  className="border-b border-dao-border/60 hover:bg-cyan-500/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-cyan-500/30">
                        <Identicon
                          string={voter.voter.toLowerCase()}
                          size={32}
                        />
                      </div>
                      <span className="font-mono text-sm text-gray-300">
                        {truncate(voter.voter, 4, 4, 11)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                    {timeAgo(voter.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {voter.choosen ? (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <FiCheckCircle size={12} />
                        <span>Đồng ý</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        <FiXCircle size={12} />
                        <span>Từ chối</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Voters
