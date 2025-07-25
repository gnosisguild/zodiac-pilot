import { vi } from 'vitest'

vi.mock('./src/dbClient', async (importOriginal) => {
  const module = await importOriginal<typeof import('./src/dbClient')>()

  const { getMockedDb } =
    await vi.importActual<typeof import('./test-utils/dbIt')>(
      './test-utils/dbIt',
    )

  return {
    ...module,

    dbClient: getMockedDb,
  }
})
