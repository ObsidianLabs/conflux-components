import { ProjectSettings } from '@obsidians/workspace'

export default class ConfluxProjectSettings extends ProjectSettings {
  constructor (settingFilePath, channel) {
    super(settingFilePath, channel)
    this.configFileName = 'config.json'
  }

  trimSettings = (rawSettings = {}) => {
    return {
      main: rawSettings.main || './contracts/MetaCoin.sol',
      deploy: rawSettings.deploy || './build/contracts/MetaCoin.json',
      compilers: {
        cfxtruffle: rawSettings.compilers?.cfxtruffle || '',
        solc: rawSettings.compilers?.solc || '',
      }
    }
  }
}
