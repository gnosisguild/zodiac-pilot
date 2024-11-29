export const sleep = (time: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, time))

export const sleepTillIdle = () =>
  new Promise<void>((resolve) => setImmediate(() => resolve()))
