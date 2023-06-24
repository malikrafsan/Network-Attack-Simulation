import express, { Express, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import morgan from "morgan";


const app = express();

const SERVER_CONFIG = {
    PORT: 9999,
    INTERVAL: 1000,
}

type IData = {
    timestamp: Date;
    value: number;
    sensor_id: string;
    index: number;
}

const addData = (data: IData) => {
    // make sure sensor_data size is not over 50
    if (sensor_data.length >= 10) {
        sensor_data.shift();
    }

    sensor_data.push(data);
}

const validateLogin = (params: {
    username: string;
    password: string;
}) => {
    return params.username === 'admin' && params.password === 'admin'
}

const sensor_data: IData[] = [];

let timer = setInterval(() => {
    addData({
        timestamp: new Date(),
        value: Math.floor(Math.pow(Math.random(), 2) * 100),
        sensor_id: Math.floor(Math.random() * 100) + "",
        index: sensor_data.length,
    })
}, SERVER_CONFIG.INTERVAL)

app.use(bodyParser.json());
app.use(morgan("dev"));

app.post("/login", (req, res) => {
    const username: string = req.body.username
    const password: string = req.body.password

    const validate = validateLogin({
        username,
        password,
    })

    if (!validate) {
        res.send({
            success: false,
            message: "wrong username or password",
        })
        return;
    }

    res.send({
        success: true,
        data: {
            token: "admin-token"
        }
    })
})

const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send("Please authenticate");
    }

    const token = authHeader.split(" ")[1];

    if (token === 'admin-token') {
        res.locals.user = 'admin';
        next();
    }

    return res.status(403).send({
        success: false,
        message: "your token is invalid"
    });
};

app.post("/admin/reset", authMiddleware, () => {
    sensor_data.length = 0;
})

const resetTimer = (interval: number) => {
    clearInterval(timer);
    SERVER_CONFIG.INTERVAL = interval;
    timer = setInterval(() => {
        sensor_data.push({
            timestamp: new Date(),
            value: Math.floor(Math.pow(Math.random(), 2) * 100),
            sensor_id: Math.floor(Math.random() * 100) + "",
            index: sensor_data.length,
        })
    }, SERVER_CONFIG.INTERVAL)
}

app.patch("/admin/config", authMiddleware, (req, res) => {
    const interval: number | undefined = req.body.interval;

    if (interval) {
        resetTimer(interval);
    }

    res.send({
        success: true,
        data: {
            interval,
        }
    })
})

app.get("/", (_, res) => {
    res.send({
        data: "helloworld"
    })
})

app.get("/data/latest", (_, res) => {
    res.send(sensor_data.at(-1))
})

app.get("/data", (_, res) => {
    res.send(sensor_data)
})

app.listen(SERVER_CONFIG.PORT, () => {
    console.log(`Server run on http://localhost:${SERVER_CONFIG.PORT}`)
})
