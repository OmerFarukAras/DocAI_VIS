import AdminJS from "adminjs";

import * as AdminJSMongoose from "@adminjs/mongoose";
import * as AdminJSExpress from "@adminjs/express";

import {User} from "../models/user.model.js";
import {Access} from "../models/access.model.js";

import {dark, light, noSidebar} from '@adminjs/themes'


AdminJS.registerAdapter(AdminJSMongoose);

export function LoadAdmin(app) {
    const adminJs = new AdminJS({
        resources: [
            {
                resource: User,
            },
            {
                resource: Access,
            },
        ],
        rootPath: "/admin",
        defaultTheme: dark.id,
        availableThemes: [dark, light, noSidebar],
    });
    const router = AdminJSExpress.buildRouter(adminJs);

    app.use(adminJs.options.rootPath, router);
}
