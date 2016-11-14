/*
This query find all the info regarding only the selected category.
So `cat_pages` is `files exactly here (cat_files) +
subcats number (cat_subcats)`
*/
SELECT *
FROM category
WHERE cat_title = 'Media_contributed_by_the_ETH-Bibliothek'

/*
This query find all the info regarding pages/cats/files with the
selected category inside of them.
So `cl_to` is our category, instead `cl_from` is the ID where the
cat is present.
`cl_timestamp` is when the cat is last applied: if different from upload
timestamp maybe something weird happens.
With `cl_type` you can understand if is a subdirectory or a file
*/
SELECT *
FROM categorylinks
WHERE cl_to = 'Media_contributed_by_the_ETH-Bibliothek'
