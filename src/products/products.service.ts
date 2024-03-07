import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private logger = new Logger( 'ProductsService' );

  onModuleInit() {
    this.$connect();
    this.logger.log( 'Database connected' );
  }

  create( createProductDto: CreateProductDto ) {
    return this.product.create( {
      data: createProductDto
    } );
  }

  async findAll( paginationDto: PaginationDto ) {
    const { limit, page } = paginationDto;
    const skip = ( page - 1 ) * limit;
    const products = await this.product.findMany( {
      where: { available: true },
      take: limit,
      skip
    } );

    const total = await this.product.count( {
      where: { available: true }
    } );

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil( total / limit )
      }
    };
  }

  async findOne( id: number ) {
    const product = await this.product.findFirst( {
      where: { id, available: true }
    } );

    if ( !product ) {
      throw new NotFoundException( `Product with id ${ id } not found` );
    }

    return product;
  }

  async update( id: number, updateProductDto: UpdateProductDto ) {

    await this.findOne( id );

    return this.product.update( {
      where: { id },
      data: updateProductDto
    } );
  }

  async remove( id: number ) {
    await this.findOne( id );

    /*return this.product.delete( {
      where: { id }
    } );*/

    return await this.product.update( {
      where: { id },
      data: { available: false }
    } );

  }
}
