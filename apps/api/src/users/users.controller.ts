import { Body, Controller, Get, Patch } from "@nestjs/common";
import { UsersService } from "./users.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";
import { UpdateUserProfileDto } from "./dto/update-user-profile.dto.js";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getMe(user.id);
  }

  @Patch("me")
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() body: UpdateUserProfileDto) {
    return this.usersService.updateMe(user.id, body);
  }
}
