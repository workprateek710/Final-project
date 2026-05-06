import AdminAccountsTable from "@/components/admin-panel/AdminAccountsTable";
import { authOptions } from "@/libs/authOptions";
import { connectMongoDB } from "@/libs/MongoConnect";
import ProductRating from "@/libs/models/ProductRating";
import Purchase from "@/libs/models/Purchase";
import User from "@/libs/models/User";
import { getServerSession } from "next-auth";

type RawUserRow = {
  _id: string;
  name?: string;
  email: string;
  createdAt: string;
};

export const dynamic = "force-dynamic";

const ADMIN_TIME_ZONE = "America/Los_Angeles";

function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: ADMIN_TIME_ZONE,
  }).format(new Date(value));
}

export default async function AccountsPage() {
  const session = await getServerSession(authOptions);
  const adminEmail = session?.user?.email?.trim().toLowerCase() ?? "";

  await connectMongoDB();
  const [usersRaw, purchaseCounts, reviewCounts] = await Promise.all([
    User.find({}, { name: 1, email: 1, createdAt: 1 }).sort({ createdAt: -1 }).lean(),
    Purchase.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]),
    ProductRating.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]),
  ]);

  const purchasesByUser = new Map(purchaseCounts.map((row) => [row._id, row.count]));
  const reviewsByUser = new Map(reviewCounts.map((row) => [row._id, row.count]));

  const usersList = usersRaw as unknown as RawUserRow[];
  const usersForClient = usersList.map((user) => ({
    _id: String(user._id),
    name: user.name,
    email: user.email,
    joinedDisplay: formatAdminDate(user.createdAt),
    purchasesCount: purchasesByUser.get(user.email) ?? 0,
    reviewsCount: reviewsByUser.get(user.email) ?? 0,
  }));

  const registeredEmails = new Set(usersList.map((u) => u.email.trim().toLowerCase()));

  const isOrphanActivityUserId = (userId: string) => {
    const key = String(userId ?? "").trim().toLowerCase();
    if (!key || key === "anonymous") return false;
    return !registeredEmails.has(key);
  };

  const orphanPurchaseRows = purchaseCounts.filter((row) => isOrphanActivityUserId(String(row._id)));
  const orphanReviewRows = reviewCounts.filter((row) => isOrphanActivityUserId(String(row._id)));

  const orphanUserIds = new Set<string>();
  for (const row of orphanPurchaseRows) orphanUserIds.add(String(row._id).trim().toLowerCase());
  for (const row of orphanReviewRows) orphanUserIds.add(String(row._id).trim().toLowerCase());

  const deletedAccountsCount = orphanUserIds.size;
  const orphanPurchasesTotal = orphanPurchaseRows.reduce((sum, row) => sum + row.count, 0);
  const orphanReviewsTotal = orphanReviewRows.reduce((sum, row) => sum + row.count, 0);

  const deletedSummary =
    deletedAccountsCount > 0
      ? {
          count: deletedAccountsCount,
          purchasesTotal: orphanPurchasesTotal,
          reviewsTotal: orphanReviewsTotal,
        }
      : null;

  return (
    <div className="bg-white h-[calc(100vh-96px)] rounded-lg p-4 overflow-auto">
      <AdminAccountsTable users={usersForClient} adminEmail={adminEmail} deletedSummary={deletedSummary} />
    </div>
  );
}
