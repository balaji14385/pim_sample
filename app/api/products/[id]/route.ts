import { eq,inArray,and} from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { brands, products, attributes, productVariants, categories, subCategories, skus, skuAttributeValues } from "@/db/schema";
import { db } from '@/db/index';
import { redis } from "@/lib/redis";
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const rows = await db
            .select({
                productId: products.id,
                productName: products.name,
                brandName: brands.name,
                categoryName: categories.name,

                variantId: productVariants.id,
                variantName: productVariants.variantName,

                skuId: skus.id,
                skuCode: skus.skuCode,
                mrp: skus.mrp,

                attributeName: attributes.name,
                attributeValue: skuAttributeValues.value,
            })
            .from(products)
            .innerJoin(brands, eq(brands.id, products.brandId))
            .innerJoin(subCategories, eq(subCategories.id, products.subCategoryId))
            .innerJoin(categories, eq(categories.id, subCategories.categoryId))
            .leftJoin(productVariants, and(eq(productVariants.productId, products.id),eq(productVariants.status,true)))
            .leftJoin(skus,and(eq(skus.variantId, productVariants.id),eq(skus.status,true)))           
            .leftJoin(skuAttributeValues, and(eq(skuAttributeValues.skuId, skus.id),eq(skuAttributeValues.status,true)))
            .leftJoin(attributes, eq(attributes.id, skuAttributeValues.attributeId))
            .where(eq(products.id, id));
        const resultMap = new Map();

        for (const row of rows) {
            if (!resultMap.has(row.productId)) {
                resultMap.set(row.productId, {
                    product: row.productName,
                    brand: row.brandName,
                    category: row.categoryName,
                    variants: []
                });
            }

            const product = resultMap.get(row.productId);
      if (row.variantId) {
  let variant = product.variants.find(
    (v: any) => v.id === row.variantId
  );

  if (!variant) {
    variant = {
      id: row.variantId,
      name: row.variantName,
      sku: row.skuCode,
      price: row.mrp,
      attributes: {}
    };

    product.variants.push(variant);
  }

  if (row.attributeName) {
    variant.attributes[row.attributeName] =
      row.attributeValue;
  }
}
        }

        const finalResult = Array.from(resultMap.values());

        return NextResponse.json({
            status: true,
            message: "successfully fetch",
            data: finalResult
        }, { status: 200 })
    } catch (error: any) {
        console.log(error)

        return NextResponse.json({
            status: false,
            message: error.message || "Something went wrong"
        }, { status: 500 })
    }
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
try {
     const {id}=await params
    const result=await db.transaction(async(tx)=>{
        await tx.update(products).set(
            {
                status:false
            }
        ).where(eq(products.id,id))
        await tx.update(productVariants).set(
            {
                status:false
            }
        ).where(eq(productVariants.productId,id))
         await tx.update(skus).set(
            {
                status:false
            }
        ).where(inArray(skus.variantId, 
            tx.select({id:productVariants.id})
            .from(productVariants)
            .where(eq(productVariants.productId,id))
        ));
         await tx.update(skuAttributeValues)
    .set({ status: false })
    .where(inArray(
      skuAttributeValues.skuId,
      tx.select({ id: skus.id })
        .from(skus)
        .where(inArray(
          skus.variantId,
          tx.select({ id: productVariants.id })
            .from(productVariants)
            .where(eq(productVariants.productId,id))
        ))
    ))
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
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) 
{
   try {
    const {id}= await params
      if(!id)
    {
        return NextResponse.json({
            status: false,
            message: "product id required"
        }, { status: 404 })
    }
    const data=await req.json()
    let updData={
        brandId:data.brandId,
        name:data.name,
        subCategoryId:data.subCategoryId,
        productCode:data.productCode,
        description:data.description,
        launchDate:data.launchDate
    }
  
   let upd=await db.update(products).set(updData).where(eq(products.id,id)).returning()
   if(upd.length===0)
   {
    return NextResponse.json({
            status: false,
            message: "product not update"
        }, { status: 408 })
   }
   if(upd && upd.length>0)
        {
           try {
                await redis.del('registeredProducts');
            } catch (redisError) {
                console.error("Redis cache invalidation failed:", redisError);
            }
        }
    return NextResponse.json({
            status: true,
            message: "product successfully update"
        }, { status: 200 })
   } catch (error:any) {
     console.log(error)

        return NextResponse.json({
            status: false,
            message: error.message || "Something went wrong"
        }, { status: 500 })
   }
}