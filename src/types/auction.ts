import type { User } from "./auth";

export type ProductCondition = "new" | "used" | "refurbished";

export type ProductStatus = "draft" | "active" | "sold" | "cancelled";

export type AuctionStatus = "scheduled" | "live" | "ended" | "cancelled";

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Product = {
  id: number;
  seller_id: number;
  category_id: number;
  title: string;
  description: string;
  images: string[];
  condition: ProductCondition;
  status: ProductStatus;
  created_at?: string;
  updated_at?: string;
  category?: Category;
  seller?: User;
};

export type Auction = {
  id: number;
  product_id: number;
  seller_id: number;

  start_price: number;
  reserve_price?: number | null;
  buy_now_price?: number | null;
  current_price: number;
  bid_increment: number;

  starts_at: string;
  ends_at: string;
  status: AuctionStatus;
  winner_id?: number | null;

  created_at?: string;
  updated_at?: string;

  product?: Product;
  seller?: User;
  winner?: User | null;
};

export type Bid = {
  id: number;
  auction_id: number;
  user_id: number;
  amount: number;
  created_at: string;
  user?: User;
  auction?: Auction;
};

export type WatchlistItem = {
  id: number;
  user_id: number;
  auction_id: number;
  created_at: string;
  auction?: Auction;
};

export type AuctionListResponse = {
  data: Auction[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

export type CreateAuctionRequest = {
  title: string;
  description: string;
  category_id: number;
  condition: ProductCondition;
  images: string[];
  start_price: number;
  reserve_price?: number | null;
  buy_now_price?: number | null;
  bid_increment: number;
  starts_at: string;
  ends_at: string;
};

export type UpdateAuctionRequest = Partial<CreateAuctionRequest>;

export type PlaceBidRequest = {
  amount: number;
};

export type AuctionQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  status?: AuctionStatus;
  min_price?: number;
  max_price?: number;
  ending_soon?: boolean;
  seller_id?: number;
};
