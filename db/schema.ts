import { pgTable,uuid,text,date,varchar,integer,numeric,serial,boolean,timestamp,unique } from "drizzle-orm/pg-core";
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
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  }
    
)

export const manufacturers = pgTable("manufacturers", {
  id: uuid("id").defaultRandom().primaryKey(),

  tenantId: uuid("tenant_id").notNull(),

  companyName: varchar("company_name", { length: 255 }).notNull(),

  gstNumber: varchar("gst_number", { length: 50 }),

  address: text("address"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  },
  (table) => [
    unique("tenant_gst_unique")
      .on(table.tenantId, table.gstNumber),
    unique("tenant_company_unique")
      .on(table.tenantId, table.companyName)
  ]
);


// Brands

export const brands = pgTable(
  "brands",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
    tenantId: uuid("tenant_id").notNull(),
    manufacturerId: uuid("manufacturer_id")
    .references(()=>manufacturers.id)
    .notNull(),

    parentBrandId: uuid("parent_brand_id")
    .references((): any => brands.id, {
      onDelete: "set null"
    }),
    name: varchar("name", { length: 255 })
      .notNull(),

    brandCode: varchar("brand_code", { length: 100 }),

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
  },
  (table) => [
    unique("tenant_brandcode_unique")
      .on(table.tenantId, table.brandCode),
     unique("tenant_brandName_unique")
      .on(table.tenantId, table.name)
  ]
);


// Products
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),

  tenantId: uuid("tenant_id").notNull(),

  brandId: uuid("brand_id")
    .references(() => brands.id)
    .notNull(),

  name: varchar("name", { length: 255 }).notNull(),

  productCode: varchar("product_code", { length: 100 }),

  description: text("description"),

  launchDate: date("launch_date"),

  status: boolean("status")
    .default(true),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  },
(table) => [
    unique("tenant_productcode_unique")
      .on(table.tenantId, table.productCode),
    unique("tenant_productName_unique")
      .on(table.tenantId, table.name)
  ]
);

export const industries = pgTable(
  "industries",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    tenantId: uuid("tenant_id")
      .notNull(),

    name: varchar("name", {
      length: 255
    }).notNull(),

    code: varchar("code", {
      length: 50
    }).notNull(),

    description: text("description"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  },

  (table) => [
    unique("tenant_industry_code_unique")
      .on(table.tenantId, table.code),
     unique("tenant_industryName_unique")
      .on(table.tenantId, table.name)
  ]
);



// Categories
export const categories = pgTable(
  "categories",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    tenantId: uuid("tenant_id")
      .notNull(),

    industryId: uuid("industry_id")
      .references(() => industries.id)
      .notNull(),

    name: varchar("name", {
      length: 255
    }).notNull(),

    code: varchar("code", {
      length: 50
    }).notNull(),

    imageUrl: text("image_url"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  },

  (table) => [
    unique("tenant_category_code_unique")
      .on(table.tenantId, table.code),
    
    unique("tenant_categoryName_unique")
      .on(table.tenantId, table.name)
  ]
);



// Sub Categories
export const subCategories = pgTable(
  "sub_categories",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    tenantId: uuid("tenant_id")
      .notNull(),

    categoryId: uuid("category_id")
      .references(() => categories.id)
      .notNull(),

    name: varchar("name", {
      length: 255
    }).notNull(),

    code: varchar("code", {
      length: 50
    }).notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  },

  (table) => [
    unique("tenant_subcategory_code_unique")
      .on(table.tenantId, table.code),
    
    unique("tenant_subcategoryName_unique")
      .on(table.tenantId, table.name)
  ]
);
export const productVariants =
  pgTable(
    "product_variants",
    {
      id: uuid("id")
        .defaultRandom()
        .primaryKey(),
     tenantId: uuid("tenant_id")
      .notNull(),
      productId: uuid(
        "product_id"
      )
        .references(
          () => products.id
        )
        .notNull(),

      variantName: varchar(
        "variant_name",
        { length: 255 }
      ).notNull(),

      status: boolean(
        "status"
      ).default(true),

      createdAt: timestamp(
        "created_at"
      )
        .defaultNow()
        .notNull(),
     updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
    },
    (table)=>[
       unique("product_variantName_unique")
       .on(table.productId,table.variantName)
    ]
  );

  export const skus = pgTable(
  "skus",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    tenantId: uuid("tenant_id")
      .notNull(),

    variantId: uuid(
      "variant_id"
    )
      .references(
        () =>
          productVariants.id,
      )
      .notNull(),

    skuCode: varchar(
      "sku_code",
      { length: 100 }
    )
          .notNull(),
    mrp: numeric("mrp", {
      precision: 12,
      scale: 2,
    }),

    sellingPrice: numeric(
      "selling_price",
      {
        precision: 12,
        scale: 2,
      }
    ),
    status: boolean("status")
      .default(true),

    createdAt: timestamp(
      "created_at"
    )
      .defaultNow()
      .notNull(),

    updatedAt: timestamp(
      "updated_at"
    )
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table)=>[
   unique("tenant_skucode_varainat_unique")
   .on(table.tenantId,table.skuCode,table.variantId)
  ]
);

export const attributes =
  pgTable(
    "attributes",
    {
      id: uuid("id")
        .defaultRandom()
        .primaryKey(),
      categoryId: uuid(
        "category_id"
      ),
      name: varchar("name", {
        length: 255,
      }).notNull(),
      code: varchar("code", {
        length: 100,
      }).notNull(),
      dataType: varchar(
        "data_type",
        { length: 50 }
      ).notNull(),

      isFilterable: boolean(
        "is_filterable"
      ).default(false),

      isRequired: boolean(
        "is_required"
      ).default(false),

      status: boolean(
        "status"
      ).default(true),

      createdAt: timestamp(
        "created_at"
      )
        .defaultNow()
        .notNull(),
      updatedAt: timestamp(
      "updated_at"
    )
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    },(table) => [
        unique(
      "category_attribute_name_unique"
    ).on(
      table.categoryId,
      table.name
    ),
    unique(
      "category_attribute_code_unique"
    ).on(
      table.categoryId,
      table.code
    ),
  ]
  );
export const skuAttributeValues =
  pgTable(
    "sku_attribute_values",
    {
      id: uuid("id")
        .defaultRandom()
        .primaryKey(),

      skuId: uuid("sku_id")
        .references(
          () => skus.id)
        .notNull(),

      attributeId: uuid(
        "attribute_id"
      )
        .references(
          () => attributes.id
        )
        .notNull(),

      value: text("value"),

      createdAt: timestamp(
        "created_at"
      )
        .defaultNow()
        .notNull(),
    },

    (table) => [
      unique(
        "sku_attribute_unique"
      ).on(
        table.skuId,
        table.attributeId
      ),
    ]
  );