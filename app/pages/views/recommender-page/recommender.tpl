<div class="row list_item">
    <a class="itemUnused" href="https://commons.wikimedia.org/wiki/File:{{img_name}}" target="_blank">
        <h2>{{image_name}}</h2>
    </a>
    <div class="w-100">
        <div class="row">
            <div class="col-3">
                <img class="thumb" src="{{thumbnail_url}}" alt="{{image_name}}">
            </div>
            <div class="col-9 wikis">
                {{#each wikis}}
                <div class="row">
                    <div class="col-3">
                        <a href="{{url}}" target="_blank">{{label}}</a>
                    </div>
                    {{#each media}}
                    <div class="col-3">
                        <a href="{{url}}" style="font-size:0.9em;margin-right:2em">{{site}}</a>
                    </div>
                    {{/each}}
                </div>
                {{/each}}
            </div>
            </tr>
        </div>
    </div>
</div>