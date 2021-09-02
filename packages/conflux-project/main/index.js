const path = require('path')
const fs = require('fs')
const ProjectChannel = require('@obsidians/eth-project')

class CfxProjectChannel extends ProjectChannel {
  async writeFrameworkFiles ({ projectRoot, framework, npmClient, compilerVersion }) {
    const configJson = fs.readFileSync(path.join(projectRoot, 'config.json'), 'utf8')
    const config = JSON.parse(configJson)
    config.npmClient = npmClient
    config.compilers = config.compilers

    if (framework === 'cfxtruffle-docker') {
      const truffleConfig = fs.readFileSync(path.join(__dirname, 'templates', 'truffle-config.js'), 'utf8')
      fs.writeFileSync(path.join(projectRoot, 'truffle-config.js'), truffleConfig)
      config.compilers = { cfxtruffle: compilerVersion, ...config.compilers }
      fs.rmdirSync(path.join(projectRoot, 'scripts'), { recursive: true })
    } else if (framework === 'cfxtruffle') {
      const truffleConfig = fs.readFileSync(path.join(__dirname, 'templates', 'truffle-config.js'), 'utf8')
      fs.writeFileSync(path.join(projectRoot, 'truffle-config.js'), truffleConfig)
      fs.rmdirSync(path.join(projectRoot, 'scripts'), { recursive: true })
    }

    fs.writeFileSync(path.join(projectRoot, 'config.json'), JSON.stringify(config, null, 2))
  }

  async postCreation ({ name, projectRoot, framework }) {
    const packageJson = fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')
    const packageObj = JSON.parse(packageJson)
    if (framework === 'cfxtruffle') {
      packageObj.scripts = { build: 'cfxtruffle compile', deploy: 'cfxtruffle deploy' }
    }
    fs.writeFileSync(path.join(projectRoot, 'package.json'), JSON.stringify(packageObj, null, 2))
    return { projectRoot, name }
  }
}

module.exports = CfxProjectChannel