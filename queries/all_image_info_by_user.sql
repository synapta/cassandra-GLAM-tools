SELECT *
FROM image
WHERE img_user_text = 'ETH-Bibliothek'

SELECT COUNT(DISTINCT img_name)
FROM image
WHERE img_user_text = 'ETH-Bibliothek'
