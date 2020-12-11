import { IpcChannel } from '@obsidians/ipc'
import { DockerImageChannel } from '@obsidians/docker'
import semver from 'semver'

const channel = new IpcChannel('conflux-node')

channel.node = new DockerImageChannel('confluxchain/conflux-rust', {
  filter: v => semver.valid(v) && semver.gte(v, '1.0.0')
})

export default channel