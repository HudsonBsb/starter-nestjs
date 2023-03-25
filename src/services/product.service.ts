import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Product } from 'src/entities/product.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose/dist';
import { CategoryService } from './category.service';

@Injectable()
export class ProductService {

    constructor(
        @InjectModel(Product.name)
        private readonly productModel: Model<Product>,
        private readonly categoryService: CategoryService) { }

    async create({ category, ...product }: Product) {
        const cat = await this.categoryService.findById(category?.id);
        if (!cat) throw new HttpException('Categoria inexistente.', HttpStatus.BAD_REQUEST);
        const created = await new this.productModel(product).save();
        this.categoryService.addProduct(category.id, created);
        await this.productModel.updateOne({ _id: created.id }, { category: cat });
        created.category = cat;
        return created;
    }

    async findAll() {
        return this.productModel.find().populate('category');
    }

    async update({ _id, ...product }: Product) {
        await this.productModel.updateOne({ _id }, { ...product });
        product.updatedAt = new Date();
        return product;
    }
}
