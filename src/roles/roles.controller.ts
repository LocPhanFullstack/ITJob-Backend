import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ResponseMessage, UserDecorator } from '@/decorator/customize';
import { IUser } from '@/users/user.interface';

@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Post()
    @ResponseMessage('Create a new role')
    create(@Body() createRoleDto: CreateRoleDto, @UserDecorator() user: IUser) {
        return this.rolesService.create(createRoleDto, user);
    }

    @Get()
    @ResponseMessage('Fetch roles with paginate')
    findAll(
        @Query('current') currentPage: string,
        @Query('pageSize') limit: string,
        @Query() qs: string,
    ) {
        return this.rolesService.findAll(+currentPage, +limit, qs);
    }

    @Get(':id')
    @ResponseMessage('Fetch a role by id')
    findOne(@Param('id') id: string) {
        return this.rolesService.findOne(id);
    }

    @Patch(':id')
    @ResponseMessage('Update a role by id')
    update(
        @Param('id') id: string,
        @Body() updateRoleDto: UpdateRoleDto,
        @UserDecorator() user: IUser,
    ) {
        return this.rolesService.update(id, updateRoleDto, user);
    }

    @Delete(':id')
    @ResponseMessage('Delete a role by id')
    remove(@Param('id') id: string, @UserDecorator() user: IUser) {
        return this.rolesService.remove(id, user);
    }
}
