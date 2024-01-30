import express from "express";
import connection from "./db/mongodb.mjs";
import Loginschema from "./DB_Schema/Login.mjs";
import cors from 'cors'
import crypto from 'crypto'
import session from "express-session";
import Count from "./DB_Schema/Count.mjs";
import calculate_busiest_hour from "./automation/bussiest_hour.mjs";
import CreateDocument from "./automation/startup.mjs"
import { Server } from "socket.io";
import fs from 'fs'
import csv from 'fast-csv'
import GuestEntries from "./DB_Schema/GuestEntries.mjs";
// CreateDocument()
const DATE_MAPPING = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
// const WebSocket = new Server(4001,{
//     cors:{
//     origin:"http://localhost:5173",
//     methods:["GET","POST"]
//     }
// })



const app = express()
app.listen(3000,()=>{console.log(`App is running at port 3000`);})
app.use(cors())
app.use(express.json())
app.use(session({secret:process.env.SECRET,resave:false,saveUninitialized:true}))

app.get("/Cron-Check-Hourly",async(req,res)=>{

    let resu = await fetch("https://timeapi.io/api/Time/current/zone?timeZone=Asia/Calcutta",{
            method:"GET",
            ContentType:"application/json",
        }).then((result)=>{return result.json()})
        let date = new Date(resu.dateTime)
        let date_month = String(date.getDate())+"-"+String(date.getMonth())
        let result = await Count.findOne({date:date_month}).catch(err=>{return res.json({"error":"couldnt fetch data"}).status(500)})

        let cur_count = result.in
        let cur_count_busiest = result.busiest_hour_count
        if(cur_count > cur_count_busiest){
            Count.insertMany({in:result.in,out:result.out,teacher:result.teacher,student:result.student,unknown:result.unknown,busiest_hour:String(resu.hour),busiest_day:result.busiest_day})
            
            return res.json({"modified":true}).status(200)        
        }else{
        return res.json({"modified":false}).status(200)    
        }
        
    
})
app.get("/connection/faces",async(req,res)=>{

    try{
        let resu = await fetch("https://timeapi.io/api/Time/current/zone?timeZone=Asia/Calcutta",{
            method:"GET",
            ContentType:"application/json",
        }).then((result)=>{return result.json()})
        let date = new Date(resu.dateTime)
        let date_month = String(date.getDate())+"-"+String(date.getMonth())
        let result = await Count.findOne({date:date_month}).catch(err=>{return res.json({"error":"couldnt fetch data"}).status(500)})
        if(result){
        console.log("-------"+result.busiest_day)
        // socket.emit("Update",{in:result.in,out:result.out})
        // socket.emit("Update_FaceDetection",{teacher:result.teacher,student:result.student,unknown:result.unknown})
        
            return res.json({teacher:result.teacher,student:result.student,unknown:result.unknown,in:result.in,out:result.out,busiest_day:result.busiest_day,busiest_hour:result.busiest_hour}).status(200)
        }
        else{
            return res.json({teacher:0,student:0,unknown:0,in:0,out:0,busiest_day:DATE_MAPPING[resu.day_of_week],busiest_hour:""}).status(200)
        }
    }

    catch
    {
        return res.json({"error":"Couldnt connect to faces"}).status(500)
    }
})


