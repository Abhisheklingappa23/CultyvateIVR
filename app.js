const express = require('express');
const app = express()
var sql = require("mssql");
const bodyParser = require('body-parser')
var fs = require('fs');
const res = require('express/lib/response');
const axios = require("axios");
const {MongoClient} = require('mongodb')
const url= 'mongodb://52.172.183.84:15593';
const DgDatabaseName='cultyvate_test'
const DgClient= new MongoClient(url);

require('dotenv').config()
app.use(express.json())
app.use(bodyParser.json());

var config ={
    "server": 'cultyvate-sql.database.windows.net',
    "user": 'cultyvate',
    "password": '#Farns2020$',
    "database": 'cultYvate',
    "port": 1433 
  };

// abhishek 8073796903
//priya mam 9164726070 ,9448999808

var DgFarmerDetails = [
    // ["Mahesh TK","8073796903","a840415df182e00b","8618882667","8072615910"],
    // ["Mahesh TK","8618882667","a84041fcb182e00c","8618882667","8072615910"],
    // ["Mahesh TK","8618882667","a8404167a182e00d","8618882667","8072615910"],
    //["Mahesh TK","8618882667","a84041454182e00e","8618882667","8072615910"],
    // ["Mahesh TK","8618882667","a84041e46182e00f","8618882667","8072615910"],
    // ["Kailas Moore","8072615910","a84041eb1182e043","8618882667","8072615910"],
    // ["Kailas Moore","8073796903","a84041ee3182e044","8618882667","8072615910"],
    // ["Kailas Moore","8073796903","a84041d9e182e045","8618882667","8072615910"],
    // ["Kailas Moore","8073796903","a840415a41837a81","8618882667","8072615910"],
    // ["Sayadri","8072615910","a84041fe8182dfd3","8618882667","8072615910"],
    // ["Sayadri","8072615910","a84041fcf182dff0","8618882667","8072615910"],
    // ["Sayadri","8072615910","a840412fc182e01d","8618882667","8072615910"],
    // ["Sayadri","8072615910","a84041f83182e022","8618882667","8072615910"],
    // ["Sayadri","8072615910","a8404135e182e035","8618882667","8072615910"],
    // ["Sayadri","8072615910","a840414a7182e034","8618882667","8072615910"],
    // ["Sayadri","8073796903","a84041f93182e042","8618882667","8072615910"],
    ["HSRTesting","8073796903","a84041f791837fa3","8618882667","8072615910"]]

let DgDateObJ = new Date();
var DgDayWiseLogfile = 'C:/Users/This PC/Desktop/cultyavteIVR/Logs/LOGS_24Hr' + DgDateObJ.getFullYear() + "-"+ (DgDateObJ.getMonth()+1) + "-" + DgDateObJ.getDate() +'.txt'

async function F2FFarmerGetData(){

    var llatestDatetime = new Date().toISOString().replace('/', '-').split('T')[0].replace('/', '-');
    var lHours24 = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)+(5*60+30)*60000)
    console.log(" Time checking ",lHours24)

    let lResult = await DgClient.connect();
    DB= lResult.db(DgDatabaseName);
    Collection = DB.collection('telemetrydatas');
    F2FWriteToLogFile(" Mongodb Connection Opened Successfully... ")
    F2FWriteToLogFile(" Listener Programer for Soilmoisture Started...")

    for (let i=0;i<DgFarmerDetails.length;i++ ){

        let lData24 = await Collection.find({"devId":DgFarmerDetails[i][2],"createdAt": { "$gte": new Date(lHours24)}}).sort({_id:-1}).limit(2).toArray();
        var lLatestData = parseInt(((lData24[0].raw.v3_raw.uplink_message.decoded_payload.level3/4095)*100).toFixed(0))
        var lPrevoiusData = parseInt(((lData24[1].raw.v3_raw.uplink_message.decoded_payload.level3/4095)*100).toFixed(0))

        F2FIVRApiCall(lLatestData,lPrevoiusData, DgFarmerDetails[i])
    }
}

setInterval(() => {
    F2FFarmerGetData() 
},15000);

