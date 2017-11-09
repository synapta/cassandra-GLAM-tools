{{#each nodes}}
	<div class="list_item">
		<div class="item">
			<span class="id" id="{{id}}">
				{{id}}
			</span>
			<br>
			<span>
				{{files}} files
			</span>
		</div>
		<div class="link" style="font-size:0.6em;">
			<a href="https://commons.wikimedia.org/wiki/Category:{{id}}" title="{{id}}" target="_blank">
				link
			</a>
		</div>
		<div class="clear"></div>
	</div>
{{/each}}