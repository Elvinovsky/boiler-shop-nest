import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ShoppingCart } from './shopping-cart.model';
import { UsersService } from '../users/users.service';
import { BoilerPartsService } from '../boiler-parts/boiler-parts.service';
import { AddToCartDto } from './dto/shopping-cart.dto';

@Injectable()
export class ShoppingCartService {
  constructor(
    @InjectModel(ShoppingCart)
    private readonly shoppingCartModel: typeof ShoppingCart,
    private readonly usersService: UsersService,
    private readonly boilerPartsService: BoilerPartsService,
  ) {}
  async findAll(userId: number | string): Promise<ShoppingCart[]> {
    return this.shoppingCartModel.findAll({ where: { userId } });
  }
  async add(addToCartDto: AddToCartDto) {
    const cart = new ShoppingCart();
    const user = await this.usersService.findOne({
      where: { username: addToCartDto.username },
    });
    const part = await this.boilerPartsService.findOne(addToCartDto.partId);

    cart.userId = user.id;
    cart.partId = part.id;
    cart.boiler_manufacturer = part.boiler_manufacturer;
    cart.parts_manufacturer = part.parts_manufacturer;
    cart.price = part.price;
    cart.in_stock = part.in_stock;
    cart.image = JSON.parse(part.images)[0];
    cart.name = part.name;
    cart.total_price = part.price;

    return cart.save();
  }

  async update(count: number, partId: number): Promise<{ count: number }> {
    await this.shoppingCartModel.update({ count }, { where: { partId } });

    const cart = await this.shoppingCartModel.findOne({ where: { partId } });

    return { count: cart.count };
  }

  async updateTotalPrice(
    total_price: number,
    partId: number,
  ): Promise<{ total_price: number }> {
    await this.shoppingCartModel.update({ total_price }, { where: { partId } });

    const cart = await this.shoppingCartModel.findOne({ where: { partId } });

    return { total_price: cart?.total_price };
  }

  async remove(partId: number): Promise<void> {
    const cart = await this.shoppingCartModel.findOne({ where: { partId } });

    await cart.destroy();
  }

  async removeAll(userId: number): Promise<void> {
    await this.shoppingCartModel.destroy({ where: { userId } });
  }
}
