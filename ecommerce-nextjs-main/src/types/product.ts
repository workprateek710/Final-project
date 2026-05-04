/**
 * Shared product shapes for admin dashboard and catalog pages.
 * - Mongo `_id` is only for admin CRUD.
 * - `prodId` is the stable catalog id shared with the recommender (Flask) and `Purchase` rows.
 */

export interface IProduct {
  _id: string;
  prodId: string;
  slug: string;
  imgSrc: string;
  fileKey: string;
  name: string;
  price: string;
  category: string;
  subcategory?: string;
  description?: string;
  brand?: string;
  ratingAvg?: number;
  reviews?: number;
  stock?: number;
  featured?: boolean;
}

/** Public catalog card (from GET /api/get_products) */
export interface CatalogProduct {
  _id: string;
  prodId: string;
  slug: string;
  imgSrc: string;
  name: string;
  price: string;
  category: string;
  subcategory: string;
  description: string;
  brand: string;
  ratingAvg: number;
  reviews: number;
  stock: number;
}
