import fileOps from '@obsidians/file-ops'
import { IpcChannel } from '@obsidians/ipc'
import instance from '@obsidians/conflux-instances'
import compiler from '@obsidians/conflux-compiler'
import { dockerChannel } from '@obsidians/docker'

export function getConfluxBinFolder () {
  return fileOps.current.path.join(fileOps.current.homePath, 'Conflux Studio', '.bin')
}

export async function checkConfluxVersion () {
  const ipc = new IpcChannel()
  const binFolder = getConfluxBinFolder()
  await fileOps.current.ensureDirectory(binFolder)
  const result = await ipc.invoke('cp', './run/conflux -V', { cwd: binFolder })
  return !result.code && result.logs
}

export default async function checkDependencies () {
  try {
    const results = await Promise.all([
      dockerChannel.check(),
      checkConfluxVersion(),
      instance.node.installed(),
      compiler.channel.installed(),
    ])
    return results.every(x => !!x)
  } catch (e) {
    return false
  }
}