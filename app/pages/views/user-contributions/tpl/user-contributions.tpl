{{#each users}}
  <div class="list_item">
    <div class="row">
      <div class="col-9 item-col">
        <span class="id item" id="{{user_id}}">
          {{user}}
        </span>
        <div class="link" style="font-size:0.6em;">
          <a
            style="text-decoration:underline"
            href="https://commons.wikimedia.org/wiki/User:{{user}}"
            title="{{user}}"
            target="_blank"
          >
            §[messages.view-on-commons]§
            <img class="link-out-small" src="/assets/img/link-out.svg" alt="go" />
          </a>
        </div>
      </div>
      <div class="item col-3">
        <div class="row">
          <div class="col-2">
            <span style="font-size: 0.6em; text-transform: uppercase;">
              §[messages.files]§
            </span>
          </div>
          <div
            class="col-8"
            style="font-family: 'Lato', sans-serif; text-align:right; display:inline"
          >
            {{total}}
          </div>
        </div>
      </div>
    </div>
    <div class="clear"></div>
  </div>
{{/each}}