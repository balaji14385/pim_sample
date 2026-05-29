CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"industry_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_category_code_unique" UNIQUE("tenant_id","code"),
	CONSTRAINT "tenant_categoryName_unique" UNIQUE("tenant_id","name")
);
--> statement-breakpoint
CREATE TABLE "industries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_industry_code_unique" UNIQUE("tenant_id","code"),
	CONSTRAINT "tenant_industryName_unique" UNIQUE("tenant_id","name")
);
--> statement-breakpoint
CREATE TABLE "sub_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_subcategory_code_unique" UNIQUE("tenant_id","code"),
	CONSTRAINT "tenant_subcategoryName_unique" UNIQUE("tenant_id","name")
);
--> statement-breakpoint
ALTER TABLE "brands" DROP CONSTRAINT "brands_brand_code_unique";--> statement-breakpoint
ALTER TABLE "manufacturers" DROP CONSTRAINT "manufacturers_gst_number_unique";--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_product_code_unique";--> statement-breakpoint
ALTER TABLE "details" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_categories" ADD CONSTRAINT "sub_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "tenant_brandcode_unique" UNIQUE("tenant_id","brand_code");--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "tenant_brandName_unique" UNIQUE("tenant_id","name");--> statement-breakpoint
ALTER TABLE "manufacturers" ADD CONSTRAINT "tenant_gst_unique" UNIQUE("tenant_id","gst_number");--> statement-breakpoint
ALTER TABLE "manufacturers" ADD CONSTRAINT "tenant_company_unique" UNIQUE("tenant_id","company_name");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "tenant_productcode_unique" UNIQUE("tenant_id","product_code");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "tenant_productName_unique" UNIQUE("tenant_id","name");