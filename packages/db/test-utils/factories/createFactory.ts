import { dbClient, type DBClient } from '@zodiac/db'

type FactoryOptions<Input, Output, BuildArgs extends Array<unknown>> = {
  build: (...data: [...BuildArgs, Partial<Input>?]) => Input
  create: (db: DBClient, data: Input) => Promise<Output>
  createWithoutDb: (data: Input) => Output
}

type Factory<Input, Output, BuildArgs extends Array<unknown>> = {
  createWithoutDb: (...data: [...BuildArgs, Partial<Input>?]) => Output
  create: (...data: [...BuildArgs, Partial<Input>?]) => Promise<Output>
}

export const createFactory = <
  Input,
  Output,
  BuildArgs extends Array<unknown> = [],
>({
  build,
  create,
  createWithoutDb,
}: FactoryOptions<Input, Output, BuildArgs>): Factory<
  Input,
  Output,
  BuildArgs
> => {
  return {
    createWithoutDb(...data) {
      return createWithoutDb(build(...data))
    },
    create(...data) {
      return create(dbClient(), build(...data))
    },
  }
}
