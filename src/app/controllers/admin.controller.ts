import { Controller, Get, Query, Render } from '@nestjs/common'

@Controller('admin')
export class AdminController {
  @Get()
  @Render('users/list')
  listUsers(@Query('page') page = 1, @Query('q') q?: string) {
    // gọi service lấy dữ liệu
    const users = [
      { id: 1, name: 'John Doe', email: 'john@test.com' },
      { id: 2, name: 'Jane Doe', email: 'jane@test.com' },
    ]

    return {
      title: 'Users',
      users,
      query: q,
      pages: [1, 2, 3],
      currentPage: page,
      hasPrev: page > 1,
      prevPage: page - 1,
      hasNext: page < 3,
      nextPage: page + 1,
      user: { name: 'Admin' },
      notifications: [{ message: 'New order created', time: '2m ago' }],
    }
  }
}
