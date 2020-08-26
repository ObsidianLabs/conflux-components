import instance from '@obsidians/conflux-instances'
import compiler from '@obsidians/conflux-compiler'
import { dockerChannel } from '@obsidians/docker'
import { checkConfluxReady } from './checkConfluxUpdate'

export default async function checkDependencies () {
  try {
    const results = await Promise.all([
      dockerChannel.check(),
      checkConfluxReady(),
      instance.node.installed(),
      compiler.channel.installed(),
    ])
    return results.every(x => !!x)
  } catch (e) {
    return false
  }
}