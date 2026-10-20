import { classifyDeadline, isDueThisWeek } from "@/lib/utils/deadline";
import type {
  GeneralContractor,
  PageResult,
  Project,
  ProjectListItem,
  ProjectListQuery,
  ProjectSortKey,
  User,
} from "@/types/domain";

const STATUS_ORDER = [
  "new",
  "screening",
  "go",
  "reviewing",
  "pricing",
  "submitted",
  "won",
  "lost",
  "no_go",
] as const;

export function toListItem(
  project: Project,
  contractors: GeneralContractor[],
  users: User[],
): ProjectListItem {
  return {
    id: project.id,
    name: project.name,
    number: project.number,
    city: project.city,
    trade: project.trade,
    status: project.status,
    gcId: project.gcId,
    gcName:
      contractors.find((contractor) => contractor.id === project.gcId)?.name ?? "Unknown",
    ownerId: project.ownerId,
    ownerName: users.find((user) => user.id === project.ownerId)?.name ?? "Unassigned",
    bidDueAt: project.bidDueAt,
    estimatedValue: project.estimatedValue,
    nextAction: project.nextAction,
  };
}

function compareValues(
  left: string | number | null,
  right: string | number | null,
): number {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  if (typeof left === "number" && typeof right === "number") return left - right;
  return String(left).localeCompare(String(right));
}

function sortValue(item: ProjectListItem, key: ProjectSortKey): string | number | null {
  if (key === "status") return STATUS_ORDER.indexOf(item.status);
  if (key === "estimatedValue") return item.estimatedValue;
  if (key === "bidDueAt") return item.bidDueAt;
  return item.name;
}

export function queryProjects(
  projects: Project[],
  contractors: GeneralContractor[],
  users: User[],
  query: ProjectListQuery,
  now: Date,
): PageResult<ProjectListItem> {
  const search = query.search?.trim().toLowerCase() ?? "";
  const items = projects
    .map((project) => toListItem(project, contractors, users))
    .filter((item) => {
      if (query.status && query.status !== "all" && item.status !== query.status)
        return false;
      if (query.trade && query.trade !== "all" && item.trade !== query.trade)
        return false;
      if (query.ownerId && query.ownerId !== "all" && item.ownerId !== query.ownerId)
        return false;
      if (query.gcId && query.gcId !== "all" && item.gcId !== query.gcId) return false;
      if (search) {
        const haystack =
          `${item.name} ${item.number} ${item.city} ${item.gcName}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      const tone = classifyDeadline(item.bidDueAt, now);
      if (query.deadline === "overdue" && tone !== "overdue") return false;
      if (query.deadline === "today" && tone !== "today") return false;
      if (query.deadline === "soon" && tone !== "soon" && tone !== "today") return false;
      if (query.deadline === "week" && !isDueThisWeek(item.bidDueAt, now)) return false;
      return true;
    });

  const sort = query.sort ?? "bidDueAt";
  const direction = query.direction ?? "asc";
  items.sort((left, right) => {
    const result = compareValues(sortValue(left, sort), sortValue(right, sort));
    return direction === "asc" ? result : -result;
  });

  const pageSize = query.pageSize ?? 8;
  const page = Math.max(1, query.page ?? 1);
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  };
}
