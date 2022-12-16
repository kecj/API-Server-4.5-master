// 
//    TRAVAIL FINAL
//    PictaCloud, gestionnaire d'image
//    Déveleppé par Kyle Delisi et Anthony Boutin Dufour,
//    15 décembre 2022
//

//###   DÉCLARATION DE VARIABLES & CONSANTES   ################################################################################################################################################

const apiBaseURL = "https://pictacloud.glitch.me";
const apiImageURL = "https://pictacloud.glitch.me/api/images";
let idUser = 0;

//#############################################################################################################################################################################################

//###   REQUEST HEAD   ########################################################################################################################################################################

function HEAD(successCallBack, errorCallBack) {
  $.ajax({
    url: apiImageURL,
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

//#############################################################################################################################################################################################

//###   REQUEST GET   #########################################################################################################################################################################

function GET_ALL(successCallBack, errorCallBack, queryString = null) {
  let url = apiImageURL + (queryString ? queryString : "");
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
function GET_IMAGE_BY_ID(id, successCallBack, errorCallBack) {
  $.ajax({
    url: apiImageURL + "/" + id,
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
    url: apiBaseURL + "/Accounts/index/" + id,
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
}
function LOGOUT(successCallBack, errorCallBack) {
  let user = sessionStorage.getItem("userProfil");
  let userid = JSON.parse(user).Id;
  $.ajax({
    url: apiBaseURL + "/Accounts/logout/" + userid,
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
  if (idUser != 0) {
    $.ajax({
      url: apiBaseURL + `/Accounts/verify?id=${idUser}&code=${VerifyCode}`,
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
  } else {
    $.ajax({
      url: apiBaseURL + `/Accounts/verify?id=${userId.Id}&code=${VerifyCode}`,
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

//#############################################################################################################################################################################################

//###   REQUEST DELETE   ######################################################################################################################################################################

function DELETE_IMAGE(id, successCallBack, errorCallBack) {
  $.ajax({
    url: apiImageURL + "/" + id,
    type: "DELETE",
    success: () => {
      successCallBack();
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function DELETE_USER(id, successCallBack, errorCallBack) {
  let token = sessionStorage.getItem("token");
  $.ajax({
    url: apiBaseURL + "/Accounts/remove/" + id,
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

//#############################################################################################################################################################################################

//###   REQUEST PUT   #########################################################################################################################################################################

function PUT(image, successCallBack, errorCallBack) {
  $.ajax({
    url: apiImageURL + "/" + image.Id,
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
function MODIFY(data, successCallBack, errorCallBack) {
  $.ajax({
    url: apiBaseURL + "/Accounts/modify" + "/" + data.Id,
    type: "PUT",
    contentType: "application/json",
    headers: getBearerAuthorizationToken(),
    data: JSON.stringify(data),
    success: () => {
      GET_USER_BY_ID(data.Id, successCallBack, error);
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}

//#############################################################################################################################################################################################

//###   REQUEST POST   #########################################################################################################################################################################

function REGISTER(data, successCallBack, errorCallBack) {
  $.ajax({
    url: apiBaseURL + "/Accounts/register",
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
function LOGIN(data, successCallBack, errorCallBack) {
  $.ajax({
    url: apiBaseURL + "/token",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (profil) {
      storeAccessToken(profil.Access_token);
      GET_USER_BY_ID(profil.UserId, successCallBack, errorCallBack);
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function POST(data, successCallBack, errorCallBack) {
  $.ajax({
    url: apiImageURL,
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

//#############################################################################################################################################################################################

//###   TOKEN GESTION   #######################################################################################################################################################################

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

//#############################################################################################################################################################################################