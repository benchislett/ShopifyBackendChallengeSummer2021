# Search for images with a tag

Find images that have a given tag.

**Path** : `/image/search/tags/{tag}/`

**Method** : `POST`

**Data constraints**

Requires path parameter `{tag}` for an tag to match on.

Additionally, an upper bound on the number of desired results can optionall be given.
If more than this quantity match, searching will stop early.
No guarantees are made on the number of results returned.

If limit is not present, all matches will be returned, up to 9001.

**Data example**

```json
{
  "limit": 1
}
```

## Success Response

Returns a list of metadata for the matched resources

**Condition** : None. Will return an empty list if no matches are found.

**Code** : `200 OK`

**Content example**

```json
[
  {
    "id": 83274832437,
    "source": "https://images.theconversation.com/files/350865/original/file-20200803-24-50u91u.jpg",
    "tags": ["cat", "mask", "coronavirus"],
    "encoding": [0.00001, 0.000012, ..., 0.66, 0.31, ..., 0.00001],
    "owner": "the-conversation-news"
  },
]
```
