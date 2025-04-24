import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';
import * as AWS from 'aws-sdk';

export const S3Provider: Provider = {
  provide: 'S3_CLIENT',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new AWS.S3({
      accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: configService.get<string>('S3_REGION_NAME'),
    });
  },
};
