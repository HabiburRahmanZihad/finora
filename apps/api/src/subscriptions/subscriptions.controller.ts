import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto.js";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto.js";

@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateSubscriptionDto) {
    return this.subscriptionsService.create(user.id, body);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(user.id, id, body);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.subscriptionsService.remove(user.id, id);
  }
}
