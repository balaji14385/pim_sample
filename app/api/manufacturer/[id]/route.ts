import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { manufacturers,brands } from "@/db/schema";
import { db } from '@/db/index';
import { redis } from "@/lib/redis";
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) 
{
   try {
    const {id}= await params
    console.log(id)
      if(!id)
    {
        return NextResponse.json({
            status: false,
            message: "product id required"
        }, { status: 404 })
    }
    const data=await req.json()
   let upd=await db.update(manufacturers).set(data).where(eq(manufacturers.id,id)).returning()
   if(upd.length===0)
   {
    return NextResponse.json({
            status: false,
            message: "Manufacturer not update"
        }, { status: 408 })
   }if(upd && upd.length>0)
        {
           try {
                await redis.del('registeredManufacturer');
            } catch (redisError) {
                console.error("Redis cache invalidation failed:", redisError);
            }
        }
    return NextResponse.json({
            status: true,
            message: "Manufacturer successfully update"
        }, { status: 200 })
   } catch (error: any) {
  console.error("Raw Database Error:", error); 
  const dbErrorCode = error.cause?.code || error.code;
  const constraintName = error.cause?.constraint_name || error.constraint;

  if (dbErrorCode === '23505' && constraintName === 'tenant_gst_unique') {
    return NextResponse.json({
      status: false,
      message: "This GST number is already registered for another manufacturer."
    }, { status: 400 });
  }

  return NextResponse.json({
    status: false,
    message: error.message || "Something went wrong"
  }, { status: 500 });
}
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
try {
     const {id}=await params
    const result=await db.transaction(async(tx)=>{
       await tx.update(manufacturers)
       .set({status:false})
       .where(eq(manufacturers.id,id))
       await tx.update(brands)
       .set({status:false})
       .where(eq(brands.manufacturerId,manufacturers.id))
    })
       try {
                await redis.del('registeredProducts');
            } catch (redisError) {
                console.error("Redis cache invalidation failed:", redisError);
            }
return NextResponse.json({
            status: true,
            message: "Successfully Deleted",
            data:result
        }, { status: 200 })
} catch (error:any) {
    console.log(error)

        return NextResponse.json({
            status: false,
            message: error.message || "Something went wrong"
        }, { status: 500 })
}
}