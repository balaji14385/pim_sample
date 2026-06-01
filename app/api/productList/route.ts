import { NextRequest,NextResponse } from "next/server";
import { db } from "@/db/index";
import { products } from "@/db/schema";


export async function GET(req:NextRequest) {
    try {
        let data=await db.select({id:products.id,name:products.name}).from(products)       
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