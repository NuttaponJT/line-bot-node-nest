/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, Headers } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /* handle line message webhook */
  @Post("/line-message-handler")
  async postLineMessageHandler(@Body() jsonBody: object, @Headers() header: Headers){
    const hmacCode = this.appService.getHmacEncode(JSON.stringify(jsonBody));
    const hmacCodeBase64 = Buffer.from(hmacCode).toString("base64");
    console.log("hmacCode is : ", hmacCodeBase64);
    console.log("Headers is : ", header);
    console.log("Body is : ", JSON.stringify(jsonBody));
    if(hmacCodeBase64 != header["x-line-signature"]){
      return this.appService.lineSignatureMisMatch();
    }
    const jsonResponse = await this.appService.lineMessageWebhookHandler(jsonBody, header);
    return jsonResponse;
  }

  /* 
  {
    message: <STR>, 
  }
  */
  @Post("/send-push-message")
  async postSendPushMessage(@Body() jsonBody: object, @Headers() header: Headers){
    const sessionId = header["session-id"];
    this.appService.lineSendPushMessage(jsonBody["message"]);
  }
}
