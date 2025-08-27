export class RequestFilterDto<T = number | string | boolean> {
  [key: string]: T
}

// export class RequestFilterBetweenDto {
//   [key: string]: {
//     gte: number
//     lte: number
//   }
// }

// export class RequestFilterContainsDto {
//   [key: string]: {
//     contains: string
//   }
// }
