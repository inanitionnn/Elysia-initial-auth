// import Elysia, { t } from "elysia";
// import { GuardsHandler } from "./guards.handler";
// import { bearer } from '@elysiajs/bearer'
// import jwt from "@elysiajs/jwt";
// import { envConfig } from "../config";
// import { MyError } from "../error";

// const guards = new GuardsHandler()
// const myError = new MyError
// const JWT_SECRET = envConfig.get("JWT_SECRET")
// export const AuthGuardRoute = new Elysia()
//     .use(bearer())
//     .use(
//         jwt({й
//             name: 'jwt',
//             secret: JWT_SECRET
//         })
//     )
//   .onBeforeHandle(async ({ bearer, jwt, cookie, request }) => {
//     // request.headers.get("")
//     guards.authGuard()

//   })