app.get('/dates/getDates',async(req,res)=>{

    try{
        let resut = await Count.find().catch(err=>{return res.json({"error":"couldnt fetch data"})})
        let resu = await fetch("https://timeapi.io/api/Time/current/zone?timeZone=Asia/Calcutta",{
            method:"GET",
            ContentType:"application/json",
        }).then((result)=>{return result.json()})
        let date = new Date(resu.dateTime)

        let date_now = date.getDate()
        let check_point
        if(date_now - 7 >=0) {
        check_point = date_now - 7 
        }
        else{
            check_point = 1
        }

        resut = resut.filter(item=>check_point<=parseInt(item['date'].split('-')[0]) && parseInt(item['date'].split('-')[0])<=date_now)
        resut.sort((a,b)=>parseInt(a['date'].split('-')[0]) - parseInt(b['date'].split('-')[0]))
        console.log(resut)
        resut.forEach((element)=>{
            
            let build_date = element['date'].split('-')
                    
                    build_date = "2024-"+ String(parseInt(build_date[1])+1) +"-"+build_date[0]
                    let cur_date = new Date(build_date)
                    console.log(cur_date.getDay())
                    element['date'] = DATE_MAPPING [cur_date.getDay()];
            }
            )
        return res.status(200).json({result:resut})
    }

    catch
    {
        return res.json({"error":"couldnt getDates"}).status(500)
    }
})

app.get('/Cron-Check',async(req,res)=>{

    try{
        let resu = await fetch("https://timeapi.io/api/Time/current/zone?timeZone=Asia/Calcutta",{
            method:"GET",
            ContentType:"application/json",
        }).then((result)=>{return result.json()})
        let date = new Date(resu.dateTime)
        let date_month = String(date.getDate())+"-"+String(date.getMonth())
        let resut = await Count.find().catch(err=>{return res.json({"error":"couldnt fetch data"}).status(500)})
        if(resut.length>0){
        let date_now = date.getDate()
        let check_point
        if(date_now - 7 >=0) {
        check_point = date_now - 7 
        }
        else{
            check_point = 1
        }

        resut = resut.filter(item=>check_point<=parseInt(item['date'].split('-')[0]) && parseInt(item['date'].split('-')[0])<=date_now)
        resut.sort((a,b)=>b['in'] - a['in'])
        resut['date'] = resu.dayOfWeek
        await Count.insertMany({date:date_month,in:0,out:0,busiest_hour:"",busiest_day:resut.date,student:0,teacher:0,unknown:0,busiest_hour_count:0}).catch(err=>console.log(err))
        return res.json({date:date_month,in:0,out:0,busiest_hour:"",busiest_day:resut.date,student:0,teacher:0,unknown:0,busiest_hour_count:0}).status(200)
        }

        else{
            let cur_date = resu.dayOfWeek
            console.log(cur_date)
        await Count.insertMany({date:date_month,in:0,out:0,busiest_hour:"0",busiest_day:cur_date,student:0,teacher:0,unknown:0,busiest_hour_count:0}).catch(err=>console.log(err))
            return res.json({date:date_month,in:0,out:0,busiest_hour:"",busiest_day:cur_date,student:0,teacher:0,unknown:0,result:resu,busiest_hour_count:0}).status(200)
        }
    }

    catch
    {
        return res.json({"error":"Couldnt Connect to Cron-Check"})
    }
})

app.get('/logs/general/:id',(req,res)=>{
    const file_path = "e:/Desktop/RaspberryPi/Dashboard/React_Backend/Backend/Python/FaceRecognition/Record.csv"
    const results = []
    const parser = csv.parse({headers:true})
    console.log(req.params.id);
    const filterCriterion = {
        column:"Category",
        value:req.params.id
    }
    fs.createReadStream(file_path).pipe(parser).on('data',(row)=>{
        if(row[filterCriterion.column] === filterCriterion.value)
        { 
            results.push(row)
        }
    }).on('end',()=>{
        res.json(results)
        res.status(200)
    }).on('error',(err)=>{
        console.log(err)
        res.status(500)
    })
       
})
app.get('/logs/CSV',(req,res)=>{
    const file_path = "e:/Desktop/RaspberryPi/Dashboard/React_Backend/Backend/Python/FaceRecognition/Record.csv"
    const results = []
    const parser = csv.parse({headers:true})
    fs.createReadStream(file_path).pipe(parser).on('data',(row)=>{results.push(row)}).on('end',()=>{
        res.json(results)
        res.status(200)
    }).on('error',(err)=>{
        console.log(err)
        res.status(500)
    })
       
})

