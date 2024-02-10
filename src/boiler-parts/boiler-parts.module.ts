import { Module } from '@nestjs/common';
import { BoilerPartsService } from './boiler-parts.service';
import { BoilerPartsController } from './boiler-parts.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { BoilerParts } from './boiler-parts.model';

@Module({
  imports: [SequelizeModule.forFeature([BoilerParts])],
  providers: [BoilerPartsService],
  controllers: [BoilerPartsController],
  exports: [BoilerPartsService],
})
export class BoilerPartsModule {}
