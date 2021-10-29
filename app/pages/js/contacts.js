let recaptchaToken;

$(function () {
  $("#send-message").click(function (e) {
    const firstName = $("#firstname").val();
    const lastName = $("#lastname").val();
    const userMail = $("#usermail").val();
    const contactsBody = $("#contactsBody").val();

    const re = /\S+@\S+\.\S+/;
    const validMail = re.test(userMail);

    e.preventDefault();
    
    if (!(firstName && lastName && validMail && contactsBody)) {
      $("#validation-error").fadeIn(200);
      return;
    }

    $("#validation-error").fadeOut(200);
    $("#save-error").fadeOut(200);

    let mailFields = {
      firstName, lastName, userMail, contactsBody, 'g-recaptcha-response': recaptchaToken
    };

    $.ajax({
      type: "POST",
      url: "/api/sendMail",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify(mailFields),
      success: function (data) {
        $("#save-error").fadeOut(200);
        $("#save-success").fadeIn(200);
        setTimeout(function () { window.location = "/";}, 3000);
      },
      error: function (err) {
        $("#save-success").hide();
        $("#save-error").fadeIn(200);
      }
    });
  });
});

function setRecaptchaToken(token) {
  recaptchaToken = token;
}
