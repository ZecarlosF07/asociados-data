const DEFAULT_ATTEMPTS = 3
const DEFAULT_DELAY_MS = 500

export async function retryAsync(
  operation,
  {
    attempts = DEFAULT_ATTEMPTS,
    delayMs = DEFAULT_DELAY_MS,
    shouldRetry = isTransientNetworkError,
  } = {}
) {
  let lastError

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (attempt >= attempts || !shouldRetry(error)) throw error
      await wait(delayMs * attempt)
    }
  }

  throw lastError
}

export function isTransientNetworkError(error) {
  const message = String(error?.message || error || '').toLowerCase()

  return (
    error?.name === 'TypeError' ||
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('name_not_resolved') ||
    message.includes('load failed')
  )
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
