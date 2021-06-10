<div class="glam-block {{status}}">
  <div class="info">
    <div class="glam-controls-container">
      <h3 class="status">{{status}}</h3>
      <a class="glam-controls edit" href="/admin/edit-glam/{{glamID}}">§[admin.edit]§</a>
      <spans class="glam-controls command {{command}}" data-glamID={{glamID}} data-glamPaused={{paused}}>{{command}}</span>
    </div>
    <h2>{{glamFullName}} ({{glamID}})</h2>
    <h2><span class="bold-span">§[admin.cat]§:</span> <i>{{glamCategory}}</i></h2>
    {{#if lastrun}}
      <h2> <span class="bold-span">§[admin.lastrun]§:</span> {{lastrun}}</h2>
    {{/if}}
  </div>
  <div class="img">
    <img src="{{image_url}}" alt="{{glamFullName}}">
  </div>
  <!-- <div class="glam-controls-overlay"></div> -->
</div>
