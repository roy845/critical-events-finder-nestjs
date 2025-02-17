import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsString,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class IntersectionEventDto {
  @ApiProperty({ example: 'A', description: 'Intersection identifier' })
  @IsString()
  @IsNotEmpty({ message: 'Intersection must not be empty' })
  intersection: string;

  @ApiProperty({ example: 'Event1', description: 'Event name' })
  @IsString()
  @IsNotEmpty({ message: 'Event must not be empty' })
  event: string;
}

export class FindCriticalEventsDto {
  @ApiProperty({
    description: 'List of days with intersection events',
    type: () => [[IntersectionEventDto]],
    example: [
      [
        { intersection: 'A', event: 'Event1' },
        { intersection: 'B', event: 'Event1' },
      ],
    ],
  })
  @IsArray({ message: 'days_list must be an array of arrays' })
  @ValidateNested({ each: true })
  @Type(() => IntersectionEventDto)
  days_list: IntersectionEventDto[][];
}
