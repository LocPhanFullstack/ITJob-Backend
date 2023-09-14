import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from '@/users/user.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class ResumesService {
    constructor(
        @InjectModel(Resume.name)
        private resumeModel: SoftDeleteModel<ResumeDocument>,
    ) {}

    async create(createUserCvDto: CreateUserCvDto, user: IUser) {
        const { url, companyId, jobId } = createUserCvDto;
        const { email, _id } = user;

        const newCv = await this.resumeModel.create({
            url,
            companyId,
            email,
            jobId,
            userId: _id,
            status: 'PENDING',
            createdBy: { _id, email },
            history: [
                {
                    status: 'PENDING',
                    updatedAt: new Date(),
                    updatedBy: {
                        _id: user._id,
                        email: user.email,
                    },
                },
            ],
        });

        return {
            _id: newCv?._id,
            createdAt: newCv?.createdAt,
        };
    }

    async findAll(currentPage: number, limit: number, qs: string) {
        const { filter, sort, population } = aqp(qs);
        delete filter.current;
        delete filter.pageSize;

        let offset = (+currentPage - 1) * +limit;
        let defaultLimit = +limit ? +limit : 10;

        const totalItems = (await this.resumeModel.find(filter)).length;
        const totalPages = Math.ceil(totalItems / defaultLimit);

        const result = await this.resumeModel
            .find(filter)
            .skip(offset)
            .limit(defaultLimit)
            .sort(sort as any)
            .populate(population)
            .exec();
    }

    async findOne(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Not found resume with this id');
        }
        return await this.resumeModel.findById(id);
    }

    async update(_id: string, status: string, user: IUser) {
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            throw new BadRequestException('not found resume');
        }

        const updated = await this.resumeModel.updateOne(
            {
                _id,
            },
            {
                status,
                updatedBy: {
                    _id: user._id,
                    email: user.email,
                },
                $push: {
                    history: {
                        status,
                        updatedAt: new Date(),
                        updatedBy: {
                            _id: user._id,
                            email: user.email,
                        },
                    },
                },
            },
        );
        return updated;
    }

    async remove(id: string, user: IUser) {
        await this.resumeModel.updateOne(
            {
                _id: id,
            },
            {
                deletedBy: {
                    _id: user._id,
                    email: user.email,
                },
            },
        );

        return this.resumeModel.softDelete({ _id: id });
    }
}
