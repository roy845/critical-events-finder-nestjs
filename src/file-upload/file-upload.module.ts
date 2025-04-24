import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { S3Provider } from 'src/aws/aws-s3-provider';

@Module({
  controllers: [FileUploadController],
  providers: [FileUploadService, S3Provider],
})
export class FileUploadModule {}
