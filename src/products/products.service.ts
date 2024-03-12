import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common';
import { RpcException } from '@nestjs/microservices';

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
      throw new RpcException( {
        message: `Product with id ${ id } not found`,
        status: HttpStatus.BAD_REQUEST
      } );
    }

    return product;
  }

  async update( id: number, updateProductDto: UpdateProductDto ) {

    await this.findOne( id );

    const { id: _, ...data } = updateProductDto;

    return this.product.update( {
      where: { id },
      data
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
