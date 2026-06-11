import { eq, sql,and,countDistinct } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { brands, manufacturers, products } from "@/db/schema";
import { db } from '@/db/index';
import { alias } from "drizzle-orm/pg-core";
import {redis} from '@/lib/redis'

export async function GET() {
    try {
    let cached=await redis.get('registeredBrands')
    if(cached)
    {
        return NextResponse.json({
            status: true,
            message: "successfully fetch data",
            data:cached
        }, { status: 200 })
    }
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

               productCount: countDistinct(products.id),

                status: brands.status,

                createdAt: brands.createdAt
            })
            .from(brands)

            .innerJoin(
                manufacturers,
                and(eq(manufacturers.id, brands.manufacturerId),eq(manufacturers.status,true))
            )

            .leftJoin(
                pb,
                and( eq(pb.id, brands.parentBrandId),eq(pb.status,true))
            )

            .leftJoin(
                products,
                and(eq(products.brandId, brands.id),eq(products.status,true))
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
            )
            .where(eq(brands.status,true))
            try {
             await redis.set('registeredBrands',data)
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