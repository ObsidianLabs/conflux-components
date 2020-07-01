import redux from '@obsidians/redux'

export default class NavGuard {
  constructor (history) {
    console.info('[Router Guard] Start watching route changes')
    this.history = history
    const { location } = history
    this.uninstall = history.listen(location => this.handleChanges(location))
    this.handleChanges(location)
  }

  unmount () {
    this.uninstall()
  }

  handleChanges (location) {
    const { pathname } = location

    if (!this.preflight(pathname)) {
      return
    }

    const [first] = this.parsePathname(pathname)
    if (first === 'guest') {
      this.updateSelectedProject(pathname)
    }
  }

  preflight (pathname) {
    const state = redux.getState()
  
    if (pathname === '/') {
      // go to seleted project
      const selected = state.projects.get('selected')
      if (selected) {
        const author = selected.get('author')
        const id = selected.get('id')
        if (author && id) {
          this.history.replace(`/${author}/${id}`)
          return false
        }
      }
    }
  
    return true
  }

  parsePathname (pathname) {
    const [_, first, second] = pathname.split('/')
    return [first || '', second || '']
  }

  updateSelectedProject (pathname) {
    const [author, id] = this.parsePathname(pathname)

    const { projects } = redux.getState()
    const oldSelected = projects.get('selected')
    if (
      oldSelected &&
      oldSelected.get('author') === author &&
      oldSelected.get('id') === id
    ) {
      return
    }
  
    const project = {
      pathname,
      author,
      id,
    }
  
    // try to find projects from local
    const found = projects.get('local').find(p => p.get('id') === id)
    if (found) {
      project.name = found.get('name')
      project.path = found.get('path')
    }
    redux.dispatch('SELECT_PROJECT', { project })
  }
}