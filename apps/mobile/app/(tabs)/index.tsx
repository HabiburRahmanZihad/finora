import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { formatCurrency } from "@finora/utils";
import { useDashboardSummary } from "@/src/features/dashboard/use-dashboard";
import { authClient, useSession } from "@/src/lib/auth-client";
import { LogoMark } from "@/src/components/Logo";
import { colors, radius } from "@/src/lib/theme";

function StatCard({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" | "danger" }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text
        style={[
          styles.cardValue,
          tone === "success" && { color: colors.success },
          tone === "danger" && { color: colors.danger },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { data: session } = useSession();
  const { data: summary, isLoading, isRefetching, refetch } = useDashboardSummary();

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LogoMark size={32} />
            <View>
              <Text style={styles.greeting}>Hi, {session?.user?.name?.split(" ")[0] ?? "there"}</Text>
              <Text style={styles.subGreeting}>Your financial situation at a glance</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            hitSlop={8}
            onPress={() => authClient.signOut()}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : summary ? (
          <View style={styles.grid}>
            <StatCard label="Total Balance" value={formatCurrency(summary.totalBalance, "BDT")} />
            <StatCard label="Income" value={formatCurrency(summary.totalIncome, "BDT")} tone="success" />
            <StatCard label="Expense" value={formatCurrency(summary.totalExpense, "BDT")} tone="danger" />
            <StatCard label="Savings" value={formatCurrency(summary.totalSavings, "BDT")} />
            <StatCard label="Savings Rate" value={`${summary.savingsRate}%`} />
          </View>
        ) : (
          <Text style={styles.empty}>Could not load your summary. Pull to retry.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  container: {
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  greeting: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.foreground,
  },
  subGreeting: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
  },
  cardLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.foreground,
  },
  empty: {
    textAlign: "center",
    color: colors.mutedForeground,
    marginTop: 32,
  },
});
