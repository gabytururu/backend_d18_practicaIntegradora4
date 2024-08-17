import { Router } from 'express';
import { VistasController } from '../controller/vistasController.js';
import { customAuth } from '../middleware/auth.js';
import { config } from '../config/config.js';

export const router=Router();

if(config.ENVIRONMENT==='prod'){
    //logger test endpoint
    router.get('/loggerTest',customAuth(["public"]),VistasController.getLoggerTest)

    //mocking proucts endpoint
    router.get('/mockingProducts',customAuth(["public"]),VistasController.getMockingProducts)

    //real ecommerce API endpoints
    router.get('/',customAuth(["public"]),VistasController.renderHome)
    router.get('/products',customAuth(["public"]),VistasController.renderProducts)
    router.get('/products/:pid',customAuth(["public"]),VistasController.renderProductById)
    router.get('/carts',customAuth(["admin"]),VistasController.renderCarts)
    router.get('/carts/:cid',customAuth(["user","admin","premium"]),VistasController.renderCartById)
    router.get('/chat',customAuth(["user","premium"]),VistasController.renderChat)
    router.get('/registro', customAuth(["public"]),VistasController.renderRegistro)
    router.get('/login',customAuth(["public"]),VistasController.renderLogin)
    router.get('/perfil',customAuth(["user","admin","premium"]),VistasController.renderPerfil)
    router.get('/logout',customAuth(["public"]),VistasController.renderLogout)
    router.get('/purchase/:tid',customAuth(["user","admin","premium"]),VistasController.renderTicket)
    router.get('/password',customAuth(["public"]),VistasController.renderPassword)
    router.get('/resetPassword',customAuth(["public"]),VistasController.renderResetPassword)
    router.get('/error',customAuth(["public"]),VistasController.renderError)
}

  //logger test endpoint
  router.get('/loggerTest',customAuth(["public"]),VistasController.getLoggerTest)

  //mocking proucts endpoint
  router.get('/mockingProducts',customAuth(["public"]),VistasController.getMockingProducts)

  //real ecommerce API endpoints
  router.get('/',customAuth(["public"]),VistasController.renderHome)
  router.get('/products',customAuth(["public"]),VistasController.renderProducts)
  router.get('/products/:pid',customAuth(["public"]),VistasController.renderProductById)
  router.get('/carts',customAuth(["admin"]),VistasController.renderCarts)
  router.get('/carts/:cid',customAuth(["user","admin","premium"]),VistasController.renderCartById)
  router.get('/chat',customAuth(["user","premium"]),VistasController.renderChat)
  router.get('/registro', customAuth(["public"]),VistasController.renderRegistro)
  router.get('/login',customAuth(["public"]),VistasController.renderLogin)
  router.get('/perfil',customAuth(["user","admin","premium"]),VistasController.renderPerfil)
  router.get('/perfilUploads',customAuth(["user","admin","premium"]),VistasController.renderPerfilUploads)
  router.get('/logout',customAuth(["public"]),VistasController.renderLogout)
  router.get('/purchase/:tid',customAuth(["user","admin","premium"]),VistasController.renderTicket)
  router.get('/password',customAuth(["public"]),VistasController.renderPassword)
  router.get('/resetPassword',customAuth(["public"]),VistasController.renderResetPassword)
  router.get('/error',customAuth(["public"]),VistasController.renderError)



