import { Controller, Get, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { Roles } from "../auth/roles.decorator.js";

@Controller("admin")
@UseGuards(RolesGuard)
@Roles("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("health")
  getHealth() {
    return this.adminService.getHealth();
  }

  @Get("stats")
  getStats() {
    return this.adminService.getStats();
  }

  @Get("traffic")
  getTraffic() {
    return this.adminService.getTraffic();
  }
}
