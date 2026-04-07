
export class taskPaginationDto {
  limit!: number;
  page!: number;
}

export class GetPaginatedTaskParamDto extends taskPaginationDto {}
