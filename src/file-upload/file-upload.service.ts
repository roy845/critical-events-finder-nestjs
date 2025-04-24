import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as XLSX from 'xlsx';
import { Validator } from 'jsonschema';
import { jsonSchema } from 'src/schemas/jsonSchema';

@Injectable()
export class FileUploadService {
  private readonly S3_BUCKET_NAME: string;

  constructor(
    private configService: ConfigService,
    @Inject('S3_CLIENT') private readonly s3: AWS.S3,
  ) {
    this.S3_BUCKET_NAME = this.configService.get<string>(
      'S3_BUCKET_NAME',
    ) as string;
  }

  async uploadExcelFile(uploadedFile: Express.Multer.File) {
    if (!uploadedFile) throw new BadRequestException('No file provided');

    const fileExtension = uploadedFile.originalname
      .split('.')
      .pop()
      ?.toLowerCase();
    if (!['xlsx', 'xls'].includes(fileExtension || '')) {
      throw new BadRequestException(
        'Invalid file type. Only Excel files are allowed.',
      );
    }

    try {
      const s3Key = `royatali/${uploadedFile.originalname}`;
      await this.s3
        .upload({
          Bucket: this.S3_BUCKET_NAME,
          Key: s3Key,
          Body: uploadedFile.buffer,
        })
        .promise();

      return { message: 'Excel File uploaded successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while uploading the file',
      );
    }
  }

  async uploadJSONFile(uploadedFile: Express.Multer.File) {
    if (!uploadedFile) throw new BadRequestException('No file provided');

    if (uploadedFile.mimetype !== 'application/json') {
      throw new BadRequestException(
        'Invalid file type. Only JSON files are allowed.',
      );
    }

    try {
      const jsonData = JSON.parse(uploadedFile.buffer.toString('utf-8'));
      const validator = new Validator();
      const validationResult = validator.validate(jsonData, jsonSchema);

      if (!validationResult.valid) {
        throw new BadRequestException(
          'JSON validation failed: ' +
            validationResult.errors.map((e) => e.stack).join('; '),
        );
      }

      const s3Key = `royatali/${uploadedFile.originalname}`;
      await this.s3
        .upload({
          Bucket: this.S3_BUCKET_NAME,
          Key: s3Key,
          Body: uploadedFile.buffer,
        })
        .promise();

      return { message: 'JSON File uploaded successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while processing the JSON file',
      );
    }
  }

  async listFiles(page: number = 1, limit: number = 10, search: string = '') {
    try {
      const response = await this.s3
        .listObjectsV2({
          Bucket: this.S3_BUCKET_NAME,
          Prefix: 'royatali/',
        })
        .promise();

      if (!response.Contents)
        return { message: 'No files found', files: [], status: 200 };

      let allFiles = response.Contents.filter(
        (file) => !file.Key?.endsWith('/'),
      ).map((file) => ({
        file_name: file.Key,
        size: file.Size,
      }));

      if (search) {
        allFiles = allFiles.filter((file) =>
          file.file_name!.toLowerCase().includes(search.toLowerCase()),
        );
      }

      const total_files = allFiles.length;
      const total_pages = Math.ceil(total_files / limit);
      const paginatedFiles = allFiles.slice((page - 1) * limit, page * limit);

      return {
        message: 'Files listed successfully',
        total_files,
        page,
        limit,
        total_pages,
        files: paginatedFiles,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to list files');
    }
  }

  async deleteFile(file_name: string) {
    try {
      const s3Key = `royatali/${file_name}`;
      await this.s3
        .deleteObject({
          Bucket: this.S3_BUCKET_NAME,
          Key: s3Key,
        })
        .promise();

      return { message: `File ${file_name} deleted successfully` };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete file ${file_name}`,
      );
    }
  }

  async deleteAllFiles() {
    try {
      const response = await this.s3
        .listObjectsV2({
          Bucket: this.S3_BUCKET_NAME,
          Prefix: 'royatali/',
        })
        .promise();

      if (response.Contents) {
        for (const file of response.Contents) {
          await this.s3
            .deleteObject({
              Bucket: this.S3_BUCKET_NAME,
              Key: file.Key!,
            })
            .promise();
        }
      }

      return { message: 'All files deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete all files');
    }
  }

  async createFolder(folder_name: string): Promise<{ message: string }> {
    try {
      if (!folder_name.endsWith('/')) {
        folder_name += '/';
      }

      await this.s3
        .putObject({
          Bucket: this.S3_BUCKET_NAME,
          Key: folder_name,
          Body: '',
        })
        .promise();

      return { message: `Folder "${folder_name}" created successfully` };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create folder "${folder_name}"`,
      );
    }
  }

  async downloadAndProcessFile(file_name: string, file_type: string) {
    try {
      const s3Key = `royatali/${file_name}`;
      const response = await this.s3
        .getObject({
          Bucket: this.S3_BUCKET_NAME,
          Key: s3Key,
        })
        .promise();

      const fileContent = response.Body as Buffer;
      if (!fileContent)
        throw new BadRequestException('The file is empty or could not be read');

      if (file_type === 'json') {
        const jsonData = JSON.parse(fileContent.toString('utf-8'));
        return {
          message: 'File processed successfully',
          days_list: jsonData,
        };
      } else if (['xlsx', 'xls'].includes(file_type)) {
        const workbook = XLSX.read(fileContent, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (rows[0].length < 3) {
          throw new BadRequestException(
            'The file must contain at least three columns: day_index, intersection, and event.',
          );
        }

        const daysList = rows.reduce(
          (acc: any, row: any) => {
            const [dayIndex, intersection, event] = row;
            const day_id = `day-${dayIndex}`;
            if (!acc[day_id]) acc[day_id] = [];
            acc[day_id].push({ intersection, event });
            return acc;
          },
          {} as Record<string, { intersection: string; event: string }[]>,
        );

        return {
          message: 'File processed successfully',
          days_list: Object.entries(daysList).map(([id, events]) => ({
            id,
            events,
          })),
        };
      } else {
        throw new BadRequestException('Unsupported file type');
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while processing the file',
      );
    }
  }
}
