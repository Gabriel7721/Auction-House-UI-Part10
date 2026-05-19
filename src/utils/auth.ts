import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "access_token";

export const saveAuthTokens = async (
  accessToken: string,
  refreshToken?: string,
): Promise<void> => {
  await AsyncStorage.multiSet([[ACCESS_TOKEN_KEY, accessToken]]);
};

export const saveToken = async (token: string): Promise<void> => {
  await saveAuthTokens(token);
};

export const getAccessToken = async (): Promise<string | null> => {
  const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  if (accessToken) return accessToken;

  return null;
};

export const getToken = getAccessToken;

export const removeAuthTokens = async (): Promise<void> => {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const removeToken = removeAuthTokens;
