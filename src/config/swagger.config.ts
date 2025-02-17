import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { CriticalEventsModule } from 'src/critical-events/critical-events.module';
import { FileUploadModule } from 'src/file-upload/file-upload.module';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Critical Events API')
    .setDescription(
      'API to find critical events based on intersection patterns',
    )
    .setVersion('1.0')
    .addTag('critical-events')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [CriticalEventsModule, FileUploadModule],
  });

  SwaggerModule.setup('api/swagger/docs', app, document);
}
