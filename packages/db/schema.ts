import { relations, sql } from 'drizzle-orm';
import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  date,
  numeric,
  integer,
  index,
  uniqueIndex,
  check,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import type { UserRole } from '../domains/entities/user';

/* ============================================================
 * Auth / organization
 * ============================================================ */

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  role: text('role').$type<UserRole>().default('employee').notNull(),
  departmentId: text('departmentId')
    .notNull()
    .references(() => department.id, { onDelete: 'restrict' }),
  positionId: text('positionId')
    .notNull()
    .references(() => position.id, { onDelete: 'restrict' }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  banned: boolean('banned'),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires', { precision: 6, withTimezone: true }),
});

export const department = pgTable('department', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export const position = pgTable('position', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  departmentId: text('department_id')
    .notNull()
    .references(() => department.id, { onDelete: 'restrict' }),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    impersonatedBy: text('impersonated_by'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

/* ============================================================
 * OKR enums
 * ============================================================ */

export const cycleStatusEnum = pgEnum('cycle_status', [
  'planning',
  'active',
  'closed',
]);
export const cycleTypeEnum = pgEnum('cycle_type', [
  'quarterly',
  'annual',
  'custom',
]);

export const objectiveLevelEnum = pgEnum('objective_level', [
  'company',
  'department',
  'individual',
]);
export const objectiveStatusEnum = pgEnum('objective_status', [
  'draft',
  'active',
  'completed',
  'cancelled',
]);

// Yes/no key results are modelled as `number` 0 → 1 (or split into countable milestones).
export const metricTypeEnum = pgEnum('metric_type', [
  'number',
  'percentage',
  'currency',
]);
// Lifecycle of a key result (is it still being worked on?).
export const keyResultStatusEnum = pgEnum('key_result_status', [
  'active',
  'done',
  'cancelled',
]);
// Health of a key result (is it likely to hit the target?). Independent of status.
export const keyResultHealthEnum = pgEnum('key_result_health', [
  'on_track',
  'at_risk',
  'off_track',
]);

/* ============================================================
 * OKR tables
 * ============================================================ */

export const cycle = pgTable(
  'cycle',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    type: cycleTypeEnum('type').default('quarterly').notNull(),
    // Calendar dates (no time / timezone), returned as 'YYYY-MM-DD' strings.
    startAt: date('start_at').notNull(),
    endAt: date('end_at').notNull(),
    status: cycleStatusEnum('status').default('planning').notNull(),

    createdBy: text('created_by')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedBy: text('updated_by').references(() => user.id, {
      onDelete: 'restrict',
    }),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedBy: text('deleted_by').references(() => user.id, {
      onDelete: 'restrict',
    }),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    index('cycle_status_idx').on(table.status),
    // At most one non-deleted active cycle at any time.
    // Activating a new cycle = close the old one and activate the new one in one transaction.
    uniqueIndex('cycle_single_active_idx')
      .on(table.status)
      .where(sql`${table.status} = 'active' AND ${table.deletedAt} IS NULL`),
    check('cycle_dates_check', sql`${table.endAt} > ${table.startAt}`),
  ],
);

export const objective = pgTable(
  'objective',
  {
    id: text('id').primaryKey(),
    cycleId: text('cycle_id')
      .notNull()
      .references(() => cycle.id, { onDelete: 'restrict' }),
    // Alignment: single parent → alignment forms a tree.
    // SET NULL only fires on hard delete; soft delete / cancel of a parent
    // is handled in the use case (flag children for re-alignment).
    parentObjectiveId: text('parent_objective_id').references(
      (): AnyPgColumn => objective.id,
      { onDelete: 'set null' },
    ),
    // Null = company-level objective.
    departmentId: text('department_id').references(() => department.id, {
      onDelete: 'restrict',
    }),

    title: text('title').notNull(),
    details: text('details'),
    // No default: the caller must choose the level explicitly.
    level: objectiveLevelEnum('level').notNull(),
    status: objectiveStatusEnum('status').default('draft').notNull(),
    // Cached weighted average of THIS objective's own key results, 0–100.
    // Never rolled up from aligned child objectives.
    // Recomputed in the same transaction as every check-in / KR change.
    progress: numeric('progress', { precision: 5, scale: 2, mode: 'number' })
      .default(0)
      .notNull(),

    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),

    createdBy: text('created_by')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedBy: text('updated_by').references(() => user.id, {
      onDelete: 'restrict',
    }),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedBy: text('deleted_by').references(() => user.id, {
      onDelete: 'restrict',
    }),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    // Main listing query: objectives of a cycle, filtered by level / department.
    // Partial: only used by queries that include `deleted_at IS NULL`.
    index('objective_cycle_level_department_idx')
      .on(table.cycleId, table.level, table.departmentId)
      .where(sql`${table.deletedAt} IS NULL`),
    index('objective_ownerId_idx').on(table.ownerId),
    index('objective_departmentId_idx').on(table.departmentId),
    index('objective_parentObjectiveId_idx').on(table.parentObjectiveId),
    check('objective_progress_range', sql`${table.progress} BETWEEN 0 AND 100`),
    // Company objectives have no department; department/individual must have one.
    check(
      'objective_level_department_match',
      sql`(${table.level} = 'company') = (${table.departmentId} IS NULL)`,
    ),
    // An objective cannot align to itself.
    check(
      'objective_not_self_parent',
      sql`${table.parentObjectiveId} <> ${table.id}`,
    ),
  ],
);

export const keyResult = pgTable(
  'key_result',
  {
    id: text('id').primaryKey(),
    objectiveId: text('objective_id')
      .notNull()
      .references(() => objective.id, { onDelete: 'restrict' }),

    title: text('title').notNull(),
    details: text('details'),

    // Measurement
    metricType: metricTypeEnum('metric_type').default('number').notNull(),
    unit: text('unit'), // e.g. "users", "฿", "%"
    startValue: numeric('start_value', {
      precision: 14,
      scale: 4,
      mode: 'number',
    })
      .default(0)
      .notNull(),
    targetValue: numeric('target_value', {
      precision: 14,
      scale: 4,
      mode: 'number',
    }).notNull(),
    currentValue: numeric('current_value', {
      precision: 14,
      scale: 4,
      mode: 'number',
    })
      .default(0)
      .notNull(),
    weight: numeric('weight', { precision: 5, scale: 2, mode: 'number' })
      .default(1)
      .notNull(),
    status: keyResultStatusEnum('status').default('active').notNull(),
    health: keyResultHealthEnum('health').default('on_track').notNull(),

    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),

    createdBy: text('created_by')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedBy: text('updated_by').references(() => user.id, {
      onDelete: 'restrict',
    }),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedBy: text('deleted_by').references(() => user.id, {
      onDelete: 'restrict',
    }),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    index('key_result_objectiveId_idx').on(table.objectiveId),
    index('key_result_ownerId_idx').on(table.ownerId),
    check(
      'key_result_target_differs',
      sql`${table.targetValue} <> ${table.startValue}`,
    ),
    check('key_result_weight_positive', sql`${table.weight} > 0`),
  ],
);

