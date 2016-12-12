/*
img_timestamp è la data dell'ultima versione
File size in bytes
*/

SELECT img_name, img_user_text, img_timestamp, MIN(oi_timestamp), img_size
FROM image, oldimage
WHERE img_name = "Piazza_Popolo_Ravenna.jpg"
AND img_name = oi_name

https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata&titles=File%3aPiazza_Popolo_Ravenna.jpg&format=json
https://en.wikipedia.org/w/api.php?format=jsonfm&action=query&titles=File:Piazza_Popolo_Ravenna.jpg&prop=imageinfo&iiprop=url&meta=siteinfo&siprop=rightsinfo
