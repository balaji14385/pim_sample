import { NextRequest,NextResponse } from "next/server";
import { db } from "@/db/index";
import { attributes,productVariants,skus,products,subCategories,categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { required } from "zod/mini";


export async function POST(req:NextRequest) {
    try {
                let selectedId=await req.json()

        let data=await db.select({id:attributes.id,name:attributes.name,
            code:attributes.code,dataType:attributes.dataType,
            required:attributes.isRequired
        })
        .from(attributes).where(eq(attributes.categoryId,selectedId.id))
        // .innerJoin(productVariants,eq(skus.variantId,productVariants.id))
        // .innerJoin(products,eq(productVariants.productId,products.id))
        // .innerJoin(subCategories,eq(products.subCategoryId,subCategories.id))
        // .innerJoin(categories,eq(subCategories.categoryId,categories.id))
        // .innerJoin(attributes,eq(categories.id,attributes.categoryId))       
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