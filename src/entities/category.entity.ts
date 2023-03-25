import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Product } from './product.entity';

@Schema()
export class Category extends Document<Category> {

    @Prop()
    name: string;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] })
    products: Product[];

    @Prop({ default: true })
    status: boolean = true;
}

export const CategorySchema = SchemaFactory.createForClass(Category)
