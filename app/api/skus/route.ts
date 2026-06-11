import { NextRequest,NextResponse } from "next/server";
import { db } from "@/db/index";
import {skus} from "@/db/schema";
import { redis } from "@/lib/redis";
import { eq,and } from "drizzle-orm";


export async function POST(req:NextRequest) {
    try {
        let data=await req.json()
        console.log(data)
                 const restorePro = await db.update(skus)
                            .set({ status: true })
                            .where(and(eq(skus.skuCode, data.skuCode),eq(skus.variantId,data.variantId))).returning()
                        let result
                        if (restorePro.length === 0) {
                            let finaldata = {
                                ...data, tenantId: "11111111-0001-0001-0001-000000000001"
                            }
                            result = await db.insert(skus).values(
                                finaldata
                            )
                        }
                           try {
                                await redis.del('registeredProducts');
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