import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * Dispatch an in-app notification to a user
 */
export const sendNotification = async ({
  recipient,
  type,
  title,
  message,
  relatedId = null,
  relatedType = null,
}) => {
  try {
    if (!recipient) return;
    await Notification.create({
      recipient,
      type,
      title,
      message,
      relatedId,
      relatedType,
    });
  } catch (error) {
    console.error('[Notification Error] Failed to create notification:', error);
  }
};

/**
 * Dispatch an in-app notification to all active users with a specified role
 */
export const notifyUsersByRole = async ({
  role,
  type,
  title,
  message,
  relatedId = null,
  relatedType = null,
}) => {
  try {
    const users = await User.find({ role, isActive: true }).select('_id');
    if (!users.length) return;

    const notifications = users.map((user) => ({
      recipient: user._id,
      type,
      title,
      message,
      relatedId,
      relatedType,
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error(`[Notification Error] Failed to notify role ${role}:`, error);
  }
};
