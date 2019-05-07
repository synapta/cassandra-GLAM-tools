<!-- <div class="col-12 col-md-6"> -->
  <div class="glam-block {{status}}">
    <div class="info">
      <h3 class="status">{{status}}</h3>
      <!-- {{#if draft}}<h2><span class="bold-span">DRAFT</span></h2>{{/if}} -->
      <h2>{{glamFullName}} ({{glamID}}) {{#if paused}}<small><i> - paused</i></small>{{/if}}</h2>
      <h2><span class="bold-span">CAT:</span> <i>{{glamCategory}}</i></h2>
      {{#if lastrun}} <h2> <span class="bold-span">LAST RUN:</span> {{lastrun}}</h2>{{/if}}
    </div>
    <div class="img">
      <img src="{{image_url}}" alt="{{glamFullName}}">
    </div>
    <div class="glam-controls-overlay"></div>
    <a class="glam-controls edit" href="/admin/edit-glam/{{glamID}}">EDIT GLAM</a>
    <a class="glam-controls delete" href="#">DELETE GLAM</a>
  </div>
<!-- </div> -->
