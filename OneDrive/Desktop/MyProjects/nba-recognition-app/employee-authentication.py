import boto3
import json

s3 = boto3.client('s3')
rekognition = boto3.client('rekognition', region_name='us-east-1')
dynamodbTableName = 'NBAemployee'
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
employeeTableName = dynamodb.Table(dynamodbTableName)
bucketname = 'nba-visititor-image'

def lambda_handler(event, context):
    print(event)
    objectKey = event['queryStringParameters']['objectKey']
    image_bytes = s3.get_object(Bucket=bucketname, Key=objectKey)['Body'].read()
    response = rekognition.search_faces_by_image(
        CollectionId='employees',
        Image={'Bytes': image_bytes},
    )

    for match in response['FaceMatches']:
        print(match["Face"]["FaceId"]), match["Face"]["Confidence"]

        face = employeeTableName.get_item(
            Key={
                'rekognitionId': match["Face"]["FaceId"]
            }
        )
        if 'Item' in face:
            print('Person Found: ', face['Item'])
            return buildResponse(200, {
                'Message': 'NBA Employee Authorized',
                'firstName': face['Item']['firstName'],
                'lastName': face['Item']['lastName']
            })
    print('Person Not Found')
    return buildResponse(403, {'Message': 'NBA Employee BANNEEEED'})
    
    def buildResponse(statusCode, body=None):
        response = {
            'statusCode': statusCode,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
        if body is not None:
            response['body'] = json.dumps(body)
        return response
