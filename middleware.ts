import { NextResponse,NextRequest } from "next/server"
export async function middleware(req:NextRequest)
{
  try {
    let path=req.nextUrl.pathname
    console.log(path)
    console.log("welcome to middleware")
    if(path=='register')
    {
        return NextResponse.rewrite(new URL('/result',req.url))
    }
    return NextResponse.next();
  } catch (error:unknown) {
      console.log(error)
      return NextResponse.json({
        status:false,
        message:error.message || "something went wrong"
      },{status:500})
  }
}
export const config={
    matches:[]
}