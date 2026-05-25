import { pgTable,varchar,integer,serial,boolean,timestamp } from "drizzle-orm/pg-core";
console.log('schema')
export const details=pgTable("details",{
    id:serial('id').primaryKey(),
  
  name: varchar("name", {
    length: 100
  }).notNull(),

  age: integer("age").notNull(),

  phone: varchar("phone", {
    length: 15
  }).notNull(),

  email: varchar("email", {
    length: 255
  })
    .notNull()
    .unique(),

  password: varchar("password", {
    length: 255
  }).notNull(),

  gender: varchar("gender", {
    length: 20
  }).notNull(),

  terms: boolean("terms")
    .default(false)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull()

    
})

