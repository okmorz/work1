import { useNavigate, useParams } from 'react-router-dom'
import { ExpenseForm } from '../components/expense/ExpenseForm'
import { useExpenses } from '../hooks/useExpenses'

export function ExpenseFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { expenses, addExpense, updateExpense } = useExpenses()
  const editingExpense = id ? expenses.find((e) => e.id === id) : undefined

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-xl font-semibold">
        {editingExpense ? '支出を編集' : '支出を記録'}
      </h1>
      <ExpenseForm
        initialExpense={editingExpense}
        onSubmit={(input) => {
          if (editingExpense) {
            updateExpense(editingExpense.id, input)
          } else {
            addExpense(input)
          }
          navigate('/expenses')
        }}
      />
    </div>
  )
}
