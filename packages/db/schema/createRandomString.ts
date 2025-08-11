const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'

export const createRandomString = (length: number) => {
  const randomArray = new Uint8Array(length)

  crypto.getRandomValues(randomArray)

  return randomArray.reduce((result, number) => {
    return `${result}${chars[number % chars.length]}`
  }, '')
}
