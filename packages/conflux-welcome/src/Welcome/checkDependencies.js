import fileOps from '@obsidians/file-ops'
import { IpcChannel } from '@obsidians/ipc'
import instanceManager from '@obsidians/conflux-instances'
import compilerManager from '@obsidians/conflux-compiler'

export async function checkDocker () {
  const ipc = new IpcChannel()
  const result = await ipc.invoke('exec', 'docker info')
  return !result.code
}

export async function dockerVersion () {
  const ipc = new IpcChannel()
  const result = await ipc.invoke('exec', `docker -v`, { execa: true })
  if (result.code) {
    return ''
  }
  return result.logs
}

export async function startDocker () {
  const ipc = new IpcChannel()
  if (process.env.OS_IS_LINUX) {
    ipc.invoke('exec', 'sudo service docker start')
  } else if (process.env.OS_IS_WINDOWS) {
    ipc.invoke('exec', 'docker.exe')
  } else {
    ipc.invoke('exec', `open /Applications/Docker.app`)
  }
  return new Promise(resolve => {
    const h = setInterval(async () => {
      if (await checkDocker()) {
        clearInterval(h)
        resolve()
      }
    }, 500)
  })
}

export function getConfluxBinFolder () {
  return fileOps.current.path.join(fileOps.current.homePath, 'Conflux Studio', '.bin')
}

export async function checkConfluxVersion () {
  const ipc = new IpcChannel()
  const binFolder = getConfluxBinFolder()
  await fileOps.current.ensureDirectory(binFolder)
  const result = await ipc.invoke('exec', './run/conflux -V', { cwd: binFolder, execa: true })
  return !result.code && result.logs
}

export default async function checkDependencies () {
  try {
    const results = await Promise.all([
      checkDocker(),
      checkConfluxVersion(),
      instanceManager.invoke('versions').then(versions => versions[0].Tag),
      compilerManager.invoke('versions').then(versions => versions[0].Tag),
    ])
    return results.every(x => !!x)
  } catch (e) {
    return false
  }
}