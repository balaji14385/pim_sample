import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { brands, manufacturers, products } from "@/db/schema";
import { db } from '@/db/index';

export async function GET() {
    try {
   const data = await db
  .select({
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
  )

  .leftJoin(
    products,
    sql`${products.brandId} = ${brands.id}`
  )

  .groupBy(
    manufacturers.companyName,
    manufacturers.gstNumber,
    manufacturers.address,
    manufacturers.createdAt,
    products.name
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