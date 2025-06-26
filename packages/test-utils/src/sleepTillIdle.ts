export const sleepTillIdle = async () => {
  await sleep(1)

  return new Promise<void>((resolve) =>
    setImmediate(async () => {
      await sleep(1)

      resolve()
    }),
  )
}

const sleep = (time: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, time))
