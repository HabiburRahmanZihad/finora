import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CategoriesService } from "./categories.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";
import { CreateCategoryDto } from "./dto/create-category.dto.js";
import { UpdateCategoryDto } from "./dto/update-category.dto.js";
import { CategoryType } from "@finora/database";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query("type") type?: CategoryType) {
    return this.categoriesService.findAll(user.id, type);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateCategoryDto) {
    return this.categoriesService.create(user.id, body);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(user.id, id, body);
  }

  @Delete(":id")
  archive(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.categoriesService.archive(user.id, id);
  }
}
