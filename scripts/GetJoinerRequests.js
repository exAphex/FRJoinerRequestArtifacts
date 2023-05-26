let loggedInUser =
  context.parent.parent.parent.parent.parent.rawInfo["user_id"];

// query all orgs the given user is owner of
function queryOrgs(userId) {
  return openidm.query(
    "managed/alpha_organization",
    { _queryFilter: 'ownerIDs co "' + userId + '"' },
    ["_id", "name"]
  ).result;
}

// query all users to wants to join a certain organisation
function queryRequestors(orgName) {
  return openidm.query(
    "managed/alpha_user",
    { _queryFilter: 'frIndexedString2 eq "' + orgName + '"' },
    ["_id", "givenName", "sn", "userName", "frIndexedString3","frIndexedString2"]
  ).result;
}

// return all open requests a user has to decide on
function getRequestors(userId) {
  let orgs = queryOrgs(userId);
  let retRequestors = [];
  orgs.map((o) => {
    let orgRequestors = queryRequestors(o.name);
    orgRequestors.map(or => {
      retRequestors.push(or);
    });
  });
  return retRequestors;
}

(function () {
  if (request.method === "create") {
    return {};
  } else if (request.method === "read") {
    // return all open requests for myself
    return { userid: loggedInUser, results: getRequestors(loggedInUser) };
  } else if (request.method === "update") {
    return {};
  } else if (request.method === "patch") {
    return {};
  } else if (request.method === "delete") {
    return {};
  }
  throw { code: 500, message: "Unknown error" };
})();