app.get('/calculate/busiest_hour',async(req,res)=>{
    let date = new Date()
    let date_month = String(date.getDate())+"-"+String(date.getMonth())
    let result = await Count.findOne({date:date_month}).catch(err=>{return res.json({"error":"couldnt fetch data"}).status(500)})
    res.json({busiest_hour:result.busiest_hour})
    res.status(200)
})

app.post('/log/FaceDetection',async(req,res)=>{
    let date = new Date()
    let date_month = String(date.getDate())+"-"+String(date.getMonth())
    let student= req.body.Student
    let teacher = req.body.Teacher
    let unknown = req.body.Unknown
    
    let res_count = await Count.updateOne({date:{$eq:date_month}},{student:student,teacher:teacher,unknown:unknown})
    console.log({student:student,teacher:teacher,unknown:unknown})
    // if(res_count.matchedCount>0)
    // {
    //     WebSocket.emit("Update_FaceDetection",{student:student,teacher:teacher,unknown:unknown})
    // }

    res.json({student:student,teacher:teacher,unknown:unknown})
    res.status(200)
})

app.post('/log/flow',async(req,res)=>
{
    try{
        let resu = await fetch("https://timeapi.io/api/Time/current/zone?timeZone=Asia/Calcutta",{
            method:"GET",
            ContentType:"application/json",
        }).then((result)=>{return result.json()})
        let date = new Date(resu.dateTime)    
        let date_month = String(date.getDate())+"-"+String(date.getMonth())
        let in_people = req.body.in
        let out_people = req.body.out
        let res_count = await Count.findOne({date:{$eq:date_month}}).catch(err=>{return res.json({"error":"couldnt fetch data"}).status(500)})
        let cur_in = res_count.in
        let cur_out = res_count.out
        let new_in = cur_in + in_people
        let new_out = cur_out + out_people


        await Count.updateOne({date:{$eq:date_month}},{in:new_in,out:new_out}).catch(err=>{return res.json({"error":"couldnt update data"})})
        // let res_count = await Count.findOne({date:date_month})
        // if(res_count.matchedCount > 0)
        // {
        //     WebSocket.emit("Update",{in:in_people,out:out_people})
        //     res_count.in = in_people
        //     res_count.out = out_people
        //     console.log(res_count);
        // }

        return res.json({date:date_month,in:new_in,out:new_out}).status(200)
    }


    catch
    {
        return res.json({"error":"Couldnt Connect to log/flow"}).status(500)
    }

})
app.post("/auth/logout",(req,res)=>
{
    console.log(req.session)
    let csrf = req.body.csrf
    if(csrf === req.session.csrf)
    {
        req.session.destroy((err)=>{console.log(err)})
    
        res.json({"message":"Logged Out"})
        res.status(200)
    }
    else
    {
        res.json({"message":"Error !!"})
        res.status(200)
    }

})



app.post("/auth/login",async(req,res)=>{
    //user_name = req.body.name
    console.log(req.body);
    const password = req.body.password
    const email = req.body.email

    console.log(email,password)

    const user = await Loginschema.findOne({Email:email})
    
   
    if(user)
    {
        if(user.Password != password)
        {
            res.json({"authenticated":false,"error":"password doesn't match !!"})
            res.status(200)
        }
        else
        {
            const csrf = crypto.randomUUID()
            const Email = user.Email 
            req.session.email = Email
            req.session.csrf = csrf
            console.log(req.session.email);
            res.json({"authenticated":true,"Name":user.Name,"Email":user.Email,"csrf":csrf})
            res.status(200)
        }
    }

    else{
        res.json({"authenticated":false,"error":"user doesn't exist !!"})
        res.status(200)
    }
    
})

app.get('/logs/getGuestUsers',async(req,res)=>{


        let result = await fetch('https://appbackend-kjrf.onrender.com/log/getGuestUsers',{
            method:"GET",
        })
        console.log(result);
        res.status(200).json(result)
})

export default app
