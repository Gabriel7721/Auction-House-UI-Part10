import { Auction } from "../types/auction";

export const auctionSample: Auction = {
  ID: 1,
  ProductID: 1,
  SellerID: 1,
  StartPrice: 500,
  CurrentPrice: 725,
  BidIncrement: 25,
  ReservePrice: 700,
  BuyNowPrice: 1200,
  StartsAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  EndsAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
  Status: "live",
  Product: {
    ID: 1,
    SellerID: 1,
    CategoryID: 1,
    Title: "iPhone 15 Pro Max",
    Description: "Excellent condition, clean body, battery health 96%.",
    Images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200",
    ],
    Condition: "used",
    Status: "active",
    Category: {
      ID: 1,
      Name: "Electronics",
      Slug: "electronics",
    },
  },
};
