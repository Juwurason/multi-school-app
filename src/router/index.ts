import express from 'express'

import authenticatioon from "./authentication"
import users from './users'

const router = express.Router()

export default (): express.Router => {
    authenticatioon(router)
    users(router)

    return router;
}