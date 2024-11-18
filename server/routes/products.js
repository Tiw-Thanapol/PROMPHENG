//import...
const express = require('express')
const { 
    create, 
    list, 
    listBy, 
    remove, 
    searchFilters,  
    read, 
    createImages, 
    removeImage,
    update, 
    } = require('../controllers/products')
const router = express.Router()
const { authCheck, adminCheck } = require('../middlewares/authCheck')


//End Point http://localhost:5000/api/category
router.post('/product', create)
router.get('/products/:count', list)
router.get('/product/:id', read)
router.put('/product/:id', update)
router.delete('/product/:id', remove)
router.post('/productby', listBy)
router.post('/searchFilters', searchFilters)

router.post('/images', authCheck, adminCheck, createImages)
router.post('/removeimages', authCheck, adminCheck, removeImage)


module.exports = router