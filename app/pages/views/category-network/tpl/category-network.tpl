{{#each nodes}}
  <div class="list_item">
    <div class="row">
      <div class="item col-9">
        <span class="id" id="{{id_encoded}}" data-category="{{id}}">
          {{name}}
        </span>
        <div class="link" style="font-size:0.6em;">
          <a
            style="text-decoration:underline"
            href="https://commons.wikimedia.org/wiki/Category:{{id}}"
            title="{{name}}"
            target="_blank"
          >
            §[messages.view-on-commons]§
            <img class="link-out-small" src="/assets/img/link-out.svg" alt="§[messages.go]§" />
          </a>
          {{#unless hideDetails}}
            <a
              class="view-details-link"
              style="text-decoration:underline; margin-left:1rem;"
              href="{{url}}"
              title="{{name}}"
            >
              §[messages.drilldown]§
            </a>
          {{/unless}}
          {{!-- <div id="files{{id_encoded}}" class="link" style="display: none"> --}}
            <a
            id="files{{id_encoded}}"
              class="view-details-link unused-files-link"
              style="text-decoration:underline; margin-left:1rem;display: none;"
              href="{{urlUnused}}"
              title="{{name}}"
            >
              §[messages.view-files]§
            </a>
          {{!-- </div> --}}
        </div>
      </div>
      <div class="item col-3">
        <div class="row">
          <div class="col-2">
            <span style="font-size: 0.6em; text-transform: uppercase;">§[messages.level]§</span>
          </div>
          <div
            class="col-8"
            style="font-family: 'Lato', sans-serif; text-align:right; display:inline"
          >
            {{group}}
          </div>
        </div>
        <div class="row">
          <div class="col-2">
            <span style="font-size: 0.6em; text-transform: uppercase;">§[messages.files]§</span>
          </div>
          <div
            class="col-8"
            style="font-family: 'Lato', sans-serif; text-align:right; display:inline"
          >
            {{files}}
          </div>
        </div>
      </div>
    </div>
    <div id="category{{id_encoded}}" class="list_item_panel"></div>
    <div class="clear"></div>
  </div>
{{/each}}