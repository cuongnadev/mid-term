export type ProductFields = {
  name: string;
  price: number;
  soluong: number;
  image: string;
};

export type ProductRecord = ProductFields & {
  id: string;
};

export type CreateProductInput = {
  name: string;
  price: number;
  soluong: number;
  image: string;
};

export type UpdateProductInput = {
  name: string;
  price: number;
  soluong: number;
  image: string;
};

export type ProductSortOption =
  | 'newest'
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc'
  | 'stock_asc'
  | 'stock_desc';

export type ProductStockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

export type ProductPriceFilter = 'all' | 'under_100k' | '100k_500k' | '500k_2m' | 'over_2m';

export type ProductFilterState = {
  searchQuery: string;
  stockFilter: ProductStockFilter;
  priceFilter: ProductPriceFilter;
  sortBy: ProductSortOption;
};

export type ProductAiSuggestion = {
  suggestedPrice: number;
  suggestedSoluong: number;
  description: string;
  reasoning: string;
  source: 'gemini' | 'local';
};