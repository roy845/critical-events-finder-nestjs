import {
  Controller,
  Post,
  Get,
  Delete,
  Query,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateFolderDto, ListFilesQueryDto } from './dto/upload-file.dto';
import { FileUploadService } from './file-upload.service';

@ApiTags('file-upload')
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('uploadExcel')
  @ApiOperation({ summary: 'Upload an Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Excel file upload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcelFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return this.fileUploadService.uploadExcelFile(file);
  }

  @Post('uploadJSON')
  @ApiOperation({ summary: 'Upload a JSON file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'JSON file upload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadJSONFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return this.fileUploadService.uploadJSONFile(file);
  }

  @Get('listFiles')
  @ApiOperation({ summary: 'List files with pagination and search' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: '' })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of files',
  })
  async listFiles(@Query() query: ListFilesQueryDto) {
    return this.fileUploadService.listFiles(
      query.page,
      query.limit,
      query.search,
    );
  }

  @Delete('deleteFile/:file_name')
  @ApiOperation({ summary: 'Delete a file by name' })
  @ApiParam({ name: 'file_name', required: true })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Param('file_name') fileName: string) {
    return this.fileUploadService.deleteFile(fileName);
  }

  @Delete('deleteAllFiles')
  @ApiOperation({ summary: 'Delete all files in the bucket' })
  @ApiResponse({ status: 200, description: 'All files deleted successfully' })
  async deleteAllFiles() {
    return this.fileUploadService.deleteAllFiles();
  }

  @Post('createFolder')
  @ApiOperation({ summary: 'Create a folder in S3' })
  @ApiBody({ type: CreateFolderDto })
  @ApiResponse({ status: 200, description: 'Folder created successfully' })
  async createFolder(@Body() createFolderDto: CreateFolderDto) {
    return this.fileUploadService.createFolder(createFolderDto.folder_name);
  }

  @Get('downloadAndProcessFile/:file_name')
  @ApiOperation({ summary: 'Download and process a file' })
  @ApiParam({ name: 'file_name', required: true })
  @ApiQuery({ name: 'file_type', required: true, example: 'json' })
  @ApiResponse({ status: 200, description: 'File processed successfully' })
  async downloadAndProcessFile(
    @Param('file_name') fileName: string,
    @Query('file_type') fileType: string,
  ) {
    return this.fileUploadService.downloadAndProcessFile(fileName, fileType);
  }
}
