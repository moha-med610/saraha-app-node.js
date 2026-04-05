import multer from "multer";

export const errorHandlingMiddleware = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "File size is too large",
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  res.status(err.code || 500).json({
    success: err.success || false,
    code: err.code || 500,
    message: err.message || "Internal Server Error",
  });
};
