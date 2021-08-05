let availableLanguages = [];

function populateSelectLang() {
  const selectLang = $("#change-lang-select");
  //console.log(selectLang);
  selectLang.html("");
  availableLanguages.forEach(lang => {
    const opt = `<option value="${lang.code}" onclick="changeLang(event)">${lang.nativeName}</option>`;
    selectLang.append(opt);
  });
}

function renderChangeLang() {
  if (availableLanguages.length) {
    populateSelectLang();
    return;
  }

  $.getJSON("/api/languages", function (langs) {
    availableLanguages = langs;
    populateSelectLang();
  });
}

function changeLang(ev) {
  //console.log(window.location);
  const selected = ev.currentTarget.value;
  const url = window.location.href.split("?lang=")[0];
  const loc = `?lang=${selected}`;
  //console.log(url, loc);
  window.location = url.endsWith("/") ? `${url}${loc}` : `${url}/${loc}`;
}

renderChangeLang();