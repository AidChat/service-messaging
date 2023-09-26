import {NextFunction, Request, Response} from "express";
import {responseHandler} from "../utils/response-handler";
import {hasher} from "../utils/methods";

export function verifyClient(request: Request, response: Response, next: NextFunction) {
    try {
        let token = request.headers.session;
        if (!token) throw "Session not available"
        if (token) {
            hasher._verify(token).then((response: any) => {
                request.body.user = {
                    email: response.data
                }
                next();
            })
                .catch(() => {
                    throw "Session not available"
                })
        }
    } catch (e: any) {
        responseHandler(403, response, {message: e})
    }
}