export const formData = (data: Record<string, string | File>): FormData => {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    formData.set(key, value)
  })

  return formData
}
