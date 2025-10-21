const express = require("express");
const router = express.Router();
const productoController = require("../controllers/producto.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", productoController.obtenerProductos);
router.post("/", authMiddleware, productoController.crearProducto);
router.put("/:id", authMiddleware, productoController.actualizarProducto);
router.delete("/:id", authMiddleware, productoController.eliminarProducto);

module.exports = router;
