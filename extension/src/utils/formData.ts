export const formData = (
  data: Record<string, string | number | File>,
): FormData => {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.set(key, value, value.name)
    } else {
      formData.set(key, value.toString())
    }
  })

  return formData
}
