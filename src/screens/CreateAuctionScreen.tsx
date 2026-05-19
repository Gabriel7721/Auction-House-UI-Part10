import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { auctionApi } from "../api/auctionApi";
import { categoryApi } from "../api/categoryApi";
import { getApiErrorMessage, isUnauthorizedError } from "../api/client";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { Card } from "../components/Card";
import { DateTimeSelector } from "../components/DateTimeSelector";
import { FilterChip } from "../components/FilterChip";
import { InfoLine } from "../components/InfoLine";
import { LoadingState } from "../components/LoadingState";
import { Screen } from "../components/Screen";
import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import type {
  Category,
  CreateAuctionRequest,
  ProductCondition,
} from "../types/auction";
import { removeAuthTokens } from "../utils/auth";
import {
  formatDateTimeDisplay,
  getDefaultEndDate,
  getDefaultStartDate,
  mergeDateTimeValue,
} from "../utils/format";

type CreateAuctionErrors = {
  title?: string;
  description?: string;
  category_id?: string;
  condition?: string;
  start_price?: string;
  reserve_price?: string;
  buy_now_price?: string;
  bid_increment?: string;
  starts_at?: string;
  ends_at?: string;
};

type ActivePicker = {
  field: "starts_at" | "ends_at";
  mode: "date" | "time";
} | null;

const CONDITIONS: { label: string; value: ProductCondition }[] = [
  { label: "New", value: "new" },
  { label: "Used", value: "used" },
  { label: "Refurbished", value: "refurbished" },
];

const MAX_IMAGES = 5;

