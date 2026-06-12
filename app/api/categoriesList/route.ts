import { NextRequest,NextResponse } from "next/server";
import { db } from "@/db/index";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";


export async function GET(req:NextRequest) {
    try {
        let data=await db.select({id:categories.id,name:categories.name}).from(categories) 
         .where(eq(categories.status,true))      
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