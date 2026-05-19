import type {
    Auction,
    AuctionListResponse,
    AuctionQueryParams,
    Bid,
    CreateAuctionRequest,
    PlaceBidRequest,
    UpdateAuctionRequest,
    WatchlistItem,
} from "../types/auction";
import apiClient from "./client";
import { endpoints } from "./endpoints";

type SingleAuctionResponse = {
  message?: string;
  data: Auction;
};

type BidResponse = {
  message?: string;
  bid: Bid;
  auction: Auction;
};

type BidListResponse = {
  data: Bid[];
};

type WatchlistResponse = {
  data: WatchlistItem[];
};

type MyAuctionsResponse = {
  data: Auction[];
};

type MyBidsResponse = {
  data: Bid[];
};

type MessageResponse = {
  message: string;
};

export const auctionApi = {
  async getAuctions(
    params: AuctionQueryParams = {},
  ): Promise<AuctionListResponse> {
    const response = await apiClient.get<AuctionListResponse>(
      endpoints.auctions.list,
      {
        params,
      },
    );

    return response.data;
  },

  async getLatestAuctions(limit = 10): Promise<Auction[]> {
    const response = await this.getAuctions({
      page: 1,
      limit: limit,
      status: "live",
    });

    return response.data;
    // const response = await apiClient.get("/auctions", {
    //   params: { limit },
    // });

    // console.log("API auctions response:", response.data);

    // return response.data.auctions;
  },

  async getEndingSoonAuctions(limit = 10): Promise<Auction[]> {
    const response = await this.getAuctions({
      page: 1,
      limit: limit,
      status: "live",
      ending_soon: true,
    });

    return response.data;
  },

  async getAuctionById(id: number | string): Promise<Auction> {
    const response = await apiClient.get<SingleAuctionResponse>(
      endpoints.auctions.detail(id),
    );

    return response.data.data;
  },

  async createAuction(payload: CreateAuctionRequest): Promise<Auction> {
    const response = await apiClient.post<SingleAuctionResponse>(
      endpoints.auctions.create,
      payload,
    );

    return response.data.data;
  },

  async updateAuction(
    id: number | string,
    payload: UpdateAuctionRequest,
  ): Promise<Auction> {
    const response = await apiClient.put<SingleAuctionResponse>(
      endpoints.auctions.update(id),
      payload,
    );

    return response.data.data;
  },

  async cancelAuction(id: number | string): Promise<MessageResponse> {
    const response = await apiClient.patch<MessageResponse>(
      endpoints.auctions.cancel(id),
    );

    return response.data;
  },

  async placeBid(
    auctionId: number | string,
    payload: PlaceBidRequest,
  ): Promise<BidResponse> {
    const response = await apiClient.post<BidResponse>(
      endpoints.auctions.bids(auctionId),
      payload,
    );

    return response.data;
  },

  async getAuctionBids(auctionId: number | string): Promise<Bid[]> {
    const response = await apiClient.get<BidListResponse>(
      endpoints.auctions.bids(auctionId),
    );

    return response.data.data;
  },

  async watchAuction(auctionId: number | string): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      endpoints.auctions.watch(auctionId),
    );

    return response.data;
  },

  async unwatchAuction(auctionId: number | string): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>(
      endpoints.auctions.watch(auctionId),
    );

    return response.data;
  },

  async getMyWatchlist(): Promise<WatchlistItem[]> {
    const response = await apiClient.get<WatchlistResponse>(
      endpoints.me.watchlist,
    );

    return response.data.data;
  },

  async getMyAuctions(): Promise<Auction[]> {
    const response = await apiClient.get<MyAuctionsResponse>(
      endpoints.me.auctions,
    );

    return response.data.data;
  },

  async getMyBids(): Promise<Bid[]> {
    const response = await apiClient.get<MyBidsResponse>(endpoints.me.bids);

    return response.data.data;
  },
};
