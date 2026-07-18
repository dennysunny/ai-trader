import { IsNotEmpty, IsString } from 'class-validator';

export class AliceBlueCallbackDto {
  @IsString()
  @IsNotEmpty()
  authCode!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}
