import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { ResponseMessage, UserDecorator } from '@/decorator/customize';
import { IUser } from '@/users/user.interface';

@Controller('subscribers')
export class SubscribersController {
    constructor(private readonly subscribersService: SubscribersService) {}

    @Post()
    @ResponseMessage('Create a subscriber')
    create(@Body() createSubscriberDto: CreateSubscriberDto, @UserDecorator() user: IUser) {
        return this.subscribersService.create(createSubscriberDto, user);
    }

    @Get()
    @ResponseMessage('Fetch permissions with pagination')
    findAll(
        @Query('current') currentPage: string,
        @Query('pageSize') limit: string,
        @Query() qs: string,
    ) {
        return this.subscribersService.findAll(+currentPage, +limit, qs);
    }

    @Get(':id')
    @ResponseMessage('Fetch a permission by id')
    findOne(@Param('id') id: string) {
        return this.subscribersService.findOne(id);
    }

    @Patch(':id')
    @ResponseMessage('Update a permission')
    update(
        @Param('id') id: string,
        @Body() updatePermissionDto: UpdateSubscriberDto,
        @UserDecorator() user: IUser,
    ) {
        return this.subscribersService.update(id, updatePermissionDto, user);
    }

    @Delete(':id')
    @ResponseMessage('Delete a permission')
    remove(@Param('id') id: string, @UserDecorator() user: IUser) {
        return this.subscribersService.remove(id, user);
    }
}
