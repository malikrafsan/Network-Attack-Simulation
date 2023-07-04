import axios from "axios";
import { ArgumentParser } from 'argparse';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import { exit } from "process";

const parser = new ArgumentParser({
    description: 'Argparse'
});

parser.add_argument('-t', '--time', { help: 'time interval' });
parser.add_argument('-T', '--type', { help: 'type of attack' });

const args: {
    [key: string]: string | undefined;
} = parser.parse_args();

const label = (url: string, label: string) => {
    return url + "?label=" + label;
}

const URLS = {
    login: "http://localhost:9999/login",
    reset: "http://localhost:9999/admin/reset",
    latest: "http://localhost:9999/data/latest",
    all: "http://localhost:9999/data",
    calc: "http://localhost:9999/calc",
} as const;

const block = (blockTime: number) => {
    const now = performance.now();
    while (performance.now() - now < blockTime) { }
}


const normal = async () => {
    while (1) {
        try {
            const res = await axios.get(
                label(URLS.latest, "normal")
            )
            console.log(res.data)

            block(100)
        } catch (err) {
            console.error(err)
            exit(1);
        }
    }
}

const dos = async () => {
    setInterval(() => {
        axios.get(
            label(URLS.latest, "dos")
        ).catch(err => {
            console.error(err)
        })
    })
}

const bruteForceLogin = async () => {
    setInterval(() => {
        axios.post(
            label(URLS.login, "brute-force"),
            {
                username: faker.internet.userName(),
                password: faker.internet.password()
            },
        ).then(res => {
            console.log(res.data)
        })
        .catch(err => {
            console.error(err)
        })
    })
}

const bigPayloadAttack = async () => {
    while (1) {
        try {
            const SIZE_PAYLOAD = 1_000_000;
            const bigArr = Array(SIZE_PAYLOAD).fill(0).map(() => {
                const key = faker.lorem.word();
                const value = faker.string.alphanumeric();
                return {
                    [key]: value,
                }
            });

            const res = await axios.post(
                label(URLS.login, "big-payload"),
                bigArr,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
            console.log(res.data);
        } catch (err) {
            console.log(err);
            exit(1);
        }
    }
}

const bigCompute = async () => {
    while (1) {
        try {
            const NUM = Math.floor(Math.random() * 1_000_000);
            const res = await axios.post(
                label(URLS.calc, "big-compute"),
                {
                    num: NUM,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
            console.log(res.data); 
        } catch (err) {
            console.log(err);
            exit(1);
        }
    }
}


const safe = <T>(fn: () => T) => {
    return () => {
        try {
            return fn();
        } catch (err) {
            console.log(err);
            return null;
        }
    }
}

const callback = () => {
    const type = args.type || "normal";

    switch (type) {
        case "normal":
            return {
                name: "normal",
                handler: safe(normal),
            }
        case "dos":
            return {
                name: "dos",
                handler: safe(dos),
            }
        case "brute-force":
            return {
                name: "brute-force",
                handler: safe(bruteForceLogin),
            }
        case "big-payload":
            return {
                name: "big-payload",
                handler: safe(bigPayloadAttack),
            }
        case "big-compute":
            return {
                name: "big-compute",
                handler: safe(bigCompute),
            }
        default:
            return {
                name: "normal",
                handler: safe(normal),
            }
    }
}

const main = async () => {
    try {
        const time = args.time ? parseInt(args.time) : null;

        const cl = callback();

        cl.handler();

        if (time) {
            setTimeout(() => {
                exit(0);
            }, time)
        }
    } catch (err) {
        console.log(err);
    }
}

main();
