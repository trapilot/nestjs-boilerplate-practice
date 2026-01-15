import { parentPort } from 'worker_threads'

parentPort?.on('message', async (data) => {
  try {
    const [callbackFn, args] = data

    const fnName = (callbackFn as string).replace('async', '')

    const fn = new Function(`return async function ${fnName}`)()
    const result = await fn(...args)

    parentPort?.postMessage({ success: result })
  } catch (error) {
    parentPort?.postMessage({ error })
  }
})
