import { useNavigate } from 'react-router-dom'
import { GoalForm } from '../components/goal/GoalForm'
import { useSavingsGoal } from '../hooks/useSavingsGoal'

export function GoalSettingPage() {
  const { goal, setGoal } = useSavingsGoal()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-xl font-semibold">目標設定</h1>
      <GoalForm
        initialGoal={goal}
        onSubmit={(nextGoal) => {
          setGoal(nextGoal)
          navigate('/')
        }}
      />
    </div>
  )
}
