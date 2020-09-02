import semver from 'semver'
import { Octokit } from "@octokit/core"

import fileOps from '@obsidians/file-ops'
import { IpcChannel } from '@obsidians/ipc'

export function getConfluxBinFolder () {
  return fileOps.current.path.join(fileOps.current.workspace, '.bin')
}

export async function checkConfluxCurrentVersion () {
  const ipc = new IpcChannel()
  const binFolder = getConfluxBinFolder()
  await fileOps.current.ensureDirectory(binFolder)
  const result = await ipc.invoke('exec', './run/conflux -V', { cwd: binFolder })
  return !result.code && semver.clean(result.logs.replace('conflux', ''))
}

export async function checkConfluxLatestVersion () {
  const octokit = new Octokit();
  const latestRelease = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
    owner: 'Conflux-Chain',
    repo: 'conflux-rust'
  })
  const latestVersion = semver.clean(latestRelease.data.tag_name)
  return latestVersion
}

export async function checkConfluxVersion () {
  const [currentVersion, latestVersion] = await Promise.all([checkConfluxCurrentVersion(), checkConfluxLatestVersion()])
  return {
    update: latestVersion && currentVersion && semver.gt(latestVersion, currentVersion),
    currentVersion,
    latestVersion
  }
}

export async function checkConfluxReady () {
  const { update, currentVersion } = await checkConfluxVersion()
  return currentVersion && !update
}
