import type { LocationDescriptorObject } from "history";
import { lazy } from "react";
import { generatePath } from "react-router-dom";
import type { RouteDef } from "../../route-config";

export type AddExecutorParams = {
  realm: string;
  profileName: string;
};

export const AddExecutorRoute: RouteDef = {
  path: "/:realm/realm-settings/client-policies/:profileName/add-executor",
  component: lazy(() => import("../ExecutorForm")),
  breadcrumb: (t) => t("realm-settings:addExecutor"),
  access: "manage-realm",
};

export const toAddExecutor = (
  params: AddExecutorParams
): LocationDescriptorObject => ({
  pathname: generatePath(AddExecutorRoute.path, params),
});
