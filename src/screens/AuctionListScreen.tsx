import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { auctionApi } from "../api/auctionApi";
import { getApiErrorMessage } from "../api/client";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { AuctionCard } from "../components/AuctionCard";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { FilterChip } from "../components/FilterChip";
import { LoadingState } from "../components/LoadingState";
import { Screen } from "../components/Screen";
import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { Auction, AuctionStatus } from "../types/auction";

type StatusFilter = "all" | AuctionStatus;

const STATUS_FILTERS: {
  label: string;
  value: StatusFilter;
}[] = [
  { label: "All", value: "all" },
  { label: "Live", value: "live" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Ended", value: "ended" },
  { label: "Cancelled", value: "cancelled" },
];

const AuctionListScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ ending_soon?: string }>();

  const initialEndingSoon = params.ending_soon === "true";

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [endingSoon, setEndingSoon] = useState(initialEndingSoon);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchInput, setSearchInput] = useState("");

  const hasMore = page < totalPages;

  const activeFilterLabel = useMemo(() => {
    const parts: string[] = [];

    if (keyword) {
      parts.push(`Search: "${keyword}"`);
    }

    if (statusFilter !== "all") {
      parts.push(`Status: ${statusFilter}`);
    }

    if (endingSoon) {
      parts.push("Ending soon");
    }

    if (parts.length === 0) {
      return "Showing all auctions";
    }

    return parts.join(" • ");
  }, [keyword, statusFilter, endingSoon]);

  const loadAuctions = useCallback(
    async (
      targetPage = 1,
      options?: {
        append?: boolean;
        silent?: boolean;
      },
    ) => {
      try {
        setErrorMessage("");

        if (targetPage === 1 && !options?.silent) {
          setLoading(true);
        }

        if (targetPage > 1) {
          setLoadingMore(true);
        }

        const response = await auctionApi.getAuctions({
          page: targetPage,
          limit: 10,
          search: keyword || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          ending_soon: endingSoon || undefined,
        });

        setAuctions((prev) =>
          options?.append ? [...prev, ...response.data] : response.data,
        );

        setPage(response.page);
        setTotalPages(response.total_pages);
        setTotal(response.total);
      } catch (error: unknown) {
        setErrorMessage(
          getApiErrorMessage(error, "Không thể tải danh sách auction."),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [keyword, statusFilter, endingSoon],
  );

  useEffect(() => {
    void loadAuctions(1);
  }, [loadAuctions]);

  const handleSearch = () => {
    setKeyword(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setKeyword("");
  };

  const handleRefresh = () => {
    setRefreshing(true);
    void loadAuctions(1, { silent: true });
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore || loading || refreshing) {
      return;
    }

    void loadAuctions(page + 1, { append: true, silent: true });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setKeyword("");
    setStatusFilter("all");
    setEndingSoon(false);
  };

  const renderAuction = ({ item }: { item: Auction }) => {
    return (
      <AuctionCard
        auction={item}
        onPress={() => router.push(`/auctions/${item.id}`)}
      />
    );
  };

  if (loading) {
    return (
      <Screen>
        <LoadingState message="Đang tải danh sách auction..." />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screenContent}>
      <FlatList
        data={auctions}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderAuction}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={darkColors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>Auction Marketplace</Text>
              <Text style={styles.title}>Browse Auctions</Text>
              <Text style={styles.subtitle}>
                Search active listings, filter by auction status, and track
                items ending soon.
              </Text>
            </View>
            <Card style={styles.searchCard}>
              <AppInput
                label="Search"
                placeholder="Search by title or description..."
                value={searchInput}
                onChangeText={setSearchInput}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />

              <View style={styles.searchActions}>
                <AppButton
                  title="Search"
                  onPress={handleSearch}
                  style={styles.searchButton}
                />

                <AppButton
                  title="Clear"
                  onPress={handleClearSearch}
                  variant="secondary"
                  style={styles.searchButton}
                />
              </View>
            </Card>
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Status</Text>

              <View style={styles.filterRow}>
                {STATUS_FILTERS.map((filter) => (
                  <FilterChip
                    key={filter.value}
                    label={filter.label}
                    active={statusFilter === filter.value}
                    onPress={() => setStatusFilter(filter.value)}
                  />
                ))}
              </View>

              <View style={styles.filterRow}>
                <FilterChip
                  label="Ending Soon"
                  active={endingSoon}
                  onPress={() => setEndingSoon((prev) => !prev)}
                />

                <FilterChip
                  label="Reset Filters"
                  active={false}
                  onPress={handleResetFilters}
                />
              </View>
            </View>

            <Card style={styles.resultCard}>
              <Text style={styles.resultTitle}>{total} auctions found</Text>
              <Text style={styles.resultSubtitle}>{activeFilterLabel}</Text>
            </Card>

            {errorMessage ? (
              <Card style={styles.errorCard}>
                <Text style={styles.errorTitle}>Unable to load auctions</Text>
                <Text style={styles.errorMessage}>{errorMessage}</Text>

                <AppButton
                  title="Try Again"
                  onPress={() => loadAuctions(1)}
                  variant="secondary"
                  style={styles.errorButton}
                />
              </Card>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !errorMessage ? (
            <EmptyState
              title="No auctions found"
              message="Try changing your search keyword or filters."
              actionTitle="Create Auction"
              onActionPress={() => router.push("/auctions/create")}
              style={styles.emptyState}
            />
          ) : null
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {loadingMore ? (
              <ActivityIndicator color={darkColors.primary} />
            ) : hasMore ? (
              <AppButton
                title="Load More"
                onPress={handleLoadMore}
                variant="secondary"
              />
            ) : auctions.length > 0 ? (
              <Text style={styles.endText}>You have reached the end.</Text>
            ) : null}
          </View>
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.25}
      />

      <Pressable
        onPress={() => router.push("/auctions/create")}
        style={({ pressed }) => [
          styles.floatingButton,
          pressed && styles.floatingButtonPressed,
        ]}>
        <Text style={styles.floatingButtonText}>＋</Text>
      </Pressable>
    </Screen>
  );
};

export default AuctionListScreen;

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    right: spacing.xl,
    bottom: spacing.xl,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: darkColors.primary,
    shadowColor: darkColors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  floatingButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  floatingButtonText: {
    color: darkColors.textInverse,
    fontSize: 34,
    fontWeight: "900",
    marginTop: -3,
  },
  footer: {
    paddingVertical: spacing.xl,
  },
  endText: {
    color: darkColors.muted,
    fontSize: typography.caption,
    textAlign: "center",
    fontWeight: "700",
  },

  emptyState: {
    backgroundColor: darkColors.surface,
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: 22,
    marginTop: spacing.lg,
  },

  errorCard: {
    borderColor: darkColors.danger,
    marginBottom: spacing.xl,
  },
  errorTitle: {
    color: darkColors.text,
    fontSize: typography.subheading,
    fontWeight: "900",
  },
  errorMessage: {
    color: darkColors.muted,
    fontSize: typography.body,
    lineHeight: 23,
    marginTop: spacing.sm,
  },
  errorButton: {
    marginTop: spacing.lg,
  },

  filterSection: {
    marginBottom: spacing.xl,
  },
  filterTitle: {
    color: darkColors.text,
    fontSize: typography.subheading,
    fontWeight: "900",
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  resultCard: {
    marginBottom: spacing.lg,
  },
  resultTitle: {
    color: darkColors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  resultSubtitle: {
    color: darkColors.muted,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },

  searchCard: {
    marginBottom: spacing.xl,
  },
  searchActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  searchButton: {
    flex: 1,
  },

  screenContent: {
    paddingBottom: 0,
  },
  listContent: {
    paddingBottom: 110,
  },
  header: {
    marginBottom: spacing.xl,
  },
  eyebrow: {
    color: darkColors.primary,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  title: {
    color: darkColors.text,
    fontSize: 34,
    fontWeight: "900",
  },
  subtitle: {
    color: darkColors.muted,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
});
