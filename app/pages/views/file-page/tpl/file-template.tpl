<div class="file_details" id="{{image_id}}" data-wikilist="{{wiki_array}}">
  <div class="file_details_intro">
    {{image}}
    <!-- <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/{{image}}/640px-" alt="{{image_name}}"> -->
    <!-- <img src="https://commons.wikimedia.org/wiki/Special:FilePath/{{image}}" alt="{{image_name}}"> -->
    {{#if thumbnail_url}}
      <div class="file_details_div">
        <img src="{{thumbnail_url}}" alt="{{image_name}}" />
      </div>
    {{/if}}
    <h1>
      <a
        style="color: var(--main)"
        href="https://commons.wikimedia.org/wiki/File:{{image}}"
        target="_blank"
      >
        {{image_name}}
      </a>
    </h1>
  </div>
  <div class="file_details_projects file_details_section">
    <h2 class="uppercase">
      §[messages.part-of]§
      <span>
        {{cat_number}}
      </span>
      {{cat_title}}
    </h2>
    <table>
      <tbody>
        {{#each cats}}
          <tr>
            <td>
              <span>{{cat_name}}</span>
            </td>
          </tr>
        {{/each}}
      </tbody>
    </table>
  </div>
  {{#if usage}}
    <div class="file_details_projects file_details_section">
      <h2 class="uppercase">
        §[messages.used-in]§
        <span>
          {{usage}}
        </span>
        §[messages.pages-of]§
        <span>
          {{projects}}
        </span>
        §[messages.projects]§
      </h2>
      <table>
        <tbody>
          {{#each wikis}}
            <tr>
              <td>
                <span style="margin-left:3em;font-size:0.7em;text-decoration:underline">
                  {{wiki_name}}
                </span>
              </td>
              <td style="padding-left:2em">
                {{#each wiki_links}}
                  <a href="{{wiki_link}}" style="font-size:0.9em;margin-right:2em">
                    {{wiki_page}}
                  </a>
                {{/each}}
              </td>
            </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
  {{else if recommender.length}}
    <div class="file_details_projects file_details_section">
      <h2 class="uppercase">
        §[messages.related-wikidata-entities]§
      </h2>
      <table>
        <tbody>
          {{#each recommender}}
            <tr>
              <td>
                <a href="{{url}}" target="_blank">
                  {{label}}
                </a>
              </td>
              {{#each wikis}}
                <td>
                  <a href="{{url}}" style="font-size:0.9em;margin-right:2em">
                    {{site}}
                  </a>
                </td>
              {{/each}}
            </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
  {{/if}}
  <div class="file_details_views file_details_section">
    <h2 class="uppercase">
      §[messages.views-stats]§
    </h2>
    <table>
      <tbody>
        <tr>
          <td class="uppercase">
            §[messages.views-total]§
          </td>
          <td style="padding-left:2em">
            <span>
              {{tot}}
            </span>
          </td>
        </tr>
        <tr>
          <td class="uppercase">
            §[messages.daily-average]§
          </td>
          <td style="padding-left:2em">
            <span>
              {{av}}
            </span>
          </td>
        </tr>
        <tr>
          <td class="uppercase">
            §[messages.daily-median]§
          </td>
          <td style="padding-left:2em">
            <span>
              {{median}}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>