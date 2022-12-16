const apiBaseURL = "http://localhost:5000/api/images";
let idUser = 0;
function storeLoggedUser(userProfil) {
  sessionStorage.setItem("userProfil", JSON.stringify(userProfil));
}
function storeAccessToken(token) {
  sessionStorage.setItem("token", token);
}
function eraseAccessToken() {
  sessionStorage.removeItem("token");
}
function retrieveLoggeduser() {
  return JSON.parse(sessionStorage.getItem("userProfil"));
}
function retrieveAccessToken() {
  return sessionStorage.getItem("token");
}
function getBearerAuthorizationToken() {
  return { Authorization: "Bearer " + retrieveAccessToken() };
}
function deConnect() {
  sessionStorage.clear();
}
function HEAD(successCallBack, errorCallBack) {
  $.ajax({
    url: apiBaseURL,
    type: "HEAD",
    contentType: "text/plain",
    complete: (request) => {
      successCallBack(request.getResponseHeader("ETag"));
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function GET_ID(id, successCallBack, errorCallBack) {
  $.ajax({
    url: apiBaseURL + "/" + id,
    type: "GET",
    success: (data) => {
      successCallBack(data);
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function GET_USER_BY_ID(id, successCallBack, errorCallBack) {
  $.ajax({
    url: "http://localhost:5000/Accounts/" + id,
    type: "GET",
    success: (data) => {
      successCallBack(data);
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function GET_ALL(successCallBack, errorCallBack, queryString = null) {
  let url = apiBaseURL + (queryString ? queryString : "");
  $.ajax({
    url: url,
    type: "GET",
    success: (data, status, xhr) => {
      successCallBack(data, xhr.getResponseHeader("ETag"));
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function POST(data, successCallBack, errorCallBack) {
  $.ajax({
    url: apiBaseURL,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(data),
    success: (data) => {
      successCallBack(data);
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function PUT(image, successCallBack, errorCallBack) {
  $.ajax({
    url: apiBaseURL + "/" + image.Id,
    type: "PUT",
    contentType: "application/json",
    data: JSON.stringify(image),
    success: () => {
      successCallBack();
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function DELETE(id, successCallBack, errorCallBack) {
  // let user = sessionStorage.getItem("userProfil");
  // let userid = JSON.parse(user).Id;
  $.ajax({
    url: apiBaseURL + "/" + id,
    type: "DELETE",
    success: () => {
      successCallBack();
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function DELETEUSER(id, successCallBack, errorCallBack) {
  let token = sessionStorage.getItem("token");

  $.ajax({
    url: "http://localhost:5000/Accounts/remove/" + id,
    type: "GET",
    contentType: "application/json",
    headers: { Authorization: "Bearer" + token },
    success: () => {
      successCallBack();
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function LOGIN(data, successCallBack, errorCallBack) {
  $.ajax({
    url: "http://localhost:5000/token",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (profil) {
      storeAccessToken(profil.Access_token);
      GET_USER(profil.UserId, successCallBack, errorCallBack);
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function LOGOUT(successCallBack, errorCallBack) {
  let user = sessionStorage.getItem("userProfil");
  let userid = JSON.parse(user).Id;
  $.ajax({
    url: "http://localhost:5000/Accounts/logout/" + userid,
    type: "GET",
    data: {},
    headers: getBearerAuthorizationToken(),
    success: () => {
      deConnect();
      successCallBack();
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function VERIFY(VerifyCode, successCallBack, errorCallBack) {
  let userId = retrieveLoggeduser();
  if (userId.Id != null) {
    $.ajax({
      url: `http://localhost:5000/Accounts/verify?id=${userId.Id}&code=${VerifyCode}`,
      type: "GET",
      contentType: "application/json",
      data: JSON.stringify(VerifyCode),
      success: (VerifyCode) => {
        successCallBack(VerifyCode);
      },
      error: function (jqXHR) {
        errorCallBack(jqXHR.status);
      },
    });
  }
}
function GET_USER(id, successCallBack, errorCallBack) {
  $.ajax({
    url: "http://localhost:5000/Accounts/index/" + id,
    type: "GET",
    contentType: "text/plain",
    success: function (userProfil) {
      storeLoggedUser(userProfil);
      successCallBack(userProfil);
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
} //vérification du mot de passe.
function REGISTER(data, successCallBack, errorCallBack) {
  $.ajax({
    url: "http://localhost:5000/Accounts/register",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (data) {
      idUser = data.Id;
      successCallBack(data);
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}

function MODIFY(data, successCallBack, errorCallBack) {
  $.ajax({
    url: "http://localhost:5000/Accounts/modify" + "/" + data.Id,
    type: "PUT",
    contentType: "application/json",
    headers: getBearerAuthorizationToken(),
    data: JSON.stringify(data),
    success: () => {
      GET_USER(data.Id, successCallBack, error);
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
