import { sql} from "drizzle-orm";
import {
  pgTable,
  integer,
  text,
  serial,
  timestamp,
  bigint,
  customType
} from "drizzle-orm/pg-core";

export const customJsonb = <TData>(name: string) =>
  customType<{ data: TData; driverData: string }>({
    dataType() {
      return "jsonb";
    },
    // @ts-expect-error https://github.com/drizzle-team/drizzle-orm/issues/1511#issuecomment-1824687669
    toDriver(value: TData) {
      return value;
    },
  })(name);

const advocates = pgTable("advocates", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  city: text("city").notNull(),
  degree: text("degree").notNull(),
  specialties: customJsonb<string[]>("specialties").notNull(), 
  yearsOfExperience: integer("years_of_experience").notNull(),
  phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export { advocates };
