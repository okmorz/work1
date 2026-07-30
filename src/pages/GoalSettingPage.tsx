import { useNavigate } from 'react-router-dom'
import { GoalForm } from '../components/goal/GoalForm'
import { ResetDataSection } from '../components/goal/ResetDataSection'
import { useData } from '../contexts/DataContext'

export function GoalSettingPage() {
  const { goal, setGoal } = useData()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div>
        <h1 className="mb-4 text-xl font-semibold">目標設定</h1>
        <GoalForm
          key={goal ? 'filled' : 'empty'}
          initialGoal={goal}
          onSubmit={(nextGoal) => {
            setGoal(nextGoal)
            navigate('/')
          }}
        />
      </div>

      <ResetDataSection />
    </div>
  )
}
