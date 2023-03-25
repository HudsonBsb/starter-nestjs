import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { InjectModel } from '@nestjs/mongoose/dist';
import { Model } from 'mongoose';

@Injectable()
export class UserService {

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>) { }

    async findAll(): Promise<User[]> {
        return this.userModel.find();
    }

    async findById(id: number): Promise<User> {
        return this.userModel.findById(id);
    }

    async findByEmail(email: string): Promise<User> {
        return this.userModel.findOne({ email });
    }

    async create(user: User): Promise<User> {
        try {
            const { password, ...model } = await new this.userModel(user).save();
            return model as User;
        } catch (err) {
            if (err?.code === 11000)
                throw new HttpException('Usuário já existe.', HttpStatus.BAD_REQUEST);
            throw err;
        }
    }

    async update(user: User): Promise<User> {
        return new this.userModel(new User(user)).save();
    }
}