// Append-only progress history: each check-in also updates keyResult.currentValue.
export const keyResultCheckIn = pgTable(
  'key_result_check_in',
  {
    id: text('id').primaryKey(),
    keyResultId: text('key_result_id')
      .notNull()
      .references(() => keyResult.id, { onDelete: 'cascade' }),
    // keyResult.currentValue at the moment of this check-in (before applying `value`).
    // Read it with SELECT ... FOR UPDATE in the same transaction that writes the check-in.
    previousValue: numeric('previous_value', {
      precision: 14,
      scale: 4,
      mode: 'number',
    }).notNull(),
    value: numeric('value', {
      precision: 14,
      scale: 4,
      mode: 'number',
    }).notNull(),
    confidence: integer('confidence'), // 1–10, how likely the target will be hit
    note: text('note'),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('check_in_keyResultId_createdAt_idx').on(
      table.keyResultId,
      table.createdAt,
    ),
    check(
      'check_in_confidence_range',
      sql`${table.confidence} BETWEEN 1 AND 10`,
    ),
  ],
);

/* ============================================================
 * Relations
 * ============================================================ */

export const userRelations = relations(user, ({ one, many }) => ({
  sessions: many(session),
  accounts: many(account),
  department: one(department, {
    fields: [user.departmentId],
    references: [department.id],
  }),
  position: one(position, {
    fields: [user.positionId],
    references: [position.id],
  }),
  ownedObjectives: many(objective, { relationName: 'objective_owner' }),
  ownedKeyResults: many(keyResult, { relationName: 'key_result_owner' }),
  checkIns: many(keyResultCheckIn),
}));

export const departmentRelations = relations(department, ({ many }) => ({
  users: many(user),
  positions: many(position),
  objectives: many(objective),
}));

export const positionRelations = relations(position, ({ one, many }) => ({
  users: many(user),
  department: one(department, {
    fields: [position.departmentId],
    references: [department.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const cycleRelations = relations(cycle, ({ many }) => ({
  objectives: many(objective),
}));

export const objectiveRelations = relations(objective, ({ one, many }) => ({
  cycle: one(cycle, {
    fields: [objective.cycleId],
    references: [cycle.id],
  }),
  department: one(department, {
    fields: [objective.departmentId],
    references: [department.id],
  }),
  owner: one(user, {
    fields: [objective.ownerId],
    references: [user.id],
    relationName: 'objective_owner',
  }),
  parent: one(objective, {
    fields: [objective.parentObjectiveId],
    references: [objective.id],
    relationName: 'objective_alignment',
  }),
  children: many(objective, { relationName: 'objective_alignment' }),
  keyResults: many(keyResult),
}));

export const keyResultRelations = relations(keyResult, ({ one, many }) => ({
  objective: one(objective, {
    fields: [keyResult.objectiveId],
    references: [objective.id],
  }),
  owner: one(user, {
    fields: [keyResult.ownerId],
    references: [user.id],
    relationName: 'key_result_owner',
  }),
  checkIns: many(keyResultCheckIn),
}));

export const keyResultCheckInRelations = relations(
  keyResultCheckIn,
  ({ one }) => ({
    keyResult: one(keyResult, {
      fields: [keyResultCheckIn.keyResultId],
      references: [keyResult.id],
    }),
    author: one(user, {
      fields: [keyResultCheckIn.createdBy],
      references: [user.id],
    }),
  }),
);

/* ============================================================
 * Typed table map
 * ============================================================ */

const schemaTables = {
  user,
  department,
  position,
  session,
  account,
  verification,
  cycle,
  objective,
  keyResult,
  keyResultCheckIn,
};

export const Schema = schemaTables;
export type Schema = typeof schemaTables;
