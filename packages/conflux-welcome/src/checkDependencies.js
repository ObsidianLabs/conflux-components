import { instanceChannel } from '@obsidians/conflux-network'
import compiler from '@obsidians/conflux-compiler'
import { dockerChannel } from '@obsidians/docker'

export default async function checkDependencies () {
  try {
    const results = await Promise.all([
      dockerChannel.check(),
      instanceChannel.node.installed(),
      compiler.cfxtruffle.installed(),
    ])
    return results.every(x => !!x)
  } catch (e) {
    return false
  }
}