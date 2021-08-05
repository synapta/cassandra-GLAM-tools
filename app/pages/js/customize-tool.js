// // Create NEW glam
$(function () {
  $.getJSON("/api/languages", function (langs) {
    availableLanguages = langs;
    const selectLang = $("#defaultLang");
    selectLang.html("");
    availableLanguages.forEach(lang => {
      const opt = `<option value="${lang.code}">${lang.nativeName}</option>`;
      selectLang.append(opt);
    });
  }).done(() => {
    $.getJSON("/api/admin/settings", function (res) {
      if (res) {
        if (res.defaultLanguage) {
          const selectLang = $("#defaultLang");
          selectLang.val(res.defaultLanguage);
        }
        if (res.homeTitle) {
          $("#setHomeTitle").val(res.homeTitle);
        } else {
          $("#setHomeTitle").val("§[admin.set-title-placeholder]§");
        }
      }
    });
  });

  $("#uploadForm").submit(async function (e) {
    e.preventDefault();
    const logoFile = document.getElementById("logoFile");
    if (logoFile.files.length) {
      const buffer = await logoFile.files[0].arrayBuffer();
      $.ajax({
        type: "POST",
        url: "/api/admin/owner-logo",
        data: buffer,
        processData: false,
        contentType: "image/svg+xml",
        success: function (data) {
          $("#upload-error").fadeOut(200);
          $("#upload-success").fadeIn(200);
        },
        error: function (err) {
          $("#upload-success").hide();
          $("#upload-error").fadeIn(200);
        }
      });
    }
  });

  $("#save-settings").click(function (e) {
    e.preventDefault();
    let settings = {
      homeTitle: $("#setHomeTitle").val(),
      defaultLanguage: $("#defaultLang").val()
    };

    $.ajax({
      type: "POST",
      url: "/api/admin/settings",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify(settings),
      success: function (data) {
        $("#settings-error").fadeOut(200);
        $("#settings-success").fadeIn(200);
      },
      error: function (err) {
        $("#settings-success").hide();
        $("#settings-error").fadeIn(200);
      }
    });
  });

  $("#update-button").click(function (e) {
    e.preventDefault();

    $.get("/api/admin/update-tool", function () {
      $("#refresh-error").fadeOut(200);
      $("#refresh-success").fadeIn(200);
    }).fail(function () {
      $("#refresh-success").fadeOut(200);
      $("#refresh-error").fadeIn(200);
    });
  });
});