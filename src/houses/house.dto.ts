import type { HouseType, PropertyType } from "./houses.entity";

export class HouseDto {
  type: HouseType;
  property_type: PropertyType;
  secure_url: string;
  location: string;
  previousPrice?: number;
  priceReduced?: boolean;
  price: number;
  bathroom: number;
  bedroom: number;
  area: string;
}