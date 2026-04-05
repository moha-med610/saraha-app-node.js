import { Messages } from "../../db/models/message.model.js";
import { Users } from "../../db/models/users.model.js";
import { ServerError } from "../../utils/serverError.js";

export const sendMessagesService = async ({ body, attachments, userId }) => {
  const user = await Users.findById(userId);

  if (!user) {
    throw new ServerError(false, 404, "User Not Found");
  }

  const data = await Messages.create({
    body,
    attachments,
    receivedUserId: userId,
  });

  return { data };
};

export const getMessages = async ({ userId }) => {
  const messages = await Messages.find({ receivedUserId: userId });

  return { messages };
};
