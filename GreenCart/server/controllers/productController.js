import {v2 as cloudinary} from "cloudinary"
import Product from "../models/Product.js"

//Add Product : /api/product/add
export const addProduct = async (req, res)=>{
    try {
        let productData = JSON.parse(req.body.productData)

        const images = req.files

        let imagesUrl = await Promise.all(
            images.map(async(item)=>{
                let result = await cloudinary.uploader.upload(item.path, {resource_type: "image"});
                return result.secure_url
            })
        )

        await Product.create({...productData, image :  imagesUrl})
        return res.json({
            success: true,
            message: "Product Added"
        })

    } catch (error) {
        console.log(error.message)
        return res.json({
            success: false,
            message: error.message
        })
    }
}

//Get ProductList : /api/product/list
export const productList = async (req, res)=>{
    try {
        const products = await Product.find({})
        return res.json({
            success: true,
            products
        })
        
    } catch (error) {
        console.log(error.message)
        return res.json({
            success: false,
            message: error.message
        })
    }
}

//get single Product : /api/product/id
export const productById = async (req, res)=>{
    try {
        const {id} = req.body;
        const products = await Product.find(id)
        return res.json({
            success: true,
            products
        })
    } catch (error) {
        console.log(error.message)
        return res.json({
            success: false,
            message: error.message
        })
    }
}

//Change Product Stock : /api/product/stock
export const changeStock = async (req, res)=>{
    try {
        const {id, inStock} = req.body;
        await Product.findByIdAndUpdate(id, {inStock})
        return res.json({
            success: true,
            message: "Stock Updated"
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}
