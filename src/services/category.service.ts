import { Injectable } from '@nestjs/common';
import { UpdateResult } from 'mongodb';
import { Product } from 'src/entities/product.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose/dist';
import { Category } from 'src/entities/category.entity';

@Injectable()
export class CategoryService {

    constructor(
        @InjectModel(Category.name)
        private readonly categoryModel: Model<Category>) { }

    async create(category: Category) {
        return new this.categoryModel(category).save();
    }

    async findAll(products: boolean) {
        const query = this.categoryModel.find();
        return products ? query.populate('products') : query;
    }

    async findById(id: string) {
        return this.categoryModel.findById(id);
    }

    async addProduct(id: string, product: Product): Promise<UpdateResult> {
        return this.categoryModel.updateOne(
            { _id: id },
            { $push: { products: product } }
        );
    }
}