function F2FIVRApiCall(pLatestData, pPrevoiusData, pFarmerDetails){
    var llatestdattime = new Date().toISOString().replace('/', '-').split('T')[0].replace('/', '-');
    console.log("date",llatestdattime)
    try {
       
        if(pLatestData<10&&pPrevoiusData>10){
            F2FWriteToLogFile("Condition trigger for IVR call Matched : "+" [" + pFarmerDetails[0]+" ,"+pFarmerDetails[1]+" ,"+pFarmerDetails[2]+","+pFarmerDetails[3]+" ,"+pFarmerDetails[4]+ "]" + " Soil_moisture_level3_current_value is : " + pLatestData +"%"+" Soil_moisture_level3_Previous_value is : " + pPrevoiusData +"%")
            //F2FWriteToLogFile(" Condition trigger for IVR call  to  :" +pFarmerDetails[0])
            console.log("IVR Call Triggered",pFarmerDetails[0]);
            sql.connect(config, function (err) {
                if (err) console.log(err);                
                var request = new sql.Request();
                var lstring  = "select * from IVRCallTriggerLog where fType= 'FR' and DeviceID='" + pFarmerDetails[2] +"' and fDateTime='" + llatestdattime +"' "
                console.log("OUR REF ",lstring)
                request.query(lstring, function (err, recordset) {
                    if (err) console.log(err)                
                   var Pulled_record = (recordset.recordsets[0][0])
                   console.log()
                   if(typeof(Pulled_record)==="undefined"){
                       console.log("no data you can insert")
                       axios({
                        method: 'post',
                        url: 'https://cultyvate.asttecs.com/apiControl/triggerRequest.php',
                        data: {
                                "email":{
                                "is_present": "Null",
                                "sender_detail": "Null",
                                "payload": "Null"
                                },
                                "text_message":{
                                "is_present": "Null",
                                "sender_detail": "Null",
                                "payload": "Null"
                                },
                                "whatsapp_message":{
                                "is_present": "Null",
                                "sender_detail": "Null",
                                "payload": "Null"
                                },
                                "voice_call":{
                                "is_present": "1",
                                "sender_detail": "91"+pFarmerDetails[1],
                                "payload": "02112100"
                                }
                            }
                      })
                       var Insertrequest = new sql.Request();
                       Insertrequest.query("INSERT INTO IVRCallTriggerLog (FarmerName, FarmerMobileNumber, fType,fDateTime, DeviceID, FiledOfficerNumber, FiledManagerNumber, VoiceCallYN, IVRPostURLSent, IVRPostSentDateTime, IVRPostResponce, CreatDate) VALUES ('" +  pFarmerDetails[0] + "', '" +  pFarmerDetails[1] + "','FR','" + llatestdattime +"','" +  pFarmerDetails[2] + "', '" +  pFarmerDetails[3] + "','" +  pFarmerDetails[4] + "', 1,'YES DATA sent','" + llatestdattime +"','Success 200 OK','" + llatestdattime +"')", function (err, recordset) {
                         if (err) console.log(err)
                       });
                   }else{
                        console.log("Data Already inserted do nothing")
                   }
                          
                });
                
            });
        }else if(pLatestData==0&&pPrevoiusData==0){
            F2FWriteToLogFile(" current and previous values are same condtion : "+" [" + pFarmerDetails[0]+" ,"+pFarmerDetails[1]+" ,"+pFarmerDetails[2]+","+pFarmerDetails[3]+" ,"+pFarmerDetails[4]+ "]" + " Soil_moisture_level3_current_value is : " + pLatestData +"%"+" Soil_moisture_level3_Previous_value is : " + pPrevoiusData +"%")
            console.log(" Donot trigger the call, current and previous values are same ")
            sql.connect(config, function (err) {
                if (err) console.log(err);                
                var request = new sql.Request();
                var lstring  = "select * from IVRCallTriggerLog where fType= 'FR' and DeviceID='" + pFarmerDetails[2] +"' and fDateTime='" + llatestdattime +"' "
                console.log("OUR REF ",lstring)
                request.query(lstring, function (err, recordset) {
                    if (err) console.log(err)                
                   var Pulled_record = (recordset.recordsets[0][0])
                   console.log()
                   if(typeof(Pulled_record)==="undefined"){
                       console.log("no data you can insert")
                       axios({
                        method: 'post',
                        url: 'https://cultyvate.asttecs.com/apiControl/triggerRequest.php',
                        data: {
                                "email":{
                                "is_present": "Null",
                                "sender_detail": "Null",
                                "payload": "Null"
                                },
                                "text_message":{
                                "is_present": "Null",
                                "sender_detail": "Null",
                                "payload": "Null"
                                },
                                "whatsapp_message":{
                                "is_present": "Null",
                                "sender_detail": "Null",
                                "payload": "Null"
                                },
                                "voice_call":{
                                "is_present": "1",
                                "sender_detail": "91"+pFarmerDetails[1],
                                "payload": "02112100"
                                }
                            }
                      })
                       var Insertrequest = new sql.Request();
                       Insertrequest.query("INSERT INTO IVRCallTriggerLog (FarmerName, FarmerMobileNumber, fType,fDateTime, DeviceID, FiledOfficerNumber, FiledManagerNumber, VoiceCallYN, IVRPostURLSent, IVRPostSentDateTime, IVRPostResponce, CreatDate) VALUES ('" +  pFarmerDetails[0] + "', '" +  pFarmerDetails[1] + "','FR','" + llatestdattime +"','" +  pFarmerDetails[2] + "', '" +  pFarmerDetails[3] + "','" +  pFarmerDetails[4] + "', 1,'YES DATA sent','" + llatestdattime +"','Success 200 OK','" + llatestdattime +"')", function (err, recordset) {
                         if (err) console.log(err)
                       });
                   }else{
                        console.log("Data Already inserted do nothing")
                   }
                          
                });
                
            });
        }else if(pLatestData>1&&pPrevoiusData<10){
            F2FWriteToLogFile(" Irrigation started condtion : "+" [" + pFarmerDetails[0]+" ,"+pFarmerDetails[1]+" ,"+pFarmerDetails[2]+","+pFarmerDetails[3]+" ,"+pFarmerDetails[4]+ "]" + " Soil_moisture_level3_current_value is : " + pLatestData +"%"+" Soil_moisture_level3_Previous_value is : " + pPrevoiusData +"%")
            console.log(" Dnot trigger the call Farmer already started Irrigation ")
        }
      }
    catch (e) {
        F2FWriteToLogFile(e.message)
    }   
}

function F2FWriteToLogFile(pLineData) {
    //dd-MM-YYYY
    let lDateObJ = new Date();
    var lLogFileTime =  ("0" + lDateObJ.getDate()).slice(-2) +"-"+ ("0" + (lDateObJ.getMonth() + 1)).slice(-2) + "-" +lDateObJ.getFullYear() +  " " + ("0" +lDateObJ.getHours()).slice(-2) + ":" + ("0" +lDateObJ.getMinutes()).slice(-2) + ":" + ("0" +lDateObJ.getSeconds()).slice(-2)
    var lLogData = lLogFileTime + pLineData + "\n"
    fs.appendFileSync(DgDayWiseLogfile, lLogData, 'utf8');
}
