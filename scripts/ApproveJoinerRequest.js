let userId = request.additionalParameters.user;
let decision = request.additionalParameters.decision;
let loggedInUser =
  context.parent.parent.parent.parent.parent.rawInfo["user_id"];

// return user by user id
function getUser(userId) {
  return openidm.read("managed/alpha_user/" + userId, null, [
    "_id",
    "frIndexedString2",
  ]);
}

// return the organisation object by name and check if the logged in user is owner of it
function queryOrg(orgName, loggedInUser) {
  let retOrg = openidm.query(
    "managed/alpha_organization",
    { _queryFilter: 'name eq "' + orgName + '" and ownerIDs co "' + loggedInUser + '"' },
    ["_id", "name"]
  ).result;
  return retOrg.length > 0 ? retOrg[0] : null;
}

// clear approval data
function clearUserData(user) {
    return openidm.patch("managed/alpha_user/" + user._id, user._rev, [
        {"operation":"remove","field":"/frIndexedString2"},
        {"operation":"remove","field":"/frIndexedString3"}
      ]);
}

// assign user to org
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
    // query user object
    let user = getUser(userId);
    if (user) {
      // query org object + check if user is owner of it
      let org = queryOrg(user.frIndexedString2, loggedInUser);
      if (org) {
        // clear approval data beforehand
        clearUserData(user);
        // if the decision is an approve, assign user to org
        if (isApprove) {
            return assignUserToOrg(org, user);
        } else {
            // otherwise do nothing and return original org
            return org;
        }
      } else {
        return { error: "Couldnt assign org to user" };
      }
    } else {
      return { error: "User not found!" };
    }
  } else if (request.method === "read") {
    return {};
  } else if (request.method === "update") {
    return {};
  } else if (request.method === "patch") {
    return {};
  } else if (request.method === "delete") {
    return {};
  }
  throw { code: 500, message: "Unknown error" };
})();
