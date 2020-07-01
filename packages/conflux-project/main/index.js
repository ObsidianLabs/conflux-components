const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const { IpcChannel } = require('@obsidians/ipc')

class ProjectChannel extends IpcChannel {
  constructor () {
    super('conflux-project')
  }

  async createProject ({ template, projectRoot, name, compilerVersion }) {
    fse.ensureDirSync(projectRoot)
  }
}

module.exports = ProjectChannel