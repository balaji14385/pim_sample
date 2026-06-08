import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { brands, manufacturers, products } from "@/db/schema";
import { db } from '@/db/index';
import { alias } from "drizzle-orm/pg-core";

export async function GET() {
    try {
const pb = alias(brands, "parentBrands");

        const data = await db
            .select({
                id:brands.id,
                logo: brands.logoUrl,

                brandName: brands.name,

                parentBrandName: pb.name,

                brandCode: brands.brandCode,

                brandType: brands.brandType,

                companyName: manufacturers.companyName,

                productCount: sql<number>`
        count(${products.brandId})
    `,

                status: brands.status,

                createdAt: brands.createdAt
            })
            .from(brands)

            .innerJoin(
                manufacturers,
                eq(manufacturers.id, brands.manufacturerId)
            )

            .leftJoin(
                pb,
                eq(pb.id, brands.parentBrandId)
            )

            .leftJoin(
                products,
                eq(products.brandId, brands.id)
            )

            .groupBy(
                brands.id,
                brands.logoUrl,
                brands.name,
                pb.name,
                brands.brandCode,
                brands.brandType,
                manufacturers.companyName,
                brands.status,
                brands.createdAt
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