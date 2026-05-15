import express from "express";
import cors from "cors";
import ordersRoutes from "./routes/orders.js";
import ocrRoutes from "./routes/ocr.js";
import cuestionarioRoutes from "./routes/cuestionarios.js"
import historialRoutes from "./routes/historial.js";
import usuariosRoutes from "./routes/usuario.js";
import filesRoutes from "./routes/file.js"
import notificacionesRoutes from "./routes/notificaciones.js"
import controlRoutes from "./routes/control.js";
import planosRoutes from "./routes/planos.js";
import consultasRoutes from "./routes/consultas.js";
import { checkOrderDeadlines } from "./controllers/notificationController.js";

const app = express();

app.use(cors({
  origin: "*"
}));

app.use("/ocr", ocrRoutes);

app.use(express.json());

app.use("/orders", ordersRoutes);

app.use("/consultas", consultasRoutes);

app.use("/cuestionario", cuestionarioRoutes);

app.use("/planos", planosRoutes);

app.use("/historial", historialRoutes);

app.use("/usuario", usuariosRoutes);

app.use("/file", filesRoutes);

app.use("/notificacion", notificacionesRoutes);

app.use("/control", controlRoutes);

// 🚀 ejecutar al iniciar
checkOrderDeadlines();

// 🔁 ejecutar cada cierto tiempo
setInterval(() => {
  console.log("⏰ Chequeando vencimientos...");
  checkOrderDeadlines();
}, 1000 * 60 * 60); // cada 1 hora

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});