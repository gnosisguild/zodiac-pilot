import type { GetAnnotations } from 'react-router/internal'

export const routeTitle = (
  matches: GetAnnotations<any>['MetaArgs']['matches'],
  title: string,
) => {
  const titles = new Set<string>()

  for (const match of matches) {
    if (match == null) {
      continue
    }

    for (const meta of match.meta) {
      if ('title' in meta && typeof meta.title === 'string') {
        titles.add(meta.title)
      }
    }
  }

  return [...titles, title].join(' | ')
}
