import { NextRequest,NextResponse } from "next/server";
import { db } from "@/db/index";
import { eq,countDistinct } from "drizzle-orm";
import { brands,products,productVariants,skus,manufacturers } from "@/db/schema";
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
    eq(productVariants.productId, products.id)
  )

  .leftJoin(
    skus,
    eq(skus.variantId, productVariants.id)
  )

  .innerJoin(
    brands,
    eq(brands.id, products.brandId)
  )

  .innerJoin(
    manufacturers,
    eq(manufacturers.id, brands.manufacturerId)
  )

  .where(
    eq(
      products.brandId,
      id
    )
  )

  .groupBy(
    products.name,
    brands.name,
    productVariants.variantName,
    skus.skuCode,
    manufacturers.companyName
  );
  console.log(data.length)
  if(data.length==0)
  {
       let data=await db.select({brandName:brands.name}).from(products).
       innerJoin(brands,eq(brands.id,products.brandId))
       .where(eq(products.brandId,id))
       return NextResponse.json({
            status:true,
            message:"fetch successfully",
            data 
        },{status:200})
  }
        return NextResponse.json({
            status:true,
            message:"fetch successfully",
            data 
        },{status:200})
   } catch (error:any) {
      console.log(error)

       return NextResponse.json({
        status:false,
        message:error.message || "Something went wrong" 
       },{status:500})   
   }
}