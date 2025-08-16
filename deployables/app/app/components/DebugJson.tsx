import { jsonStringify } from '@zodiac/schema'
import hljs from 'highlight.js'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/atom-one-dark.min.css'

hljs.registerLanguage('json', json)

type DebugJsonProps = {
  data?: unknown
}

export const DebugJson = ({ data }: DebugJsonProps) => {
  if (data == null) {
    return null
  }

  const json = hljs.highlight(jsonStringify(data, 2), {
    language: 'json',
  })

  return (
    <div className="flex flex-1 overflow-hidden bg-slate-800 pt-4 text-sm">
      <pre className="overflow-y-auto px-4 pb-4">
        <code dangerouslySetInnerHTML={{ __html: json.value }} />
      </pre>
    </div>
  )
}
