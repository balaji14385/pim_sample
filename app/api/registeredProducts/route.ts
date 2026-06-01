import { eq, sql,countDistinct } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { brands, products,productVariants,subCategories,skus,categories } from "@/db/schema";
import { db } from '@/db/index';
export async function GET() {
    try {
        const data = await db
  .select({
    productName: products.name,
    productCode: products.productCode,
    brandName: brands.name,
    categoryName: categories.name,
    variantCount: countDistinct(productVariants.id),
    skuCount: countDistinct(skus.id),
    status:products.status,
    created:products.createdAt
  })
  .from(products)

  .innerJoin(
    brands,
    eq(brands.id, products.brandId)
  )

  .innerJoin(
    subCategories,
    eq(subCategories.id, products.subCategoryId)
  )

  .innerJoin(
    categories,
    eq(categories.id, subCategories.categoryId)
  )

  .leftJoin(
    productVariants,
    eq(productVariants.productId, products.id)
  )

  .leftJoin(
    skus,
    eq(skus.variantId, productVariants.id)
  )

  .groupBy(
    products.id,
    products.name,
    products.productCode,
    brands.name,
    categories.name
  );
        return NextResponse.json({
            status: true,
            message: "successfully fetch data",
            data
        }, { status: 200 })
    } catch (error: any) {
        console.log(error)

        return NextResponse.json({
            status: false,
            message: error.message || "Something went wrong"
        }, { status: 500 })
    }
} 