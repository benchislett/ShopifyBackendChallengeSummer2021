# Shopify Backend Challenge Summer 2021

## Benjamin Chislett

Welcome to my attempt at the Shopify Backend Challenge.

I have built a serverless image repository on top of AWS S3, along with a metadata store for queries in AWS DynamoDB, and a REST API using AWS APIGateway and Lambda, using AWS CDK for Infrastructure-As-Code (IaC).

Supported features include image upload, download, deletion, and search by tag or by image.

## REST API Documentation

- [Upload](docs/upload.md) : `POST /image/`
- [Download](docs/download.md) : `GET /image/{id}/`
- [Delete](docs/delete.md) : `DELETE /image/{id}`
- [Image Search](docs/image-search.md) : `POST /image/search/`
- [Tag Search](docs/tag-search.md) : `POST /image/search/tags/{tag}/`

## Usage Example

See the [client notebook](./Client.ipynb) for an overview of the client-side interaction with the API, and some examples.

## How it works

### Upload

The raw images are stored in their native formats in S3.
At the time of upload, additional metadata (owner, tags, and the encoding vector) are determined and stored as an entry in the DynamoDB table.

### Delete

Deletion is simply a lambda function that, when invoked, will remove the given entry from the S3 image store, and then delete its metadata.

### Download

Download requests are proxied directly to S3, and the raw binary data is streamed to the client through APIGateway. Because of this proxying, it is possible to access images directly as they are served implicitly by AWS Cloudfront. That is, it is possible to go to the endpoint for an image download directly in the browser.

### Tag Search

Tag search is a simple scan along the table, with a filter expression that ensures that the results have the corresponding tag.

### Image Search

Image search is more sophisticated. In brief, an encoding feature vector is determined on image upload and stored in the metadata. Then to search by image, the Mean-Squared Error (MSE) is calculated according to all images in the store. The images with the `k` least errors are returned.

In practice, I have chosen to use an imagenet prediction vector as the feature vector. So, the encoding vector contains 1000 floating point entries from [0,1], which represent the probability that the image belongs to the i-th imagenet class. This should be as robust as the underlying model for existing images (up to crop and rotation), but does deteriorate for semantically similar but contentually different. Additionally, this provides the benefit of being able to use various pre-trained models available in `torchvision` and allows for a much faster and cheaper iteration cycle since no training is necessary.

## Scale and Cost Considerations

The entire infrastructure for this repository is serverless atop AWS, so in that regard it will scale seamlessly.

However, there are a few alterations that must be made before this is capable of cheaply scaling to production.

### S3 Storage Overhead

Since images are currently stored natively and uncompressed, there will be a large cost associated with storing many images.
Some potential solutions are:

S3 supports automatic lifecycle management, which will move infrequently-accessed items into colder storage over time.
This greatly reduces cost, but also incurs an access delay if accesses are random.

A more robust solution is to implement a custom compression scheme.
As scale increases, compressability naturally increases as well.
Because of this, it is feasible to create a custom compression scheme and abstraction layer atop the S3 bucket, which incurs a small performance penalty, but drastically reduces storage costs.

### DynamoDB inefficiencies

Since DynamoDB is transactional by nature, it does not support efficient scan operations.
RDS should be used instead, but due to free-tier cost concerns I have not used it in this project.

### Direct Image Upload

Image upload is done with url and encoding vector.
In production, this incurs a double penalty since the image needs to be fetched by the client to generate the code, and again by the backend to store the image.
It would be preferred to instead have the backing lambda perform the image encoding directly, with an optional additional proxy layer which would take a URL and stream its contents to the upload lambda.

Due to free-tier cost concerns, I have left this to the client instead.
To perform the image encoding in the backend, it suffices to simply prepare a [lambda layer](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html) that contains the pre-trained model; inference should then be fast and efficient.

Further, it would be beneficial to train an in-house feature and context extractor for more robust reverse image lookup.
The current system works very well for contentually similar images, but fails to associate context or semantic information.
