{{#each files}}
	<div class="list_item" id="{{image_id}}" data-wikilist="{{wiki_array}}">
		<div class="row">
			<div class="col-9">
				<span class="id item" id="{{image}}">
					{{image_name}}
				</span>
				<div class="link" style="font-size:0.8em;">
					<a style="text-decoration:underline" href="https://commons.wikimedia.org/wiki/File:{{image}}" title="{{image_name}}" target="_blank">
						view on Commons <img class="link-out-small" src="/assets/img/link-out.svg" alt="go">
					</a>
					<a class="view-details-link" style="text-decoration:underline; margin-left:1rem;" href="{{url}}" title="{{name}}">
						view details
					</a>
				</div>
			</div>
			<div class="item col-3">
				<div class="row">
					<div class="col-2">
						<span style="font-size: 0.6em; text-transform: uppercase;">usage</span>
					</div>
					<div class="col-8" style="font-family: 'Lato', sans-serif; text-align:right; display:inline">
						{{usage}}
					</div>
				</div>
				<div class="row">
					<div class="col-2">
						<span style="font-size: 0.6em; text-transform: uppercase;">projects</span>
					</div>
					<div class="col-8" style="font-family: 'Lato', sans-serif; text-align:right; display:inline">
						{{projects}}
					</div>
				</div>
			</div>
		</div>
		<div class="list_item_panel">
			<div class="row">
				<div class="col-12 mt-2 wiki_column">
					<table>
						<tbody>
							{{#each wikis}}
								<tr>
									<td>
										<span style="margin-left:3em;font-size:0.7em;text-decoration:underline">{{wiki_name}}</span>
									</td>
									<td style="padding-left:2em">
										{{#each wiki_links}}
										<a href="{{wiki_link}}" style="font-size:0.9em;margin-right:2em">{{wiki_page}}</a>
										{{/each}}
									</td>
								</tr>
							{{/each}}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
{{/each}}
