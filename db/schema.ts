import { pgTable,uuid,text,date,varchar,integer,serial,boolean,timestamp } from "drizzle-orm/pg-core";
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

export const manufacturers = pgTable("manufacturers", {
  id: uuid("id").defaultRandom().primaryKey(),

  tenantId: uuid("tenant_id").notNull(),

  companyName: varchar("company_name", { length: 255 }).notNull(),

  gstNumber: varchar("gst_number", { length: 50 })
  .unique(),

  address: text("address"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()  
});


// Brands

export const brands = pgTable(
  "brands",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    tenantId: uuid("tenant_id").notNull(),

    segmentId: uuid("segment_id"),

    manufacturerId: uuid("manufacturer_id")
    .references(()=>manufacturers.id)
    .notNull(),

    parentBrandId: uuid("parent_brand_id")
    .references((): any => brands.id, {
      onDelete: "set null"
    }),
    name: varchar("name", { length: 255 })
      .notNull(),

    brandCode: varchar("brand_code", { length: 100 })
       .unique(),

    brandType: varchar("brand_type", { length: 100 }),

    countryOrigin: varchar(
      "country_origin",
      { length: 100 }
    ),

    description: text("description"),

    logoUrl: text("logo_url"),

    status: boolean("status")
      .default(true),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  }
);


// Products
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),

  tenantId: uuid("tenant_id").notNull(),

  brandId: uuid("brand_id")
    .references(() => brands.id)
    .notNull(),

  name: varchar("name", { length: 255 }).notNull(),

  productCode: varchar("product_code", { length: 100 })
  .unique(),

  description: text("description"),

  launchDate: date("launch_date"),

  status: boolean("status")
    .default(true),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()  
});