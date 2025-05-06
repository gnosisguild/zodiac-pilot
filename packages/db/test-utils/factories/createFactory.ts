import { dbClient, type DBClient } from '@zodiac/db'

type FactoryOptions<Input, Output, BuildArgs extends Array<unknown>> = {
  build: (...data: [...BuildArgs, input?: Partial<Input>]) => Input
  create: (db: DBClient, input: Input) => Promise<Output>
  createWithoutDb: (input: Input) => Output
}

type Factory<Input, Output, BuildArgs extends Array<unknown>> = {
  createWithoutDb: (...data: [...BuildArgs, input?: Partial<Input>]) => Output
  create: (...data: [...BuildArgs, input?: Partial<Input>]) => Promise<Output>
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
