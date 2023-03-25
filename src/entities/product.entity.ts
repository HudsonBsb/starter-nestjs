import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Category } from './category.entity';

@Schema()
export class Product extends Document<Product> {

    @Prop()
    name: string;

    @Prop()
    price: number;

    @Prop()
    packaging: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
    category: Category;

    @Prop({ default: true })
    status: boolean = true;

    @Prop({ default: Date.now, immutable: false })
    updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product)
    .pre('updateOne', function (next: Function) {
        const product = (this as any)._update;
        product.updatedAt = new Date();
        next();
    });
