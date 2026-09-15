import { AccountType } from "@finora/types";
import { Banknote, Building2, CreditCard, Landmark, PiggyBank, Smartphone } from "lucide-react";

export const accountTypeLabels: Record<AccountType, string> = {
  CASH: "Cash",
  BANK: "Bank Account",
  MOBILE_WALLET: "Mobile Wallet",
  CREDIT_CARD: "Credit Card",
  SAVINGS: "Savings Account",
  OTHER: "Other",
};

export const accountTypeIcons: Record<AccountType, typeof Banknote> = {
  CASH: Banknote,
  BANK: Landmark,
  MOBILE_WALLET: Smartphone,
  CREDIT_CARD: CreditCard,
  SAVINGS: PiggyBank,
  OTHER: Building2,
};
