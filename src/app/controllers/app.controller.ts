import { Controller, Get, Render } from '@nestjs/common'
import { APP_RESPONSE } from 'lib/nest-web'

@Controller({ path: '/' })
export class AppController {
  @Get('/')
  async ping(): Promise<any> {
    return APP_RESPONSE
  }

  @Get('admin/dashboard')
  @Render('pages/dashboard/index')
  dashboard() {
    return { title: 'Dashboard', user: { name: 'Admin' } }
  }

  @Get('admin/users')
  @Render('pages/user/list')
  users() {
    return {
      title: 'User List',
      users: [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Doe' },
      ],
    }
  }
}
