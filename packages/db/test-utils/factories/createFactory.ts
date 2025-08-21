import { type DBClient } from '@zodiac/db'
import { getMockedDb } from '../dbIt'

type FactoryOptions<Input, Output, BuildArgs extends Array<unknown>> = {
  build: (...data: [...BuildArgs, data?: Partial<Input>]) => Input
  create: (
    db: DBClient,
    ...input: [data: Input, ...BuildArgs, data?: Partial<Input>]
  ) => Promise<Output>
  createWithoutDb: (input: Input) => Output
}

type Factory<Input, Output, BuildArgs extends Array<unknown>> = {
  createWithoutDb: (...data: [...BuildArgs, data?: Partial<Input>]) => Output
  create: (...data: [...BuildArgs, data?: Partial<Input>]) => Promise<Output>
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
      return create(getMockedDb(), build(...data), ...data)
    },
  }
}
