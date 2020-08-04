import { IpcChannel } from '@obsidians/ipc'
import { DockerImageChannel } from '@obsidians/docker'

const channel = new IpcChannel('conflux-node')

channel.node = new DockerImageChannel('confluxchain/conflux-rust')

export default channel