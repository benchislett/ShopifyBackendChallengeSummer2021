import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam';

export interface AppStackProps extends cdk.StackProps {
  TableName: string;
  BucketName: string;
}

export class AppStack extends cdk.Stack {
  private code: lambda.AssetCode = lambda.Code.fromAsset('src.zip');
  private bucket: s3.IBucket;
  private table: ddb.ITable;

  constructor(scope: cdk.Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const { TableName, BucketName } = props;

    this.bucket = s3.Bucket.fromBucketAttributes(this, 'ImageBucket', {
      bucketArn: `arn:aws:s3:::${BucketName}`
    });
    this.table = ddb.Table.fromTableName(this, 'ImageTable', TableName);

    const uploadHandler = this.makeLambda('UploadLambda', 'upload');
    const deleteHandler = this.makeLambda('DeleteLambda', 'delete');
    const tagSearchHandler = this.makeLambda('SearchByTagHandler', 'searchByTags');
    const imageSearchHandler = this.makeLambda('SearchByImageHandler', 'searchByImage');

    const api = new apigateway.RestApi(this, 'ImagesApi', {
      restApiName: 'images-api',
      binaryMediaTypes: ['image/png', 'image/jpg', 'image/jpeg', 'multipart/form-data', 'application/octet-stream']
    });

    const image = api.root.addResource('image'); // /image
    const imageId = image.addResource('{id}');   // /image/{id}
    const search = image.addResource('search');  // /image/search
    const tags = search.addResource('tags');     // /image/search/tags
    const tag = tags.addResource('{tag}');       // /image/search/tags/{tag}

    // /image/POST
    image.addMethod('POST', new apigateway.LambdaIntegration(uploadHandler));

    // /image/{id}/GET
    imageId.addMethod('GET', this.makeS3Integration(), this.makeS3MethodOptions());

    // /image/{id}/DELETE
    imageId.addMethod('DELETE', new apigateway.LambdaIntegration(deleteHandler));

    // /image/search/POST
    search.addMethod('POST', new apigateway.LambdaIntegration(imageSearchHandler));

    // /image/search/tags/{tag}/POST
    tag.addMethod('POST', new apigateway.LambdaIntegration(tagSearchHandler));
  }


  private makeLambda(id: string, handler: string): lambda.Function {
    const func =  new lambda.Function(this, id, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: this.code,
      handler: `src/${handler}.handler`,
      environment: {
        BUCKET_NAME: this.bucket.bucketName,
        TABLE_NAME: this.table.tableName
      },
      timeout: cdk.Duration.seconds(16)
    });
    this.bucket.grantReadWrite(func);
    this.table.grantReadWriteData(func);
    return func;
  }

  private makeS3Integration(): apigateway.AwsIntegration {
    const downloadRole = new iam.Role(this, 'S3DownloadRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com')
    });
    this.bucket.grantReadWrite(downloadRole);

    return new apigateway.AwsIntegration({
      service: 's3',
      integrationHttpMethod: 'GET',
      path: `${this.bucket.bucketName}/{object}`,
      options: {
        credentialsRole: downloadRole,
        requestParameters: {
          'integration.request.path.object': 'method.request.path.id'
        },
        integrationResponses: [{
          statusCode: '200',
          responseParameters: {
            'method.response.header.Timestamp': 'integration.response.header.Date',
            'method.response.header.Content-Length': 'integration.response.header.Content-Length',
            'method.response.header.Content-Type': 'integration.response.header.Content-Type'
          },
          contentHandling: apigateway.ContentHandling.CONVERT_TO_BINARY
        }],
        passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_MATCH
      }
    });
  }

  private makeS3MethodOptions(): apigateway.MethodOptions {
    return {
      methodResponses: [{
        statusCode: '200',
        responseModels: {},
        responseParameters: { 'method.response.header.Timestamp': true, 'method.response.header.Content-Length': true, 'method.response.header.Content-Type': true }
      }],
      requestParameters: {
        'method.request.path.id': true
      }
    };
  }
}
