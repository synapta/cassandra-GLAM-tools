{{#each nodes}}
	<div class="list_item">
		<div class="row">
			<div class="item col-9">
				<span class="id" id="{{id_encoded}}" data-category="{{id}}">
					{{name}}
				</span>
				<div class="link" style="font-size:0.6em;">
					<a style="text-decoration:underline" href="https://commons.wikimedia.org/wiki/Category:{{id}}" title="{{name}}" target="_blank">
						view on Commons <img class="link-out-small" src="/assets/img/link-out.svg" alt="go">
					</a>
                    <a class="view-details-link" style="text-decoration:underline; margin-left:1rem;" href="./{{id}}" title="{{name}}">
						view details
					</a>
				</div>
			</div>
			<div class="item col-3">
				<div class="row">
					<div class="col-2">
					  <span style="font-size: 0.6em; text-transform: uppercase;">level</span>
					</div>
					<div class="col-8" style="font-family: 'Lato', sans-serif; text-align:right; display:inline">
						{{group}}
					</div>
				</div>
				<div class="row">
					<div class="col-2">
						<span style="font-size: 0.6em; text-transform: uppercase;">files</span>
					</div>
					<div class="col-8" style="font-family: 'Lato', sans-serif; text-align:right; display:inline">
						{{files}}
					</div>
				</div>
			</div>
		</div>
        <div id="category{{id_encoded}}" class="list_item_panel"></div>
		<div class="clear"></div>
	</div>
{{/each}}
