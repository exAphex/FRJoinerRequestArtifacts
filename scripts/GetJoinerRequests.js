let loggedInUser =
  context.parent.parent.parent.parent.parent.rawInfo["user_id"];

function queryOrgs(userId) {
  return openidm.query(
    "managed/alpha_organization",
    { _queryFilter: 'ownerIDs co "' + userId + '"' },
    ["_id", "name"]
  ).result;
}

function queryRequestors(orgName) {
  return openidm.query(
    "managed/alpha_user",
    { _queryFilter: 'frIndexedString2 eq "' + orgName + '"' },
    ["_id", "givenName", "sn", "userName", "frIndexedString3","frIndexedString2"]
  ).result;
}

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
    // POST
    return {};
  } else if (request.method === "read") {
    // GET
    return { userid: loggedInUser, results: getRequestors(loggedInUser) };
  } else if (request.method === "update") {
    // PUT
    return {};
  } else if (request.method === "patch") {
    return {};
  } else if (request.method === "delete") {
    return {};
  }
  throw { code: 500, message: "Unknown error" };
})();
