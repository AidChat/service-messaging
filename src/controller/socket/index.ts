import {Socket} from "socket.io";

export const socketHandler =(socket: any ) => {
   socket.on('message',(payload:any)=>{
      console.log(payload)
   })
}