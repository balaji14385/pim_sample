import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { products, brands } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { redis } from "@/lib/redis";


export async function POST(req: NextRequest) {
    try {
        let data = await req.json()
        const restorePro = await db.update(products)
            .set({ status: true })
            .where(and(eq(products.name, data.name),eq(products.productCode, data.productCode))).returning()
        console.log(restorePro)
        let result
        if (restorePro.length === 0) {
            let finaldata = {
                ...data, tenantId: "11111111-0001-0001-0001-000000000001"
            }
            result = await db.insert(products).values(
                finaldata
            )
        }
            try {
                await redis.del('registeredProducts');
                await redis.del('registeredManufacturer');
            } catch (redisError) {
                console.error("Redis cache invalidation failed:", redisError);
            }
        return NextResponse.json({
            status: true,
            message: restorePro.length > 0 ? "Restored product" : "Inserted product",
            data: restorePro.length > 0 ? restorePro : result,
        }, { status: 200 })

    } catch (error: any) {
        console.log(error)

        return NextResponse.json({
            status: false,
            message: error.message || "Something went wrong"
        }, { status: 500 })
    }
}