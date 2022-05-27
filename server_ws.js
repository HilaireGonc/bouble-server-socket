const fs = require("fs");
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 7000 });
//let newData = new Map();
wss.uuidv4 = function () {
    return 'xx-yx-yx-xxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


  
function InBd(IdSender){
    const Database = require("./clients.json");
    Database.forEach(element => {
        if(element["EquipID"] == IdSender){
            return true
        }else{ return false;   }     
    });
}


function BdAdd(EquipID,SocketID,){
    const Database = require("./clients.json");
    Database.push({
        EquipID : EquipID,
        SocketID: SocketID   
    });
    //console.log(Database);
    //console.log(JSON.stringify(Database));
    fs.writeFile("clients.json",JSON.stringify(Database), (err) => {
        if (err) throw err;
        console.log("done writing .............");
        fs.close
    })
}
wss.on('connection', (ws, req) =>{
    const ip = req.socket.remoteAddress; // optention de láddresse ip pour comparaison
    ws.id = wss.uuidv4(); // genere id de la connnection
    console.log(ws.id,"\t",ip);
    
    ws.on("message", (messageAsString) => {
        const message = messageAsString;
        console.log(message.toString());
        let Datagrame = JSON.parse(message);
        if (ip != "::ffff:127.0.0.5"){ // si cést pas lápi;
            if (Datagrame["IDDestiner"] == ''){ // si la destination est vide nous assiston a un appareillage
                if (InBd( !(Datagrame["IDSender"]))){
                    BdAdd(Datagrame["IDSender"],ws.id);//ws.send(message);// message invoye au serveur contenant id de léquipement donc id serder}else{
                    //BdRefresh(Datagrame["IDSender"],id,ws);
                    // envoie dún message avec líd de l'api
                }
            }else{
                const Database = require("./clients.json");
                Database.forEach(element => {
                    if(element["EquipID"] == Datagrame["IDDestiner"]){
                        wss.clients.forEach(client => {
                            if(client.id == element["SocketID"] )
                            client.send(message)
                            ws.send("recu !"); // ack
                        });
                    }
                });
            }

        } else {
          
            console.log(wss.clients.size)
            ;  // getSocket(Datagrame["IDSender"]).send(message);//donc dans ce cas, l'information est transmis de l'api ver les client 
        }

    });
    
});




/*
var state = "off";
console.log("Server on ws 8000\n");

var Devise = new Map();

wss.on("connection", (ws) => {
    console.info(`Client App connected [id=${ws.id}]`);
    ws.on('message', (messageAsString) => {
       const message = messageAsString;
       stat = message;
       console.log(message);
       ws.send("recu !");
   
 });});
wss.on("connection", (ws) => {
    console.info(`Client App connected [id=${ws.id}]`);
    Devise.set(ws, 1);
    ws.on('message', (messageAsString) => {
       const message = messageAsString;
       state = "on";
       console.log(message.toString());
       ws.send("recu !");
    ws.on("disconnect", () => {
        Devise.delete(ws);
        console.info(`Client gone [id=${socket.id}]`);
    });
 });});



 Donne = JSON.stringify(clients).substring(0,JSON.stringify(clients)-1)
    DataBase = Donne   +JSON.stringify(newData)+"]";


    function getSocket(EquipID){
    const Database = require("./clients.json");
        Database.forEach(element => {
        if(element["EquipID"] == EquipID){
            wss.clients.forEach(function each(client) {
                if(client.id == element["SocketID"] )
                return client
            });
        }
    });
}

*/

/*

Datagrame = {
    "IDSender": "",
    "IDDestiner": "",
    "State" : ""
}

EquipID = Id Data base = mac:IdEquipement (in , out ) => affectation pour chaque element ! information fornis par la carte.
on.connection()
print(client connecte)
message = on.message
if (ip != "::ffff:127.0.0.1"){
    Datagame = JSONParse(message)
    if (Datagrame["IDDestiner"]== NULL){
        //mode appareillage
        if (!verifierBD(EquipID)){
            addDB(EquipID,ConneID,Socket);
            emit.to.API(EquipId,State);// donc y compris le serveur
    }else{   
    emit.to.getSockketID(Datagrame["IDDestiner"]).message
    }
}else{
    // cést le master 
    emit.to.getSockketID(Datagrame["IDDestiner"]).message
}



le serveur attend de recevoire et il repond 
les client emettent et attende un retoure 

*/