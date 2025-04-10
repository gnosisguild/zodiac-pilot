import { dbClient, type DBClient } from '@/db'

type FactoryOptions<Input, Output, BuildArgs extends Array<unknown>> = {
  build: (...data: [...BuildArgs, Partial<Input>?]) => Input
  create: (db: DBClient, data: Input) => Promise<Output>
}

type Factory<Input, Output, BuildArgs extends Array<unknown>> = {
  create: (...data: [...BuildArgs, Partial<Input>?]) => Promise<Output>
}

export const createFactory = <
  Input,
  Output,
  BuildArgs extends Array<unknown> = [],
>({
  build,
  create,
}: FactoryOptions<Input, Output, BuildArgs>): Factory<
  Input,
  Output,
  BuildArgs
> => {
  return {
    create(...data) {
      return create(dbClient(), build(...data))
    },
  }
}
