import { Transform } from "class-transformer";
import { IsEnum, IsInt, Min } from "class-validator";

enum LeaveTypeDto {
  CO = "CO",
  COR = "COR",
}

export class UpsertEntitlementDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  year!: number;

  @IsEnum(LeaveTypeDto)
  type!: "CO" | "COR";

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  annualDays!: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  carryoverDays!: number;
}