import { createTRPCRouter } from "@/server/api/trpc";
import { projectRouter } from "@/server/api/routers/project";
import { portfolioRouter } from "@/server/api/routers/portfolio";
import { chatRouter } from "@/server/api/routers/chat";
import { paymentRouter } from "@/server/api/routers/payment";
import { servicesRouter } from "@/server/api/routers/services";
import { adminRouter } from "@/server/api/routers/admin";
import { preferencesRouter } from "@/server/api/routers/preferences";
import { activityRouter } from "@/server/api/routers/activity";
import { deadlineRouter } from "@/server/api/routers/deadline";
import { milestoneRouter } from "@/server/api/routers/milestone";
import { filesRouter } from "@/server/api/routers/files";
import { notificationRouter } from "@/server/api/routers/notification";
import { searchRouter } from "@/server/api/routers/search";

export const appRouter = createTRPCRouter({
  project: projectRouter,
  portfolio: portfolioRouter,
  chat: chatRouter,
  payment: paymentRouter,
  services: servicesRouter,
  admin: adminRouter,
  preferences: preferencesRouter,
  activity: activityRouter,
  deadline: deadlineRouter,
  milestone: milestoneRouter,
  files: filesRouter,
  notification: notificationRouter,
  search: searchRouter,
});

export type AppRouter = typeof appRouter;
