export const formatCurrency = (amount: number) => {
  return `$${amount.toFixed(2)}`;
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const isValidEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