export default function CreateAuctionScreen() {
  const router = useRouter();
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState<CreateAuctionErrors>({});
  const [description, setDescription] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryID, setCategoryID] = useState<number | null>(null);
  const [condition, setCondition] = useState<ProductCondition>("used");

  const [pickingImages, setPickingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<
    ImagePicker.ImagePickerAsset[]
  >([]);

  const [startPrice, setStartPrice] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [buyNowPrice, setBuyNowPrice] = useState("");
  const [bidIncrement, setBidIncrement] = useState("25");

  const [startsAt, setStartsAt] = useState<Date>(getDefaultStartDate());
  const [endsAt, setEndsAt] = useState<Date>(getDefaultEndDate());
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryApi.getCategories();
        setCategories(data);

        if (data.length > 0) {
          setCategoryID(data[0].id);
        }
      } catch (error: unknown) {
        if (isUnauthorizedError(error)) {
          await removeAuthTokens();
          router.replace("/login");
          return;
        }

        Alert.alert(
          "Error",
          getApiErrorMessage(error, "Không thể tải categories."),
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    void loadCategories();
  }, [router]);

  const handlePickImages = async () => {
    if (selectedImages.length >= MAX_IMAGES) {
      Alert.alert(
        "Image limit reached",
        `You can select up to ${MAX_IMAGES} images.`,
      );
      return;
    }

    setPickingImages(true);

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow photo library access to choose product images.",
        );
        return;
      }

      const remainingSlots = MAX_IMAGES - selectedImages.length;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.85,
      });

      if (result.canceled) {
        return;
      }

      const newAssets = result.assets || [];

      setSelectedImages((prev) => {
        const merged = [...prev];

        for (const asset of newAssets) {
          const alreadyExists = merged.some((item) => item.uri === asset.uri);

          if (!alreadyExists && merged.length < MAX_IMAGES) {
            merged.push(asset);
          }
        }

        return merged;
      });
    } catch (error: unknown) {
      Alert.alert(
        "Image picker error",
        getApiErrorMessage(error, "Không thể chọn ảnh từ thư viện."),
      );
    } finally {
      setPickingImages(false);
    }
  };
  const handleClearImages = () => {
    setSelectedImages([]);
  };
  const handleRemoveImage = (uri: string) => {
    setSelectedImages((prev) => prev.filter((item) => item.uri !== uri));
  };
  const openPicker = (
    field: "starts_at" | "ends_at",
    mode: "date" | "time",
  ) => {
    setActivePicker({
      field,
      mode,
    });
  };

  const handleDateTimeChange = (
    event: DateTimePickerEvent,
    selectedValue?: Date,
  ) => {
    if (Platform.OS === "android") {
      setActivePicker(null);
    }

    if (!activePicker || event.type === "dismissed" || !selectedValue) {
      return;
    }

    if (activePicker.field === "starts_at") {
      setStartsAt((prev) =>
        mergeDateTimeValue(prev, selectedValue, activePicker.mode),
      );
      return;
    }

    setEndsAt((prev) =>
      mergeDateTimeValue(prev, selectedValue, activePicker.mode),
    );
  };

  const validate = (): boolean => {
    const nextErrors: CreateAuctionErrors = {};

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    const startPriceNumber = Number(startPrice);
    const reservePriceNumber = reservePrice.trim()
      ? Number(reservePrice)
      : null;
    const buyNowPriceNumber = buyNowPrice.trim() ? Number(buyNowPrice) : null;
    const bidIncrementNumber = Number(bidIncrement);

    if (!cleanTitle) {
      nextErrors.title = "Title is required.";
    }

    if (!cleanDescription) {
      nextErrors.description = "Description is required.";
    }

    if (!categoryID) {
      nextErrors.category_id = "Please select a category.";
    }

    if (!condition) {
      nextErrors.condition = "Please select a condition.";
    }

    if (!startPrice.trim()) {
      nextErrors.start_price = "Start price is required.";
    } else if (Number.isNaN(startPriceNumber) || startPriceNumber <= 0) {
      nextErrors.start_price = "Start price must be greater than 0.";
    }

    if (
      reservePrice.trim() &&
      (Number.isNaN(reservePriceNumber) ||
        reservePriceNumber === null ||
        reservePriceNumber < startPriceNumber)
    ) {
      nextErrors.reserve_price =
        "Reserve price must be greater than or equal to start price.";
    }

    if (
      buyNowPrice.trim() &&
      (Number.isNaN(buyNowPriceNumber) ||
        buyNowPriceNumber === null ||
        buyNowPriceNumber < startPriceNumber)
    ) {
      nextErrors.buy_now_price =
        "Buy now price must be greater than or equal to start price.";
    }

    if (!bidIncrement.trim()) {
      nextErrors.bid_increment = "Bid increment is required.";
    } else if (Number.isNaN(bidIncrementNumber) || bidIncrementNumber <= 0) {
      nextErrors.bid_increment = "Bid increment must be greater than 0.";
    }

    if (endsAt <= startsAt) {
      nextErrors.ends_at = "End time must be after start time.";
    }

    if (endsAt <= new Date()) {
      nextErrors.ends_at = "End time cannot be in the past.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = (): CreateAuctionRequest => {
    const reserve = reservePrice.trim() ? Number(reservePrice) : null;
    const buyNow = buyNowPrice.trim() ? Number(buyNowPrice) : null;

    return {
      title: title.trim(),
      description: description.trim(),
      category_id: categoryID as number,
      condition,
      images: selectedImages.map((image) => image.uri),
      start_price: Number(startPrice),
      reserve_price: reserve,
      buy_now_price: buyNow,
      bid_increment: Number(bidIncrement),
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    };
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);

    try {
      const payload = buildPayload();
      const createdAuction = await auctionApi.createAuction(payload);

      Alert.alert("Success", "Auction created successfully.");

      router.replace(`/auctions/${createdAuction.id}`);
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        await removeAuthTokens();
        router.replace("/login");
        return;
      }

      Alert.alert("Create auction failed", getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = useMemo(() => {
    return (
      title.trim().length > 0 &&
      description.trim().length > 0 &&
      categoryID !== null &&
      startPrice.trim().length > 0 &&
      bidIncrement.trim().length > 0 &&
      !submitting
    );
  }, [title, description, categoryID, startPrice, bidIncrement, submitting]);

  if (loadingCategories) {
    return (
      <Screen>
        <LoadingState message="Đang tải categories..." />
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>‹ Back</Text>
            </Pressable>
          </View>

          <View style={styles.header}>
            <Text style={styles.eyebrow}>Seller Console</Text>
            <Text style={styles.title}>Create Auction</Text>
            <Text style={styles.subtitle}>
              List your product, select gallery images, choose auction time, and
              launch a live marketplace listing.
            </Text>
          </View>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Product Information</Text>

            <AppInput
              label="Title"
              placeholder="Example: iPhone 15 Pro Max"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
            />

            <AppInput
              label="Description"
              placeholder="Describe condition, included accessories, warranty..."
              value={description}
              onChangeText={setDescription}
              error={errors.description}
              multiline
              numberOfLines={5}
              style={styles.textArea}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Category</Text>

            {errors.category_id ? (
              <Text style={styles.errorText}>{errors.category_id}</Text>
            ) : null}

            <View style={styles.chipRow}>
              {categories.map((category) => (
                <FilterChip
                  key={category.id}
                  label={category.name}
                  active={categoryID === category.id}
                  onPress={() => setCategoryID(category.id)}
                />
              ))}
            </View>

            <Text style={styles.label}>Condition</Text>

            {errors.condition ? (
              <Text style={styles.errorText}>{errors.condition}</Text>
            ) : null}

            <View style={styles.chipRow}>
              {CONDITIONS.map((item) => (
                <FilterChip
                  key={item.value}
                  label={item.label}
                  active={condition === item.value}
                  onPress={() => setCondition(item.value)}
                />
              ))}
            </View>
          </Card>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Product Images</Text>

            <Text style={styles.helpTextNormal}>
              Select up to {MAX_IMAGES} images from your phone gallery.
            </Text>

            <View style={styles.imageActionRow}>
              <AppButton
                title="Choose from Gallery"
                onPress={handlePickImages}
                loading={pickingImages}
                style={styles.imageActionButton}
              />

              {selectedImages.length > 0 ? (
                <AppButton
                  title="Clear"
                  onPress={handleClearImages}
                  variant="secondary"
                  style={styles.imageActionButton}
                />
              ) : null}
            </View>

            {selectedImages.length === 0 ? (
              <View style={styles.emptyImageBox}>
                <Text style={styles.emptyImageTitle}>No images selected</Text>
                <Text style={styles.emptyImageMessage}>
                  Product photos will appear here after you choose them.
                </Text>
              </View>
            ) : (
              <View style={styles.imageGrid}>
                {selectedImages.map((image, index) => (
                  <View key={`${image.uri}-${index}`} style={styles.imageCard}>
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.imagePreview}
                    />

                    <Pressable
                      onPress={() => handleRemoveImage(image.uri)}
                      style={styles.removeImageButton}>
                      <Text style={styles.removeImageText}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </Card>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Auction Pricing</Text>

            <AppInput
              label="Start Price"
              placeholder="500"
              keyboardType="numeric"
              value={startPrice}
              onChangeText={setStartPrice}
              error={errors.start_price}
            />

            <AppInput
              label="Reserve Price"
              placeholder="Optional, example: 700"
              keyboardType="numeric"
              value={reservePrice}
              onChangeText={setReservePrice}
              error={errors.reserve_price}
            />

            <AppInput
              label="Buy Now Price"
              placeholder="Optional, example: 1200"
              keyboardType="numeric"
              value={buyNowPrice}
              onChangeText={setBuyNowPrice}
              error={errors.buy_now_price}
            />

            <AppInput
              label="Bid Increment"
              placeholder="25"
              keyboardType="numeric"
              value={bidIncrement}
              onChangeText={setBidIncrement}
              error={errors.bid_increment}
            />
          </Card>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Auction Timeline</Text>

            <DateTimeSelector
              label="Starts At"
              value={startsAt}
              error={errors.starts_at}
              onPickDate={() => openPicker("starts_at", "date")}
              onPickTime={() => openPicker("starts_at", "time")}
            />

            <DateTimeSelector
              label="Ends At"
              value={endsAt}
              error={errors.ends_at}
              onPickDate={() => openPicker("ends_at", "date")}
              onPickTime={() => openPicker("ends_at", "time")}
            />

            {activePicker ? (
              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerTitle}>
                  {activePicker.field === "starts_at"
                    ? "Select Start"
                    : "Select End"}{" "}
                  {activePicker.mode === "date" ? "Date" : "Time"}
                </Text>

                <DateTimePicker
                  value={activePicker.field === "starts_at" ? startsAt : endsAt}
                  mode={activePicker.mode}
                  onChange={handleDateTimeChange}
                  minimumDate={
                    activePicker.field === "ends_at" &&
                    activePicker.mode === "date"
                      ? startsAt
                      : undefined
                  }
                  display={
                    Platform.OS === "ios"
                      ? activePicker.mode === "date"
                        ? "inline"
                        : "spinner"
                      : "default"
                  }
                />

                {Platform.OS === "ios" ? (
                  <AppButton
                    title="Done"
                    onPress={() => setActivePicker(null)}
                    variant="secondary"
                    style={styles.donePickerButton}
                  />
                ) : null}
              </View>
            ) : null}
          </Card>

          <Card style={styles.previewCard}>
            <Text style={styles.cardTitle}>Quick Preview</Text>

            <InfoLine label="Title" value={title || "Untitled auction"} />
            <InfoLine
              label="Start Price"
              value={startPrice ? `$${startPrice}` : "$0"}
            />
            <InfoLine
              label="Bid Increment"
              value={bidIncrement ? `$${bidIncrement}` : "$0"}
            />
            <InfoLine
              label="Images"
              value={`${selectedImages.length} image(s)`}
            />
            <InfoLine label="Starts" value={formatDateTimeDisplay(startsAt)} />
            <InfoLine label="Ends" value={formatDateTimeDisplay(endsAt)} />
          </Card>

          <AppButton
            title="Create Auction"
            onPress={handleSubmit}
            loading={submitting}
            disabled={!canSubmit}
            style={styles.submitButton}
          />

          <AppButton
            title="Cancel"
            onPress={() => router.back()}
            variant="secondary"
            style={styles.cancelButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    marginTop: spacing.sm,
  },
  cancelButton: {
    marginTop: spacing.md,
  },

  previewCard: {
    marginBottom: spacing.lg,
    borderColor: darkColors.primary,
  },
  previewLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: darkColors.border,
  },
  previewLabel: {
    color: darkColors.muted,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  previewValue: {
    color: darkColors.text,
    fontSize: typography.caption,
    fontWeight: "900",
    flex: 1,
    textAlign: "right",
  },

  pickerWrapper: {
    backgroundColor: darkColors.surfaceSoft,
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: 18,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  pickerTitle: {
    color: darkColors.text,
    fontSize: typography.body,
    fontWeight: "900",
    marginBottom: spacing.md,
  },
  donePickerButton: {
    marginTop: spacing.md,
  },

  emptyImageBox: {
    backgroundColor: darkColors.surfaceSoft,
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: 18,
    padding: spacing.lg,
  },
  emptyImageTitle: {
    color: darkColors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  emptyImageMessage: {
    color: darkColors.muted,
    fontSize: typography.caption,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  imageCard: {
    width: "47.5%",
    height: 140,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: darkColors.surfaceSoft,
    borderWidth: 1,
    borderColor: darkColors.border,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.72)",
  },
  removeImageText: {
    color: darkColors.white,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 22,
  },

  helpTextNormal: {
    color: darkColors.muted,
    fontSize: typography.caption,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },

  imageActionRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  imageActionButton: {
    flex: 1,
  },
  label: {
    color: darkColors.text,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  errorText: {
    color: darkColors.danger,
    fontSize: typography.caption,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  card: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    color: darkColors.text,
    fontSize: typography.subheading,
    fontWeight: "900",
    marginBottom: spacing.lg,
  },
  textArea: {
    minHeight: 110,
    paddingTop: spacing.md,
  },

  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },

  topBar: {
    marginBottom: spacing.md,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
  },
  backText: {
    color: darkColors.primary,
    fontSize: typography.body,
    fontWeight: "900",
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
