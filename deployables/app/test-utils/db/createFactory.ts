import { dbClient, type DBClient } from '@/db'

type BuildFn<Input, BuildArgs extends Array<unknown>> = (
  ...data: [...BuildArgs, Partial<Input>] | [...BuildArgs, null]
) => Input
type CreateFn<Input, Output> = (db: DBClient, data: Input) => Promise<Output>

type CreateFactoryOptions<Input, Output, BuildArgs extends Array<unknown>> = {
  build: BuildFn<Input, BuildArgs>
  create: CreateFn<Input, Output>
}

type Factory<Input, Output, BuildArgs extends Array<unknown>> = {
  create: (
    ...data: [...BuildArgs, Partial<Input>] | [...BuildArgs]
  ) => Promise<Output>
}

export const createFactory = <
  Input,
  Output,
  BuildArgs extends Array<unknown> = [],
>({
  build,
  create,
}: CreateFactoryOptions<Input, Output, BuildArgs>): Factory<
  Input,
  Output,
  BuildArgs
> => {
  return {
    create(...data) {
      // @ts-expect-error Don't know how to fix this, but it works in user land
      return create(dbClient(), build(...data))
    },
  }
}
