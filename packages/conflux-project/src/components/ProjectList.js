import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'

import { ProjectPath } from '@obsidians/workspace'

export default class ProjectList extends PureComponent {
  renderProjectRow = (project, index) => {
    const { author = 'guest', id, name, path } = project
    const url = `/${author}/${id}`
    return (
      <tr key={`project-row-${index}`}>
        <td className='flex-column'>
          <div>
            <div className='mb-1 flex-row-center'>
              <Link to={url} className='text-white'>
                <h5 className='mb-0'>{name}</h5>
              </Link>
            </div>

            <div className='mt-2'>
              <ProjectPath projectRoot={path} />
            </div>
          </div>
        </td>
      </tr>
    )
  }

  render () {
    const projects = this.props.projects

    if (!projects || !projects.length) {
      return (
        <table className='table table-hover table-striped'>
          <tbody>
            <tr key='no-project'>
              <td align='middle' className='text-muted'>(No Project)</td>
            </tr>
          </tbody>
        </table>
      )
    }

    return (
      <table className='table table-hover table-striped'>
        <tbody>
          {projects.map(this.renderProjectRow)}
        </tbody>
      </table>
    )
  }
}
