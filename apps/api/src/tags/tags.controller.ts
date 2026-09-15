import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { TagsService } from "./tags.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";
import { CreateTagDto } from "./dto/create-tag.dto.js";

@Controller("tags")
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.tagsService.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateTagDto) {
    return this.tagsService.create(user.id, body);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.tagsService.remove(user.id, id);
  }
}
