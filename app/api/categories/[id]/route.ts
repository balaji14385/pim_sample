import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { categories,subCategories } from "@/db/schema";
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
            message: "Category id required"
        }, { status: 404 })
    }
    const data=await req.json()
   let upd=await db.update(categories).set(data).where(eq(categories.id,id)).returning()
   if(upd.length===0)
   {
    return NextResponse.json({
            status: false,
            message: "Category not update"
        }, { status: 408 })
   }
   if(upd && upd.length>0)
                {
                   try {
                        await redis.del('registeredCategories');
                    } catch (redisError) {
                        console.error("Redis cache invalidation failed:", redisError);
                    }
                }
    return NextResponse.json({
            status: true,
            message: "Category successfully update"
        }, { status: 200 })
   } catch (error: any) {
  console.error(error); 
  const dbErrorCode = error.cause?.code || error.code;
  const constraintName = error.cause?.constraint_name || error.constraint;

  if (dbErrorCode === '23505' && constraintName === 'tenant_category_code_unique') {
    return NextResponse.json({
      status: false,
      message: "This Category Code is already registered for another Category."
    }, { status: 400 });
  }
 if (dbErrorCode === '23505' && constraintName === 'tenant_categoryName_unique') {
    return NextResponse.json({
      status: false,
      message: "This Category Name is already registered for another Category."
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
       await tx.update(categories).set({status:false})
       .where(eq(categories.id,id))
       await tx.update(subCategories).set({status:false})
       .where(eq(subCategories.categoryId,id))
    })
       try {
                await redis.del('registeredCategories');
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