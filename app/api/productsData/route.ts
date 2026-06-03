import { NextRequest,NextResponse } from "next/server";
import { db } from "@/db/index";
import { products,productVariants,skus,skuAttributeValues, attributes } from "@/db/schema";
import { eq } from "drizzle-orm";
export async function GET(req:NextRequest) {
    try {
        const data = await db
  .select({
    productName: products.name,
    variantName: productVariants.variantName,
    attributeName: attributes.name,
    value: skuAttributeValues.value,
    mrp: skus.mrp,
    sellingPrice: skus.sellingPrice,
  })
  .from(products)
  .innerJoin(
    productVariants,
    eq(productVariants.productId, products.id)
  )
  .innerJoin(
    skus,
    eq(skus.variantId, productVariants.id)
  )
  .innerJoin(
    skuAttributeValues,
    eq(skuAttributeValues.skuId, skus.id)
  )
  .innerJoin(
    attributes,
    eq(attributes.id, skuAttributeValues.attributeId)
  );
        return NextResponse.json({
            status:true,
            message:"successfully fetch the data",
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