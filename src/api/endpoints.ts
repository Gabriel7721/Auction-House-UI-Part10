export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },

  categories: "/categories",

  auctions: {
    list: "/auctions",
    detail: (id: number | string) => `/auctions/${id}`,
    create: "/auctions",
    update: (id: number | string) => `/auctions/${id}`,
    cancel: (id: number | string) => `/auctions/${id}/cancel`,
    bids: (id: number | string) => `/auctions/${id}/bids`,
    watch: (id: number | string) => `/auctions/${id}/watch`,
  },

  me: {
    auctions: "/me/auctions",
    bids: "/me/bids",
    watchlist: "/me/watchlist",
  },

  admin: {
    stats: "/admin/stats",
    users: "/admin/users",
    auctions: "/admin/auctions",
    auctionStatus: (id: number | string) => `/admin/auctions/${id}/status`,
    user: (id: number | string) => `/admin/users/${id}`,
  },
};
