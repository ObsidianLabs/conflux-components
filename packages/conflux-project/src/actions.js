import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'
import redux from '@obsidians/redux'

export class ProjectActions {
  constructor() {
    this.history = null
    this.newProjectModal = null
  }

  async newProject () {
    const { projectRoot, name } = await this.newProjectModal.openModal()
    const projectId = btoa(projectRoot)
    redux.dispatch('ADD_PROJECT', {
      type: 'local',
      project: {
        id: projectId,
        path: projectRoot,
        author: 'guest',
        name,
      }
    })
    this.history.push(`/guest/${projectId}`)
  }

  async openProject () {
    try {
      const projectRoot = await fileOps.current.chooseFolder()
      const { base } = fileOps.current.path.parse(projectRoot)
      const projectId = btoa(projectRoot)
      redux.dispatch('ADD_PROJECT', {
        type: 'local',
        project: {
          id: projectId,
          path: projectRoot,
          author: 'guest',
          name: base,
        }
      })
      this.history.replace(`/guest/${projectId}`)
    } catch (e) {}
  }

  removeProject ({ id, name }) {
    const selected = redux.getState().projects.get('selected')
    if (selected && selected.get('id') === id) {
      redux.dispatch('SELECT_PROJECT', { project: undefined })
      this.history.replace(`/guest`)
    }
    redux.dispatch('REMOVE_PROJECT', { id, type: 'local' })
    notification.info('Remove Project Successful', `Project <b>${name}</b> is removed`)
  }
}

export default new ProjectActions()
