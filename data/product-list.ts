export interface Product {
  id: number;
  name: string;
  brand: string;
  subCategory: string;
}

export const productList = [
  // { "id": 19752, "name": "Xiaomi Civi 4 Pro" },
  // { "id": 19300, "name": "Xiaomi 14" },
  // { "id": 19288, "name": "Xiaomi 14 Pro" },
  { "id": 20844, "name": "REDMI Turbo 4", brand: "REDMI", subCategory: "REDMI Turbo" },
  { "id": 21136, "name": "REDMI Turbo 4 Pro", brand: "REDMI", subCategory: "REDMI Turbo" },
  { "id": 20790, "name": "REDMI K80", brand: "REDMI", subCategory: "REDMI K" },
  { "id": 20779, "name": "REDMI K80 Pro", brand: "REDMI", subCategory: "REDMI K" },
  { "id": 21298, "name": "Xiaomi Civi 5 Pro", brand: "Xiaomi", subCategory: "Xiaomi Civi" },
  { "id": 20618, "name": "Xiaomi 15", brand: "Xiaomi", subCategory: "Xiaomi 数字系列" },
  { "id": 20609, "name": "Xiaomi 15 定制版", brand: "Xiaomi", subCategory: "Xiaomi 数字系列" },
  { "id": 20603, "name": "Xiaomi 15 Pro", brand: "Xiaomi", subCategory: "Xiaomi 数字系列" },
  { "id": 20982, "name": "Xiaomi 15 Ultra", brand: "Xiaomi", subCategory: "Xiaomi 数字系列" },
  { "id": 21305, "name": "Xiaomi 15S Pro", brand: "Xiaomi", subCategory: "Xiaomi 数字系列" },
] as Product[];

