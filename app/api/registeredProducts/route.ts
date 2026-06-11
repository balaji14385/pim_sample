import { eq, sql,countDistinct,and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { brands, products,productVariants,subCategories,skus,categories } from "@/db/schema";
import { db } from '@/db/index';
import { redis } from "@/lib/redis";
export async function GET() {
    try {
        const data = await db
  .select({
    id:products.id,
    productName: products.name,
    productCode: products.productCode,
    brandName: brands.name,
    categoryName: categories.name,
    variantsCount: countDistinct(productVariants.id),
    skuCount: countDistinct(skus.id),
    status:products.status,
    createdAt:products.createdAt
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
    and(eq(productVariants.productId, products.id),eq(productVariants.status,true))
  )

  .leftJoin(
    skus,
    and(eq(skus.variantId, productVariants.id),eq(skus.status,true)
)
  )

  .groupBy(
    products.id,
    products.name,
    products.productCode,
    brands.name,
    categories.name
  )
  .where(eq(products.status,true))
    try {
                await redis.set('registeredProducts',data)
               } catch (redisError) {
                   console.error("Failed to update Redis cache:", redisError);
               }
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