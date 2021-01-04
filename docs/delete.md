# Delete an image

Purge an image from the repository.

**Path** : `/image/{id}/`

**Method** : `DELETE`

**Data constraints**

Requires path parameter `{id}` for an entry in the repository.

## Success Response

The body of the return message contains a string confirming success.

**Condition** : None. Will return successful if no match is found, following the S3 API.

**Code** : `200 OK`

**Content example**

```json
"Deletion successful"
```
