import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Eye, Search } from "lucide-react";
import { getAdminBusinesses } from "../../api/adminApi";
import { EmptyStateCard, ErrorStateCard } from "../../components/StateCard";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";

const formatNumber = (value) => new Intl.NumberFormat("en").format(value || 0);

const formatDate = (value) => {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const statusClass = (status) =>
  status === "suspended"
    ? "border-red-200 bg-red-50 text-red-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";

function BusinessesLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-[520px] rounded-2xl" />
    </div>
  );
}

export default function AdminBusinessesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [accountType, setAccountType] = useState("");
  const [sortBy, setSortBy] = useState("registeredDate");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      status: status || undefined,
      accountType: accountType || undefined,
      sortBy,
      sortOrder,
    }),
    [accountType, debouncedSearch, page, sortBy, sortOrder, status],
  );

  const businessesQuery = useQuery({
    queryKey: ["admin", "businesses", queryParams],
    queryFn: () => getAdminBusinesses(queryParams),
  });

  const businesses = businessesQuery.data?.businesses || [];
  const pagination = businessesQuery.data?.pagination || {
    page,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const updateFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  if (businessesQuery.isLoading) {
    return <BusinessesLoading />;
  }

  if (businessesQuery.isError) {
    return (
      <ErrorStateCard
        message={
          businessesQuery.error?.response?.data?.message ||
          "We could not load businesses."
        }
        onRetry={() => businessesQuery.refetch()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <Card className="border-white/80 bg-white shadow-[0_18px_50px_-42px_rgba(15,23,42,0.45)]">
        <CardContent className="p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_0.7fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10"
                placeholder="Search business, owner, email, or mobile"
              />
            </div>

            <select
              value={status}
              onChange={updateFilter(setStatus)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={accountType}
              onChange={updateFilter(setAccountType)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
            >
              <option value="">All account types</option>
              <option value="beta">Beta</option>
              <option value="free">Free</option>
            </select>

            <select
              value={sortBy}
              onChange={updateFilter(setSortBy)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
            >
              <option value="registeredDate">Registered date</option>
              <option value="businessName">Business name</option>
              <option value="ownerName">Owner name</option>
              <option value="totalTestimonials">Testimonials</option>
              <option value="privateFeedbackCount">Private feedback</option>
              <option value="lastActivity">Last activity</option>
            </select>

            <select
              value={sortOrder}
              onChange={updateFilter(setSortOrder)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-white/80 bg-white shadow-[0_18px_60px_-44px_rgba(15,23,42,0.45)]">
        <CardContent className="p-0">
          <div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:p-5">
            <h2 className="text-lg font-bold text-slate-950">Business accounts</h2>
            <p className="text-sm text-slate-500">
              {formatNumber(pagination.total)} businesses match the current filters.
            </p>
          </div>

          {businesses.length === 0 ? (
            <div className="p-5">
              <EmptyStateCard
                title="No businesses found"
                description="Try changing the search term or filters."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1180px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Business</th>
                    <th className="px-4 py-3 font-semibold">Owner</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Mobile</th>
                    <th className="px-4 py-3 font-semibold">Registered</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Testimonials</th>
                    <th className="px-4 py-3 font-semibold">Private feedback</th>
                    <th className="px-4 py-3 font-semibold">Last activity</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {businesses.map((business) => (
                    <tr key={business._id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4 font-semibold text-slate-950">
                        {business.businessName || "Untitled business"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {business.owner?.name || "Unknown"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {business.owner?.email || "Not provided"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {business.owner?.mobile || "Not provided"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(business.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={statusClass(business.accountStatus)}>
                          {business.accountStatus || "active"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className="border-sky-200 bg-sky-50 text-sky-700">
                          {business.isBeta ? "Beta" : "Free"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatNumber(business.usage?.totalTestimonials)}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatNumber(business.usage?.privateFeedbackCount)}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(business.lastActivity)}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          to={`/admin/businesses/${business._id}`}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 bg-white"
                disabled={!pagination.hasPreviousPage || businessesQuery.isFetching}
                onClick={() => setPage((value) => Math.max(value - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 bg-white"
                disabled={!pagination.hasNextPage || businessesQuery.isFetching}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
