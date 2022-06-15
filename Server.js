const fs = require("fs");
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8000 });
// ws://127.0.0.1:5000/device/communication/ route a utiliser pour cntacter l'api

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
    //console.log("a : ",a,"\tb : ",b);
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
            //console.log(element["EquipID"],"\t",ID)
                if(element["EquipID"] == ID){
                    wss.clients.forEach(function each(client){
                       //console.log(client.id,"\n", element["SocketID"])
                        if(client.id == element["SocketID"]){
                            client.send(messageAsString.toString())
                            console.log("envoyer !\n");
                            }
                        })
                    }
                        
                });
}


function BodyWork(id, IpAdd, messageAsString){
    if ( messageAsString.toString().length > 70) { // verification du schema de base contenant id destination
        Datagrame = JSON.parse(messageAsString);   
        if(Datagrame["IDSender"].length === 13){ //Verification du destinataire du destinataire
            if(IpAdd != "::ffff:127.0.0.1"){ // Vennant du reseaux externe 10.20.1.X
                if(!InDataBase(Datagrame["IDSender"])){
                    AddDataBase(Datagrame["IDSender"],id)
                    console.log("enregistrement dans la base de donne !")
                    sendMessage("R3:87:Ts@9613", messageAsString) // gere correctement lénvoie a lÁpi
                    console.log("Envoye a l'api !")
                }else{
                    RefrechDatBase(Datagrame["IDSender"],id)
                    console.log("Mise a jour de la base de donne !")
                    sendMessage("Rp:xj:pM:R3:87:Ts@9613", messageAsString)
                    console.log("Envoye a l'api !")
                }
            }else{// mesage de lápi vers micro
                RefrechDatBase("R3:87:Ts@9613",id)// gere correctement lénvoie a lÁpi
                console.log("Mise a jour de Id du serveur!")
                if(Datagrame["IDDestiner"].length === 13){
                    sendMessage(Datagrame["IDDestiner"], messageAsString)
                    console.log("Envoye a ", Datagrame["IDDestiner"])
                }else{// Destinataire incorrecte
                    console.log("Erruer : Destinataire incorrecte")
                }
            }
        }else{//Sender ou Destinataire incorrecte
            console.log("Erruer : Sender ou Destinataire incorrecte")
        }
    }else{// Si le text est vide ou quíl n'y est pas acces de chars
        console.log("Erruer : Message vide")
    }
}

//let socket = new Map();

wss.on("connection", (ws, req) => {
    const IpAdd = req.socket.remoteAddress; // optention de láddresse ip pour comparaison
    ws.id = wss.uuidv4(); // genere id de la connnection
    console.log("\n\t",ws.id,"\t",IpAdd)
    //sendMessage(Datagrame["IDDestiner"], messageAsString)
    ws.on("message", (messageAsString) => {
        BodyWork(ws.id, IpAdd, messageAsString)
    })

    ws.on("disconnect", () => { // informer lápi de la deconnection de léquipement 

    })
})



/*
if(IpAdd != "::ffff:127.0.0.1"){
            //console.log("client ip = 10.20.1.X donc client microcontroler \n")

            if(Datagrame["IDDestiner"] == ""){// premier connection depuis le setup; donc láddresde destinati (celui de lápi) est vide !
               // console.log("Premier connection \n ",Datagrame["IDSender"])
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

    Datagrame = JSON.parse(messageAsString);
        console.log(messageAsString.toString().length)
        console.log(Datagrame["IDSender"].toString().length)
        console.log(Datagrame["IDSender"].toString())
        //RefrechDatBase(Datagrame["IDSender"],ws.id)
        //sendMessage(Datagrame["IDDestiner"], messageAsString)
*/