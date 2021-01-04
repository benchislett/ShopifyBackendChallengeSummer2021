# Search for similar images

Find similar images given an image encoding.

**Path** : `/image/search/`

**Method** : `POST`

**Data constraints**

Provide encoding metadata for the target image.
This should be in the form of a 1000-vector of floats [0,1] representing ImageNet probabilities.

Additionally, an upper bound on the number of desired results can optionall be given.
No more than this quantity will be returned.

If limit is not present, only the best match will be returned.

**Data example**

```json
{
  "encoding": [0.00001, 0.000012, ..., 0.66, 0.31, ..., 0.00001],
  "limit": 12
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
  ...
]
```
