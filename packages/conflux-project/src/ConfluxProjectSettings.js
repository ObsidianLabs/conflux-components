import { ProjectSettings } from '@obsidians/workspace'

export default class ConfluxProjectSettings extends ProjectSettings {
  static configFileName = 'config.json'

  constructor (settingFilePath, channel) {
    super(settingFilePath, channel)
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
