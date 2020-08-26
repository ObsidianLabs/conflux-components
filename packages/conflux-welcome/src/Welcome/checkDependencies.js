import instance from '@obsidians/conflux-instances'
import compiler from '@obsidians/conflux-compiler'
import { dockerChannel } from '@obsidians/docker'
import { checkConfluxVersion } from './checkConfluxUpdate'

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