import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({children}) => {

    const currency = import.meta.env.VITE_CURRENCY;


    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([]);

    const [cartItems, setCartItems] = useState({});
    //fetch All Products
    const fetchProduct = async ()=> {
        setProducts(dummyProducts)
    }
    // Add Products to Cart
    const addToCart = (itemId)=> {
        let cartData = structuredClone(cartItems)
        if(cartData[itemId]) {
            cartData[itemId] += 1
        } else {
            cartData[itemId] = 1
        }
        setCartItems(cartData)
        toast.success("Added to Cart")
    }

    //Update Cart Item Quantity
    const updateCartItem = (itemId, quantity)=> {
        let cartData = structuredClone(cartItems);
        cartData[itemId] = quantity;
        setCartItems(cartData)
        toast.success("Card Updated")
    }

    // Remove Product From Cart

    const removeFromCart = (itemId) => {
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            cartData[itemId] -= 1;
            if(cartData[itemId] === 0) {
                delete cartData[itemId]
            }
        }
        toast.success("Removed From Cart")
        setCartItems(cartData)
    }

    useEffect(()=> {
        fetchProduct()
    },[])

    const value = {
        navigate,
        user, setUser,
        isSeller, setIsSeller,
        showUserLogin, setShowUserLogin,
        products,
        currency,
        cartItems,addToCart, updateCartItem, removeFromCart
    }

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = () => {
    return useContext(AppContext);
}


