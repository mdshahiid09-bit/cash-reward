import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal, RefreshCw, Layers } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Task } from '../types'
import { TaskBadge } from '../components/common/Badge'
import { CardSkeleton } from '../components/common/Shimmer'
import { sound } from '../lib/audio'

export const Offers: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedBadge, setSelectedBadge] = useState('All')
  const [sortBy, setSortBy] = useState<'latest' | 'prize_high' | 'prize_low'>('latest')

  const fetchTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('tasks')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (err) throw err
      setTasks(data || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // Extract available categories
  const categories = useMemo(() => {
    const list = new Set<string>()
    tasks.forEach(t => {
      if (t.category) list.add(t.category)
    })
    return ['All', ...Array.from(list)]
  }, [tasks])

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        const matchesSearch =
          task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.title.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCategory =
          selectedCategory === 'All' || task.category === selectedCategory

        const matchesBadge =
          selectedBadge === 'All' ||
          (selectedBadge === 'hot' && task.badge_hot) ||
          (selectedBadge === 'exclusive' && task.badge_exclusive) ||
          (selectedBadge === 'new' && task.badge_new) ||
          (selectedBadge === 'limited' && task.badge_limited)

        return matchesSearch && matchesCategory && matchesBadge
      })
      .sort((a, b) => {
        if (sortBy === 'prize_high') return b.prize_inr - a.prize_inr
        if (sortBy === 'prize_low') return a.prize_inr - b.prize_inr
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [tasks, searchQuery, selectedCategory, selectedBadge, sortBy])

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100 mb-1">
          Available Offers
        </h1>
        <p className="text-sm text-slate-400">
          Complete verified offers below, submit your proof, and receive real wallet payouts.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search offer name or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={sortBy}
              onChange={e => {
                sound.playPop()
                setSortBy(e.target.value as 'latest' | 'prize_high' | 'prize_low')
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="latest">Latest Offers</option>
              <option value="prize_high">Highest Reward (₹)</option>
              <option value="prize_low">Lowest Reward (₹)</option>
            </select>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                sound.playPop()
                setSelectedCategory(cat)
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Badges Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 text-[11px] font-medium mr-1 uppercase">Badge:</span>
          {['All', 'hot', 'exclusive', 'new', 'limited'].map(badge => (
            <button
              key={badge}
              onClick={() => {
                sound.playPop()
                setSelectedBadge(badge)
              }}
              className={`px-3 py-1 rounded-lg font-medium capitalize transition-colors ${
                selectedBadge === badge
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
              }`}
            >
              {badge}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : error ? (
        <div className="rounded-3xl p-8 bg-slate-900 border border-rose-500/30 text-center">
          <p className="text-sm text-rose-400 mb-3">{error}</p>
          <button
            onClick={fetchTasks}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map(task => (
            <Link
              key={task.id}
              to={`/offers/${task.id}`}
              onClick={() => sound.playPop()}
              className="group p-5 rounded-3xl bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all flex items-center gap-4 shadow-md hover:shadow-emerald-500/5 hover:-translate-y-0.5"
            >
              <img
                src={task.logo_url}
                alt={task.name}
                className="w-16 h-16 rounded-2xl object-cover bg-slate-800 flex-shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  {task.badge_hot && <TaskBadge type="hot" />}
                  {task.badge_exclusive && <TaskBadge type="exclusive" />}
                  {task.badge_new && <TaskBadge type="new" />}
                  {task.badge_limited && <TaskBadge type="limited" />}
                </div>
                <h3 className="text-base font-bold text-slate-100 truncate font-heading group-hover:text-emerald-400 transition-colors">
                  {task.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                  {task.title}
                </p>
                <span className="text-[11px] font-medium text-slate-500 mt-2 block">
                  Category: {task.category}
                </span>
              </div>
              <div className="text-right flex-shrink-0 pl-2">
                <span className="text-xs text-slate-500 block leading-none">Earn</span>
                <span className="text-lg font-extrabold text-emerald-400 font-heading">
                  ₹{task.prize_inr}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl p-12 bg-slate-900/60 border border-slate-800 text-center">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300 font-heading mb-1">
            No matching offers found
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Try adjusting your search query, badge or category filters.
          </p>
          <button
            onClick={() => {
              sound.playPop()
              setSearchQuery('')
              setSelectedCategory('All')
              setSelectedBadge('All')
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
