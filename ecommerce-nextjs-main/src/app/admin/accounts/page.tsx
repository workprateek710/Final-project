import { connectMongoDB } from "@/libs/MongoConnect";
import ProductRating from "@/libs/models/ProductRating";
import Purchase from "@/libs/models/Purchase";
import User from "@/libs/models/User";

type AccountRow = {
  _id: string;
  name?: string;
  email: string;
  createdAt: string;
  purchasesCount: number;
  reviewsCount: number;
};

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

  const users = (usersRaw as unknown as RawUserRow[]).map((user) => ({
    ...user,
    purchasesCount: purchasesByUser.get(user.email) ?? 0,
    reviewsCount: reviewsByUser.get(user.email) ?? 0,
  })) as AccountRow[];

  const registeredEmails = new Set(
    (usersRaw as unknown as RawUserRow[]).map((u) => u.email.trim().toLowerCase())
  );

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

  return (
    <div className="bg-white h-[calc(100vh-96px)] rounded-lg p-4 overflow-auto">
      <h2 className="text-3xl">Accounts</h2>
      <p className="text-sm text-slate-500 mt-1">Registered storefront users.</p>
      <div className="mt-4 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-t border-[#ececec]">
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Email</th>
              <th className="text-left py-2">Purchases</th>
              <th className="text-left py-2">Reviews</th>
              <th className="text-left py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t border-[#f1f1f1]">
                <td className="py-2">{user.name || "—"}</td>
                <td className="py-2">{user.email}</td>
                <td className="py-2">{user.purchasesCount}</td>
                <td className="py-2">{user.reviewsCount}</td>
                <td className="py-2">{formatAdminDate(user.createdAt)}</td>
              </tr>
            ))}
            {deletedAccountsCount > 0 && (
              <tr className="border-t border-[#f1f1f1] bg-slate-50/80">
                <td className="py-2 font-medium text-slate-800">
                  Deleted users ({deletedAccountsCount})
                </td>
                <td className="py-2 text-slate-400">—</td>
                <td className="py-2 font-medium">{orphanPurchasesTotal}</td>
                <td className="py-2 font-medium">{orphanReviewsTotal}</td>
                <td className="py-2 text-slate-400">—</td>
              </tr>
            )}
            {users.length === 0 && (
              <tr>
                <td className="py-4 text-slate-500" colSpan={5}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {deletedAccountsCount > 0 && (
          <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-xl">
            The row above sums purchases and reviews for storefront accounts that were deleted (history is kept under their former email id). Guest checkout under “anonymous” is excluded.
          </p>
        )}
      </div>
    </div>
  );
}
