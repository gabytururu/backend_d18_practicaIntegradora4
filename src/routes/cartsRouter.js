import { Router } from 'express';
import { CartsController } from '../controller/cartsController.js';
import {customAuth} from '../middleware/auth.js'
import { config } from '../config/config.js';

export const router=Router();

router.get('/',customAuth(["admin"]),CartsController.getCarts)
router.get('/:cid',customAuth(["user","premium"]),CartsController.getCartById)
router.post('/',customAuth(["user","premium"]),CartsController.postNewCart)
router.put('/:cid',customAuth(["user","premium"]),CartsController.replaceCartContent)
router.put('/:cid/products/:pid',customAuth(["user","premium"]),CartsController.updateProductInCart)
router.delete('/:cid',customAuth(["user","premium"]), CartsController.deleteAllProductsInCart)
router.delete('/:cid/products/:pid',customAuth(["user","premium"]),CartsController.deleteSingleProductInCart )
router.post('/:cid/purchase',customAuth(["user","premium"]),CartsController.completePurchase)
router.get('/:cid/purchase/:tid',customAuth(["user","admin","premium"]),CartsController.getPurchaseTicket)

//temporary testing purposes only
router.get('/purchase/allTickets',customAuth(["user","admin","premium"]),CartsController.getAllPurchaseTickets)

