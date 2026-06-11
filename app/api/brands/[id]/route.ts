import { NextRequest,NextResponse } from "next/server";
import { db } from "@/db/index";
import { eq,countDistinct,inArray,and } from "drizzle-orm";
import { redis } from "@/lib/redis";
import { brands,products,productVariants,skus,manufacturers,skuAttributeValues } from "@/db/schema";
type Context={
  params:Promise<{
    id:string
  }>
}
export async function GET(req:NextRequest,context:Context) {
   try {
       const {id}=await context.params
       let data = await db
  .select({
    productName: products.name,
    brandName:brands.name,
    variantName: productVariants.variantName,
    skuCode: skus.skuCode,
    companyName: manufacturers.companyName,
    skuCount: countDistinct(skus.id),
  })
  .from(products)
  .leftJoin(
    productVariants,
    and(eq(productVariants.productId, products.id),eq(productVariants.status,true))
  )
  .leftJoin(
    skus,
    and( eq(skus.variantId, productVariants.id),eq(skus.status,true)
)
  )
  .innerJoin(
    brands,
   and(  eq(brands.id, products.brandId),eq(brands.status,true))
  )
  .innerJoin(
    manufacturers,
    eq(manufacturers.id, brands.manufacturerId)
  )
  .where(
    and(
    eq(products.brandId, id),
    eq(products.status, true)
  )
  )
  .groupBy(
    products.name,
    brands.name,
    productVariants.variantName,
    skus.skuCode,
    manufacturers.companyName
  )
  console.log(data.length)
  if (data.length === 0) {
  const brand = await db
    .select({
      brandName: brands.name,
    })
    .from(brands)
    .where(
      and(
        eq(brands.id, id),
        eq(brands.status, true)
      )
    );

  return NextResponse.json({
    status: true,
    message: "fetch successfully",
    data: brand,
  }, { status: 200 });
}
       
   } catch (error:any) {
      console.log(error)

       return NextResponse.json({
        status:false,
        message:error.message || "Something went wrong" 
       },{status:500})   
   }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) 
{
   try {
    const {id}= await params
    console.log(id)
      if(!id)
    {
        return NextResponse.json({
            status: false,
            message: "Brand id required"
        }, { status: 404 })
    }
    const data=await req.json()
    const finalData:any={}
    for(const[key,value] of Object.entries(data))
    {
      if(value !='' && value !=null && value != undefined)
      {
        finalData[key]=value
      }
    }
    console.log(finalData)
   let upd=await db.update(brands).set(finalData).where(eq(brands.id,id)).returning()
   if(upd.length===0)
   {
    return NextResponse.json({
            status: false,
            message: "Brand not update"
        }, { status: 408 })
   }
   if(upd && upd.length>0)
        {
           try {
                await redis.del('registeredBrands');
            } catch (redisError) {
                console.error("Redis cache invalidation failed:", redisError);
            }
        }
    return NextResponse.json({
            status: true,
            message: "Brand successfully update"
        }, { status: 200 })
   } catch (error: any) {
  console.error(error); 
  const dbErrorCode = error.cause?.code || error.code;
  const constraintName = error.cause?.constraint_name || error.constraint;

  if (dbErrorCode === '23505' && constraintName === 'tenant_brandcode_unique') {
    return NextResponse.json({
      status: false,
      message: "This BrandCode is already registered for another Brand."
    }, { status: 400 });
  }
   if (dbErrorCode === '23505' && constraintName === 'tenant_brandName_unique') {
    return NextResponse.json({
      status: false,
      message: "This BrandName is already registered for another Brand."
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
        await tx.update(brands).set({status:false})
        .where(eq(brands.id,id))
        await tx.update(products).set(
            {
                status:false
            }
        ).where(eq(products.brandId,id))
        await tx.update(productVariants)
  .set({ status: false })
  .where(
    inArray(
      productVariants.productId,
      tx.select({ id: products.id })
        .from(products)
        .where(eq(products.brandId, id))
    )
  )
       await tx.update(skus)
  .set({ status: false })
  .where(
    inArray(
      skus.variantId,
      tx.select({ id: productVariants.id })
        .from(productVariants)
        .where(
          inArray(
            productVariants.productId,
            tx.select({ id: products.id })
              .from(products)
              .where(eq(products.brandId, id))
          )
        )
    )
  )
         await tx.update(skuAttributeValues)
  .set({ status: false })
  .where(
    inArray(
      skuAttributeValues.skuId,
      tx.select({ id: skus.id })
        .from(skus)
        .where(
          inArray(
            skus.variantId,
            tx.select({ id: productVariants.id })
              .from(productVariants)
              .where(
                inArray(
                  productVariants.productId,
                  tx.select({ id: products.id })
                    .from(products)
                    .where(eq(products.brandId, id))
                )
              )
          )
        )
    )
  )
    })
       try {
                await redis.del('registeredBrands');
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