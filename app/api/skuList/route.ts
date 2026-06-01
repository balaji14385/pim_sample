import { NextRequest,NextResponse } from "next/server";
import { db } from "@/db/index";
import { categories, products, productVariants,skus, subCategories } from "@/db/schema";
import { eq } from "drizzle-orm";


export async function GET(req:NextRequest) {
    try {
        let data=await db.select({id:skus.id,name:productVariants.variantName,
            code:skus.skuCode,category:categories.name,categoryId:categories.id
        }).
        from(skus)
        .innerJoin(productVariants,eq(productVariants.id,skus.variantId))  
        .innerJoin(products,eq(productVariants.productId,products.id))
        .innerJoin(subCategories,eq(products.subCategoryId,subCategories.id))
        .innerJoin(categories,eq(subCategories.categoryId,categories.id))     
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