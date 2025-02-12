import type { MetaTransactionRequest } from '@zodiac/schema'
import {
  afterEach,
  assert,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from 'vitest'
import { getStorageEntry, saveStorageEntry } from '../../utils'
import { recordCalls } from './roles'

// Use Vitest's mocking API to mock the storage utilities.
vi.mock('../../utils', () => ({
  getStorageEntry: vi.fn(),
  saveStorageEntry: vi.fn(),
}))

// Grab strongly typed mocked functions
const mockedGetStorageEntry = vi.mocked(getStorageEntry, true)
const mockedSaveStorageEntry = vi.mocked(saveStorageEntry, true)

const testTransaction: MetaTransactionRequest = {
  to: `0x0000000000000000000000000000000000000000`,
  data: '0x',
  value: 0n,
  operation: 0,
}

describe('recordCalls', () => {
  let fetchMock: Mock

  beforeEach(() => {
    // Stub the global fetch with a Vitest mock.
    fetchMock = vi.fn()
    globalThis.fetch = fetchMock
  })

  afterEach(() => {
    // Reset all mocks after each test.
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('posts to the endpoint for a new record if no storage entry exists for the role', async () => {
    // Arrange: simulate that no record exists.
    mockedGetStorageEntry.mockResolvedValue({})

    // Prepare a fake record returned by the Roles app.
    const fakeRecord = { id: 'record1', authToken: 'secretToken' }

    // Configure the fetch mock to return a response with our fake record.
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeRecord,
    })

    // Act: call recordCalls.
    await recordCalls([testTransaction], {
      rolesMod: 'eth:0x0000000000000000000000000000000000000000',
      roleKey: 'my-role',
    })

    // Assert: Verify that fetch was called once with the URL for creating a new record.
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.ROLES_APP_URL}/api/records`,
      expect.anything(),
    )

    // Finally, assert that saveStorageEntry was called to persist the new record.
    expect(mockedSaveStorageEntry).toHaveBeenCalledTimes(1)
    expect(mockedSaveStorageEntry).toHaveBeenCalledWith({
      key: 'role-records',
      value: {
        'eth:0x0000000000000000000000000000000000000000:my-role': fakeRecord,
      },
    })
  })

  it('uses stored record id and auth token for subsequent calls', async () => {
    // Arrange: simulate that a stored record exists.
    const existingRecord = {
      id: 'existingRecordId',
      authToken: 'existingToken',
    }
    mockedGetStorageEntry.mockResolvedValue({
      'eth:0x0000000000000000000000000000000000000000:my-role': existingRecord,
    })

    // Configure the fetch mock to return a successful response.
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    // Act: call recordCalls.
    await recordCalls([testTransaction], {
      rolesMod: 'eth:0x0000000000000000000000000000000000000000',
      roleKey: 'my-role',
    })

    // Assert that the correct endpoint is used for subsequent calls.
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.ROLES_APP_URL}/api/records/existingRecordId/calls`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer existingToken',
          'Content-Type': 'application/json',
        }),
      }),
    )

    // Assert that saveStorageEntry was not called, since this is a subsequent call.
    expect(mockedSaveStorageEntry).not.toHaveBeenCalled()
  })

  it('batches 3 concurrent invocations into 2 serial fetch requests', async () => {
    // Setup getStorageEntry so that:
    // - First call returns empty storage (forcing record creation)
    // - Subsequent calls return storage with the created record
    mockedGetStorageEntry.mockResolvedValueOnce({}).mockResolvedValue({
      'eth:0x0000000000000000000000000000000000000000:my-role': {
        id: 'newRecord',
        authToken: 'newAuthToken',
      },
    })

    // Create a deferred for the first fetch call.
    const { resolve: resolveFetchCall1, promise: fetchCall1Promise } =
      Promise.withResolvers()

    // The first fetch call is for recordInitialCalls.
    fetchMock.mockImplementationOnce(() => fetchCall1Promise)

    // The second fetch call (for recordSubsequentCalls) resolves immediately.
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    // Act:
    // Invoke recordCalls concurrently.
    const p1 = recordCalls([testTransaction], {
      rolesMod: 'eth:0x0000000000000000000000000000000000000000',
      roleKey: 'my-role',
    })
    const p2 = recordCalls([testTransaction], {
      rolesMod: 'eth:0x0000000000000000000000000000000000000000',
      roleKey: 'my-role',
    })
    const p3 = recordCalls([testTransaction], {
      rolesMod: 'eth:0x0000000000000000000000000000000000000000',
      roleKey: 'my-role',
    })

    // Allow a tick so that all invocations are registered in the queue.
    await Promise.resolve()

    // Now, resolve the first fetch call simulating the record creation response.
    assert(resolveFetchCall1)
    resolveFetchCall1({
      ok: true,
      json: async () => ({ id: 'newRecord', authToken: 'newAuthToken' }),
    })

    // Wait for all recordCalls calls to complete.
    await Promise.all([p1, p2, p3])

    // Assert:
    // There should have been exactly 2 fetch calls.
    expect(fetchMock).toHaveBeenCalledTimes(2)

    // The first fetch call should be to create a new record.
    expect(fetchMock.mock.calls[0][0]).toBe(
      `${process.env.ROLES_APP_URL}/api/records`,
    )

    // The second fetch call should use the stored record's details,
    // batching the transactions from the second and third invocations.
    expect(fetchMock.mock.calls[1][0]).toBe(
      `${process.env.ROLES_APP_URL}/api/records/newRecord/calls`,
    )
    const secondCallBody = JSON.parse(fetchMock.mock.calls[1][1]?.body)
    expect(secondCallBody).toHaveLength(2)
  })
})
