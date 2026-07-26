import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type Mode = 'signIn' | 'signUp'

export function LoginPage() {
  const { user, loading, signInWithPassword, signUpWithPassword } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [signedUp, setSignedUp] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const action = mode === 'signIn' ? signInWithPassword : signUpWithPassword
    const message = await action(email, password)
    setSubmitting(false)

    if (message) {
      setError(message)
      return
    }
    if (mode === 'signUp') {
      setSignedUp(true)
      return
    }
    navigate('/')
  }

  function toggleMode() {
    setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'))
    setError(null)
    setSignedUp(false)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-center text-xl font-semibold">家計簿アプリ</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg bg-white p-6 shadow-sm"
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            メールアドレス
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            パスワード
          </span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {signedUp && (
          <p className="text-sm text-green-700">
            登録しました。メール確認が有効な場合は、確認後にログインしてください。
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {mode === 'signIn' ? 'ログイン' : '新規登録'}
        </button>
      </form>

      <button
        type="button"
        onClick={toggleMode}
        className="mt-4 text-sm text-blue-600 hover:underline"
      >
        {mode === 'signIn' ? 'アカウントを作成する' : 'ログインはこちら'}
      </button>
    </div>
  )
}
