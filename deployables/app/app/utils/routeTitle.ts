import type { CreateMetaArgs } from 'react-router/route-module'

export const routeTitle = (
  matches: CreateMetaArgs<any>['matches'],
  title: string,
) => {
  const parts = matches.reduce((result, match) => {
    if (match == null) {
      return result
    }

    return [
      ...result,
      ...match.meta.reduce((result, meta) => {
        if ('title' in meta) {
          return [...result, meta.title]
        }

        return result
      }, []),
    ]
  }, [])
}
