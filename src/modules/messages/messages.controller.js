import { Router } from "express";
import { upload } from "../../middlewares/multer.js";
import * as service from "./messages.service.js";
import { response } from "../../utils/response.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const router = Router();

router.post(
  "/send-message",
  upload({ dest: "messages", fileSize: 15 * 1024 * 1024 }).array(
    "attachments",
    5,
  ),
  async (req, res) => {
    const attachments = req.files.map((e) => e.finalPath);
    const { userId, body } = req.body;

    const data = await service.sendMessagesService({
      attachments,
      body,
      userId,
    });

    return response({
      res,
      message: "Message Created Successfully",
      statusCode: 201,
      data,
    });
  },
);

router.get("/get-messages", verifyToken, async (req, res) => {
  const data = await service.getMessages({ userId: req.user._id });

  return response({
    res,
    message: "Messages Fetched Successfully",
    data,
  });
});

export default router;
