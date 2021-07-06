{{#each files}}
  <div class="list_item" data-imagename="{{img_name}}">
    <div class="row">
      <div class="col-8">
        <span class="id item" id="{{img_name_id}}">
          {{img_name_text}}
        </span>
        <div class="link" style="font-size:0.8em;">
          <a
            style="text-decoration:underline"
            href="https://commons.wikimedia.org/wiki/File:{{img_name}}"
            title="{{img_name_text}}"
            target="_blank"
          >
            §[messages.view-on-commons]§
            <img
              class="link-out-small"
              src="/assets/img/link-out.svg"
              alt="go"
            />
          </a>
          <a
            class="view-details-link"
            style="text-decoration:underline; margin-left:1rem;"
            href="{{url}}"
            title="{{img_name_text}}"
          >
            §[messages.view-details]§
          </a>
        </div>
      </div>
      <div class="item col-4">
        <div class="row">
          <div class="col-2">
            <span style="font-size: 0.6em; text-transform: uppercase;">
              §[messages.total]§
            </span>
          </div>
          <div
            class="col-8"
            style="font-family: 'Lato', sans-serif; text-align:right; display:inline"
          >
            {{tot}}
          </div>
        </div>
        <div class="row">
          <div class="col-2">
            <span style="font-size: 0.6em; text-transform: uppercase;">
              §[messages.avg-day]§
            </span>
          </div>
          <div
            class="col-8"
            style="font-family: 'Lato', sans-serif; text-align:right; display:inline"
          >
            {{av}}
          </div>
        </div>
        <div class="row">
          <div class="col-2">
            <span style="font-size: 0.6em; text-transform: uppercase;">
              §[messages.median]§
            </span>
          </div>
          <div
            class="col-8"
            style="font-family: 'Lato', sans-serif; text-align:right; display:inline"
          >
            {{median}}
          </div>
        </div>
      </div>
    </div>
    <div class="clear"></div>
  </div>
{{/each}}