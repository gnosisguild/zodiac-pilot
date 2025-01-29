export const decode = (data: string) => JSON.parse(atob(data).toString())
