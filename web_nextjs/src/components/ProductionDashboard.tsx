"use client"


import {
useEffect,
useState
} from "react"


import {
Plus,
Pin,
FileText,
BarChart3
} from "lucide-react"



export default function ProductionDashboard(){


const [master,setMaster]=useState<any>({})

const [form,setForm]=useState<any>({

date:"",
productCode:"",
stageCode:"",
lineCode:"",
slotCode:"",
quantity:"",
target2h:87

})



useEffect(()=>{

fetch("/api/master")
.then(r=>r.json())
.then(setMaster)

},[])



async function submit(){


await fetch("/api/production",{

method:"POST",

body:
JSON.stringify(form)

})


alert("Rải chuyền thành công")

}



return (

<div className="
bg-white
border
rounded-lg
shadow-sm
p-6
space-y-8
">


<h1 className="
text-center
font-bold
text-xl
text-blue-900
border-b
pb-4
">

PHÒNG KẾ HOẠCH - KHỞI TẠO & RẢI CHUYỀN

</h1>




{/* STEP 1 */}

<section className="border rounded p-5">


<h2 className="
text-blue-700
font-bold
flex gap-2
mb-4
">

<Pin className="text-red-500"/>

Bước 1: Khai Báo Lệnh Mã Hàng Tổng

</h2>


<div className="
grid md:grid-cols-3 gap-4
">


<input
type="date"
className="border p-2 rounded"

onChange={
e=>setForm({
...form,
date:e.target.value
})
}

/>



<select
className="border p-2 rounded"

onChange={
e=>setForm({
...form,
productCode:e.target.value
})
}

>

<option>
Chọn mã hàng
</option>


{
master.products?.map((p:any)=>(

<option key={p.ProductCode}>

{p.ProductCode}

</option>

))
}

</select>




<button
className="
bg-blue-600
text-white
font-bold
rounded
flex
justify-center
items-center
gap-2
">

<Plus/>

KHỞI TẠO LỆNH TỔNG

</button>


</div>


</section>





{/* STEP 2 */}


<section className="border rounded p-5">


<h2 className="
text-blue-700
font-bold
flex gap-2 mb-4
">

<FileText/>

Bước 2: Phân Bổ Khoán & Định Mức Riêng Cho Từng Chuyền

</h2>



<div className="
grid md:grid-cols-3 gap-4
">


<select
className="border p-2 rounded"

onChange={
e=>setForm({
...form,
stageCode:e.target.value
})
}

>

<option>
Chọn công đoạn
</option>


{
master.stages?.map((x:any)=>(

<option key={x.StageCode}
value={x.StageCode}
>

{x.StageName}

</option>

))
}

</select>




<select
className="border p-2 rounded"

onChange={
e=>setForm({
...form,
lineCode:e.target.value
})
}

>

<option>
-- Chọn chuyền --
</option>


{
master.lines?.map((x:any)=>(

<option key={x.LineCode}
value={x.LineCode}
>

{x.LineName}

</option>

))
}


</select>





<select

className="border p-2 rounded"

onChange={
e=>setForm({
...form,
slotCode:e.target.value
})
}

>


<option>
Chọn ca
</option>


{
master.slots?.map((x:any)=>(

<option key={x.SlotCode}
value={x.SlotCode}
>

{x.SlotName}

</option>

))
}

</select>



<input

placeholder="500"

className="border p-2 rounded"

onChange={
e=>setForm({
...form,
quantity:e.target.value
})
}

/>




<input

value={form.target2h}

className="border p-2 rounded"

/>



<button

onClick={submit}

className="
bg-green-600
text-white
font-bold
rounded
"

>

XÁC NHẬN RẢI CHUYỀN

</button>



</div>


</section>





<section className="border-t border-dashed pt-5">


<h2 className="
text-blue-800
font-bold
flex gap-2
">

<BarChart3/>

Kế Hoạch Phân Bổ Chuyền Đang Vận Hành

</h2>



<table className="w-full mt-5">


<thead className="
bg-slate-800
text-white
">

<tr>

<th>Mã KH</th>
<th>Mã hàng</th>
<th>Ngày SX</th>
<th>Công đoạn</th>
<th>Chuyền</th>
<th>Khoán</th>
<th>2H</th>

</tr>

</thead>


<tbody>

<tr>

<td colSpan={7}
className="text-center p-5"
>

Chưa có dữ liệu

</td>

</tr>


</tbody>


</table>


</section>


</div>

)

}