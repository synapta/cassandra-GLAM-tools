{{#each files}}
	<div class="list_item">
		<div class="row">
			<div class="col-8">
				<span class="id item" id="{{img_name_id}}">
					{{img_name_text}}
				</span>
				<div class="link" style="font-size:0.6em;">
					<a style="text-decoration:underline" href="https://commons.wikimedia.org/wiki/File:{{img_name}}" title="{{img_name_text}}" target="_blank">
						view on Commons <img class="link-out-small" src="/assets/img/link-out.svg" alt="go">
					</a>
				</div>
			</div>
			<div class="item col-4">
				<div class="row">
					<div class="col-2">
						<span style="font-size: 0.6em; text-transform: uppercase;">total</span>
					</div>
					<div class="col-8" style="font-family: 'Lato', sans-serif; text-align:right; display:inline">
						{{tot}}
					</div>
				</div>
				<div class="row">
					<div class="col-2">
						<span style="font-size: 0.6em; text-transform: uppercase;">avg/day</span>
					</div>
					<div class="col-8" style="font-family: 'Lato', sans-serif; text-align:right; display:inline">
						{{av}}
					</div>
				</div>
				<div class="row">
					<div class="col-2">
						<span style="font-size: 0.6em; text-transform: uppercase;">median</span>
					</div>
					<div class="col-8" style="font-family: 'Lato', sans-serif; text-align:right; display:inline">
						{{median}}
					</div>
				</div>
			</div>
		</div>

		<div class="clear"></div>
		</div>
	</div>
{{/each}}
