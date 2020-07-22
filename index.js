import * as readline from 'readline';
import { Socket } from 'battleye';
import { serverCfg } from './constants';

  console.log(serverCfg)
 
    // create socket
    const socket = new Socket({
      port: serverCfg.port,     // listen port
      ip: serverCfg.ip,  // listen ip
    })
 
    // create connection
    const connection = socket.connection({
        ...serverCfg
    }, {
      reconnect: true,              // reconnect on timeout
      reconnectTimeout: 500,        // how long (in ms) to try reconnect
      keepAlive: true,              // send keepAlive packet
      keepAliveInterval: 15000,     // keepAlive packet interval (in ms)
      timeout: true,                // timeout packets
      timeoutInterval: 1000,        // interval to check packets (in ms)
      serverTimeout: 30000,         // timeout server connection (in ms)
      packetTimeout: 1000,          // timeout packet check interval (in ms)
      packetTimeoutThresholded: 5,  // packets to resend
    })
 
    // create readline for command input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
 
    socket.on('listening', (socket) => {
      const addr = socket.address()
      console.log(`Socket listening on ${typeof addr === 'string' ? addr : `${addr.address}:${addr.port}`}`)
    })
 
    socket.on('received', (resolved, packet, buffer, connection, info) => {
      console.log(`received: ${connection.ip}:${connection.port} => packet:`, packet)
    })
 
    socket.on('sent', (packet, buffer, bytes, connection) => {
      console.log(`sent: ${connection.ip}:${connection.port} => packet:`, packet)
    })
 
    socket.on('error', (err) => { console.error(`SOCKET ERROR:`, err) })
 
    connection.on('message', (message, packet) => {
      console.log(`message: ${connection.ip}:${connection.port} => message: ${message}`)
    })
 
    connection.on('command', (data, resolved, packet) => {
      console.log(`command: ${connection.ip}:${connection.port} => packet:`, packet)
    })
 
    connection.on('disconnected', (reason) => {
      console.warn(`disconnected from ${connection.ip}:${connection.port},`, reason)
    })
 
    connection.on('connected', () => {
      console.error(`connected to ${connection.ip}:${connection.port}`)
    })
 
    connection.on('debug', console.log)
 
    connection.on('error', (err) => {
      console.error(`CONNECTION ERROR:`, err)
    })
 
    rl.on('line', input => {
      connection
        .command(input)
        .then(response => {
          console.log(`response: ${connection.ip}:${connection.port} => ${response.command}\n${response.data}`)
        })
        .catch(console.error)
 
      console.log(`send: ${connection.ip}:${connection.port} => ${input}`)
    });