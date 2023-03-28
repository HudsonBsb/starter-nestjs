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

export namespace Category {
    export class Model {
        _id: string;
        name: string;
        products: Product.Model[];
        constructor(category: Category) {
            if (category) {
                this._id = category.id;
                this.name = category.name;
                if (category.products && category.products[0]?.name)
                    this.products = category.products.map(product => new Product.Model(product));
            }
        }
    }
}
