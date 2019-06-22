"use strict";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";

import { ZingleService } from "./zingle/zingle.service";

const app = express();

admin.initializeApp();
app.use(cors());

// Express middleware that validates Firebase ID Or Basic Auth Tokens passed in the Authorization HTTP header.
const authenticate = async (req: any, res: any, next: any) => {
  if (!!req.headers.authorization) {
    if (/^Bearer .*$/gim.test(req.headers.authorization)) {
      const idToken = req.headers.authorization.split("Bearer ")[1];
      try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedIdToken;
        next();
        return;
      } catch (e) {
        res
          .status(403)
          .send({ error: e })
          .json();
        return;
      }
    } else if (/^Basic .*$/gim.test(req.headers.authorization)) {
      try {
        req.user = req.headers.authorization.split("Basic ")[1];
        next();
        return;
      } catch (e) {
        res
          .status(403)
          .send({ error: e })
          .json();
        return;
      }
    }
  } else {
    res.status(403).send({
      Headers: req.headers.authorization
    });
    return;
  }
};

app.use(authenticate);

app.options("/signup", async (req: any, res: any) => {
  res.send();
});

app.get("/signup", async (req: any, res: any) => {
  try {
    const zingleService: ZingleService = new ZingleService();
    zingleService.login(req.user, (error, response, body) => {
        if (!error) {
          // TODO: Create User In Firebase
            res.status(response.statusCode).send(body);
        } else {
            res.status(500).json(error);
        }
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.options("/services", async (req: any, res: any) => {
  res.send();
});

app.get("/services", async (req: any, res: any) => {
  try {
    const zingleService: ZingleService = new ZingleService();
    zingleService.getServices(req.user, (error, response, body) => {
        if (!error) {
            res.status(response.statusCode).send(body);
        } else {
            res.status(500).json(error);
        }
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.options("/contacts", async (req: any, res: any) => {
  res.send();
});

app.post("/contacts", async (req: any, res: any) => {
  const { serviceId, payload } = req.body;

  // res.status(200).json({ servId: serviceId, pld: payload });

  try {
    const zingleService: ZingleService = new ZingleService();
    zingleService.createContact(req.user, serviceId, payload, (error, response, body) => {
        if (!error) {
            res.status(response.statusCode).send(body);
        } else {
            res.status(500).send(error);
        }
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Expose the API as a function
exports.api = functions.https.onRequest(app);
