import { QRCodeSVG } from 'qrcode.react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CopyUrlButton } from '../components/guide/CopyUrlButton'
import { PwaInstallInstructions } from '../components/guide/PwaInstallInstructions'
import {
  APP_OVERVIEW,
  APP_URL,
  SIGNUP_STEPS,
  USAGE_STEPS,
} from '../content/guide'
import { useAuth } from '../contexts/AuthContext'

function SectionCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  )
}

export function GuidePage() {
  const { user, loading } = useAuth()
  const openAppTo = !loading && user ? '/' : '/login'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-md space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">使い方ガイド</h1>
          <CopyUrlButton />
        </div>

        <p className="text-base leading-relaxed text-gray-700">
          {APP_OVERVIEW}
        </p>

        <Link
          to={openAppTo}
          className="block w-full rounded-md bg-blue-600 px-4 py-3 text-center text-base font-semibold text-white hover:bg-blue-700"
        >
          アプリを開く
        </Link>

        <SectionCard title="アプリのURL / QRコード">
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-lg border border-gray-200 p-3">
              <QRCodeSVG value={APP_URL} size={160} />
            </div>
            <p className="break-all text-center text-sm text-gray-600">
              {APP_URL}
            </p>
          </div>
        </SectionCard>

        <SectionCard title="① アカウントを作成する">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-700">
            {SIGNUP_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard title="② ホーム画面に追加する（インストール）">
          <PwaInstallInstructions />
        </SectionCard>

        <SectionCard title="③ 基本的な使い方">
          <ol className="space-y-4">
            {USAGE_STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>

        <Link
          to={openAppTo}
          className="block w-full rounded-md bg-blue-600 px-4 py-3 text-center text-base font-semibold text-white hover:bg-blue-700"
        >
          アプリを開く
        </Link>
      </div>
    </div>
  )
}
