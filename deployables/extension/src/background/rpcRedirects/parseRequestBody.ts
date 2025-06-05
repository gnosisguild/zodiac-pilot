const decoder = new TextDecoder('utf-8')

export const parseRequestBody = (
  requestBody: chrome.webRequest.OnBeforeRequestDetails['requestBody'],
) => {
  if (requestBody == null) {
    return null
  }

  if (requestBody.raw == null) {
    return null
  }

  const [data] = requestBody.raw

  if (data == null) {
    return null
  }

  if (data.bytes == null) {
    return null
  }

  try {
    return decodeURIComponent(decoder.decode(data.bytes))
  } catch {
    return null
  }
}
