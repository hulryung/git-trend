import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

export const repositories = sqliteTable(
  "repositories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    fullName: text("full_name").notNull(),
    owner: text("owner").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    language: text("language"),
    stars: integer("stars").notNull().default(0),
    forks: integer("forks").notNull().default(0),
    topics: text("topics"),
    homepage: text("homepage"),
    license: text("license"),
    createdAt: text("created_at"),
    pushedAt: text("pushed_at"),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_repo_full_name").on(table.fullName),
    index("idx_repo_language").on(table.language),
  ]
);

export const trendingSnapshots = sqliteTable(
  "trending_snapshots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    repoId: integer("repo_id")
      .notNull()
      .references(() => repositories.id),
    date: text("date").notNull(),
    period: text("period").notNull(),
    rank: integer("rank"),
    starsToday: integer("stars_today"),
    source: text("source").notNull().default("scrape"),
    collectedAt: text("collected_at").notNull(),
  },
  (table) => [
    index("idx_snapshot_date_period").on(table.date, table.period),
    uniqueIndex("idx_snapshot_repo_date_period").on(
      table.repoId,
      table.date,
      table.period
    ),
  ]
);

export const starHistory = sqliteTable(
  "star_history",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    repoId: integer("repo_id")
      .notNull()
      .references(() => repositories.id),
    date: text("date").notNull(),
    stars: integer("stars").notNull(),
  },
  (table) => [
    uniqueIndex("idx_star_history_repo_date").on(table.repoId, table.date),
  ]
);

export const analyses = sqliteTable(
  "analyses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    repoId: integer("repo_id")
      .notNull()
      .references(() => repositories.id),
    summaryKo: text("summary_ko"),
    summaryEn: text("summary_en"),
    techStack: text("tech_stack"),
    category: text("category"),
    useCases: text("use_cases"),
    similarProjects: text("similar_projects"),
    highlights: text("highlights"),
    difficulty: text("difficulty"),
    modelVersion: text("model_version"),
    analyzedAt: text("analyzed_at").notNull(),
  },
  (table) => [index("idx_analysis_repo").on(table.repoId)]
);

export const trendClassifications = sqliteTable(
  "trend_classifications",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    repoId: integer("repo_id")
      .notNull()
      .references(() => repositories.id),
    date: text("date").notNull(),
    classification: text("classification").notNull(),
    trendScore: real("trend_score"),
    consecutiveDays: integer("consecutive_days"),
  },
  (table) => [
    index("idx_trend_class_date").on(table.date, table.classification),
  ]
);

export const webhookSubscriptions = sqliteTable("webhook_subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull(),
  platform: text("platform").notNull(),
  filters: text("filters"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});
