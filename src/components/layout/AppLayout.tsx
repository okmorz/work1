import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'ダッシュボード' },
  { to: '/expenses/new', label: '支出を記録' },
  { to: '/expenses', label: '支出一覧' },
  { to: '/income/new', label: '収入を記録' },
  { to: '/income', label: '収入一覧' },
  { to: '/stats', label: '支出分析' },
  { to: '/goal', label: '目標設定' },
]

export function AppLayout() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <nav className="flex gap-4 overflow-x-auto">
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
          <div className="flex shrink-0 items-center gap-3 text-xs text-gray-500">
            <span className="hidden sm:inline">{user?.email}</span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="whitespace-nowrap text-blue-600 hover:underline"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
