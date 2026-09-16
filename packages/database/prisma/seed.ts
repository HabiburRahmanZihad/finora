import { PrismaClient, CategoryType } from "../generated/client/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ADMIN_USER_ID = "seed-admin-user";
const ADMIN_ACCOUNT_ID = "seed-admin-account";
const ADMIN_EMAIL = "admin@finora.com";
const ADMIN_PASSWORD = "Pa$$w0rd";

const defaultExpenseCategories = [
  { name: "Food", icon: "utensils" },
  { name: "Transport", icon: "car" },
  { name: "Housing", icon: "home" },
  { name: "Shopping", icon: "shopping-bag" },
  { name: "Bills & Utilities", icon: "receipt" },
  { name: "Entertainment", icon: "film" },
  { name: "Health", icon: "heart-pulse" },
  { name: "Education", icon: "graduation-cap" },
  { name: "Travel", icon: "plane" },
  { name: "Technology", icon: "laptop" },
  { name: "Family", icon: "users" },
  { name: "Personal Care", icon: "sparkles" },
  { name: "Other", icon: "ellipsis" },
];

const defaultIncomeCategories = [
  { name: "Salary", icon: "wallet" },
  { name: "Freelance", icon: "briefcase" },
  { name: "Business", icon: "building" },
  { name: "Investment", icon: "trending-up" },
  { name: "Bonus", icon: "gift" },
  { name: "Gift", icon: "gift" },
  { name: "Other", icon: "ellipsis" },
];

async function main() {
  for (const category of defaultExpenseCategories) {
    await prisma.category.upsert({
      where: { id: `default-expense-${slug(category.name)}` },
      update: {},
      create: {
        id: `default-expense-${slug(category.name)}`,
        userId: null,
        name: category.name,
        icon: category.icon,
        type: CategoryType.EXPENSE,
        isDefault: true,
      },
    });
  }

  for (const category of defaultIncomeCategories) {
    await prisma.category.upsert({
      where: { id: `default-income-${slug(category.name)}` },
      update: {},
      create: {
        id: `default-income-${slug(category.name)}`,
        userId: null,
        name: category.name,
        icon: category.icon,
        type: CategoryType.INCOME,
        isDefault: true,
      },
    });
  }

  console.log(
    `Seeded ${defaultExpenseCategories.length} expense + ${defaultIncomeCategories.length} income default categories.`,
  );

  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  await prisma.user.upsert({
    where: { id: ADMIN_USER_ID },
    update: { role: "admin" },
    create: {
      id: ADMIN_USER_ID,
      name: "Finora Admin",
      email: ADMIN_EMAIL,
      emailVerified: true,
      role: "admin",
    },
  });

  // Mirrors Better Auth's own sign-up flow (providerId: "credential",
  // accountId === userId) so the seeded admin can sign in normally.
  await prisma.account.upsert({
    where: { id: ADMIN_ACCOUNT_ID },
    update: { password: passwordHash },
    create: {
      id: ADMIN_ACCOUNT_ID,
      accountId: ADMIN_USER_ID,
      providerId: "credential",
      userId: ADMIN_USER_ID,
      password: passwordHash,
    },
  });

  console.log(`Seeded admin user ${ADMIN_EMAIL}.`);
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
