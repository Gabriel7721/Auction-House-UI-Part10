import type { Bid } from "../types/auction";

export const bidHistorySample: Bid[] = [
  {
    ID: 5,
    AuctionID: 1,
    UserID: 4,
    Amount: 925,
    CreatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    User: {
      id: 4,
      name: "David Nguyen",
      email: "david@example.com",
    },
  },
  {
    ID: 4,
    AuctionID: 1,
    UserID: 3,
    Amount: 875,
    CreatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    User: {
      id: 3,
      name: "Sophia Tran",
      email: "sophia@example.com",
    },
  },
  {
    ID: 3,
    AuctionID: 1,
    UserID: 2,
    Amount: 825,
    CreatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    User: {
      id: 2,
      name: "Michael Le",
      email: "michael@example.com",
    },
  },
  {
    ID: 2,
    AuctionID: 1,
    UserID: 5,
    Amount: 775,
    CreatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    User: {
      id: 5,
      name: "Emily Pham",
      email: "emily@example.com",
    },
  },
  {
    ID: 1,
    AuctionID: 1,
    UserID: 6,
    Amount: 725,
    CreatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    User: {
      id: 6,
      name: "Kevin Hoang",
      email: "kevin@example.com",
    },
  },
];
