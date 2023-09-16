import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, roleDocument } from './schemas/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from '@/users/user.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class RolesService {
    constructor(
        @InjectModel(Role.name)
        private roleModel: SoftDeleteModel<roleDocument>,
    ) {}

    async create(createRoleDto: CreateRoleDto, user: IUser) {
        const { name, description, isActive, permissions } = createRoleDto;

        const isExist = await this.roleModel.findOne({ name });
        if (isExist) {
            throw new BadRequestException(`Role with name="${name}" đã tồn tại `);
        }

        const newRole = await this.roleModel.create({
            name,
            description,
            isActive,
            permissions,
            createdBy: {
                _id: user._id,
                email: user.email,
            },
        });

        return newRole;
    }

    async findAll(currentPage: number, limit: number, qs: string) {
        const { filter, sort, population, projection } = aqp(qs);
        delete filter.current;
        delete filter.pageSize;

        let offset = (+currentPage - 1) * +limit;
        let defaultLimit = +limit ? +limit : 10;

        const totalItems = (await this.roleModel.find(filter)).length;
        const totalPages = Math.ceil(totalItems / defaultLimit);

        const result = await this.roleModel
            .find(filter)
            .skip(offset)
            .limit(defaultLimit)
            .sort(sort as any)
            .populate(population)
            .select(projection as any)
            .exec();

        return {
            meta: {
                current: currentPage,
                pageSize: limit,
                pages: totalPages,
                total: totalItems,
            },
            result,
        };
    }

    async findOne(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Not found role');
        }
        return (await this.roleModel.findById(id)).populate({
            path: 'permissions',
            // 1 if you want to take that element and -1 if you don't want to take it
            select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 },
        });
    }

    async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Not found role');
        }

        const { name, description, isActive, permissions } = updateRoleDto;

        // const isExist = await this.roleModel.findOne({ name });
        // if (isExist) {
        //     throw new BadRequestException(`Role with name="${name} has already existed`);
        // }

        const updated = await this.roleModel.updateOne(
            { _id: id },
            {
                name,
                description,
                isActive,
                permissions,
                updatedBy: {
                    _id: user._id,
                    email: user.email,
                },
            },
        );

        return updated;
    }

    async remove(id: string, user: IUser) {
        const foundRole = await this.roleModel.findById(id);
        if (foundRole.name === 'ADMIN') {
            throw new BadRequestException("Can't delete this role");
        }

        await this.roleModel.updateOne(
            { _id: id },
            {
                deletedBy: {
                    _id: user._id,
                    email: user.email,
                },
            },
        );

        return this.roleModel.softDelete({
            _id: id,
        });
    }
}
