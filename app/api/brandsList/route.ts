import { NextRequest,NextResponse } from "next/server";
import { db } from "@/db/index";
import { brands } from "@/db/schema";
import { eq } from "drizzle-orm";


export async function GET(req:NextRequest) {
    try {
        let data=await db.select({id:brands.id,name:brands.name}).from(brands)       
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