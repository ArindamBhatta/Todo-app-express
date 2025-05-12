import multer from "multer";
/* 
Multer is responsible for receiving the file and storing it locally (or in memory, or cloud, depending on config).
destination: Tells Multer where on the server to store the file (e.g., ./public/temp
Tells Multer what to name the saved file (you’re using the original name sent by the user, which is fine but potentially risky if not sanitized).

Even though the file "arrives" with the request, it’s not saved anywhere on your server unless you tell Multer how and where to save it.

So req.files.avatar[0].path works only because Multer saved the file to disk, and you're accessing that generated path afterward.
*/
const storage = multer.diskStorage({
  //where we store the data
  destination: (req, file, cb) => {
    cb(null, "./public/temp");
  },
  //what is the name of the file
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });
