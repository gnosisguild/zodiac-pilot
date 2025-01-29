import { parseRouteData } from '@/utils'
import { jsonStringify } from '@zodiac/schema'
import hljs from 'highlight.js'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/atom-one-dark.min.css'
import { useParams } from 'react-router'

hljs.registerLanguage('json', json)

export const DebugRouteData = () => {
  const { data } = useParams()

  if (data == null) {
    return null
  }

  const json = hljs.highlight(jsonStringify(parseRouteData(data), 2), {
    language: 'json',
  })

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden bg-slate-800 pt-4 text-sm">
      <h2 className="px-4 uppercase opacity-80">Raw route data</h2>
      <pre className="overflow-y-auto px-4 pb-4">
        <code dangerouslySetInnerHTML={{ __html: json.value }} />
      </pre>
    </div>
  )
}
