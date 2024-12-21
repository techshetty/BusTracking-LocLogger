const express = require('express')
const cron = require('node-cron')
require('dotenv').config();
const {Client} = require('pg');
const app=express();
const port=process.env.port;
const dburl=process.env.supaUri;
app.use(express.json())
const pgclient = new Client({
    connectionString: dburl,
  });
pgclient.connect().then(()=>{
    console.log("Connected to PGSQL Database")
}).catch(err=>{console.log(err.stack)})
app.get('/',(req,res)=>{
    return res.send("BusTracking API is running...");
})

app.get('/viewLocation', async(req,res)=>{
    try{
    const bdata=await fetch(process.env.locUrl);
    const bj=await bdata.json();
    const {vehicleNumber,latitude,longitude,location,ignition,speed}=bj.data.list[0];
    return res.status(200).json({
        vehicleNum: vehicleNumber,
        lat: latitude,
        long:longitude,
        loc:location,
        ign: ignition,
        speed: speed,
        time: new Date(),
    });
    }
    catch(err){
        console.log(err)
        return res.status(500).json({success: false,error: err});
    }
})
const logLoc=async()=>{
    try{
    const bdata=await fetch(process.env.locUrl);
    const bj=await bdata.json();
    const {vehicleNumber,latitude,longitude,location,ignition,speed}=bj.data.list[0];
    if(ignition){
    const query = `INSERT INTO vehicle_data (vehicleNum, lat, long, loc, time,ign,speed) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
    await pgclient.query(query,[vehicleNumber,latitude,longitude,location,new Date(),ignition,speed])
    console.log("Data Inserted SuccessFully");
    }
    }
    catch(err){
        console.log(err.stack);
    }
}
cron.schedule('* * * * *', logLoc);
app.listen(port,()=>{
    console.log(`Server running on port ${port}`)
})