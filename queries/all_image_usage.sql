/*
This query returns all the usage in the currently db, so NOT global usage
*/
SELECT *
FROM imagelinks
WHERE il_to = 'Filippo_Mordani.jpg'

/*
Instead this query looks after only global links.
`gil_wiki` is the project that use the file, like `itwiki`
`gil_page` is the ID of the page where the file is
`git_to` is the commons file name
*/
SELECT *
FROM globalimagelinks
WHERE gil_to = 'Stazione_di_Fossato_di_Vico-Gubbio.JPG'
