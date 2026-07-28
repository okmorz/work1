import { useNavigate, useParams } from 'react-router-dom'
import { IncomeForm } from '../components/income/IncomeForm'
import { useData } from '../contexts/DataContext'

export function IncomeFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { incomes, addIncome, updateIncome } = useData()
  const editingIncome = id ? incomes.find((i) => i.id === id) : undefined

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-xl font-semibold">
        {editingIncome ? '収入を編集' : '収入を記録'}
      </h1>
      <IncomeForm
        initialIncome={editingIncome}
        onSubmit={(input) => {
          if (editingIncome) {
            updateIncome(editingIncome.id, input)
          } else {
            addIncome(input)
          }
          navigate('/income')
        }}
      />
    </div>
  )
}
