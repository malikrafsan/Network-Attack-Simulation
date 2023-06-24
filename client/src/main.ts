import axios from "axios";
import { ArgumentParser } from 'argparse';
import { faker } from '@faker-js/faker';
import fs from 'fs';

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

const dos_attack = async () => {
    const NUMBER_OF_REQUESTS = 1000;
    const promises = await Promise.all(Array(NUMBER_OF_REQUESTS).fill(0).map(async (_, idx) => {
        const res = await axios.get(
            label(URLS.latest, "dos-" + idx),
        );
        console.log(res.data);
        return res.data;
    }))
    console.log(promises);
}

const normal = async () => {
    console.log("normal inside");
    const res = await axios.get(
        label(URLS.latest, "normal"),
    );
    console.log(res.data);
}

const normalLoop = async () => {
    const time = args.time ? parseInt(args.time) : 1000;
    setInterval(normal, time)
}

const bruteForceLogin = async () => {
    const NUMBER_OF_REQUESTS = 1000;
    const promises = await Promise.all(Array(NUMBER_OF_REQUESTS).fill(0).map(async (_, idx) => {
        const res = await axios.post(
            label(URLS.login, "brute-force-" + idx),
            {
                username: faker.internet.userName(),
                password: faker.internet.password(),
            },
            {
                headers: {
                    "Content-Type": "application/json",
                }
            }
        );
        console.log(res.data);
        return res.data;
    }))
    console.log(promises);
}

const bigPayloadAttack = async () => {
    // create super big javascript object ~15 MB
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
}

const bigCompute = async () => {
    const NUM = 100_000_000;
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
}

const safeParseInt = (num: string, radix?: number | undefined) => {
    try {
        return parseInt(num, radix);
    } catch (err) {
        return null;
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

const ops = [
    {
        name: "normal",
        handler: normal,
        probability: 0.9,
    },
    {
        name: "dos",
        handler: dos_attack,
        probability: 0.01,
    },
    {
        name: "brute-force",
        handler: bruteForceLogin,
        probability: 0.01,
    },
    {
        name: "big-payload",
        handler: bigPayloadAttack,
        probability: 0.49,
    },
    {
        name: "big-compute",
        handler: bigCompute,
        probability: 0.49,
    }
] as const

const byzantine = async () => {
    // loop and call normal, but occasionally call other attacks
    const time = args.time && safeParseInt(args.time) || 100;

    setInterval(safe(async () => {
        const rand = Math.random();
        let sum = 0;
        for (const op of ops) {
            sum += op.probability;
            if (rand < sum) {
                console.log("attack type: ", op.name);
                await op.handler();
                return
            }
        }
    }), time);
}

const callback = async () => {
    const type = args.type || "normal";

    switch (type) {
        case "normal":
            return normalLoop();
        case "dos":
            return dos_attack();
        case "brute-force":
            return bruteForceLogin();
        case "big-payload":
            return bigPayloadAttack();
        case "big-compute":
            return bigCompute();
        case "combine":
            return byzantine();
        default:
            return normalLoop();
    }
}

const main = async () => {
    try {
        callback();
    } catch (err) {
        console.log(err);
    }
}

main();
