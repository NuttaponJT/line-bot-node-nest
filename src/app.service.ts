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
      if(jsonBody["events"][0]["message"]["text"] == "Hey, Jarvey"){
        await this._replyMessage(jsonBody["events"][0]["replyToken"], [
          {
            type: "text", 
            text: "Yes? Sir", 
          }
        ]);
      }
    }
    return {
      status: 200,
      body: 'success',
    };
  }

  async lineSendPushMessage(message: string){
    // can't get by API now has to verify account
    // const userList = await this._getAllUser();
    const groupId = "C7a4093e52fd58feee840d262858dd898";
    await this._lineApiRequest({endpoint: "https://api.line.me/v2/bot/message/push", method: "POST", body: {
      to: groupId, 
      messages: [
        {
          type: "text", 
          text: "Test Push Notice", 
        }, 
        {
          type: "text", 
          text: "With two line", 
        }, 
      ], 
    }});

    // try broadcast
    // await this._lineApiRequest({endpoint: "https://api.line.me/v2/bot/message/broadcast", method: "POST", body: {
    //   messages: [
    //     {
    //       type: "text", 
    //       text: "Test Push Notice Broadcast", 
    //     }, 
    //     {
    //       type: "text", 
    //       text: "With two line", 
    //     }, 
    //   ], 
    // }});
  }

  async _getAllUser(){
    return this._lineApiRequest({endpoint: "https://api.line.me/v2/bot/followers/ids", method: "GET"});
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

  _lineApiRequest({endpoint, body = {}, method = "POST"}: {endpoint: string, body?: object, method?: string}){
    return new Promise(async (resolve, reject) => {
      let header = {
        "Authorization": "Bearer " + this.configService.get<string>("ACCESS_TOKEN"), 
        "Content-Type": "application/json", 
      }
      let response;
      if(method === "POST"){
        response = await lastValueFrom(this.httpService.post(endpoint, body, {headers: header}).pipe(
          map(res => res.data), 
          catchError(e => {
            throw new HttpException(e.response.data, e.response.status);
          }),
        ));
      }else if(method === "GET"){
        response = await lastValueFrom(this.httpService.get(endpoint, {headers: header}).pipe(
          map(res => res.data), 
          catchError(e => {
            throw new HttpException(e.response.data, e.response.status);
          }),
        ));
      }
      resolve(response);
    });
  }
}
