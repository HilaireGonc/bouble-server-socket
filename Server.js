const fs = require("fs");
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8000 });

wss.uuidv4 = function () {
    return 'xxx-yx-yx-xxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
//
let Datagrame = {
    "IDSender": "", // id de celui qui envoie le message; cela nous permet de sauvegarder une trace de l'equipement connecter !
    "IDDestiner": "",// id de celui qui dois recevoir la donne, cela nous permet de selectionner le socket a qui envoie la trame!
    "State" : ""    // la donne en in contien soit létat de lampe ou les information comme consomation la temperatire ...
    }

let Data = {
    "EquipID" : "", // Equipement ID cést línfoemation relier au socet Id, 
    "SocketID" : "" 
}

function InDataBase(ID){
    var a = 0
    var b = 0
    const Database = require("./clients.json")
    Database.forEach(Element => {
        //console.log(Element["EquipID"]);
        if(Element["EquipID"] == ID){
            console.log("l'Element est deja dans la base de donne\n");
            b+=1
        } else{
            console.log("Pas enregistre\n");
            a+=1
        }
        //console.log("Rien TrouverS\n");
    })
    console.log("a : ",a,"\tb : ",b);
    if(b!=0){return true}else{return false}
}

function AddDataBase(EquipID,SocketID){
    const DataBase = require("./clients.json")
    DataBase.push(
        {
            EquipID : EquipID,
            SocketID: SocketID
        }
    ) 
    fs.writeFile("clients.json", JSON.stringify(DataBase), (err) => {
        if(err) throw err
        console.log("done writing database.............")
    })   
}


function RefrechDatBase(EquipID,SocketID){
    const DataBase = require("./clients.json")
    DataBase.forEach(Element => {
        //console.log(Element["EquipID"]);
        if(Element["EquipID"] == EquipID){
            Element["SocketID"] = SocketID//(EquipID,SocketID) 
        }         
    });
    fs.writeFile("clients.json", JSON.stringify(DataBase), (err) => {
        if(err) throw err
        console.log("Updating database.............")
    })   
}

function sendMessage(ID, messageAsString){
    const Database = require("./clients.json")
        Database.forEach(element => {
            console.log(element["EquipID"],"\t",ID)
                if(element["EquipID"] == ID){
                    wss.clients.forEach(function each(client){
                        console.log(client.id,"\n", element["SocketID"])
                        if(client.id == element["SocketID"]){
                            client.send(messageAsString.toString())
                            console.log("envoyer !\n");
                            }
                        })
                    }
                        
                });
}

//let socket = new Map();

wss.on("connection", (ws, req) => {
    const IpAdd = req.socket.remoteAddress; // optention de láddresse ip pour comparaison
    ws.id = wss.uuidv4(); // genere id de la connnection
    console.log("\n\t",ws.id,"\t",IpAdd)
    //sendMessage(Datagrame["IDDestiner"], messageAsString)
    ws.on("message", (messageAsString)=> {
        Datagrame = JSON.parse(messageAsString);
        RefrechDatBase(Datagrame["IDSender"],ws.id)
        sendMessage(Datagrame["IDDestiner"], messageAsString)
        if(IpAdd != "::ffff:127.0.0.1"){
            console.log("client ip = 10.20.1.X donc client microcontroler \n",/*Datagrame*/)

            if(Datagrame["IDDestiner"] == ""){// premier connection depuis le setup; donc láddresde destinati (celui de lápi) est vide !
                console.log("Premier connection \n "/*,Datagrame["IDSender"]*/)
                if(!InDataBase(Datagrame["IDSender"])){
                    console.log("enregistrement dans la base de donne !")
                    AddDataBase(Datagrame["IDSender"],ws.id)
                }else{
                    RefrechDatBase(Datagrame["IDSender"],ws.id)
                    sendMessage(Datagrame["IDDestiner"], messageAsString)
                    //console.log("envoie du message au destinataire\n")
                }
                RefrechDatBase(Datagrame["IDSender"],ws.id)
                sendMessage(Datagrame["IDDestiner"], messageAsString)
            }
        } else {
            RefrechDatBase(Datagrame["IDSender"],ws.id)
            sendMessage(Datagrame["IDDestiner"], messageAsString)
            // recuper les information du serveur et les stocket dans une varriable pour un appel rapide
            console.log("en locale donc c'est l'api")
    }
    })

})
