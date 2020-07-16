$(function() {
  let x, i, j, selElmnt, a, b, c;
  /*look for any elements with the class "select-chart":*/
  x = document.getElementsByClassName("select-chart");
  for (i = 0; i < x.length; i++) {
    selElmnt = x[i].getElementsByTagName("select")[0];
    /* reset value to the first option */
    $('#switch_page').val((selElmnt.options[0].value));
    /* for each element, create a new DIV that will act as the selected item: */
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    /* show first option */
    a.innerHTML = selElmnt.options[0].innerHTML;
    x[i].appendChild(a);
    /* for each element, create a new DIV that will contain the option list: */
    b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide");
    for (j = 1; j < selElmnt.length; j++) {
      /* for each option in the original select element,
      create a new DIV that will act as an option item: */
      c = document.createElement("DIV");
      c.innerHTML = selElmnt.options[j].innerHTML;
      c.addEventListener("click", function(e) {
          /* when an item is clicked, update the original select box,
          and the selected item: */
          let y, i, k, s, h;
          s = this.parentNode.parentNode.getElementsByTagName("select")[0];
          h = this.parentNode.previousSibling;
          for (i = 0; i < s.length; i++) {
            if (s.options[i].innerHTML === this.innerHTML) {
              s.selectedIndex = i;
              h.innerHTML = this.innerHTML;
              y = this.parentNode.getElementsByClassName("same-as-selected");
              for (k = 0; k < y.length; k++) {
                y[k].removeAttribute("class");
              }
              this.setAttribute("class", "same-as-selected");
              break;
            }
          }
          h.click();
      });
      b.appendChild(c);
    }
    x[i].appendChild(b);
    a.addEventListener("click", function(e) {
        /* when the select box is clicked, close any other select boxes,
        and open/close the current select box: */
        e.stopPropagation();
        closeAllSelect(this);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
    
        let baseurl = document.location.href;
        let h = baseurl.split("/");
        let selection = h[4];
        let page = $('#switch_page').val();
    
        if (selection !== page) {
          let url = baseurl.replace(selection,page);
          if (url !== '') {
            window.location = url;
          }
        }
      });
  }
  function closeAllSelect(elmnt) {
    /* a function that will close all select boxes in the document,
    except the current select box: */
    var x, y, i, arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    for (i = 0; i < y.length; i++) {
      if (elmnt === y[i]) {
        arrNo.push(i);
      } else {
        y[i].classList.remove("select-arrow-active");
      }
    }
    for (i = 0; i < x.length; i++) {
      if (arrNo.indexOf(i)) {
        x[i].classList.add("select-hide");
      }
    }
  }
  /* if the user clicks anywhere outside the select box,
  then close all select boxes: */
  document.addEventListener("click", closeAllSelect);
    
    function getCategories() {
        let categories = [];
        const urlSplit = window.location.href.toString().split('/');
        const db = urlSplit[3];
        let url = "/api/"+db+"/category";
        
        $.getJSON(url).then(res => {
            if(res.nodes){
                let opts = "";
              if (urlSplit[5]){
                let ref = urlSplit[0]+'/'+urlSplit[1]+'/'+urlSplit[2]+'/'+ urlSplit[3] + '/'+urlSplit[4] + '/'+ decodeURIComponent(urlSplit[5])+ '/'+(urlSplit[6]?decodeURIComponent(urlSplit[6]):'');;
                categories.push(ref);
                opts += "<option>"+decodeURIComponent(urlSplit[5]).replace(/[_\-]+/g," ")+"</option>";
              }
                res.nodes.forEach(cat =>{
                  if (cat.id !== decodeURIComponent(urlSplit[5])){
                    let name = cat.id.replace(/[_\-]+/g," ");
                    let ref = urlSplit[0]+'/'+urlSplit[1]+'/'+urlSplit[2]+'/'+ urlSplit[3] + '/'+urlSplit[4] + '/'+ encodeURIComponent(cat.id) + '/'+(urlSplit[6]?decodeURIComponent(urlSplit[6]):'');
                    opts += "<option>"+name+"</option>";
                    categories.push(ref);
                  }
                });
              $(".autocomplete-categories").html(opts);
              $(".autocomplete-categories").selectpicker();
              $(".autocomplete-categories").on("change", el => {
                    if (el && el.currentTarget && el.currentTarget.selectedIndex && categories[el.currentTarget.selectedIndex]){
                        window.location.href = categories[el.currentTarget.selectedIndex];
                    }
                });
            }
        });
    }
    getCategories();
});
