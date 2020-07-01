import fileOps from '@obsidians/file-ops'

import set from 'lodash/set'

export default class ProjectSettings {
  constructor (projectRoot) {
    this.projectRoot = projectRoot
    this.invalid = false
    this.settings = {}
    this.path = fileOps.current.path
  }

  get configPath () {
    return this.path.join(this.projectRoot, 'config.json')
  }

  async readSettings () {
    await fileOps.current.ensureFile(this.configPath)
    const settingsJson = await fileOps.current.readFile(this.configPath)

    let rawSettings
    try {
      rawSettings = JSON.parse(settingsJson || '{}')
    } catch (e) {
      return
    }

    this.settings = this.trimSettings(rawSettings)
    return this.settings
  }

  async updateSettings (rawSettings) {
    const settings = this.trimSettings(rawSettings)
    const settingsJson = JSON.stringify(settings, null, 2)
    await fileOps.current.writeFile(this.configPath, settingsJson)
  }

  trimSettings = (rawSettings = {}) => {
    return {
      language: rawSettings.language || 'teal',
      main: rawSettings.main || '',
    }
  }

  onChange (key) {
    if (!this.onChangeHandlers[key]) {
      this.onChangeHandlers[key] = async value => {
        const settings = this.settings
        set(settings, key, value)
        await this.updateSettings(settings)
      }
    }
    return this.onChangeHandlers[key]
  }

  get mainPath () {
    if (this.settings && this.settings.main) {
      return this.path.join(this.projectRoot, this.settings.main)
    }
    throw new Error('No main file in config.json')
  }

  async isMainValid () {
    try {
      return await fileOps.current.isFile(this.mainPath)
    } catch (e) {
      return false
    }
  }
}
