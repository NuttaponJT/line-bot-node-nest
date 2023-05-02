/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { HttpModule } from "@nestjs/axios"
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule.forRoot(), 
    HttpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
