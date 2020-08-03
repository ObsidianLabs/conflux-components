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
  const result = await ipc.invoke('cp', `docker -v`)
  if (result.code) {
    return ''
  }
  return result.logs
}

export async function startDocker () {
  const ipc = new IpcChannel()
  if (process.env.OS_IS_MAC) {
    ipc.invoke('exec', `open /Applications/Docker.app`)
  } else if (process.env.OS_IS_LINUX) {
    return false
  } else {
    // Try to start Docker Toolbox
    const toolboxResult = await ipc.invoke('cp', 'docker-machine start')
    if (toolboxResult.code) {
      // Get Docker Desktop path
      const pathResult = await ipc.invoke('cp', '(Get-Command docker).Path')
      const desktopPath = pathResult?.logs?.replace('Resources\\bin\\docker.exe', 'Docker Desktop.exe').trim()
      if (!desktopPath.endsWith('Desktop.exe')) {
        return false
      }
      // Try to start Docker Desktop
      const desktopResult = await ipc.invoke('cp', `Start-Process "${desktopPath}"`)
      if (desktopResult.code) {
        return false
      }
    }
  }
  return new Promise(resolve => {
    const delay = 500
    let counter = 5 * 60 * (1000 / delay) // 5 mins
    const h = setInterval(async () => {
      if (--counter <= 0) {
        clearInterval(h)
        resolve(false)
      }
      if (await checkDocker()) {
        clearInterval(h)
        resolve(true)
      }
    }, delay)
  })
}

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