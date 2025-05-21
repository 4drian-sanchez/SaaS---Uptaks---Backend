import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

const handleInputsErrors = (req: Request, res: Response, next: NextFunction) => {
    let errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json(errors)
    }
    next()
}

export default handleInputsErrors