import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function Tabs({ tabs, defaultTab = 0 }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  
  return (
    <div>
      <div className="flex border-b-4 border-black">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-6 py-3 font-bold text-sm uppercase tracking-wide transition-colors ${
              activeTab === index
                ? 'bg-black text-white border-t-4 border-t-black'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-6">
        {tabs[activeTab]?.content}
      </div>
    </div>
  )
}

export function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null)
  
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="border-4 border-black rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 font-bold"
          >
            {item.title}
            <ChevronDown className={`w-5 h-5 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
          </button>
          {openIndex === index && (
            <div className="p-4 bg-white">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function Dropdown({ trigger, items, align = 'left' }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </button>
      {isOpen && (
        <div className={`absolute top-full mt-1 ${align === 'right' ? 'right-0' : 'left-0'} bg-white border-4 border-black rounded-lg shadow-lg min-w-[200px] z-50`}>
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick?.()
                setIsOpen(false)
              }}
              className={`w-full px-4 py-2 text-left font-medium hover:bg-gray-100 flex items-center gap-2 ${
                item.danger ? 'text-red-600' : ''
              } ${index !== items.length - 1 ? 'border-b border-gray-200' : ''}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
