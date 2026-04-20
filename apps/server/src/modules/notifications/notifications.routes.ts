import { Hono } from "hono";

import { authMiddleware } from "../../middleware/auth";
import type { AuthEnv } from "../../types";
import { notificationsController } from "./notifications.controller";

const notificationsRoutes = new Hono<AuthEnv>();

// SSE stream for real-time notifications
notificationsRoutes.get("/stream", authMiddleware, notificationsController.stream);

// List notifications (paginated)
notificationsRoutes.get("/", authMiddleware, notificationsController.list);

// Get unread count
notificationsRoutes.get("/unread-count", authMiddleware, notificationsController.unreadCount);

// Mark single notification as read
notificationsRoutes.patch("/:id/read", authMiddleware, notificationsController.markRead);

// Mark all notifications as read
notificationsRoutes.patch("/read-all", authMiddleware, notificationsController.markAllRead);

// Register push token (mobile)
notificationsRoutes.post("/push-token", authMiddleware, notificationsController.registerPushToken);

// Remove push token
notificationsRoutes.delete("/push-token", authMiddleware, notificationsController.removePushToken);

export { notificationsRoutes };
