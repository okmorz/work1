import { Route, Routes } from 'react-router-dom'
import { RequireAuth } from './components/auth/RequireAuth'
import { AppLayout } from './components/layout/AppLayout'
import { DataProvider } from './contexts/DataContext'
import { DashboardPage } from './pages/DashboardPage'
import { ExpenseFormPage } from './pages/ExpenseFormPage'
import { ExpenseListPage } from './pages/ExpenseListPage'
import { GoalSettingPage } from './pages/GoalSettingPage'
import { GuidePage } from './pages/GuidePage'
import { IncomeFormPage } from './pages/IncomeFormPage'
import { IncomeListPage } from './pages/IncomeListPage'
import { LoginPage } from './pages/LoginPage'
import { StatsPage } from './pages/StatsPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/guide" element={<GuidePage />} />
      <Route element={<RequireAuth />}>
        <Route
          element={
            <DataProvider>
              <AppLayout />
            </DataProvider>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/expenses/new" element={<ExpenseFormPage />} />
          <Route path="/expenses/:id/edit" element={<ExpenseFormPage />} />
          <Route path="/expenses" element={<ExpenseListPage />} />
          <Route path="/income/new" element={<IncomeFormPage />} />
          <Route path="/income/:id/edit" element={<IncomeFormPage />} />
          <Route path="/income" element={<IncomeListPage />} />
          <Route path="/goal" element={<GoalSettingPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
