<div class="row list_item" id="{{md5 img_name}}">
  <div class="row">
    <span class="col-1">
    File:
    </span>
    <a class="col-10 itemUnused" href="https://commons.wikimedia.org/wiki/File:{{img_name}}" target="_blank">
      <h2>{{image_name}}</h2>
    </a>
    <div class="col-1"><button id="ignoreSuggestion" type="submit" class="btn float-right" onclick="ignoreSuggestion('{{btoa img_name}}')">DISMISS</button></div>
  </div>
  <div class="w-100">
    <div class="row">
      <div class="col-3">
        <a class="col-11 itemUnused" href="https://commons.wikimedia.org/wiki/File:{{img_name}}" target="_blank">
          <img class="thumb" src="{{thumbnail_url}}" alt="{{image_name}}">
        </a>
      </div>
      <div class="col-9 wikis">
        <div class="row">
          <h6 class="col-3">Wikidata suggestion</h6>
          <h6 class="col-4">Wikipedia pages</h6>
        </div>
          {{#each wikis}}
        <div class="row">
          <div class="col-3 text-truncate">
            <a href="{{url}}"  title="{{label}}"  target="_blank">{{label}}</a>
          </div>
            {{#each media}}
          <div class="col-2 text-truncate">
            <span>{{lang}} : </span> <a href="{{url}}" title="{{label}}" style="font-size:0.9em;margin-right:2em">{{label}}</a>
          </div>
          {{/each}}
        </div>
        {{/each}}
      </div>
      </tr>
    </div>
  </div>
</div>