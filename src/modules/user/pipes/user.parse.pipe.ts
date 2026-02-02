import { Injectable, PipeTransform } from '@nestjs/common'
import { TUser } from '../interfaces/user.interface'
import { UserService } from '../services/user.service'

@Injectable()
export class UserParsePipe implements PipeTransform {
  constructor(private readonly userService: UserService) {}

  async transform(value: number): Promise<TUser> {
    const user: TUser = await this.userService.findOrFail(value)

    return user
  }
}
