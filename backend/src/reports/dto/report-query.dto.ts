import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class WeeklyReportQueryDto {
  @IsOptional()
  @IsString()
  weekStart?: string; // "YYYY-MM-DD"
}

export class MonthlyReportQueryDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  year!: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;
}

export class YearlyReportQueryDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  year!: number;
}