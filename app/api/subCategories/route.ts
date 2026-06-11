import { NextRequest,NextResponse } from "next/server";
import { db } from "@/db/index";
import { subCategories } from "@/db/schema";
import { redis } from "@/lib/redis";

export async function POST(req:NextRequest) {
    try {
        let data=await req.json()
        
        let finaldata={...data,tenantId: "11111111-0001-0001-0001-000000000001"
}
        let insData=await db.insert(subCategories).values(
            finaldata
        ).returning()
        if(insData && insData.length>0)
                        {
                           try {
                                await redis.del('registeredProducts');
                                await redis.del('registeredCategories');
                            } catch (redisError) {
                                console.error("Redis cache invalidation failed:", redisError);
                            }
                        }
        return NextResponse.json({
            status:true,
            message:"successfully inserted"
        },{status:200})
    } catch (error:any) {
        console.log(error)

       return NextResponse.json({
        status:false,
        message:error.message || "Something went wrong" 
       },{status:500})   
    }
}