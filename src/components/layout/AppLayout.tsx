import { NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'ダッシュボード' },
  { to: '/expenses/new', label: '支出を記録' },
  { to: '/expenses', label: '支出一覧' },
  { to: '/goal', label: '目標設定' },
]

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <nav className="mx-auto flex max-w-3xl gap-4 overflow-x-auto px-4 py-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap text-sm font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
