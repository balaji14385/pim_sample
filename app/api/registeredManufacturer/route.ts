import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { brands, manufacturers, products } from "@/db/schema";
import { db } from '@/db/index';
import { redis } from "@/lib/redis";

export async function GET() {
    try {
   const data = await db
  .select({
    id:manufacturers.id,

    companyName: manufacturers.companyName,

    gstNumber: manufacturers.gstNumber,

    address: manufacturers.address,

    brandCount: sql<number>`
      count(${brands.manufacturerId})
    `.as("brand_count"),

    productName: products.name,

    createdAt: manufacturers.createdAt
  })

  .from(manufacturers)
  
  .leftJoin(
    brands,
    sql`${brands.manufacturerId} = ${manufacturers.id}`
  ).where(eq(brands.status,true))
  
  .leftJoin(
    products,
    sql`${products.brandId} = ${brands.id}`
  )
  
  .groupBy(
    manufacturers.id,
    manufacturers.companyName,
    manufacturers.gstNumber,
    manufacturers.address,
    manufacturers.createdAt,
    products.name
  )
   try {
                  await redis.set('registeredManufacturer',data)
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