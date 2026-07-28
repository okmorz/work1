import { useState } from 'react'

export function CopyUrlButton() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // クリップボードAPIが使えない環境では何もしない（URLはテキストとして画面に表示済み）
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
    >
      {copied ? 'コピーしました' : 'このページのURLをコピー'}
    </button>
  )
}
