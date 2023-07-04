# Network Attack Simulation

## Summary
This repository contains code for simulating behavior of server being attacked by multiple clients. There are several attack modes, such as DOS, brute force login, big payload attack, and big computation attack, also normal modes

## Setup
1. Install all required software, such as docker and node JS (Preferably v18)
2. Install the dependencies
```sh
cd exp-fin
npm install
```

```sh
cd client
npm install
```

## How To Run
### Server
The server is on `exp_fin` folder. You can run it by using this steps
1. Change dir to server folder
```sh
cd exp_fin
```
2. Run the server
```sh
docker compose up --build   # if you are in linux server, please add sudo in front of it
```

### Client
There are multiple modes of the client, you can run it by using these steps
1. Change dir to client folder
```sh
cd client
```
2. Run the client
- TYPE: `"normal" | "dos" | "brute-force" | "big-payload" | "big-compute"`
- TIME: positive integer in miliseconds -> if you don't specify, then the client will run forever
```sh
npx ts-node src/main.tx --type $TYPE --time $TIME
```


