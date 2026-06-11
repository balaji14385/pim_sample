import { NextRequest,NextResponse } from "next/server";
import { db } from "@/db/index";
import { manufacturers } from "@/db/schema";
import { redis } from "@/lib/redis";
import { eq,and } from "drizzle-orm";

export async function POST(req:NextRequest) {
    try {
        let data=await req.json()
        
        const restorePro = await db.update(manufacturers)
            .set({ status: true })
            .where(and(eq(manufacturers.companyName, data.name),eq(manufacturers.gstNumber,data.gstNumber))).returning()
        let result
        if (restorePro.length === 0) {
            let finaldata = {
                ...data, tenantId: "11111111-0001-0001-0001-000000000001"
            }
            result = await db.insert(manufacturers).values(
                finaldata
            ).returning()
        }
                   try {
                        await redis.del('registeredBrands');
                        await redis.del('registeredManufacturer');
                    } catch (redisError) {
                        console.error("Redis cache invalidation failed:", redisError);
                    }

       return NextResponse.json({
            status: true,
            message: restorePro.length > 0 ? "Restored product" : "Inserted product",
            data: restorePro.length > 0 ? restorePro : result,
        }, { status: 200 })

    } catch (error:any) {
        console.log(error)

       return NextResponse.json({
        status:false,
        message:error.message || "Something went wrong" 
       },{status:500})   
    }
}