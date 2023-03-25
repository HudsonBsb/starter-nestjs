import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { AuthGuard } from 'src/decorators/auth.decorator';
import { Category } from 'src/entities/category.entity';
import { Product } from 'src/entities/product.entity';
import { AuthService } from 'src/services/auth.service';
import { CategoryService } from 'src/services/category.service';
import { ProductService } from 'src/services/product.service';

@Controller('api')
export class ApiController {
  constructor(
    private readonly authService: AuthService,
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
  ) { }

  @Post('login')
  async login(@Body() { email, password }: { email: string, password: string }) {
    return this.authService.login(email, password);
  }

  @Get('categories')
  @AuthGuard()
  async findAllCategories(@Query('products') products: boolean) {
    return this.categoryService.findAll(products);
  }

  @Post('categories')
  @AuthGuard()
  async createCategory(@Body() category: Category) {
    return this.categoryService.create(category);
  }

  @Post('products')
  @AuthGuard()
  async createProduct(@Body() product: Product) {
    return this.productService.create(product);
  }

  @Get('products')
  @AuthGuard()
  async findAllProducts() {
    return this.productService.findAll();
  }

  @Put('products')
  @AuthGuard()
  async updateProduct(@Body() product: Product) {
    return this.productService.update(product);
  }

  @Delete('products/:id')
  @AuthGuard()
  async deleteProduct(@Param('id') id: string) {
    return { ok: true };
  }
}