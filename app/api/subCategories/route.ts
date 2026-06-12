import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { subCategories } from "@/db/schema";
import { redis } from "@/lib/redis";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        let data = await req.json()
        console.log(data)
        const restorePro = await db.update(subCategories)
            .set({ status: true })
            .where(and(eq(subCategories.name, data.name), eq(subCategories.code, data.code))).returning()
        console.log(restorePro)
        let result
        if (restorePro.length === 0) {
            let finaldata = {
                ...data, tenantId: "11111111-0001-0001-0001-000000000001"
            }
            result = await db.insert(subCategories).values(
                finaldata
            )
        }
        try {
            await redis.del('registeredProducts');
            await redis.del('registeredCategories');
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
        const code = error.cause?.code || error.code
        const constraint = error.cause?.constraint_name
        if (code === '23505' && constraint === 'tenant_subcategoryName_unique') {
            return NextResponse.json({
                status: false,
                message: "the Name is already register for another SubCategory"
            }, { status: 409 })
        }
        if (code === '23505' && constraint === 'tenant_subcategory_code_unique') {
            return NextResponse.json({
                status: false,
                message: "the Code is already register for another SubCategory"
            }, { status: 409 })
        }
        return NextResponse.json({
            status: false,
            message: error.message || "Something went wrong"
        }, { status: 500 })
    }
}