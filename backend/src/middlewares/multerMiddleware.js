const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Guardando archivo en la ruta:"); // Debugging para confirmar la ruta de destino
    cb(null, 'src/uploads/'); // Verifica que la ruta sea correcta y que existan los permisos
  },
  filename: (req, file, cb) => {
    console.log("Nombre del archivo guardado:"); // Debugging para confirmar el nombre del archivo
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      console.log("Archivo inválido:", file.originalname); // Debugging para archivos no válidos
      return cb(new Error('Please upload a valid image (jpg, jpeg, or png).'));
    }
    cb(null, true);
  },
  limits: { fileSize: 5000000 } // 5 MB
});

module.exports = upload;
