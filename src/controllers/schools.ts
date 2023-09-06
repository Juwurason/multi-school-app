import express from 'express';
import { getSchools } from '../db/school'; // Import your School model


export const getAllSchools = async (req: express.Request, res: express.Response) => {
    try {
        const schools = await getSchools();

        return res.status(200).json(schools)
    } catch (error) {
        console.log(error);
        return res.status(400);
        
    }
}

