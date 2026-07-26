import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { ExpenseFormPage } from './pages/ExpenseFormPage'
import { ExpenseListPage } from './pages/ExpenseListPage'
import { GoalSettingPage } from './pages/GoalSettingPage'
import { LoginPage } from './pages/LoginPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/expenses/new" element={<ExpenseFormPage />} />
        <Route path="/expenses" element={<ExpenseListPage />} />
        <Route path="/goal" element={<GoalSettingPage />} />
      </Route>
    </Routes>
  )
}

export default App
