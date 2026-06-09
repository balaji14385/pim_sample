import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { brands, products, attributes, productVariants, categories, subCategories, skus, skuAttributeValues } from "@/db/schema";
import { db } from '@/db/index';
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
            .leftJoin(productVariants, eq(productVariants.productId, products.id))
            .leftJoin(skus, eq(skus.variantId, productVariants.id))
            .leftJoin(skuAttributeValues, eq(skuAttributeValues.skuId, skus.id))
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