import * as bcrypt from 'bcrypt';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document<User> {

    @Prop()
    name: string;

    @Prop({ unique: true })
    email: string;

    @Prop()
    password: string;

    @Prop({ default: true })
    status: boolean = true;
}

export const UserSchema = SchemaFactory.createForClass(User)
    .pre<User>('save', function (next: Function) {
        const user = this as User;
        if (user.password) {
            const salt = bcrypt.genSaltSync(10);
            user.password = bcrypt.hashSync(user.password, salt);
        }
        next();
    })
    .pre('updateOne', function (next: Function) {
        const user = (this as any)._update;
        if (user.password) {
            const salt = bcrypt.genSaltSync(10);
            user.password = bcrypt.hashSync(user.password, salt);
        }
        next();
    });
