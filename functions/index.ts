"use strict";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";

import { ZingleService } from "./zingle/zingle.service";

const app = express();

admin.initializeApp();
app.use(cors());


// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
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

app.options("/contacts", async (req: any, res: any) => {
  res.send();
});

// POST /api/messages
// Create a new message, get its sentiment using Google Cloud NLP,
// and categorize the sentiment before saving.
// app.post('/contacts', async (req: any, res: any) => {
//   const contact = req.body.message;
//   try {
//     const snapshot = await admin.database().ref(`/users/${req.user.uid}/contacts`).push(contact);
//     const val = snapshot.val();
//     res.status(201).json({message: val.message, category: val.category});
//   } catch(error) {
//     console.log('Error detecting sentiment or saving message', error.message);
//     res.status(500).send('Error Uploading Contact To Zingle!');
//   }
// });

// GET /api/messages?category={category}
// Get all messages, optionally specifying a category to filter on
// app.get("/signup", async (req: any, res: any) => {
//   const zingleToken = req.user;
//   // admin
//   //     .database()
//   //     .ref(`/users/${req.user.uid}/token`)
//   //     .toString();

//   try {
//     const service = new ZingleService();
//     const zingleLogin = service.login(zingleToken);
//     cors(
//       res
//         .status(200)
//         .json({ zingleLogin: zingleLogin, zingleToken: zingleToken })
//     );
//   } catch (error) {
//     console.log("Error getting login", error.message);
//     res.sendStatus(500).json({ zingleToken: zingleToken });
//   }
// });

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

// Expose the API as a function
exports.api = functions.https.onRequest(app);
