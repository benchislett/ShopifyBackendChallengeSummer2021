# Upload a new image

Submit a new image into the repository.

**Path** : `/image/`

**Method** : `POST`

**Data constraints**

Provide URL source for the image.

Additionally, the following can optionally be included to enable searchability:

- Tags
- Encoding (1000-vector of floats [0,1] representing ImageNet probabilities)
- Owner

**Data example**

```json
{
  "url": "https://images.theconversation.com/files/350865/original/file-20200803-24-50u91u.jpg",
  "tags": ["cat", "mask", "coronavirus"],
  "encoding": [0.00001, 0.000012, ..., 0.66, 0.31, ..., 0.00001],
  "owner": "the-conversation-news"
}
```

## Success Response

Returns the id of the created resource.

**Condition** : Sufficient space remains in the image store.

**Code** : `200 OK`

**Content example**

```json
{
  "id": 83274832437
}
```
