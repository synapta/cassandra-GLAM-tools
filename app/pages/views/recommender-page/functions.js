const url = window.location.href.toString();
const urlSplit = url.split("/");
const glam = window.location.href.toString().split("/")[3];
const db = window.location.href.toString().split("/")[3];
const query = urlSplit[5] && !urlSplit[5].includes("?lang") ? urlSplit[5] : "";
let limit = 5;
let stopScroll = false;
let category;

Handlebars.registerHelper("btoa", function (value) {
  return btoa(value);
});

Handlebars.registerHelper("md5", function (value) {
  return CryptoJS.MD5(decodeURIComponent(value)).toString(CryptoJS.enc.Hex);
});

function getThumbnailUrl(file, size_in_px, callback) {
  var base_url = "https://upload.wikimedia.org/wikipedia/commons/thumb";

  let hash = CryptoJS.MD5(decodeURIComponent(file)).toString(CryptoJS.enc.Hex);
  // console.log(hash);
  if (callback && typeof callback == "function") {
    const img_url =
      base_url +
      "/" +
      hash.substring(0, 1) +
      "/" +
      hash.substring(0, 2) +
      "/" +
      fixedEncodeURIComponent(file).replace(/%25C3%25/g, "%C3%") +
      "/" +
      size_in_px.toString() +
      "px-thumbnail.jpg";
    callback(img_url);
  }
}

function getWikiDataUrl(ids) {
  const url = "/api/wikidata/";
  let idMerge = "";
  for (let i = 0; i < ids.length - 1; i++) {
    idMerge += ids[i] + "|";
  }
  idMerge += ids[ids.length - 1];
  return url + idMerge;
}

function getUrl() {
  const url = window.location.href.toString();
  const urlSplit = url.split("/");
  const db = urlSplit[3];
  const category = urlSplit[5] && !urlSplit[5].includes("?lang") ? urlSplit[5] : "";
  let query = "?limit=" + limit;

  if (category) {
    query = query + "&cat=" + category;
  }
  return "/api/" + db + "/recommender" + query;
}

function getFiles() {
  $.get("/views/recommender-page/recommender.tpl", function (tpl) {
    $.getJSON(getUrl(), function (files) {
      if (files.length === 0) {
        $("#resultsSearch").append('<h3 class="col-12 text-center">§[messages.no-more]§</h3>');
        $("#loadMore").hide();
        stopScroll = true;
        // remove handler
      }

      let langOrderStr = "";
      const langOrderStrDef = "de, en, fr, it";

      $.getJSON("/api/settings", function (res) {
        if (res && res.recommenderLangs) {
          langOrderStr = res.recommenderLangs;
        } else {
          langOrderStr = langOrderStrDef;
        }
      }).always(() => {
        langOrderStr = langOrderStr ? langOrderStr : langOrderStrDef;
        for (let i = 0; i < files.length; i++) {
          getThumbnailUrl(files[i].img_name, 500, function (thumbnail_url) {
            // console.log(thumbnail_url);
            files[i].thumbnail_url = thumbnail_url;
            // add views and category;
            files[i].image_name = files[i].img_name ? files[i].img_name.replace(/_/g, " ") : "";
            files[i].image_id = files[i].img_name ? cleanImageName(files[i].img_name) : "";
            const distinctFiles = [];
            files[i].titles.forEach(title => {
              if (!distinctFiles.includes(title)) {
                distinctFiles.push(title);
              }
            });

            // recommender
            //get data from wiki
            $.getJSON(getWikiDataUrl(distinctFiles), function (wikidata) {
              let base = "https://www.wikidata.org/wiki/";
              files[i].wikis = [];
              for (let j = 0; j < distinctFiles.length; j++) {
                files[i].wikis.push({
                  title: distinctFiles[j],
                  url: base + distinctFiles[j]
                });
              }

              for (let j = 0; j < files[i].wikis.length; j++) {
                let data = wikidata.entities[files[i].wikis[j].title];
                if (data.labels && !isEmpty(data.labels)) {
                  if (data.labels.en) {
                    files[i].wikis[j].label = data.labels.en.value;
                  } else {
                    files[i].wikis[j].label = data.labels[Object.keys(data.labels)[0]].value;
                  }
                }
                files[i].wikis[j].media = [];
                const order = langOrderStr
                  .toLowerCase()
                  .split(",")
                  .map(s => s.trim());
                const map = {};
                order.forEach(el => (map[el] = {}));

                for (const prop in data.sitelinks) {
                  if (data.sitelinks.hasOwnProperty(prop)) {
                    let lang = prop.split("wiki")[0];
                    let wiki = {};
                    wiki.url = data.sitelinks[prop].url;
                    wiki.lang = lang;
                    wiki.label = data.sitelinks[prop].title;
                    map[lang] = wiki;
                  }
                }
                // console.log(Object.values(map));
                files[i].wikis[j].media = Object.values(map);
              }
              // compile template
              let template = Handlebars.compile(tpl);
              $("#resultsSearch").append(template(files[i]));
            });
          });
        }
      });
    });
  });
}

function loadMore() {
  if (!stopScroll) {
    getFiles();
  }
}

function ignoreSuggestion(imageEncoded) {
  let image = atob(imageEncoded);
  let imageHash = CryptoJS.MD5(decodeURIComponent(image)).toString(CryptoJS.enc.Hex);
  $.ajax({
    url: "/api/" + db + "/recommender/" + image,
    type: "DELETE",
    success: function (result) {
      $("#" + imageHash).fadeOut();
    }
  });
}

function how_to_read() {
  let button = $("#how_to_read_button");
  let box = $(".how_to_read");

  button.click(function () {
    box.toggleClass("show");
  });
}

$(function () {
  setCategory();
  how_to_read();
  let db = window.location.href.toString().split("/")[3];
  $("#institutionId").attr("href", "/" + db);
  getFiles();
});
