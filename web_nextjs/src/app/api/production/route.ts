import {NextResponse} from "next/server"

import {prisma} from "@/lib/prisma"



export async function POST(req:Request){


const body =
await req.json()



const result =
await prisma.productionData.create({

data:{


ProductionDate:
new Date(body.date),


ProductCode:
body.productCode,


StageCode:
body.stageCode,


LineCode:
body.lineCode,


SlotCode:
body.slotCode,


PlanQuantity:
Number(body.quantity),


Target2Hour:
Number(body.target2h)

}


})


return NextResponse.json(result)


}