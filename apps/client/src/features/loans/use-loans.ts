"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type {
  CreateLoanInput,
  RecordLoanPaymentInput,
  UpdateLoanInput,
  UpdateLoanScheduleEntryInput,
} from "@finora/validation";
import type {
  LoanType,
  LoanInterestType,
  LoanInterestFrequency,
  LoanRepaymentFrequency,
  LoanInstallmentType,
  LoanStatus,
  LoanPaymentStatus,
} from "@finora/types";

export interface LoanScheduleEntry {
  id: string;
  installmentNumber: number;
  dueDate: string;
  principalComponent: string;
  interestComponent: string;
  totalDue: string;
  amountPaid: string;
  status: LoanPaymentStatus;
}

export interface LoanPaymentRecord {
  id: string;
  scheduleId: string;
  amount: string;
  paidDate: string;
  note: string | null;
  transaction: { id: string; account: { id: string; name: string } | null } | null;
}

interface LoanBase {
  id: string;
  lenderName: string;
  loanType: LoanType;
  principalAmount: string;
  startDate: string;
  endDate: string;
  hasInterest: boolean;
  interestType: LoanInterestType | null;
  interestValue: string | null;
  interestFrequency: LoanInterestFrequency | null;
  repaymentFrequency: LoanRepaymentFrequency;
  customRepaymentDays: number | null;
  installmentType: LoanInstallmentType;
  totalInstallments: number;
  status: LoanStatus;
  note: string | null;
  outstandingPrincipal: string;
  remainingInterest: string;
  totalPayableRemaining: string;
  totalPaid: string;
  progress: number;
  hasOverdue: boolean;
}

export interface Loan extends LoanBase {
  nextDueInstallment: {
    id: string;
    installmentNumber: number;
    dueDate: string;
    totalDue: string;
    amountPaid: string;
  } | null;
}

export interface LoanDetail extends LoanBase {
  totalPayableOriginal: string;
  totalInterest: string;
  schedule: LoanScheduleEntry[];
  payments: LoanPaymentRecord[];
}

export interface LoansSummary {
  totalBorrowed: string;
  totalOutstanding: string;
  totalPaid: string;
  activeLoanCount: number;
  overdueInstallmentCount: number;
  upcomingInstallmentCount: number;
}

export interface LoansResponse {
  loans: Loan[];
  summary: LoansSummary;
}

export function useLoans() {
  return useQuery({
    queryKey: ["loans"],
    queryFn: () => apiClient.get<LoansResponse>("/loans"),
  });
}

export function useLoan(id: string) {
  return useQuery({
    queryKey: ["loans", id],
    queryFn: () => apiClient.get<LoanDetail>(`/loans/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLoanInput) => apiClient.post<LoanDetail>("/loans", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["loans"] }),
  });
}

export function useUpdateLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateLoanInput & { id: string }) =>
      apiClient.patch<LoanDetail>(`/loans/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["loans"] }),
  });
}

export function useDeleteLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/loans/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["loans"] }),
  });
}

export function useUpdateLoanScheduleEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      loanId,
      scheduleId,
      ...input
    }: UpdateLoanScheduleEntryInput & { loanId: string; scheduleId: string }) =>
      apiClient.patch<LoanDetail>(`/loans/${loanId}/schedule/${scheduleId}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["loans"] }),
  });
}

export function useRecordLoanPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ loanId, ...input }: RecordLoanPaymentInput & { loanId: string }) =>
      apiClient.post<LoanDetail>(`/loans/${loanId}/payments`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
