# Download an image

Download the contents of an image

**Path** : `/image/{id}/`

**Method** : `GET`

**Data constraints**

Requires path parameter `{id}` for an entry in the repository.

## Success Response

The body of the return message contains the raw binary image content.

**Condition** : The item with the given id exists in the repository.

**Code** : `200 OK`

**Content example**

![Cat Image](https://images.theconversation.com/files/350865/original/file-20200803-24-50u91u.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=400&h=400.0&fit=crop)
