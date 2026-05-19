export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const isValidRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateRequired = (
  value: string,
  label: string,
): string | null => {
  return value.trim() ? null : `${label} là bắt buộc.`;
};

export const validatePassword = (password: string): string | null => {
  if (!password.trim()) return "Mật khẩu là bắt buộc.";
  if (password.length < 6) return "Mật khẩu cần ít nhất 6 ký tự.";
  return null;
};

 