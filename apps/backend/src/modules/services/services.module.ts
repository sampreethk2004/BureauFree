import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { GovernmentServicesService } from './government-services.service';
import { ExpertSystemService } from './expert-system.service';

@Module({
  controllers: [ServicesController],
  providers: [GovernmentServicesService, ExpertSystemService]
})
export class ServicesModule {}
