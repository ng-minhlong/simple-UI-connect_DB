import {NextResponse} from "next/server"
import {prisma} from "@/lib/prisma"



export async function GET(){


const [
 products,
 stages,
 lines,
 slots
]=await Promise.all([

prisma.product.findMany(),

prisma.stage.findMany(),

prisma.line.findMany(),

prisma.timeSlot.findMany()

])



return NextResponse.json({

products,
stages,
lines,
slots

})


}