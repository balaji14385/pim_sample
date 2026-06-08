import { NextRequest,NextResponse } from "next/server";
import { db } from "@/db/index";
import { brands } from "@/db/schema";
import { eq } from "drizzle-orm";
import {redis} from '@/lib/redis'

interface resData {
    id: string;
    name: string;
}
export async function GET(req:NextRequest) {
    try {
        let cached=await redis.get('brands')
        if(cached)
        {
            console.log("from redis")
             return NextResponse.json({
            status:true,
            message:"successfully fetch the data",
            data:cached
        },{status:200})
        }
        let data:resData[]=await db.select({id:brands.id,name:brands.name}).from(brands) 
         await redis.set('brands',JSON.stringify(data))
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