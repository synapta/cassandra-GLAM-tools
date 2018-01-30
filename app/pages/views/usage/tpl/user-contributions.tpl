{{#each users}}
	<div class="list_item">
		<div class="row">
			<div class="col-9">
				<span class="id item" id="{{user}}">
					{{user}}
				</span>
				<div class="link" style="font-size:0.6em;">
					<a href="https://commons.wikimedia.org/wiki/User:{{user}}" title="{{user}}" target="_blank">
						view on Commons
					</a>
				</div>
			</div>
			<div class="item col-3">
				<div class="row">
					<div class="col-2">
						<span style="font-size: 0.6em; text-transform: uppercase;">files</span>
					</div>
					<div class="col-8" style="font-family: 'Lato', sans-serif; text-align:right; display:inline">
						{{total}}
					</div>
				</div>
			</div>
		</div>

		<div class="clear"></div>
		</div>
	</div>
{{/each}}
