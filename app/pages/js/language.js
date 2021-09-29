$(function () {

  let availableLanguages = [];

  function populateSelectLang() {
    const selectLang = $("#change-lang-select");
    if (!selectLang.length) {
      return;
    }
    selectLang.html("");
    availableLanguages.forEach(lang => {
      const opt = `<option value="${lang.code}">${lang.nativeName}</option>`;
      selectLang.append(opt);
    });

    /*look for the "change-lang-parent" element*/
    const selElemParent = document.getElementById("change-lang-parent");
    const selElem = document.getElementById("change-lang-select");

    /* reset value to the first option */
    selectLang.val(availableLanguages[0].code);
    /* create a new DIV that will act as the selected item: */
    let selDiv = document.createElement("DIV");
    selDiv.setAttribute("class", "lang-selected");
    /* show first option */
    selDiv.innerHTML = selElem.options[0].innerHTML;
    selElemParent.appendChild(selDiv);
    /* create a new DIV that will contain the option list: */
    let otherDiv = document.createElement("DIV");
    otherDiv.setAttribute("class", "select-langs lang-hide");
    for (let j = 1; j < selElem.length; j++) {
      /* for each option in the original select element,
        create a new DIV that will act as an option item: */
      const optionDiv = document.createElement("DIV");
      optionDiv.innerHTML = selElem.options[j].innerHTML;
      optionDiv.addEventListener("click", function (e) {
        /* when an item is clicked, update the original select box, and the selected item: */
        let newSel;
        const prevOpt = this.parentNode.previousSibling;
        for (let i = 0; i < selElem.length; i++) {
          if (selElem.options[i].innerHTML === this.innerHTML) {
            selElem.selectedIndex = i;
            prevOpt.innerHTML = this.innerHTML;
            newSel = this.parentNode.getElementsByClassName("same-as-selected");
            for (k = 0; k < newSel.length; k++) {
              newSel[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            const url = window.location.href.split("?lang=")[0];
            const loc = `?lang=${selElem.value}`;
            window.location = url.endsWith("/") ? `${url}${loc}` : `${url}/${loc}`;
            break;
          }
        }
        prevOpt.click();
      });
      otherDiv.appendChild(optionDiv);
    }
    selElemParent.appendChild(otherDiv);
    selDiv.addEventListener("click", function (e) {
      /* when the select box is clicked, close any other select boxes, and open/close the current select box: */
      e.stopPropagation();
      closeAllSelect(this);
      this.nextSibling.classList.toggle("lang-hide");
      this.classList.toggle("select-arrow-active");
    });
  }

  function renderChangeLang() {
    // if (availableLanguages.length) {
    //   populateSelectLang();
    //   return;
    // }

    $.getJSON("/api/languages", function (langs) {
      availableLanguages = langs;
      populateSelectLang();
    });
  }


  function closeAllSelect(elem) {
  /* a function that will close all select boxes in the document,
  except the current select box: */
    var x, y, i, arrNo = [];
    x = document.getElementsByClassName("select-langs");
    y = document.getElementsByClassName("lang-selected");
    for (i = 0; i < y.length; i++) {
      if (elem === y[i]) {
        arrNo.push(i);
      } else {
        y[i].classList.remove("select-arrow-active");
      }
    }
    for (i = 0; i < x.length; i++) {
      if (arrNo.indexOf(i)) {
        x[i].classList.add("lang-hide");
      }
    }
  }
  /* if the user clicks anywhere outside the select box,
then close all select boxes: */
  document.addEventListener("click", closeAllSelect);

  renderChangeLang();
});
