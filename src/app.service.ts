/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from "@nestjs/axios"
import { ConfigService } from '@nestjs/config';
import * as crypto from "crypto";
import { lastValueFrom, map } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService, 
    private httpService: HttpService){}

  getHello(): string {
    return 'Hello World!';
  }

  lineSignatureMisMatch(){
    return {
      status: 200, 
      body: "Signature mismatch."
    }
  }

  getHmacEncode(body: string){
    let hmac = crypto.createHmac("sha256", this.configService.get<string>("SECRET_TOKEN"));
    let data = hmac.update(body);
    let gen_hmac = data.digest();
    return gen_hmac;
  }

  async lineMessageWebhookHandler(jsonBody: object, header: Headers){
    if(jsonBody["events"].length > 0){
      await this._replyMessage(jsonBody["events"][0]["replyToken"], [
        {
          type: "text", 
          text: "Got it, understood!", 
        }
      ]);
    }
    return {
      status: 200,
      body: 'success',
    };
  }

  _replyMessage(replyToken: string, message: any){
    return new Promise(async (resolve, reject) => {
      let endpoint = "https://api.line.me/v2/bot/message/reply"
      let header = {
        "Authorization": "Bearer " + this.configService.get<string>("ACCESS_TOKEN"), 
        "Content-Type": "application/json", 
      };
      let body = {
        replyToken: replyToken, 
        messages: message, 
      }
      let response = await lastValueFrom(this.httpService.post(endpoint, body, {headers: header}).pipe(
        map(res => res.data), 
        catchError(e => {
          throw new HttpException(e.response.data, e.response.status);
        }),
      ));
      resolve(true);
    });
  }
}
