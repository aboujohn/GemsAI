import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { BaseResponseDto, ErrorResponseDto } from '../dto/base-response.dto';

export const ApiSuccessResponse = <T extends Type<any>>(
  type: T,
  options?: { description?: string; isArray?: boolean }
) => {
  const { description = 'Success', isArray = false } = options || {};
  return applyDecorators(
    ApiExtraModels(BaseResponseDto, type),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseResponseDto) },
          {
            properties: {
              data: isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(type) },
                  }
                : {
                    $ref: getSchemaPath(type),
                  },
            },
          },
        ],
      },
    })
  );
};

export const ApiErrorResponse = (status: number, description: string, errorCode?: string) => {
  return applyDecorators(
    ApiExtraModels(ErrorResponseDto),
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ErrorResponseDto) },
          {
            properties: {
              errorCode: {
                type: 'string',
                example: errorCode,
              },
            },
          },
        ],
      },
    })
  );
};
