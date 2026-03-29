import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'

export default function SearchFilter({
  onSearch,
  onFilter,
  filters = [],
  placeholder = 'Search...'
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState({})

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch?.(value)
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value }
    setActiveFilters(newFilters)
    onFilter?.(newFilters)
  }

  const clearFilters = () => {
    setActiveFilters({})
    setSearchTerm('')
    onFilter?.({})
    onSearch?.('')
  }

  const hasActiveFilters = Object.values(activeFilters).some(v => v)

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 border-2 border-black rounded-lg hover:bg-gray-100 flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <div key={filter.key} className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={activeFilters[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="px-3 py-1 border-2 border-black rounded-lg text-sm"
              >
                <option value="">{filter.label}</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
