import { NextRequest,NextResponse } from "next/server";
import { db } from "@/db/index";
import { manufacturers } from "@/db/schema";
import { eq } from "drizzle-orm";


export async function GET(req:NextRequest) {
    try {
        let data=await db.select({id:manufacturers.id,company_name:manufacturers.companyName})
        .from(manufacturers)  
        .where(eq(manufacturers.status,true))     
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