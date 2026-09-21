export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type CatalogVariant = {
  id: string;
  productId: string;
  sku: string;
  name: string;
  flavour: string | null;
  weightGrams: number | null;
  weightLabel: string | null;
  pricePaise: number;
  compareAtPaise: number | null;
  status: "ACTIVE" | "INACTIVE";
  unlimitedInventory: boolean;
  minOrderQty: number;
  maxOrderQty: number | null;
  sortOrder: number;
  availableQty: number | null;
};

export type CatalogImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
};

export type CatalogCollection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  collectionType: string;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  category: CatalogCategory | null;
  tags: string[];
  thumbnailUrl: string | null;
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  isVegetarian: boolean;
  isEggless: boolean;
  containsEgg: boolean;
  allergenInfo: string | null;
  ingredients: string | null;
  servingSize: string | null;
  preparationTimeHours: number | null;
  shelfLife: string | null;
  storageInstructions: string | null;
  status: ProductStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  variants: CatalogVariant[];
  images: CatalogImage[];
};

export type ShopFilters = {
  category?: string;
  q?: string;
  eggless?: boolean;
  vegetarian?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  sort?: "popular" | "price-asc" | "price-desc" | "newest" | "bestselling";
};
