import express from 'express'

const router = express.Router();

router.get('/save', async (req, res) =>{
    const mandantId = req.user.mandantid
    const userId = req.user.id

    try{
        await saveOffer(req.body, mandantId, userId)
        return res.json({message: 'offer saved'})

    }catch (e){
        return res.json(statusCode(404).json({error: e.message}))
    }

    return res.json(res.statusCode(404).json({error: 'Fehler!'}))
})

router.get('/create', async (req, res) =>{
    const mandantId = req.user.mandantid
    const userId = req.user.id

    try{
        await saveOffer(req.body, mandantId, userId)
        return res.json({message: 'offer saved'})

    }catch (e){
        return res.json(statusCode(404).json({error: e.message}))
    }

    return res.json(res.statusCode(404).json({error: 'Fehler!'}))
})

export default router;