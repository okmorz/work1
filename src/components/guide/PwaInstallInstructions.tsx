import { useState } from 'react'
import { PWA_INSTALL_GUIDES } from '../../content/guide'

export function PwaInstallInstructions() {
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios')
  const guide = PWA_INSTALL_GUIDES.find((g) => g.platform === platform)!

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {PWA_INSTALL_GUIDES.map((g) => (
          <button
            key={g.platform}
            type="button"
            onClick={() => setPlatform(g.platform)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${
              platform === g.platform
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <p className="mb-3 text-sm text-gray-500">{guide.browserNote}</p>

      <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm text-gray-700">
        {guide.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {guide.screenshots.map((shot) => (
          <img
            key={shot.src}
            src={shot.src}
            alt={shot.alt}
            className="w-32 shrink-0 rounded-lg border border-gray-200 sm:w-40"
          />
        ))}
      </div>
    </div>
  )
}
