{{#each files}}
	<div class="list_item" id="{{gil_to_id}}">
		<div class="row">
			<div class="col-9">
				<span class="id item" id="{{gil_to}}">
					{{gil_to_name}}
				</span>
				<div class="link" style="font-size:0.6em;">
					<a href="https://commons.wikimedia.org/wiki/File:{{gil_to}}" title="{{gil_to_name}}" target="_blank">
						view on Commons
					</a>
				</div>
			</div>
			<div class="item col-3">
				<div class="row">
					<div class="col-2">
						<span style="font-size: 0.6em; text-transform: uppercase;">usage</span>
					</div>
					<div class="col-8" style="font-family: 'Lato', sans-serif; text-align:right; display:inline">
						{{u}}
					</div>
				</div>
				<div class="row">
					<div class="col-2">
						<span style="font-size: 0.6em; text-transform: uppercase;">projects</span>
					</div>
					<div class="col-8" style="font-family: 'Lato', sans-serif; text-align:right; display:inline">
						{{wiki}}
					</div>
				</div>
			</div>
		</div>
		<div class="list_item_panel">
			<div class="row">
				<div class="col-12 mt-2 wiki_column">
				</div>
			</div>
		</div>
		<!-- <div class="clear"></div> -->
		</div>
	</div>
{{/each}}
