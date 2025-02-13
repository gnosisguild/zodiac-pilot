const VISIBLE_START = 4
const VISIBLE_END = 4

export const shortenAddress = (address: string): string => {
  const start = address.substring(0, VISIBLE_START + 2)
  const end = address.substring(42 - VISIBLE_END, 42)

  return `${start}...${end}`
}
