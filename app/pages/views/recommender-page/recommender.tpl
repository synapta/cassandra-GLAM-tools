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
                <div class="row">
                    <h6 class="col-3">WikiData Suggestion</h6>
                    <h6 class="col-4">Wikipedia pages</h6>
                </div>
                {{#each wikis}}
                <div class="row">
                    <div class="col-3">
                      <a href="{{url}}" target="_blank">{{label}}</a>
                    </div>
                    {{#each media}}
                    <div class="col-3">
                        <span>{{lang}} : </span> <a href="{{url}}" style="font-size:0.9em;margin-right:2em">{{label}}</a>
                    </div>
                    {{/each}}
                </div>
                {{/each}}
            </div>
            </tr>
        </div>
    </div>
</div>