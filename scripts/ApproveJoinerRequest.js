let userId = request.additionalParameters.user;
let decision = request.additionalParameters.decision;
let loggedInUser =
  context.parent.parent.parent.parent.parent.rawInfo["user_id"];

function getUser(userId) {
  return openidm.read("managed/alpha_user/" + userId, null, [
    "_id",
    "frIndexedString2",
  ]);
}

// and ownerIDs co "' + loggedInUser + '"
function queryOrg(orgName, loggedInUser) {
  let retOrg = openidm.query(
    "managed/alpha_organization",
    { _queryFilter: 'name eq "' + orgName + '"' },
    ["_id", "name"]
  ).result;
  return retOrg.length > 0 ? retOrg[0] : null;
}

function clearUserData(user) {
    return openidm.patch("managed/alpha_user/" + user._id, user._rev, [
        {"operation":"remove","field":"/frIndexedString2"},
        {"operation":"remove","field":"/frIndexedString3"}
      ]);
}

function assignUserToOrg(org, user) {
  return openidm.patch("managed/alpha_organization/" + org._id, org._rev, [
    {
      operation: "add",
      field: "/members/-",
      value: {
        _ref: "managed/alpha_user/" + user._id,
        _refProperties: {},
      },
    },
  ]);
}

(function () {
  if (request.method === "create") {
    let isApprove = false;
    if (decision && decision.toLowerCase() === "approve") {
        isApprove = true;
    }
    let user = getUser(userId);
    if (user) {
      let org = queryOrg(user.frIndexedString2, loggedInUser);
      if (org) {
        clearUserData(user);
        if (isApprove) {
            return assignUserToOrg(org, user);
        } else {
            return org;
        }
      } else {
        return { error: "Couldnt assign org to user" };
      }
    } else {
      return { error: "User not found!" };
    }
  } else if (request.method === "read") {
    // GET
    return {};
  } else if (request.method === "update") {
    return {};
    //let requestedOrg = queryOrg(user._id)
    //return {};
  } else if (request.method === "patch") {
    return {};
  } else if (request.method === "delete") {
    return {};
  }
  throw { code: 500, message: "Unknown error" };
})();
