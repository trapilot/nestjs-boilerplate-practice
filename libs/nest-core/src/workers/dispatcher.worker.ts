export default async function ({ workerPath, payload, sharedBuffer }) {
  const mod = await import(workerPath)

  if (!mod.default) {
    throw new Error('Worker must export default function')
  }

  return mod.default(payload, sharedBuffer)
}
