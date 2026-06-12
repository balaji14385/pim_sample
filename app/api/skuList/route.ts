import { NextRequest,NextResponse } from "next/server";
import { db } from "@/db/index";
import { categories, products, productVariants,skus, subCategories } from "@/db/schema";
import { and, eq } from "drizzle-orm";


export async function GET(req:NextRequest) {
    try {
        let data=await db.select({id:skus.id,name:productVariants.variantName,
            code:skus.skuCode,category:categories.name,categoryId:categories.id
        }).
        from(skus)
        .innerJoin(productVariants,and(eq(productVariants.id,skus.variantId),eq(productVariants.status,true))) 
        .innerJoin(products,and(eq(productVariants.productId,products.id),eq(products.status,true)) )
        .innerJoin(subCategories,and(eq(products.subCategoryId,subCategories.id),eq(subCategories.status,true)) )
        .innerJoin(categories,and(eq(subCategories.categoryId,categories.id) ,eq(categories.status,true)))     
        .where(eq(skus.status,true))
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