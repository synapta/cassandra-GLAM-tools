{{#each users}}
	<div class="list_item">
		<div class="item">
			<a href="https://commons.wikimedia.org/wiki/User:{{user}}" title="{{user}}" target="_blank">
				{{user}}
			</a>
		</div>

		<div>
		{{#each files}}
			<p>
				{{date}} - {{count}}
			</p>
		{{/each}}
		</div>
		<div class="clear"></div>
		</div>
	</div>
{{/each}}