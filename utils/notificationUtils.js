const Notification = require("../models/Notification");
const User = require("../models/mUser");

async function createNotificationIfAllowed({ userId, type, title, message, link }) {
  const user = await User.findById(userId).lean();
  if (user?.preferences?.notifications?.realTime) {
    return Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
      read: false,
    });
  }
  return null;
}

module.exports = { createNotificationIfAllowed };