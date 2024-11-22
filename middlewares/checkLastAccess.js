import { Access, findAccessByUser } from "../models/access.model.js";

export async function checkLastAccess(agent, cookies, ip, user) {
  let data = await findAccessByUser(user);
  if (data.length > 0) {
    let lastAccess = data[data.length - 1];
    if (
      lastAccess.ip == ip &&
      lastAccess.userAgent == agent &&
      lastAccess.cookies == cookies
    ) {
      return "User access already saved.";
    } else {
      saveAccess(agent, cookies, ip, user);
    }
  } else {
    saveAccess(agent, cookies, ip, user);
  }
  return "User access saved as " + agent + ".";
}

function saveAccess(agent, cookies, ip, user) {
  let access = new Access({
    userAgent: agent,
    cookies: cookies,
    ip: ip,
    user: user,
  });
  access.save();
}
